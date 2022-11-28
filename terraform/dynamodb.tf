resource "aws_dynamodb_table" "counter" {
  name             = "${var.name_prefix}-table"
  billing_mode   = "PROVISIONED"
  # 無料の範囲  
  read_capacity  = 25
  write_capacity = 25
  hash_key         = "CounterName"

  attribute {
    name = "CounterName"
    type = "S"
  }
}