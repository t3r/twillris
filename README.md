# Twillris
Simple AWS lambda to pull public calendar entries from an ALLRIS system and push to Twitter

## Usage
From you twitter dev account, set these environment variables before kicking the lambda:

* CONSUMER_KEY - your twitter consumer key
* CONSUMER_SECRET - your twitter consumer secret
* ACCESS_TOKEN - your twitter access token
* ACCESS_TOKEN_SECRET - your twitter access token secret

Also set these environment variables:

* TWEET_PREFIX - The text to show up right in front of the actual calendar entry. May contain any twitter special characters like @ and #
* ALLRIS_URL - the url of the public ALLRIS system, example: https://www.wentorf.sitzung-online.com/bi
* node_env - set to production for usage as a lambda. Leave empty (or set to development) when running standalone

## Developing
Pull requests are welcome
