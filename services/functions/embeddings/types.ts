export type EmbeddingResponse = {
  textContent: string;
  originLink: {
    url: string;
    text: string;
  };
};

export type EmbeddingsResponse = Array<EmbeddingResponse>;
