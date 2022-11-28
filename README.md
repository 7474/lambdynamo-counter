# lambdynamo-counter

AWSのLambda関数のURLとDynamoDBで動作するアクセスカウンターです。

## 表示の仕方

```html
<img src="https://{function-url}/?name={counter-name}">
```

クエリパラメータ
- name: カウンタ名
- digit: 0埋めする桁数
- ip_check: `1`を指定することで前回と同一IPアドレスからのアクセス時にはカウントアップしないようにするフラグ

## 自分のAWSアカウントに設置

リポジトリをクローンやフォークなどしてTerraformのバックエンド設定や変数設定を行って適用してください。
