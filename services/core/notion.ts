import {
  ListBlockChildrenParameters,
  BlockObjectResponse,
  RichTextItemResponse,
  PageObjectResponse,
  GetPageResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { Client } from "@notionhq/client";
import { createEmbeddingWithRetry, getPromptLength } from "./openai";
import {
  CreateEmbeddingInput,
  Embedding,
  getFullTextEmbedding,
} from "./embedding";
// Initializing a client

// TODO user notion token from user ?

const MERGED_BLOCK_LENGTH = 200;
const MAX_PAGES = 100;

export const getPageList = async (notionToken: string, maxPages?: number) => {
  if (!maxPages) maxPages = MAX_PAGES;
  const notion = new Client({
    auth: notionToken,
  });
  const response = await notion.search({
    filter: {
      property: "object",
      value: "page",
    },
    // TODO: max page size is 100 so we need to paginate if maxPages > 100
    page_size: maxPages,
  });
  return response.results;
};

const getPage = async ({
  pageId,
  notionToken,
}: {
  pageId: string;
  notionToken: string;
}) => {
  const notion = new Client({
    auth: notionToken,
  });
  const pageResponse = await notion.pages.retrieve({ page_id: pageId });
  const page = checkPageIsNotPartial(pageResponse);
  const children = await getAllBlockChildren({ blockId: pageId, notionToken });
  return { page, children };
};

const checkPageIsNotPartial = (page: GetPageResponse) => {
  if ("properties" in page) {
    return page as PageObjectResponse;
  }
  throw new Error("Page is partial");
};

type TextContentResponse = {
  page: PageObjectResponse;
  blocksWithTextContent: BlocksWithTextContent[];
};

type BlocksWithTextContent = {
  block: NestedBlockObjectResponse;
  text: {
    context: string;
    content: string;
  };
};

const filterBlock = (block: BlocksWithTextContent) => {
  return block.text.content.length > 20;
};

export const savePageEmbeddings = async ({
  connectionId,
  workspaceId,
  pageId,
  notionToken,
}: {
  connectionId: string;
  workspaceId: string;
  pageId: string;
  notionToken: string;
}) => {
  const input = await getTextContents({ pageId, notionToken });
  const blocksWithTextContent = mergeBlocks(input, MERGED_BLOCK_LENGTH);
  const filteredBlocks = blocksWithTextContent.filter(filterBlock);
  const embeddingInputs = await Promise.all(
    filteredBlocks.map((block) =>
      getCreateEmbeddingInputFromBlock({
        workspaceId,
        block,
        page: input.page,
        connectionId,
      })
    )
  );
  return Embedding.batchCreateEmbedding(embeddingInputs);
};

const getCreateEmbeddingInputFromBlock = async ({
  workspaceId,
  connectionId,
  block,
  page,
}: {
  workspaceId: string;
  connectionId: string;
  block: BlocksWithTextContent;
  page: PageObjectResponse;
}) => {
  const { text } = block;
  // TODO pass in real user
  const ada002 = await createEmbeddingWithRetry({
    user: "admin",
    text: getFullTextEmbedding(text),
  });
  const embeddingInput: CreateEmbeddingInput = {
    ada002,
    text: text,
    workspaceId,
    originId: page.id,
    connectionId,
    originLink: {
      url: `${page.url}#${block.block.id.split("-").join("")}`,
      text: getPageTitle(page),
    },
  };
  return embeddingInput;
};

const getTextContents = async ({
  notionToken,
  pageId,
}: {
  notionToken: string;
  pageId: string;
}) => {
  const { page, children } = await getPage({ notionToken, pageId });
  const blocksWithTextContent = children.map((block) => {
    const textContent = blockToPlainText(block);
    return {
      block,
      text: { content: textContent, context: "" },
    };
  });
  return { page, blocksWithTextContent };
};

/* 
merge blocks to the previous heading 
**/
const mergeBlocks = (
  input: TextContentResponse,
  contentLengthInTokens: number
) => {
  const { page, blocksWithTextContent } = input;
  if (blocksWithTextContent.length === 0) {
    return [];
  }
  const mergedBlocks: BlocksWithTextContent[] = [];
  // if document does not start with a heading, we add a fake one
  let currentHeading: BlocksWithTextContent = blocksWithTextContent[0];
  let currentContentLength = getPromptLength(currentHeading.text.content);
  let currentHeading1: string | undefined = undefined;
  let currentHeading2: string | undefined = undefined;
  let currentHeading3: string | undefined = undefined;
  const pageTitle = getPageTitle(page);
  blocksWithTextContent.forEach((block, index) => {
    if (isHeading(block.block) && index !== 0) {
      if (currentContentLength > contentLengthInTokens) {
        const context = getBlockHeadingContext(
          pageTitle,
          currentHeading1,
          currentHeading2,
          currentHeading3
        );
        currentHeading.text.context = context;
        mergedBlocks.push(currentHeading);
        currentHeading = block;
        currentContentLength = getPromptLength(block.text.content);
      }
      if (block.block.type === "heading_1") {
        currentHeading1 = block.text.content;
        currentHeading2 = undefined;
        currentHeading3 = undefined;
      }
      if (block.block.type === "heading_2") {
        currentHeading2 = block.text.content;
        currentHeading3 = undefined;
      }
      if (block.block.type === "heading_3") {
        currentHeading3 = block.text.content;
      }
      return;
    } else {
      currentHeading.text.content += `\n${block.text.content}`;
      currentContentLength += getPromptLength(block.text.content);
    }
    if (index === blocksWithTextContent.length - 1) {
      const context = getBlockHeadingContext(
        pageTitle,
        currentHeading1,
        currentHeading2,
        currentHeading3
      );
      currentHeading.text.context = context;
      mergedBlocks.push(currentHeading);
    }
  });
  return mergedBlocks;
};

const getBlockHeadingContext = (
  pageTitle: string | undefined,
  heading1: string | undefined,
  heading2: string | undefined,
  heading3: string | undefined
) => {
  let context = "";
  if (pageTitle) {
    context += `Page: ${pageTitle}`;
  }
  if (heading1) {
    context += `
# ${heading1}`;
  }
  if (heading2) {
    context += `
## ${heading2}`;
  }
  if (heading3) {
    context += `
### ${heading3}`;
  }
  return context;
};

const getPageTitle = (page: PageObjectResponse) => {
  // in most cases, the title is in the title property
  const titleObject = page.properties?.title;
  if (titleObject && titleObject.type === "title") {
    return richTextToPlainText(titleObject.title);
  }
  // if it is not there, find the property with type set as title
  const keys = Object.keys(page.properties);
  for (const key of keys) {
    const property = page.properties[key];
    if (property.type === "title") {
      return richTextToPlainText(property.title);
    }
  }
  console.log("Page has no title", JSON.stringify(page));
  return "untitled";
};

const isHeading = (block: NestedBlockObjectResponse) => {
  return (
    block.type === "heading_1" ||
    block.type === "heading_2" ||
    block.type === "heading_3"
  );
};

// TODO is nested the right word there ?
// Basically we create new types for the blocks that can have children
type NestedBlockObjectResponse =
  | BlockObjectResponse
  | {
      id: string;
      type: "nested-table";
      nested_table: { children: NestedBlockObjectResponse[] };
    }
  | {
      id: string;

      type: "nested-column-list";
      nested_column: { children: NestedBlockObjectResponse[] };
    }
  | {
      id: string;

      type: "nested-column";
      nested_column: { children: NestedBlockObjectResponse[] };
    };

const getAllBlockChildren = async ({
  blockId,
  notionToken,
}: {
  blockId: string;
  notionToken: string;
}): Promise<NestedBlockObjectResponse[]> => {
  const notion = new Client({
    auth: notionToken,
  });
  const childrens = await getAllPages<
    ListBlockChildrenParameters,
    NestedBlockObjectResponse
  >({ block_id: blockId }, notion.blocks.children.list as any);

  const promises = childrens.map(async (child) => {
    if (child.type === "table") {
      const nestedTableChildren = await getAllBlockChildren({
        blockId: child.id,
        notionToken,
      });
      const nestedTable: NestedBlockObjectResponse = {
        id: child.id,
        type: "nested-table",
        nested_table: { children: nestedTableChildren },
      };
      return nestedTable;
    }
    if (child.type === "column_list") {
      const nestedColumnListChildren = await getAllBlockChildren({
        blockId: child.id,
        notionToken,
      });
      const nestedColumnList: NestedBlockObjectResponse = {
        id: child.id,
        type: "nested-column-list",
        nested_column: { children: nestedColumnListChildren },
      };
      return nestedColumnList;
    }
    if (child.type === "column") {
      const nestedColumnChildren = await getAllBlockChildren({
        blockId: child.id,
        notionToken,
      });
      const nestedColumn: NestedBlockObjectResponse = {
        id: child.id,
        type: "nested-column",
        nested_column: { children: nestedColumnChildren },
      };
      return nestedColumn;
    }
    return child;
  });
  return Promise.all(promises);
};

type NotionPaginatedApi<Tparam, TResult> = (
  input: NotionPaginatedRequest<Tparam>
) => Promise<NotionPaginatedResponse<TResult>>;
type NotionPaginatedRequest<TParam> = CursorInput & TParam;
type CursorInput = {
  start_cursor?: string | null;
  page_size?: number;
};
type NotionPaginatedResponse<T> = {
  next_cursor: string | null;
  has_more: boolean;
  results: Array<T>;
};

const getAllPages = async <TParam extends CursorInput, TResult>(
  param: TParam,
  func: NotionPaginatedApi<TParam, TResult>
): Promise<Array<TResult>> => {
  let response = await func(param);
  let results = response.results;
  while (response.has_more) {
    response = await func({ ...param, start_cursor: response.next_cursor });
    results = results.concat(response.results);
  }
  return results;
};

// x ParagraphBlockObjectResponse
// x Heading1BlockObjectResponse
// x Heading2BlockObjectResponse
// x Heading3BlockObjectResponse
// x BulletedListItemBlockObjectResponse
// x NumberedListItemBlockObjectResponse
// x QuoteBlockObjectResponse
// x ToDoBlockObjectResponse
// x ToggleBlockObjectResponse
// TemplateBlockObjectResponse
// SyncedBlockBlockObjectResponse
// x ChildPageBlockObjectResponse
// ChildDatabaseBlockObjectResponse
// EquationBlockObjectResponse
// x CodeBlockObjectResponse
// x CalloutBlockObjectResponse
// DividerBlockObjectResponse
// BreadcrumbBlockObjectResponse
// TableOfContentsBlockObjectResponse
// x ColumnListBlockObjectResponse
// x ColumnBlockObjectResponse
// LinkToPageBlockObjectResponse
// x TableBlockObjectResponse
// x TableRowBlockObjectResponse
// x EmbedBlockObjectResponse
// x BookmarkBlockObjectResponse
// x ImageBlockObjectResponse
// x VideoBlockObjectResponse
// x PdfBlockObjectResponse
// x FileBlockObjectResponse
// x AudioBlockObjectResponse
// x LinkPreviewBlockObjectResponse
// UnsupportedBlockObjectResponse
const blockToPlainText = (block: NestedBlockObjectResponse): string => {
  switch (block.type) {
    case "callout":
      return richTextToPlainText(block.callout.rich_text);
    case "paragraph":
      return richTextToPlainText(block.paragraph.rich_text);
    case "heading_1":
      return `# ${richTextToPlainText(block.heading_1.rich_text)}`;
    case "heading_2":
      return `## ${richTextToPlainText(block.heading_2.rich_text)}`;
    case "heading_3":
      return `### ${richTextToPlainText(block.heading_3.rich_text)}`;
    case "bulleted_list_item":
      return `- ${richTextToPlainText(block.bulleted_list_item.rich_text)}`;
    case "numbered_list_item":
      return richTextToPlainText(block.numbered_list_item.rich_text);
    case "to_do":
      return richTextToPlainText(block.to_do.rich_text);
    case "toggle":
      return richTextToPlainText(block.toggle.rich_text);
    case "child_page":
      return block.child_page.title;
    case "quote":
      return `> ${richTextToPlainText(block.quote.rich_text)}`;
    case "code":
      return `\`${richTextToPlainText(block.code.rich_text)}\``;
    case "table_row":
      return block.table_row.cells
        .map((cell) => richTextToPlainText(cell))
        .join(" ");
    case "link_preview":
      return block.link_preview.url;
    case "file":
      return richTextToPlainText(block.file.caption);
    case "audio":
      return richTextToPlainText(block.audio.caption);
    case "image":
      return richTextToPlainText(block.image.caption);
    case "video":
      return richTextToPlainText(block.video.caption);
    case "pdf":
      return richTextToPlainText(block.pdf.caption);
    case "embed":
      return richTextToPlainText(block.embed.caption);
    case "bookmark":
      return richTextToPlainText(block.bookmark.caption);
    case "nested-table":
      return block.nested_table.children.map(blockToPlainText).join("\n");
    case "nested-column-list":
      return block.nested_column.children.map(blockToPlainText).join("\n");
    case "nested-column":
      return block.nested_column.children.map(blockToPlainText).join("\n");
    default:
      return "";
  }
};

const richTextToPlainText = (richTextItems: RichTextItemResponse[]) => {
  return richTextItems.map((richText) => richText.plain_text).join("");
};
