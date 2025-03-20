import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { parseArgs } from "node:util";

type CognitoSession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
  issuedAt: number;
};

type Args = {
  username: string;
  password: string;
  clientId: string;
  userPoolId: string;
};

const parseAndValidateArgs = (): Args => {
  const {
    values: { username, password, clientId, userPoolId },
  } = parseArgs({
    options: {
      username: { type: "string" },
      password: { type: "string" },
      clientId: { type: "string" },
      userPoolId: { type: "string" },
    },
  });
  if (username && password && clientId && userPoolId) {
    return { username, password, clientId, userPoolId };
  }
  throw new Error("Missing required arguments");
};

const signIn = async ({
  username,
  password,
  clientId,
  userPoolId,
}: Args): Promise<CognitoSession> => {
  const userPool = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });
  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(
      new AuthenticationDetails({
        Username: username,
        Password: password,
      }),
      {
        onSuccess: (result) => {
          const accessToken = result.getAccessToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();
          const idToken = result.getIdToken().getJwtToken();
          const expiresAt = result.getAccessToken().getExpiration();
          const issuedAt = result.getAccessToken().getIssuedAt();
          resolve({ accessToken, refreshToken, idToken, expiresAt, issuedAt });
        },
        onFailure: reject,
      },
    );
  });
};

const main = async () => {
  try {
    const args = parseAndValidateArgs();
    const session = await signIn(args);
    process.stdout.write(JSON.stringify(session, null, 2) + "\n");
  } catch (error) {
    process.stderr.write(String(error) + "\n\n");
    process.stderr.write(help);
    process.exit(1);
  }
};

const help = `Sign in to a Cognito user pool using SRP.

Usage:

cognito-srp-sign-in
  --username <username>
  --password <password>
  --clientId <clientId>
  --userPoolId <userPoolId>
`;

main();
