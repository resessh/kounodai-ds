# Kounodai-ds
This function will notify you the increasing of reservable lesson frames.
Let's finish the driving school at the fastest.

## Setup
1. create `.firebaserc` to fill project name.
2. add firebase function configs
  ```sh
  $ firebase function config:set \
    kounodai.login_id="<KOUNODAI_ID>" \
    kounodai.login_pass="<KOUNODAI_PASS>" \
    kounodai.login_url="<GET_THIS_FROM_AN_QRCODE_FROM_KOUNODAI>" \
    functions.api_key="<CHOOSE_IT_RANDOMLY>" \
    functions.region="<CHOOSE_WHAT_YOU_LIKE>" \
    slack.user_id="<WHO_TO_NOTIFY>"
    slack.webhook="<GET_FROM_SLACK_APP_CONFIG>"
  ```
3. deploy
  ```sh
  $ yarn install
  $ yarn run deploy
  ```

## License
MIT
