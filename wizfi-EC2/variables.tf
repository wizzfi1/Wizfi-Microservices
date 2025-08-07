variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region to deploy resources in"
}

variable "ami_id" {
  type        = string
  description = "AMI ID to use for the EC2 instance"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"  
}


variable "key_name" {
  type        = string
  description = "Name for the AWS key pair"
}

variable "public_key_path" {
  type        = string
  description = "Path to your public SSH key file"
}
