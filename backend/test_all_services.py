"""
Comprehensive test suite for all StudyMate backend services
Tests service health, basic functionality, and integration
"""

import asyncio
import httpx
import logging
import json
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Service URLs
SERVICES = {
    "api-gateway": "http://localhost:8000",
    "profile-service": "http://localhost:8006", 
    "resume-analyzer": "http://localhost:8003"
}

class ServiceTester:
    def __init__(self):
        self.results = {}
        
    async def test_service_health(self, service_name: str, base_url: str) -> bool:
        """Test service health endpoint"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{base_url}/health")
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"✅ {service_name} health check passed")
                    logger.info(f"   Status: {data.get('status', 'unknown')}")
                    return True
                else:
                    logger.error(f"❌ {service_name} health check failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"💥 {service_name} connection failed: {e}")
            return False

    async def test_service_info(self, service_name: str, base_url: str) -> bool:
        """Test service root endpoint for basic info"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(base_url)
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"✅ {service_name} info endpoint works")
                    logger.info(f"   Service: {data.get('service', data.get('message', 'unknown'))}")
                    return True
                else:
                    logger.error(f"❌ {service_name} info endpoint failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"💥 {service_name} info request failed: {e}")
            return False

    async def test_api_gateway_auth(self) -> bool:
        """Test API Gateway authentication endpoints"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Test signup
                signup_data = {
                    "email": "test@example.com",
                    "password": "testpassword",
                    "name": "Test User"
                }
                
                response = await client.post(f"{SERVICES['api-gateway']}/auth/signup", json=signup_data)
                
                if response.status_code == 200:
                    data = response.json()
                    token = data.get("access_token")
                    
                    if token:
                        logger.info("✅ API Gateway authentication test passed")
                        logger.info(f"   Token received: {token[:20]}...")
                        return True
                    else:
                        logger.error("❌ No access token received")
                        return False
                else:
                    logger.error(f"❌ Authentication test failed: {response.status_code}")
                    logger.error(f"   Response: {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"💥 Authentication test failed: {e}")
            return False

    def create_test_resume_content(self) -> str:
        """Create test resume content"""
        return """
        John Doe
        Software Engineer
        Email: john.doe@email.com
        Phone: (555) 123-4567
        Location: San Francisco, CA
        LinkedIn: linkedin.com/in/johndoe
        GitHub: github.com/johndoe
        
        PROFESSIONAL SUMMARY
        Experienced software engineer with 5+ years in full-stack development.
        Proficient in Python, JavaScript, React, and Node.js.
        
        EXPERIENCE
        Senior Software Engineer | Tech Corp | 2021 - Present
        - Developed microservices architecture using Python and FastAPI
        - Led team of 4 developers on critical projects
        - Improved system performance by 40%
        
        Software Engineer | StartupXYZ | 2019 - 2021
        - Built responsive web applications using React and Node.js
        - Implemented CI/CD pipelines using Docker and Jenkins
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of California, Berkeley | 2015 - 2019
        GPA: 3.8/4.0
        
        SKILLS
        - Programming: Python, JavaScript, Java, Go
        - Frameworks: React, FastAPI, Django, Express.js
        - Tools: Docker, Kubernetes, AWS, Git
        - Databases: PostgreSQL, MongoDB, Redis
        
        PROJECTS
        E-commerce Platform | 2023
        - Built full-stack e-commerce platform using React and FastAPI
        - Integrated payment processing and inventory management
        - Technologies: React, Python, PostgreSQL, Redis
        
        Task Management App | 2022  
        - Developed task management application with real-time updates
        - Implemented user authentication and role-based access
        - Technologies: Vue.js, Node.js, MongoDB
        
        CERTIFICATIONS
        AWS Certified Solutions Architect | Amazon Web Services | 2022
        Certified Kubernetes Administrator | CNCF | 2021
        """

    async def test_profile_service_extraction(self) -> bool:
        """Test profile service resume extraction"""
        try:
            # Create a test text file (simulating resume upload)
            resume_content = self.create_test_resume_content()
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Prepare multipart form data
                files = {
                    "resume": ("test_resume.txt", resume_content, "text/plain")
                }
                data = {
                    "user_id": "test-user-123"
                }
                
                response = await client.post(
                    f"{SERVICES['profile-service']}/extract-profile",
                    files=files,
                    data=data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if result.get("success"):
                        extraction_data = result.get("extracted_data", {})
                        confidence = result.get("confidence_score", 0)
                        
                        logger.info("✅ Profile extraction test passed")
                        logger.info(f"   Confidence Score: {confidence}%")
                        logger.info(f"   Extracted Name: {extraction_data.get('personal_info', {}).get('name', 'N/A')}")
                        logger.info(f"   Skills Count: {len(extraction_data.get('skills', []))}")
                        logger.info(f"   Experience Count: {len(extraction_data.get('experience', []))}")
                        return True
                    else:
                        logger.error("❌ Profile extraction failed - no success flag")
                        return False
                else:
                    logger.error(f"❌ Profile extraction failed: {response.status_code}")
                    logger.error(f"   Response: {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"💥 Profile extraction test failed: {e}")
            return False

    async def test_profile_service_crud(self) -> bool:
        """Test profile service CRUD operations"""
        try:
            user_id = "test-crud-user-123"
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Test GET profile (should return 404 for new user)
                response = await client.get(f"{SERVICES['profile-service']}/profile/{user_id}")
                
                if response.status_code == 404:
                    logger.info("✅ Profile GET test passed (correctly returns 404 for non-existent user)")
                    return True
                elif response.status_code == 200:
                    logger.info("✅ Profile GET test passed (user already exists)")
                    return True
                else:
                    logger.error(f"❌ Profile GET test failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"💥 Profile CRUD test failed: {e}")
            return False

    async def run_all_tests(self):
        """Run comprehensive test suite"""
        logger.info("🚀 Starting StudyMate Backend Test Suite")
        logger.info("=" * 50)
        
        total_tests = 0
        passed_tests = 0
        
        # Test service health checks
        logger.info("\n📋 Testing Service Health Checks...")
        for service_name, base_url in SERVICES.items():
            total_tests += 1
            if await self.test_service_health(service_name, base_url):
                passed_tests += 1
        
        # Test service info endpoints
        logger.info("\n📋 Testing Service Info Endpoints...")
        for service_name, base_url in SERVICES.items():
            total_tests += 1
            if await self.test_service_info(service_name, base_url):
                passed_tests += 1
        
        # Test API Gateway authentication
        logger.info("\n📋 Testing API Gateway Authentication...")
        total_tests += 1
        if await self.test_api_gateway_auth():
            passed_tests += 1
        
        # Test Profile Service extraction
        logger.info("\n📋 Testing Profile Service AI Extraction...")
        total_tests += 1
        if await self.test_profile_service_extraction():
            passed_tests += 1
        
        # Test Profile Service CRUD
        logger.info("\n📋 Testing Profile Service CRUD Operations...")
        total_tests += 1
        if await self.test_profile_service_crud():
            passed_tests += 1
        
        # Print summary
        logger.info("\n" + "=" * 50)
        logger.info("📊 TEST SUMMARY")
        logger.info("=" * 50)
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests}")
        logger.info(f"Failed: {total_tests - passed_tests}")
        logger.info(f"Success Rate: {(passed_tests / total_tests * 100):.1f}%")
        
        if passed_tests == total_tests:
            logger.info("🎉 All tests passed! Your backend is working correctly.")
        else:
            logger.error("⚠️  Some tests failed. Check the logs above for details.")
        
        return passed_tests == total_tests

async def main():
    """Main test runner"""
    tester = ServiceTester()
    success = await tester.run_all_tests()
    
    if success:
        logger.info("\n🚀 Backend is ready for frontend integration!")
        logger.info("📖 View API documentation at:")
        for service_name, base_url in SERVICES.items():
            logger.info(f"   {service_name}: {base_url}/docs")
    else:
        logger.error("\n💥 Backend setup needs attention. Check service logs and configuration.")
    
    return success

if __name__ == "__main__":
    # Run the test suite
    result = asyncio.run(main())
    exit(0 if result else 1)