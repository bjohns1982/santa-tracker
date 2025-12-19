# AWS ECS Deployment Steps - Implementation Guide

This guide walks through implementing the plan to fix ECS services and set up Application Load Balancers.

## Prerequisites

- Backend and frontend task definitions already created
- ECS services already created
- Route 53 hosted zone for `santa-tour.com` exists
- RDS database is running and accessible

## Step 1: Fix Backend Health Check

**IMPORTANT**: The container health check must match the ALB target group health check. The ALB expects an HTTP 200 response from `/api/health`, so the container health check should verify the HTTP server is responding, not just that the process exists.

### Step 1a: Update Backend Dockerfile

First, ensure `curl` is installed in the Docker image. Update `backend/Dockerfile`:

```dockerfile
# Install OpenSSL for Prisma and curl for health checks
RUN apk add --no-cache openssl curl
```

Then rebuild and push the image (see Step 1b below).

### Step 1b: Rebuild and Push Backend Image

Run these commands from your project root:

```bash
cd backend

# Build image
docker build -t santa-tracker-backend:latest .

# Login to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 436387562737.dkr.ecr.us-east-2.amazonaws.com

# Tag and push
docker tag santa-tracker-backend:latest 436387562737.dkr.ecr.us-east-2.amazonaws.com/santa-tracker-backend:latest
docker push 436387562737.dkr.ecr.us-east-2.amazonaws.com/santa-tracker-backend:latest
```

### Step 1c: Update ECS Task Definition Health Check

**AWS Console Steps:**

1. Go to **ECS → Task Definitions → `santa-tracker-backend`**
2. Click **"Create new revision"**
3. Scroll to **Container Definitions** → Click on the `backend` container
4. Expand **Health check** section
5. Update the health check to use HTTP endpoint verification:
   - **Command**: `CMD-SHELL,curl -f http://localhost:3001/api/health || exit 1`
   - **Interval**: `30` seconds
   - **Timeout**: `5` seconds
   - **Retries**: `3`
   - **Start period**: `60` seconds
6. Click **"Create"** to create the new revision
7. Go to **ECS → Services → `santa-tracker-backend-service` → Update**
8. Under **Task definition**, select the new revision (e.g., `santa-tracker-backend:4`)
9. Check **"Force new deployment"** to ensure the new image is used
10. Click **"Update"** and wait for the service to deploy

**Why this matters**: The ALB target group health check uses HTTP requests to `/api/health`. The container health check should verify the same endpoint to ensure consistency. Using `pgrep node` only checks if the process exists, not if the HTTP server is actually responding.

**Alternative (not recommended)**: If you must use process checking instead of HTTP:

- **Command**: `CMD-SHELL,pgrep node || exit 1`
- Note: This doesn't verify HTTP server functionality and may cause mismatches with ALB health checks

---

## Step 2: Create Backend Application Load Balancer

### AWS Console Steps:

1. Go to **EC2 → Load Balancers → Create Load Balancer**
2. Select **Application Load Balancer**
3. **Basic configuration**:
   - Name: `santa-tracker-backend-alb`
   - Scheme: **Internet-facing**
   - IP address type: **IPv4**
4. **Network mapping**:
   - VPC: Select your ECS cluster VPC
   - Availability Zones: Select at least 2 public subnets (same subnets used by ECS tasks)
5. **Security groups**:
   - Create new security group: `santa-tracker-backend-alb-sg`
   - Inbound rules:
     - Type: **HTTP**
     - Port: **80**
     - Source: `0.0.0.0/0` (or restrict to your IP for security)
   - Outbound: Allow all (default)
6. **Listeners and routing**:
   - Protocol: **HTTP**
   - Port: **80**
   - Default action: **Create target group**
7. **Configure target group**:
   - Target type: **IP addresses** (required for Fargate)
   - Name: `santa-tracker-backend-tg`
   - Protocol: **HTTP**
   - Port: **3001**
   - VPC: Same as ALB
   - Health checks:
     - Protocol: **HTTP**
     - Path: `/api/health`
     - Healthy threshold: **2**
     - Unhealthy threshold: **2**
     - Timeout: **5** seconds
     - Interval: **30** seconds
     - Success codes: **200**
8. **Register targets**: Skip (ECS service will register automatically)
9. Click **"Create load balancer"**
10. **IMPORTANT**: Note the ALB DNS name (e.g., `santa-tracker-backend-alb-1234567890.us-east-2.elb.amazonaws.com`)

---

## Step 3: Update Backend ECS Service to Use ALB

### AWS Console Steps:

1. Go to **ECS → Clusters → `santa-tracker-cluster` → Services → `santa-tracker-backend-service`**
2. Click **"Update"**
3. Scroll to **Load balancing** section
4. Click **"Add to load balancer"**
5. Configure:
   - **Load balancer type**: Application Load Balancer
   - **Load balancer name**: Select `santa-tracker-backend-alb`
   - **Container name**: `backend`
   - **Container port**: `3001`
   - **Target group name**: Select `santa-tracker-backend-tg`
6. Scroll down and click **"Update"**
7. Wait for the service to deploy (tasks will register with the target group automatically)

---

## Step 4: Create Frontend Application Load Balancer

### AWS Console Steps:

1. Go to **EC2 → Load Balancers → Create Load Balancer**
2. Select **Application Load Balancer**
3. **Basic configuration**:
   - Name: `santa-tracker-frontend-alb`
   - Scheme: **Internet-facing**
   - IP address type: **IPv4**
4. **Network mapping**:
   - VPC: Select your ECS cluster VPC
   - Availability Zones: Select at least 2 public subnets
5. **Security groups**:
   - Create new security group: `santa-tracker-frontend-alb-sg`
   - Inbound rules:
     - Type: **HTTP**
     - Port: **80**
     - Source: `0.0.0.0/0`
   - Outbound: Allow all (default)
6. **Listeners and routing**:
   - Protocol: **HTTP**
   - Port: **80**
   - Default action: **Create target group**
7. **Configure target group**:
   - Target type: **IP addresses** (required for Fargate)
   - Name: `santa-tracker-frontend-tg`
   - Protocol: **HTTP**
   - Port: **80**
   - VPC: Same as ALB
   - Health checks:
     - Protocol: **HTTP**
     - Path: `/` (or `/index.html`)
     - Healthy threshold: **2**
     - Unhealthy threshold: **2**
     - Timeout: **5** seconds
     - Interval: **30** seconds
     - Success codes: **200**
8. **Register targets**: Skip (ECS service will register automatically)
9. Click **"Create load balancer"**
10. **IMPORTANT**: Note the ALB DNS name (e.g., `santa-tracker-frontend-alb-1234567890.us-east-2.elb.amazonaws.com`)

---

## Step 5: Update Frontend nginx.conf with Backend ALB DNS

**IMPORTANT**: Before rebuilding the frontend image, you need to update `frontend/nginx.conf` with the actual backend ALB DNS name.

1. Get the backend ALB DNS name from Step 2 (EC2 → Load Balancers → `santa-tracker-backend-alb`)
2. Open `frontend/nginx.conf`
3. Find the line: `set $backend "http://REPLACE_WITH_BACKEND_ALB_DNS_NAME";`
4. Replace `REPLACE_WITH_BACKEND_ALB_DNS_NAME` with the actual ALB DNS name
5. Example: `set $backend "http://santa-tracker-backend-alb-1234567890.us-east-2.elb.amazonaws.com";`
6. Save the file

---

## Step 6: Rebuild and Push Frontend Image

Run these commands from your project root:

```bash
cd frontend

# Build image
docker build --build-arg VITE_API_URL=https://api.santa-tour.com/api -t santa-tracker-frontend:latest .

# Login to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 436387562737.dkr.ecr.us-east-2.amazonaws.com

# Tag and push
docker tag santa-tracker-frontend:latest 436387562737.dkr.ecr.us-east-2.amazonaws.com/santa-tracker-frontend:latest
docker push 436387562737.dkr.ecr.us-east-2.amazonaws.com/santa-tracker-frontend:latest
```

---

## Step 7: Update Frontend ECS Service to Use ALB

### AWS Console Steps:

1. Go to **ECS → Clusters → `santa-tracker-cluster` → Services → `santa-tracker-frontend-service`**
2. Click **"Update"**
3. Scroll to **Load balancing** section
4. Click **"Add to load balancer"**
5. Configure:
   - **Load balancer type**: Application Load Balancer
   - **Load balancer name**: Select `santa-tracker-frontend-alb`
   - **Container name**: `frontend`
   - **Container port**: `80`
   - **Target group name**: Select `santa-tracker-frontend-tg`
6. Scroll down to **Deployment configuration**
7. Check **"Force new deployment"** (to use the new image)
8. Click **"Update"**
9. Wait for the service to deploy

---

## Step 8: Set Up Route 53 DNS Records

### AWS Console Steps:

1. Go to **Route 53 → Hosted zones → `santa-tour.com`**

2. **Create Backend API Record**:

   - Click **"Create record"**
   - Record name: `api`
   - Record type: **A - Routes traffic to an IPv4 address and some AWS resources**
   - Alias: **Yes** (toggle on)
   - Route traffic to: **Alias to Application and Classic Load Balancer**
   - Region: **us-east-2**
   - Load balancer: Select `santa-tracker-backend-alb`
   - Routing policy: **Simple routing**
   - TTL: **300** seconds (or leave default)
   - Click **"Create records"**

3. **Create Frontend Record**:

   - Click **"Create record"**
   - Record name: `www`
   - Record type: **A - Routes traffic to an IPv4 address and some AWS resources**
   - Alias: **Yes** (toggle on)
   - Route traffic to: **Alias to Application and Classic Load Balancer**
   - Region: **us-east-2**
   - Load balancer: Select `santa-tracker-frontend-alb`
   - Routing policy: **Simple routing**
   - TTL: **300** seconds (or leave default)
   - Click **"Create records"**

4. **Optional - Root Domain Record**:
   - Click **"Create record"**
   - Record name: (leave blank or enter `@`)
   - Record type: **A**
   - Alias: **Yes**
   - Route traffic to: **Alias to Application and Classic Load Balancer**
   - Region: **us-east-2**
   - Load balancer: Select `santa-tracker-frontend-alb`
   - Click **"Create records"**

---

## Step 9: Verify Services

### Backend Verification:

1. **Check ECS Service**:

   - Go to **ECS → Services → `santa-tracker-backend-service`**
   - Verify tasks are running and healthy
   - Check **Logs** tab for "Santa Tracker server running on port 3001"

2. **Test via ALB DNS**:

   ```bash
   curl http://BACKEND_ALB_DNS_NAME/api/health
   ```

   Should return: `{"status":"ok"}`

3. **Test via Route 53** (after DNS propagates, may take a few minutes):
   ```bash
   curl http://api.santa-tour.com/api/health
   ```
   Should return: `{"status":"ok"}`

### Frontend Verification:

1. **Check ECS Service**:

   - Go to **ECS → Services → `santa-tracker-frontend-service`**
   - Verify tasks are running and healthy
   - Check **Logs** tab for nginx startup messages (no DNS errors)

2. **Test via ALB DNS**:

   - Open browser: `http://FRONTEND_ALB_DNS_NAME`
   - Should load the Santa Tracker application

3. **Test via Route 53** (after DNS propagates):
   - Open browser: `http://www.santa-tour.com`
   - Should load the application
   - Try logging in or registering (API calls should work)

### Database Verification:

- Migrations should have run automatically on backend startup
- Check backend logs for: "No pending migrations to apply"

---

## Troubleshooting

### Backend Health Check Failing:

- If `pgrep node` doesn't work, add `curl` to Dockerfile and use `curl -f http://localhost:3001/api/health || exit 1`
- Check task logs for specific errors
- Verify health check endpoint is accessible: `/api/health`

### Frontend Not Starting:

- Check nginx logs for DNS resolution errors
- Verify backend ALB DNS name is correct in `nginx.conf`
- Ensure resolver directive is present in nginx.conf

### ALB Target Group Unhealthy:

- Check target group health in EC2 → Target Groups
- Verify security groups allow traffic from ALB to ECS tasks
- Check ECS task logs for application errors

### DNS Not Resolving:

- Wait a few minutes for DNS propagation (can take up to 48 hours, usually much faster)
- Verify Route 53 records are created correctly
- Test with `dig api.santa-tour.com` or `nslookup api.santa-tour.com`

---

## Security Group Configuration Summary

### Backend ALB Security Group (`santa-tracker-backend-alb-sg`):

- Inbound: HTTP (port 80) from `0.0.0.0/0` (or restrict to your IP)
- Outbound: Allow all

### Frontend ALB Security Group (`santa-tracker-frontend-alb-sg`):

- Inbound: HTTP (port 80) from `0.0.0.0/0`
- Outbound: Allow all

### Backend ECS Task Security Group (`santa-tracker-backend-sg`):

- Inbound: Custom TCP (port 3001) from backend ALB security group
- Outbound: Allow all (for database, API calls, etc.)

### Frontend ECS Task Security Group (`santa-tracker-frontend-sg`):

- Inbound: HTTP (port 80) from frontend ALB security group
- Outbound: Allow all (for API calls to backend)

---

## Next Steps

After successful deployment:

1. Set up SSL/TLS certificates in AWS Certificate Manager (ACM)
2. Update ALB listeners to use HTTPS (port 443)
3. Update Route 53 records if needed
4. Test full application flow with HTTPS
5. Consider setting up CloudWatch alarms for monitoring
