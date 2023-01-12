import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { respond } from "functions/utils";

export const handler = (): APIGatewayProxyStructuredResultV2 => {
    // const sesh = useSession();
    // clear push notifications and other stuff
    return respond.redirect('/');
  };