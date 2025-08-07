provider "aws" {
  region = var.aws_region
}

# Use default VPC
data "aws_vpc" "default" {
  default = true
}

# Get subnets in the default VPC
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Optional: Get details about the first subnet
data "aws_subnet" "default" {
  id = data.aws_subnets.default.ids[0]
}

# SSH key pair
resource "aws_key_pair" "wizfi_key" {
  key_name   = var.key_name
  public_key = file(var.public_key_path)
}

# Security group
resource "aws_security_group" "wizfi_sg" {
  name        = "wizfi-sg"
  description = "Allow SSH, HTTP, HTTPS, Kubernetes"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "wizfi_ec2" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.wizfi_key.key_name
  subnet_id                   = data.aws_subnets.default.ids[0] # fixed line
  vpc_security_group_ids      = [aws_security_group.wizfi_sg.id]
  associate_public_ip_address = true

  tags = {
    Name = "wizfi-ec2"
  }
}

# Output public IP
output "instance_public_ip" {
  value       = aws_instance.wizfi_ec2.public_ip
  description = "Public IP of the EC2 instance"
}
