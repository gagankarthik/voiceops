import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  ResendConfirmationCodeCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider'

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION!,
})

const CLIENT_ID = process.env.COGNITO_CLIENT_ID!

export async function signUp(email: string, password: string, name: string) {
  const cmd = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'name', Value: name },
    ],
  })
  return cognitoClient.send(cmd)
}

export async function confirmSignUp(email: string, code: string) {
  const cmd = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  })
  return cognitoClient.send(cmd)
}

export async function resendCode(email: string) {
  const cmd = new ResendConfirmationCodeCommand({
    ClientId: CLIENT_ID,
    Username: email,
  })
  return cognitoClient.send(cmd)
}

export async function signIn(email: string, password: string) {
  const cmd = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  })
  const res = await cognitoClient.send(cmd)
  return res.AuthenticationResult
}

export async function getUser(accessToken: string) {
  const cmd = new GetUserCommand({ AccessToken: accessToken })
  return cognitoClient.send(cmd)
}

export async function signOut(accessToken: string) {
  const cmd = new GlobalSignOutCommand({ AccessToken: accessToken })
  return cognitoClient.send(cmd)
}
