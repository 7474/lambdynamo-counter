variable "access_key" {
  description = "AWS Access Key"
}

variable "secret_key" {
  description = "AWS Secret Key"
  sensitive   = true
}

variable "name_prefix" {
  default = "lambdynamo-counter"
}

variable "cors_allow_origins" {
  default = ["*"]
}