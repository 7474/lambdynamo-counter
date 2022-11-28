
resource "aws_lambda_function" "counter" {
  function_name = "${var.name_prefix}-function"

  filename         = data.archive_file.counter.output_path
  source_code_hash = data.archive_file.counter.output_base64sha256

  role    = aws_iam_role.counter.arn
  handler = "index.handler"
  runtime = "nodejs16.x"
}

data "archive_file" "counter" {
  type        = "zip"
  source_dir  = "counter/function"
  output_path = "counter/function.zip"
}

resource "aws_lambda_function_url" "counter" {
  function_name      = aws_lambda_function.counter.function_name
  authorization_type = "NONE"

  cors {
    allow_origins     = var.cors_allow_origins
    allow_methods     = ["GET"]
  }
}

resource "aws_iam_role" "counter" {
  name = "counter"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "counter_for_local_basic_execution" {
  role       = aws_iam_role.counter.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "counter_for_access_dynamodb" {
  role       = aws_iam_role.counter.name
  policy_arn = aws_iam_policy.counter_for_access_dynamodb.arn
}

resource "aws_iam_policy" "counter_for_access_dynamodb" {
  name   = "${aws_iam_role.counter.name}-access-dynamodb"
  path   = "/"
  policy = data.aws_iam_policy_document.counter_for_access_dynamodb.json
}

data "aws_iam_policy_document" "counter_for_access_dynamodb" {
  statement {
    actions = [
      "dynamodb:UpdateItem",
    ]

    resources = [
      "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.counter.name}",
    ]
  }
}