# code-splitting-aws-lambda

## Requirments
- node v10
- cdk:
  - `npm i -g aws-cdk`
  - `aws bootstrap`

The example serverless application with code splitting. The application is implemented as a simple RPC API where each contract method (aka service) is loaded dynamically.  

  
## FAQ
1. Why a single lambda with many methods instead of X lambdas with one method?  
The biggest issue with lambdas is a cold start, which takes from 200ms to 600ms. If you have multiple lambdas, your users will face significant delays.  
Code sharing is also problematic because calling one lambda from another will make your application  much slower.

2. Why just RPC and not REST or GraphQL?  
Lambdas should have minimal size, and big libraries should be avoided. RPC is a perfect fit because we can call our lambda directly without any input transformation or redundant mapping.

2. Why boilerplate and not a library/framework?  
Creating a complete library or a framework would be too much time-consuming. It's recommended to edit this boilerplate to match your needs. Feel free to edit/add/remove any code.

## What's included?
1. creating and updating AWS Stack:
```bash
npm run build
cdk deploy
```

2. development mode with nodemon
```bash
npm run dev
``` 


## Example application
Current code contains two methods
1. `calc.add`
Add two numbers.
```
POST https://<api-id>.execute-api.<region>.amazonaws.com/default/rpc/calc.add

body:
  [1, 2]
```

1. `calc.slowAdd`
Add two numbers with 1s delay.  
Authentication token is required in `x-token` header (you can pass any value).
```
POST https://<api-id>.execute-api.<region>.amazonaws.com/default/rpc/calc.slowAdd

headers:
  x-token: abc

body:
  [1, 2]
```

## AWS Stack
`cdk/MainStack` contains definition for the whole AWS Stack.  
The stack contains:
- one lambda function
- one api gateway

