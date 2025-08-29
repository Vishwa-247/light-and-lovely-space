
// Types for interview data
interface InterviewQuestion {
  question: string;
  answer: string;
  feedback: string;
  score: number;
}

interface TimelineItem {
  time: string;
  note: string;
  score: number;
}

interface Recommendation {
  title: string;
  type: string;
  reason: string;
  link: string;
}

export interface InterviewData {
  id: string;
  title: string;
  date: string;
  duration: string;
  overallScore: number;
  jobRole: string;
  techStack: string[];
  experience: string;
  feedback: {
    technical: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      summary: string;
    };
    communication: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      summary: string;
    };
    nonVerbal: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      summary: string;
    };
  };
  questions: InterviewQuestion[];
  recommendations: Recommendation[];
  videoAnalysis: {
    confidenceScore: number;
    engagementScore: number;
    stressIndicators: number;
    timeline: TimelineItem[];
  };
}

// Define static mock interview data with richer examples
const mockInterviewData: InterviewData = {
  id: "mock-001",
  title: "Software Engineer Interview (React)",
  date: "2025-05-15",
  duration: "32 minutes",
  overallScore: 78,
  jobRole: "Frontend Developer",
  techStack: ["React", "TypeScript", "Node.js"],
  experience: "3-5 years",
  feedback: {
    technical: {
      score: 82,
      strengths: [
        "Strong understanding of React component lifecycle",
        "Good knowledge of state management patterns",
        "Clear explanation of frontend performance optimization"
      ],
      weaknesses: [
        "Some gaps in TypeScript advanced types knowledge",
        "Limited understanding of modern build tools",
        "Could improve on system design explanations"
      ],
      summary: "Your technical knowledge is solid, especially in React fundamentals and state management. Focus on improving your TypeScript skills and expanding your knowledge of modern build tools and system design principles."
    },
    communication: {
      score: 75,
      strengths: [
        "Clear articulation of complex concepts",
        "Good pacing and tone throughout the interview",
        "Effective use of examples to illustrate points"
      ],
      weaknesses: [
        "Occasionally used vague terminology",
        "Some responses could be more concise",
        "A few instances of filler words that reduced clarity"
      ],
      summary: "Your communication is generally strong, with good articulation and pacing. Work on being more precise with technical terminology and reducing filler words to increase the impact of your responses."
    },
    nonVerbal: {
      score: 70,
      strengths: [
        "Maintained good eye contact",
        "Appropriate facial expressions",
        "Professional demeanor throughout"
      ],
      weaknesses: [
        "Occasional fidgeting indicated nervousness",
        "Body posture could be more confident",
        "Hand gestures sometimes distracting"
      ],
      summary: "Your non-verbal communication was professional, with good eye contact. Focus on reducing nervous fidgeting and adopting a more confident posture to enhance your presence."
    }
  },
  questions: [
    {
      question: "Explain the virtual DOM and how it improves performance in React.",
      answer: "The virtual DOM is a lightweight copy of the actual DOM. When state changes in a React application, React first updates the virtual DOM, compares it with the previous version (diffing), and then only updates the actual DOM with the necessary changes. This approach is more efficient than directly manipulating the DOM for every state change because DOM operations are expensive. By batching and optimizing these updates, React significantly improves performance, especially in complex applications with frequent state changes.",
      feedback: "Good explanation of the virtual DOM concept and its performance benefits. You could strengthen the answer by mentioning specific examples of when this optimization matters most, such as in components that re-render frequently.",
      score: 85
    },
    {
      question: "How would you handle state management in a large React application?",
      answer: "For large React applications, I would implement a state management solution that scales well. Context API is good for simpler applications or for state that doesn't change frequently. For more complex applications, I'd use Redux or Zustand. I prefer Redux when we need strong guarantees about state updates, middleware support, and a well-established ecosystem. I'd structure the store using the ducks pattern or feature-based organization. For server state, I'd integrate React Query to handle caching, background updates, and synchronization.",
      feedback: "Strong answer showing awareness of different state management approaches and their trade-offs. Good mention of React Query for server state management. Consider discussing how you would determine which state belongs in global store versus component-local state.",
      score: 90
    },
    {
      question: "Describe TypeScript's type system and how it helps prevent bugs.",
      answer: "TypeScript adds static typing to JavaScript, allowing developers to define types for variables, function parameters, return values, and more. It helps prevent bugs by catching type-related errors during development rather than at runtime. Features like interfaces, generics, and union types provide powerful ways to describe complex data structures. The type system also enhances developer experience through better autocomplete and documentation.",
      feedback: "Your explanation covers the basics well, but lacks depth on advanced TypeScript features. Consider expanding your knowledge of conditional types, mapped types, and the utility types that TypeScript provides. Also, specific examples of bugs that TypeScript prevents would strengthen this answer.",
      score: 65
    },
    {
      question: "What is your approach to testing React components?",
      answer: "I follow a comprehensive testing strategy for React components. I use Jest as the test runner and React Testing Library for component testing because it encourages testing from a user perspective. For unit tests, I focus on testing component logic, hooks, and utilities. For integration tests, I test how components work together and interact with API calls (using mocks like MSW). I also implement end-to-end tests with Cypress for critical user flows. I aim for high test coverage while focusing on testing behavior rather than implementation details.",
      feedback: "Excellent answer demonstrating a well-rounded testing strategy. Good mention of testing behavior over implementation details, which is a key best practice. Your answer shows familiarity with modern testing tools and approaches. Consider also mentioning visual regression testing for UI components.",
      score: 88
    },
    {
      question: "How do you optimize the performance of a React application?",
      answer: "I optimize React performance through several strategies: First, I identify performance issues using dev tools like React Profiler. I implement code splitting with React.lazy and Suspense to reduce initial bundle size. I use memoization techniques like useMemo and React.memo to prevent unnecessary rerenders. For state management, I structure my application to minimize prop drilling and use efficient state management solutions. I also implement virtualization for long lists with libraries like react-window, and optimize images and assets with modern formats and loading techniques.",
      feedback: "Strong answer covering multiple performance optimization techniques. Good explanation of both code-level optimizations and architectural considerations. You might expand on specific metrics you look for when measuring performance improvements and how you make decisions about which optimizations to prioritize.",
      score: 85
    }
  ],
  recommendations: [
    {
      title: "Advanced TypeScript Patterns",
      type: "course",
      reason: "To address gaps in TypeScript knowledge identified during the interview",
      link: "/course/ts-advanced"
    },
    {
      title: "System Design for Frontend Engineers",
      type: "course",
      reason: "To improve understanding of frontend architecture and system design principles",
      link: "/course/fe-system-design"
    },
    {
      title: "Technical Communication Skills",
      type: "practice",
      reason: "To work on more precise and concise communication of technical concepts",
      link: "/mock-interview?focus=communication"
    },
    {
      title: "Modern Build Tools and Deployment Pipelines",
      type: "course",
      reason: "To strengthen knowledge of frontend build tools identified as a gap",
      link: "/course/modern-build-tools"
    }
  ],
  videoAnalysis: {
    confidenceScore: 72,
    engagementScore: 85,
    stressIndicators: 40,
    timeline: [
      { time: "00:02:15", note: "Increased confidence when discussing familiar topics", score: 80 },
      { time: "00:08:40", note: "Signs of stress when addressing TypeScript questions", score: 55 },
      { time: "00:15:20", note: "Strong engagement and eye contact during system design explanation", score: 90 },
      { time: "00:22:10", note: "Fidgeting observed during challenging questions", score: 60 },
      { time: "00:28:35", note: "Confident closing statements and questions", score: 85 }
    ]
  }
};

// Create additional interview data for different roles
const fullStackInterviewData: InterviewData = {
  ...mockInterviewData,
  id: "mock-002",
  title: "Full Stack Developer Interview",
  jobRole: "Full Stack Developer",
  techStack: ["React", "Node.js", "MongoDB", "Express"],
  experience: "2-4 years",
  overallScore: 84,
  feedback: {
    ...mockInterviewData.feedback,
    technical: {
      ...mockInterviewData.feedback.technical,
      score: 88,
      strengths: [
        "Excellent understanding of RESTful API design",
        "Strong knowledge of database optimization",
        "Good grasp of frontend-backend integration strategies"
      ],
      weaknesses: [
        "Limited experience with microservices architecture",
        "Could improve knowledge of containerization tools",
        "Some gaps in understanding of caching strategies"
      ],
      summary: "Your technical knowledge is strong in both frontend and backend development. Focus on expanding your understanding of distributed systems architecture and containerization technologies to become a more well-rounded full-stack developer."
    }
  },
  questions: [
    {
      question: "How do you handle authentication and authorization in a full-stack application?",
      answer: "For authentication, I typically implement JWT-based auth flow where the backend validates credentials and issues tokens. These tokens are stored securely (HTTP-only cookies or local storage with proper security measures) and sent with each request. For authorization, I implement role-based access control with middleware on the backend to validate permissions before processing requests. On the frontend, I create protected routes and conditionally render UI elements based on user roles.",
      feedback: "Excellent answer demonstrating depth of knowledge in security concepts. Good explanation of both authentication and authorization strategies. Consider also discussing refresh token strategies and security considerations like CSRF protection.",
      score: 92
    },
    {
      question: "Explain how you would design a database schema for a social media platform.",
      answer: "I'd start with core entities like Users, Posts, and Comments using a normalized approach. The User table would store profile information with indexes on frequently queried fields. For Posts, I'd include content, timestamps, and foreign keys to users. Comments would reference both users and posts. For social connections, I'd create a self-referential table for following/follower relationships. For likes and reactions, I'd use junction tables. I'd also consider denormalizing certain data for read performance and implementing proper indexing strategies.",
      feedback: "Good overall database design with proper normalization. You've covered the core relationships well. To strengthen your answer, consider discussing how you'd handle scalability challenges like data partitioning, sharding strategies, or how you might leverage both SQL and NoSQL solutions for different aspects of the application.",
      score: 85
    },
    {
      question: "Describe your experience with API development and RESTful principles.",
      answer: "I have extensive experience designing and building RESTful APIs using Node.js and Express. I follow REST principles like statelessness, resource-based URLs, and appropriate HTTP methods. I implement proper status codes, pagination for large collections, and versioning strategies. For documentation, I use tools like Swagger/OpenAPI. I also focus on security by implementing input validation, rate limiting, and proper authentication. For testing, I write comprehensive tests using tools like Jest and Supertest.",
      feedback: "Strong answer showing practical experience with API development. Good coverage of RESTful principles and additional considerations like documentation and testing. You might expand on how you handle more complex scenarios like error handling strategies or request validation approaches.",
      score: 90
    }
  ]
};

const dataEngineerInterviewData: InterviewData = {
  ...mockInterviewData,
  id: "mock-003",
  title: "Data Engineer Interview",
  jobRole: "Data Engineer",
  techStack: ["Python", "SQL", "Spark", "AWS"],
  experience: "3-5 years",
  overallScore: 79,
  feedback: {
    ...mockInterviewData.feedback,
    technical: {
      ...mockInterviewData.feedback.technical,
      score: 81,
      strengths: [
        "Strong SQL optimization skills",
        "Good understanding of data pipelines",
        "Solid knowledge of data warehousing concepts"
      ],
      weaknesses: [
        "Limited experience with real-time data processing",
        "Could improve on distributed computing concepts",
        "Some gaps in cloud-based ETL solutions"
      ],
      summary: "Your foundation in data engineering principles is strong. To advance further, focus on deepening your knowledge of distributed data processing frameworks and real-time analytics solutions."
    }
  },
  questions: [
    {
      question: "Explain the difference between star and snowflake schema in data warehousing.",
      answer: "Star schema has a central fact table connected to multiple dimension tables, creating a star-like structure. Snowflake schema extends this by normalizing dimension tables into multiple related tables, resembling a snowflake. Star schema is simpler and typically faster for queries, while snowflake reduces data redundancy but can require more complex joins.",
      feedback: "Good explanation of the basic differences. Consider also discussing specific use cases where one might be preferred over the other, and how these schemas impact query performance and ETL processes.",
      score: 78
    },
    {
      question: "How would you approach optimizing a slow-running SQL query?",
      answer: "I would start by analyzing the execution plan to identify bottlenecks. Common optimization strategies include adding appropriate indexes, rewriting joins to be more efficient, avoiding SELECT *, limiting result sets, and considering query restructuring or materialized views for complex calculations. For large tables, partitioning or sharding might also help.",
      feedback: "Excellent answer demonstrating a systematic approach to query optimization and knowledge of various techniques. You could further strengthen this by mentioning specific monitoring tools you'd use to identify problematic queries.",
      score: 92
    },
    {
      question: "Describe your experience with ETL processes and tools.",
      answer: "I've designed and implemented ETL pipelines using tools like Apache Airflow for orchestration and Spark for processing large datasets. I typically structure pipelines with clear extraction logic from source systems, transformation steps that handle data cleaning and normalization, and loading procedures with appropriate error handling and validation.",
      feedback: "Your answer shows practical experience with ETL processes. To improve, consider discussing how you handle incremental loads, data quality checks, and monitoring for ETL pipelines. Also, expanding on specific challenges you've overcome in ETL implementations would strengthen the response.",
      score: 75
    },
    {
      question: "How do you ensure data quality in data pipelines?",
      answer: "I implement a multi-layered approach to data quality. At the source, I validate data against schemas and business rules before ingestion. During processing, I implement data quality checks like completeness, accuracy, and consistency validations. I use statistical methods to detect anomalies and outliers. I also maintain data lineage tracking to identify sources of quality issues. For monitoring, I create dashboards with data quality metrics and alerting for threshold violations.",
      feedback: "Excellent comprehensive answer covering multiple aspects of data quality management. Your approach demonstrates depth of knowledge and practical experience. Consider also discussing how you handle data quality issues when they're detected, including remediation processes and stakeholder communication.",
      score: 88
    }
  ]
};

// Create a cloud architect interview data
const cloudArchitectInterviewData: InterviewData = {
  ...mockInterviewData,
  id: "mock-004",
  title: "Cloud Architect Interview",
  jobRole: "Cloud Architect",
  techStack: ["AWS", "Terraform", "Kubernetes", "Docker"],
  experience: "5+ years",
  overallScore: 86,
  feedback: {
    ...mockInterviewData.feedback,
    technical: {
      score: 89,
      strengths: [
        "Excellent understanding of cloud service models",
        "Strong knowledge of infrastructure as code",
        "Comprehensive security implementation strategies"
      ],
      weaknesses: [
        "Could improve knowledge of multi-cloud strategies",
        "Limited experience with service mesh implementations",
        "Some gaps in understanding of FinOps practices"
      ],
      summary: "Your technical knowledge of cloud architecture principles is excellent. To further enhance your expertise, focus on multi-cloud architecture patterns and developing deeper knowledge of cost optimization strategies."
    },
    communication: {
      score: 85,
      strengths: [
        "Clear explanation of complex architectural concepts",
        "Effective use of diagrams and visual aids",
        "Good translation of technical concepts for business stakeholders"
      ],
      weaknesses: [
        "Occasionally went into unnecessary technical details",
        "Could improve conciseness in some explanations",
        "Some technical terms used without explanation"
      ],
      summary: "Your communication skills are strong, particularly in explaining complex cloud concepts. Work on tailoring your communication even more to different audience technical levels and being more concise in your explanations."
    },
    nonVerbal: {
      score: 82,
      strengths: [
        "Confident body language throughout the interview",
        "Engaging eye contact and gestures when explaining concepts",
        "Professional presence and demeanor"
      ],
      weaknesses: [
        "Occasional fast speaking when discussing familiar topics",
        "Could use more pauses for emphasis",
        "Some nervousness visible when challenged on certain topics"
      ],
      summary: "Your non-verbal communication projects confidence and expertise. Focus on controlling your pace, especially when discussing familiar topics, and incorporating strategic pauses to enhance impact."
    }
  },
  questions: [
    {
      question: "How would you approach designing a highly available and scalable architecture on AWS?",
      answer: "I'd design a multi-AZ architecture with resources distributed across at least three availability zones. For compute, I'd use Auto Scaling Groups to handle variable loads. For data, I'd implement multi-AZ databases with read replicas. I'd use a combination of ELB for load balancing and Route 53 for DNS failover. For stateless components, I'd ensure horizontal scalability, while stateful components would use managed services where possible. I'd implement infrastructure as code using Terraform for reproducibility and disaster recovery.",
      feedback: "Excellent comprehensive answer showing deep understanding of AWS services and high-availability design patterns. Good emphasis on using managed services and infrastructure as code. Consider also discussing how you'd approach monitoring and alerting for this architecture, and specific metrics you'd track for availability and performance.",
      score: 94
    },
    {
      question: "Explain your approach to securing cloud infrastructure.",
      answer: "I implement defense-in-depth security with multiple layers. Starting with identity and access management using least privilege principles and strong authentication. For network security, I use VPCs with proper segmentation, security groups, NACLs, and private endpoints where possible. For data protection, I implement encryption both at rest and in transit. I use security services like GuardDuty, Security Hub, and CloudTrail for monitoring and auditing. Infrastructure is defined as code with security policies built in, and regular compliance checks and penetration testing are scheduled.",
      feedback: "Strong answer demonstrating comprehensive understanding of cloud security principles. Good coverage of multiple security domains and defense-in-depth approach. To strengthen your response, consider discussing how you handle security incident response in cloud environments and your approach to container security.",
      score: 90
    },
    {
      question: "How do you approach cost optimization in cloud environments?",
      answer: "I approach cost optimization methodically, starting with visibility through tagging strategies and cost allocation tools. I implement governance with budgets and alerts. For optimization, I right-size resources based on utilization data, leverage reserved instances for predictable workloads and spot instances for fault-tolerant applications. I architect with serverless and managed services where appropriate to reduce operational costs. I also implement lifecycle policies for storage and implement auto-scaling based on demand patterns.",
      feedback: "Good answer covering many cost optimization techniques. To make this even stronger, consider discussing how you would establish a FinOps culture within organizations and how you measure the success of cost optimization initiatives. Also, provide specific examples of how you've achieved cost savings in previous roles.",
      score: 85
    },
    {
      question: "Describe your experience with containerization and orchestration.",
      answer: "I have extensive experience containerizing applications using Docker, focusing on creating minimal, secure images with multi-stage builds. For orchestration, I've implemented Kubernetes clusters both self-managed and using managed services like EKS. I've designed for scalability with horizontal pod autoscalers, implemented proper health checks and readiness probes, and set up CI/CD pipelines for container deployments. I've also implemented service meshes like Istio for advanced traffic management and security features.",
      feedback: "Strong answer demonstrating practical experience with containerization and orchestration. Good coverage of both implementation details and operational aspects. To enhance this response, consider discussing specific challenges you've faced with container orchestration and how you overcame them, as well as your approach to container security scanning and policy enforcement.",
      score: 88
    }
  ],
  recommendations: [
    {
      title: "Multi-Cloud Architecture Patterns",
      type: "course",
      reason: "To address identified gaps in multi-cloud knowledge",
      link: "/course/multi-cloud-architecture"
    },
    {
      title: "Advanced Kubernetes and Service Mesh",
      type: "course",
      reason: "To strengthen knowledge of service mesh implementations",
      link: "/course/advanced-kubernetes"
    },
    {
      title: "Cloud FinOps Certification",
      type: "certification",
      reason: "To develop expertise in cloud cost optimization and financial governance",
      link: "/certification/finops"
    },
    {
      title: "Technical Leadership Workshop",
      type: "workshop",
      reason: "To enhance communication skills for technical leadership roles",
      link: "/workshop/tech-leadership"
    }
  ],
  videoAnalysis: {
    confidenceScore: 86,
    engagementScore: 82,
    stressIndicators: 25,
    timeline: [
      { time: "00:03:45", note: "Strong confidence when discussing AWS architecture", score: 95 },
      { time: "00:12:20", note: "Detailed and clear explanations during security questions", score: 92 },
      { time: "00:18:50", note: "Some hesitation when discussing multi-cloud strategies", score: 75 },
      { time: "00:25:15", note: "Excellent use of examples when explaining cost optimization", score: 88 },
      { time: "00:32:40", note: "Good recovery from challenging question about service meshes", score: 80 }
    ]
  }
};

// Create a machine learning engineer interview data
const mlEngineerInterviewData: InterviewData = {
  ...mockInterviewData,
  id: "mock-005",
  title: "Machine Learning Engineer Interview",
  jobRole: "ML Engineer",
  techStack: ["Python", "TensorFlow", "PyTorch", "Scikit-learn"],
  experience: "3-5 years",
  overallScore: 82,
  feedback: {
    technical: {
      score: 85,
      strengths: [
        "Excellent understanding of neural network architectures",
        "Strong knowledge of model optimization techniques",
        "Good experience with ML deployment pipelines"
      ],
      weaknesses: [
        "Limited experience with reinforcement learning",
        "Could improve knowledge of distributed training frameworks",
        "Some gaps in understanding of ML ethics and fairness"
      ],
      summary: "Your technical knowledge in machine learning engineering is strong, particularly in neural networks and model optimization. Focus on expanding your knowledge of reinforcement learning and distributed training to become more well-rounded."
    },
    communication: {
      score: 80,
      strengths: [
        "Clear explanation of complex ML concepts",
        "Good use of analogies to simplify technical ideas",
        "Structured approach to answering technical questions"
      ],
      weaknesses: [
        "Occasionally used jargon without explanation",
        "Could improve storytelling when describing projects",
        "Some explanations were overly technical for the context"
      ],
      summary: "Your communication of machine learning concepts is generally clear and well-structured. Work on adjusting your technical level based on your audience and developing more compelling narratives around your project experiences."
    },
    nonVerbal: {
      score: 75,
      strengths: [
        "Confident demeanor when discussing technical subjects",
        "Good energy and enthusiasm for the field",
        "Appropriate professional appearance"
      ],
      weaknesses: [
        "Some nervous gestures when discussing unfamiliar topics",
        "Could improve eye contact during challenging questions",
        "Occasional rushed speaking when explaining complex concepts"
      ],
      summary: "Your enthusiasm for machine learning comes across well. Focus on maintaining consistent eye contact and speaking pace, especially when discussing challenging or less familiar topics."
    }
  },
  questions: [
    {
      question: "Explain the trade-offs between different types of neural network architectures.",
      answer: "Different neural network architectures offer distinct trade-offs. CNNs excel at spatial data like images but require significant data and computation. RNNs and LSTMs handle sequential data well but can suffer from vanishing gradients and training complexity. Transformers offer powerful parallelizable sequence modeling but demand substantial computational resources. MLPs are simple and fast but lack specialized inductive biases. The choice depends on data type, available resources, and specific requirements like interpretability or real-time inference needs.",
      feedback: "Excellent comprehensive answer demonstrating deep understanding of various neural network architectures and their application contexts. Good explanation of trade-offs between different approaches. Consider also discussing how you would approach architecture selection for specific business problems and mention emerging architectures like graph neural networks.",
      score: 92
    },
    {
      question: "How do you approach ML model deployment in production?",
      answer: "I follow a structured approach to ML deployment. First, I standardize the training pipeline with versioned data, code, and models using tools like DVC and MLflow. I containerize models using Docker for environment consistency. For serving, I implement RESTful APIs with FastAPI or TensorFlow Serving, with proper error handling and monitoring. I set up comprehensive monitoring for data drift, performance metrics, and resource utilization. For larger-scale deployments, I leverage orchestration with Kubernetes and implement CI/CD pipelines for automated testing and deployment.",
      feedback: "Strong answer covering the ML deployment lifecycle with specific tools and best practices. Good emphasis on monitoring and containerization. To enhance your response, consider discussing how you handle model rollbacks when issues are detected and strategies for deploying multiple model variants (A/B testing or canary deployments).",
      score: 88
    },
    {
      question: "How do you handle imbalanced datasets in classification problems?",
      answer: "For imbalanced datasets, I implement multiple strategies depending on the situation. At the data level, I use techniques like oversampling minority classes (SMOTE, ADASYN), undersampling majority classes, or generating synthetic data. At the algorithm level, I use class weights to penalize mistakes on minority classes more heavily. For evaluation, I focus on metrics beyond accuracy, like precision-recall curves, F1-score, and ROC-AUC. I also implement ensemble methods like balanced random forests or cost-sensitive learning approaches.",
      feedback: "Good answer covering multiple approaches to handling class imbalance. You've addressed data-level, algorithm-level, and evaluation techniques. To strengthen your response, consider discussing how you would choose between these different approaches based on specific problem characteristics and how you would validate their effectiveness.",
      score: 85
    },
    {
      question: "Explain your approach to feature engineering in ML projects.",
      answer: "My approach to feature engineering starts with domain understanding and exploratory data analysis to identify potential features. I implement transformations like normalization, binning, or encoding based on data types. For numerical features, I consider scaling, polynomial features, or binning. For categorical features, I use encoding strategies like one-hot, target, or embedding encoding. I also create interaction features and domain-specific features based on subject expertise. Throughout the process, I validate feature importance and impact on model performance using techniques like permutation importance or SHAP values.",
      feedback: "Strong answer demonstrating a systematic approach to feature engineering with specific techniques for different data types. Good emphasis on domain knowledge and validation. Consider also discussing automated feature engineering approaches and how you handle feature selection for high-dimensional data.",
      score: 86
    }
  ],
  recommendations: [
    {
      title: "Advanced Reinforcement Learning",
      type: "course",
      reason: "To address the identified gap in reinforcement learning knowledge",
      link: "/course/advanced-rl"
    },
    {
      title: "Distributed ML Training at Scale",
      type: "workshop",
      reason: "To strengthen knowledge of distributed training frameworks",
      link: "/workshop/distributed-ml"
    },
    {
      title: "Ethics in AI and ML",
      type: "course",
      reason: "To develop expertise in ML ethics and fairness considerations",
      link: "/course/ai-ethics"
    },
    {
      title: "Technical Communication for Data Scientists",
      type: "practice",
      reason: "To enhance ability to explain complex ML concepts to non-technical audiences",
      link: "/practice/tech-communication"
    }
  ],
  videoAnalysis: {
    confidenceScore: 78,
    engagementScore: 82,
    stressIndicators: 35,
    timeline: [
      { time: "00:04:10", note: "High engagement when discussing neural network architectures", score: 90 },
      { time: "00:11:35", note: "Confident explanation of deployment strategies", score: 85 },
      { time: "00:17:20", note: "Some hesitation when discussing reinforcement learning applications", score: 65 },
      { time: "00:23:45", note: "Good recovery and detailed explanation of feature engineering approaches", score: 80 },
      { time: "00:29:15", note: "Increased confidence when discussing practical implementation examples", score: 85 }
    ]
  }
};

// Map of all interview data
const interviewDataMap: Record<string, InterviewData> = {
  "default": mockInterviewData,
  "mock-001": mockInterviewData,
  "mock-002": fullStackInterviewData,
  "mock-003": dataEngineerInterviewData,
  "mock-004": cloudArchitectInterviewData,
  "mock-005": mlEngineerInterviewData
};

// Function to get interview data based on ID
export const getInterviewData = (id: string): InterviewData => {
  return interviewDataMap[id] || interviewDataMap["default"];
};
