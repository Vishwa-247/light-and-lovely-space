
import { CourseType } from "@/types";

// Static course data for immediate display
export const staticCourses = {
  "network_security": {
    beginner: {
      title: "Network Security Fundamentals",
      summary: "A beginner-friendly introduction to network security concepts and best practices.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This course provides an introduction to essential network security concepts, tools, and methodologies for beginners. Learn how to protect networks from common threats and vulnerabilities.",
          chapters: [
            {
              title: "Introduction to Network Security",
              content: "Network security refers to the policies, practices, and configurations adopted by the network administrator to prevent and monitor unauthorized access, misuse, modification, or denial of computer network resources. This chapter introduces the fundamental concepts of network security including CIA triad (Confidentiality, Integrity, Availability), threats and vulnerabilities, and an overview of security controls.\n\nNetwork security has become increasingly important as organizations connect more devices and systems to networks, especially the internet. A comprehensive network security strategy involves hardware, software, and human components working together to protect network resources.",
              order_number: 1
            },
            {
              title: "Common Network Threats",
              content: "This chapter examines the most common network threats that organizations face today. We discuss malware (viruses, worms, trojans), phishing attacks, man-in-the-middle attacks, denial-of-service attacks, and insider threats.\n\nFor each threat type, we explore how attackers execute these attacks, the potential impact, and basic detection methods. Understanding these threats is the first step toward building effective defenses.",
              order_number: 2
            },
            {
              title: "Network Security Tools",
              content: "This chapter introduces essential network security tools that help protect, monitor, and analyze network traffic and systems. We cover firewalls (network and host-based), intrusion detection/prevention systems (IDS/IPS), virtual private networks (VPNs), and network monitoring tools.\n\nFor each tool category, we discuss its role in network security, how it functions, and best practices for implementation. We also explore free and open-source options that beginners can use to practice and learn.",
              order_number: 3
            },
            {
              title: "Basic Security Policies",
              content: "Effective network security requires not just technical controls but also well-defined policies and procedures. This chapter covers password policies, access control principles, security awareness training, incident response planning, and acceptable use policies.\n\nWe discuss how to develop these policies for small organizations or personal networks, emphasizing practical implementation over theoretical frameworks. The chapter concludes with examples of simple security policies that beginners can adapt for their own use.",
              order_number: 4
            }
          ]
        },
        flashcards: [
          {
            question: "What is the CIA triad in security?",
            answer: "The CIA triad stands for Confidentiality, Integrity, and Availability. These are the three main objectives of information security."
          },
          {
            question: "What is the difference between IDS and IPS?",
            answer: "An Intrusion Detection System (IDS) monitors network traffic and alerts on suspicious activity, while an Intrusion Prevention System (IPS) actively blocks detected threats."
          },
          {
            question: "What is a firewall?",
            answer: "A firewall is a network security device that monitors and filters incoming and outgoing network traffic based on predetermined security rules."
          }
        ],
        mcqs: [
          {
            question: "Which of the following is NOT one of the components of the CIA triad?",
            options: ["Confidentiality", "Integrity", "Authentication", "Availability"],
            correct_answer: "Authentication"
          },
          {
            question: "What type of attack floods a network or server with excessive traffic to make it unavailable?",
            options: ["Man-in-the-middle attack", "Denial of Service (DoS) attack", "Phishing attack", "Brute force attack"],
            correct_answer: "Denial of Service (DoS) attack"
          }
        ],
        qnas: [
          {
            question: "Why is network segmentation important for security?",
            answer: "Network segmentation divides a network into multiple segments or subnets, which helps limit the spread of attacks, reduces the attack surface, and provides better access control. If one segment is compromised, proper segmentation helps contain the breach and prevents lateral movement across the entire network."
          },
          {
            question: "What basic steps should a beginner take to secure their home network?",
            answer: "To secure a home network, beginners should: 1) Change default router credentials, 2) Enable strong WiFi encryption (WPA3 if possible), 3) Keep firmware updated, 4) Use strong, unique passwords, 5) Enable the router's firewall, 6) Create a guest network for visitors, and 7) Consider using DNS filtering for additional protection."
          }
        ]
      }
    },
    intermediate: {
      title: "Advanced Network Security",
      summary: "Take your network security skills to the next level with advanced concepts and implementations.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This intermediate-level course builds on basic network security knowledge to explore advanced concepts, tools, and implementation strategies for comprehensive network protection.",
          chapters: [
            {
              title: "Advanced Network Security Architectures",
              content: "This chapter explores sophisticated network security architectures including defense-in-depth, zero-trust networking, and secure network zoning. We discuss how to implement multiple layers of security controls throughout your network infrastructure, ensuring that if one defense fails, others remain to protect critical assets.\n\nThe zero-trust model is examined in detail, focusing on the principle of 'never trust, always verify' regardless of whether the access request comes from inside or outside the network perimeter. We also cover network segmentation strategies beyond basic VLANs, including micro-segmentation and software-defined perimeters.",
              order_number: 1
            },
            {
              title: "Network Monitoring and Threat Detection",
              content: "Effective network security requires continuous monitoring and advanced threat detection capabilities. This chapter covers network traffic analysis, security information and event management (SIEM) systems, user and entity behavior analytics (UEBA), and threat hunting methodologies.\n\nWe explore tools and techniques for identifying suspicious patterns in network traffic, correlating security events from multiple sources, and establishing baseline behaviors to detect anomalies. The chapter includes practical guidance on implementing these capabilities in mid-size environments with reasonable resource constraints.",
              order_number: 2
            },
            {
              title: "Secure Network Protocols and Services",
              content: "This chapter examines secure alternatives to common network protocols and best practices for hardening network services. Topics include TLS/SSL implementation, secure remote access (SSH, VPN technologies), encrypted communications, DNS security extensions (DNSSEC), and email security protocols (SPF, DKIM, DMARC).\n\nFor each protocol or service, we discuss common vulnerabilities, security implications, and configuration best practices. The chapter emphasizes practical implementation guidance and security trade-offs that network administrators should consider.",
              order_number: 3
            },
            {
              title: "Network Security Assessment",
              content: "Regular security assessments are crucial for maintaining effective network security. This chapter covers vulnerability scanning, penetration testing fundamentals, network security audits, and compliance requirements (such as PCI DSS, HIPAA, or GDPR as they relate to network security).\n\nWe discuss approaches for identifying, prioritizing, and remediating network vulnerabilities, including the use of industry-standard tools. The chapter also addresses how to develop and implement a regular assessment schedule appropriate for different network environments.",
              order_number: 4
            }
          ]
        }
      }
    },
    advanced: {
      title: "Enterprise Network Security Management",
      summary: "Master enterprise-level network security strategies and implementations for large-scale environments.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This advanced course provides comprehensive knowledge of enterprise network security management, covering complex architectures, advanced threat protection, and security operations center management.",
          chapters: [
            {
              title: "Enterprise Security Architecture",
              content: "This chapter focuses on designing and implementing security architectures for large, complex enterprise networks. Topics include multi-site security architectures, cloud security integration, software-defined networking (SDN) security, and securing hybrid environments.\n\nWe examine frameworks for security architecture design, including SABSA and TOGAF as they apply to security, and discuss how to align security architecture with business objectives and risk tolerance. The chapter also covers security considerations for emerging network paradigms like 5G, IoT networks, and edge computing.",
              order_number: 1
            },
            {
              title: "Advanced Threat Protection",
              content: "Modern enterprise networks face sophisticated threats from determined adversaries. This chapter covers advanced persistent threats (APTs), zero-day exploit protection, threat intelligence integration, and deception technologies.\n\nWe explore the attack lifecycle of sophisticated threats and strategies for disrupting attacks at different stages. The chapter includes discussions on threat hunting in large environments, security orchestration, automation and response (SOAR) platforms, and building adaptive security capabilities that evolve with the threat landscape.",
              order_number: 2
            },
            {
              title: "Security Operations Center",
              content: "This chapter focuses on building and operating an effective Security Operations Center (SOC) for enterprise networks. Topics include SOC models and structures, staffing and skill requirements, workflow optimization, metric development, and continuous improvement processes.\n\nWe discuss the integration of various security technologies within the SOC, including SIEM, EDR/XDR, UEBA, and threat intelligence platforms. The chapter also addresses incident response at scale, including playbook development, tabletop exercises, and post-incident analysis methodologies tailored for complex enterprise environments.",
              order_number: 3
            },
            {
              title: "Governance, Risk, and Compliance",
              content: "Enterprise network security requires strong governance frameworks and compliance management. This chapter covers security governance structures, risk management methodologies, compliance program development, and security metrics and reporting for executive leadership.\n\nWe discuss how to develop security policies and standards that scale across large organizations, establish risk appetite statements, create risk assessment frameworks, and build compliance monitoring programs. The chapter emphasizes approaches that balance security requirements with business objectives in complex regulatory environments.",
              order_number: 4
            }
          ]
        }
      }
    }
  },
  "machine_learning": {
    beginner: {
      title: "Introduction to Machine Learning",
      summary: "A beginner-friendly introduction to machine learning concepts and applications.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This course introduces fundamental machine learning concepts, algorithms, and practical applications for beginners with basic programming knowledge. Learn the building blocks of ML systems and develop a solid foundation for more advanced studies.",
          chapters: [
            {
              title: "What is Machine Learning?",
              content: "This chapter introduces the fundamental concept of machine learning (ML) and how it differs from traditional programming. We explore the definition of ML as systems that improve their performance on a specific task with experience or data, without being explicitly programmed for that improvement.\n\nWe discuss the three main categories of machine learning: supervised learning, unsupervised learning, and reinforcement learning, with real-world examples of each. The chapter concludes with an overview of common machine learning applications in different industries and the general ML workflow from data collection to model deployment.",
              order_number: 1
            },
            {
              title: "Supervised Learning Fundamentals",
              content: "This chapter focuses on supervised learning, where models learn from labeled examples. We cover regression problems (predicting continuous values) and classification problems (predicting categories), along with example use cases for each.\n\nWe introduce fundamental algorithms including linear regression, logistic regression, k-nearest neighbors, and decision trees, explaining their basic principles without diving into complex mathematics. Each algorithm is accompanied by practical examples and intuitive explanations of how they make predictions. The chapter includes discussions on training/testing splits, overfitting, and simple evaluation metrics for supervised models.",
              order_number: 2
            },
            {
              title: "Unsupervised Learning Basics",
              content: "This chapter explores unsupervised learning, where models identify patterns in unlabeled data. We focus on clustering algorithms (like K-means) that group similar data points, and dimensionality reduction techniques (like Principal Component Analysis) that simplify data while preserving important information.\n\nWe discuss real-world applications of unsupervised learning, such as customer segmentation, anomaly detection, and feature engineering for subsequent supervised learning tasks. The chapter emphasizes the exploratory nature of unsupervised learning and how it can reveal hidden patterns in data that aren't immediately obvious.",
              order_number: 3
            },
            {
              title: "Getting Started with ML Projects",
              content: "This practical chapter guides beginners through their first machine learning project using Python and popular libraries like scikit-learn and pandas. We walk through a complete project including data loading, exploration, preprocessing, model selection, training, evaluation, and basic interpretation.\n\nWe introduce essential tools for machine learning practitioners and best practices for organizing ML projects. The chapter concludes with common challenges beginners face when applying machine learning and strategies to overcome them, along with resources for continued learning and practice after completing the course.",
              order_number: 4
            }
          ]
        },
        flashcards: [
          {
            question: "What is the difference between supervised and unsupervised learning?",
            answer: "Supervised learning uses labeled data where the desired output is known, while unsupervised learning works with unlabeled data to find patterns or structure without predetermined outputs."
          },
          {
            question: "What is overfitting in machine learning?",
            answer: "Overfitting occurs when a model learns the training data too well, including its noise and outliers, resulting in poor performance on new, unseen data."
          }
        ],
        mcqs: [
          {
            question: "Which of the following is an example of a regression problem?",
            options: ["Predicting if an email is spam", "Classifying images of animals", "Predicting house prices", "Identifying fraudulent transactions"],
            correct_answer: "Predicting house prices"
          },
          {
            question: "Which algorithm is NOT typically used for supervised learning?",
            options: ["Linear Regression", "K-means", "Decision Trees", "Logistic Regression"],
            correct_answer: "K-means"
          }
        ],
        qnas: [
          {
            question: "What are the main steps in a typical machine learning workflow?",
            answer: "A typical machine learning workflow includes: 1) Problem definition, 2) Data collection, 3) Data preparation and cleaning, 4) Exploratory data analysis, 5) Feature engineering, 6) Model selection, 7) Model training, 8) Model evaluation, 9) Model tuning, and 10) Model deployment and monitoring."
          },
          {
            question: "What Python libraries are commonly used for machine learning projects?",
            answer: "Common Python libraries for machine learning include: 1) NumPy for numerical operations, 2) Pandas for data manipulation, 3) Scikit-learn for machine learning algorithms, 4) Matplotlib and Seaborn for data visualization, 5) TensorFlow or PyTorch for deep learning, and 6) SciPy for scientific computing."
          }
        ]
      }
    },
    intermediate: {
      title: "Applied Machine Learning",
      summary: "Take your machine learning skills to the next level with practical applications and advanced algorithms.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This intermediate course builds on fundamental machine learning concepts to explore more advanced algorithms, evaluation techniques, and real-world applications across various domains.",
          chapters: [
            {
              title: "Feature Engineering and Selection",
              content: "This chapter dives into the critical process of transforming raw data into informative features that improve model performance. We explore techniques for creating new features, handling categorical variables (one-hot encoding, target encoding), numerical transformations (scaling, binning, polynomial features), and text data processing (bag-of-words, TF-IDF).\n\nWe also cover feature selection methods including filter methods (correlation, chi-square), wrapper methods (recursive feature elimination), embedded methods (LASSO), and the importance of domain knowledge in feature engineering. The chapter includes practical examples of how effective feature engineering can dramatically improve model performance across different problem types.",
              order_number: 1
            },
            {
              title: "Advanced Supervised Learning",
              content: "This chapter explores more sophisticated supervised learning algorithms including ensemble methods (random forests, gradient boosting machines), support vector machines, and neural networks. For each algorithm, we discuss its principles, strengths, weaknesses, and appropriate use cases.\n\nWe dive deeper into hyperparameter tuning using grid search, random search, and validation strategies (k-fold cross-validation, stratified sampling). The chapter also covers handling class imbalance, learning curves, and strategies for improving model performance beyond basic implementations. Practical examples demonstrate when and how to apply these advanced techniques to real-world problems.",
              order_number: 2
            },
            {
              title: "Model Evaluation and Interpretation",
              content: "This chapter focuses on robust evaluation of machine learning models beyond simple accuracy metrics. We cover classification metrics (precision, recall, F1-score, ROC curves, AUC), regression metrics (RMSE, MAE, R-squared), and the importance of choosing appropriate metrics for different business problems.\n\nWe also explore techniques for model interpretation and explainability, including feature importance, partial dependence plots, SHAP values, and LIME. The chapter emphasizes the growing importance of interpretable machine learning in regulated industries and high-stakes decision contexts, providing examples of how to communicate model insights to non-technical stakeholders.",
              order_number: 3
            },
            {
              title: "Machine Learning in Production",
              content: "This chapter bridges the gap between experimental machine learning and production deployment. We discuss challenges in deploying ML models including version control, reproducibility, data and concept drift, and model monitoring.\n\nWe cover practical aspects of ML engineering such as creating pipelines for preprocessing and inference, model serialization, containerization, and simple API creation for model serving. The chapter introduces tools and best practices for each stage of the ML lifecycle, from development to deployment and maintenance, focusing on creating reliable and maintainable machine learning systems in real-world environments.",
              order_number: 4
            }
          ]
        }
      }
    },
    advanced: {
      title: "Deep Learning and AI Systems",
      summary: "Master advanced deep learning techniques and build sophisticated AI systems for complex problems.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This advanced course explores cutting-edge deep learning architectures, reinforcement learning, and the design of end-to-end AI systems for solving complex real-world problems.",
          chapters: [
            {
              title: "Deep Neural Network Architectures",
              content: "This chapter provides a comprehensive exploration of advanced neural network architectures and their applications. We cover convolutional neural networks (CNNs) for computer vision tasks, recurrent neural networks (RNNs), LSTM, and GRU for sequential data, transformers for natural language processing, and generative models including GANs and VAEs.\n\nFor each architecture, we examine their internal mechanics, the problems they're designed to solve, and implementation considerations. The chapter includes discussions on transfer learning approaches, fine-tuning pre-trained models, and strategies for training deep networks with limited data. We also address recent advances like attention mechanisms and self-supervised learning techniques that have pushed state-of-the-art performance in many domains.",
              order_number: 1
            },
            {
              title: "Reinforcement Learning",
              content: "This chapter explores reinforcement learning (RL), where agents learn to make decisions by taking actions in an environment to maximize cumulative rewards. We cover foundational concepts including Markov decision processes, value functions, and policies, as well as algorithms from classic Q-learning to deep reinforcement learning approaches like DQN, A3C, and PPO.\n\nWe examine real-world applications of reinforcement learning in robotics, game playing, recommendation systems, and automated trading. The chapter addresses challenges in reinforcement learning including the exploration-exploitation dilemma, sample efficiency, and reward design. We conclude with current research directions and emerging techniques like meta-reinforcement learning and multi-agent systems.",
              order_number: 2
            },
            {
              title: "Large Scale Machine Learning",
              content: "This chapter addresses the challenges and solutions for building machine learning systems at scale. We cover distributed training frameworks, parallel computing strategies, optimization techniques for large models, and efficient inference methods for deployment.\n\nWe examine techniques for handling massive datasets including online learning, mini-batch processing, and data sampling strategies. The chapter includes discussions on hardware acceleration (GPUs, TPUs), model compression techniques (pruning, quantization, distillation), and system design considerations for production ML pipelines handling terabytes of data. We also address MLOps practices for managing the complexity of large-scale machine learning systems, including automated retraining, A/B testing, and robust monitoring.",
              order_number: 3
            },
            {
              title: "Ethics and Responsible AI",
              content: "This final chapter explores the critical ethical considerations in advanced AI systems. We cover issues of fairness and bias in machine learning, techniques for identifying and mitigating biases, transparency and explainability requirements, privacy-preserving machine learning, and security vulnerabilities in AI systems.\n\nWe examine regulatory frameworks emerging around AI and practical approaches for implementing responsible AI principles in organizations. The chapter includes case studies of ethical failures in deployed AI systems and lessons learned, as well as frameworks for ethical decision-making throughout the AI development lifecycle. We conclude with a discussion of the broader societal impacts of advanced AI systems and the responsibilities of AI practitioners in shaping this rapidly evolving field.",
              order_number: 4
            }
          ]
        }
      }
    }
  },
  "data_mining": {
    beginner: {
      title: "Introduction to Data Mining",
      summary: "Learn the fundamentals of data mining techniques and applications for extracting useful insights from data.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This course introduces the fundamentals of data mining - the process of discovering patterns and knowledge from large amounts of data. Students will learn basic techniques and algorithms for extracting useful insights from various types of data.",
          chapters: [
            {
              title: "Introduction to Data Mining",
              content: "This chapter introduces the fundamental concepts of data mining and its relationship to other disciplines like statistics, machine learning, and database systems. We define data mining as the process of discovering patterns, relationships, and insights from large datasets using automated or semi-automated techniques.\n\nWe discuss the overall knowledge discovery process: data selection, preprocessing, transformation, data mining, and interpretation/evaluation. The chapter explores different types of data mining tasks including classification, clustering, association rule mining, anomaly detection, and regression, with real-world examples of each. We also address the growing importance of data mining across industries including retail, healthcare, finance, and digital marketing.",
              order_number: 1
            },
            {
              title: "Data Preprocessing",
              content: "Data preprocessing is often the most time-consuming yet crucial step in the data mining process. This chapter covers techniques for preparing raw data for mining, including data cleaning (handling missing values, identifying and managing outliers, correcting inconsistencies), data integration from multiple sources, data transformation (normalization, aggregation, discretization), and data reduction techniques (dimensionality reduction, numerosity reduction).\n\nWe provide practical examples of common preprocessing challenges and their solutions, emphasizing how proper preprocessing directly impacts the quality of mining results. The chapter includes hands-on examples using common tools and libraries for data preprocessing tasks.",
              order_number: 2
            },
            {
              title: "Exploratory Data Analysis",
              content: "Before applying complex data mining algorithms, exploratory data analysis (EDA) helps understand data characteristics and identify patterns visually. This chapter covers graphical and statistical techniques for exploring datasets, including summary statistics, correlation analysis, distribution visualization, and identifying relationships between variables.\n\nWe explore various visualization techniques appropriate for different data types and relationships, including scatter plots, histograms, box plots, heat maps, and pair plots. The chapter emphasizes the importance of EDA in guiding subsequent data mining efforts, helping to select appropriate algorithms and features, and identifying potential issues early in the process.",
              order_number: 3
            },
            {
              title: "Basic Data Mining Algorithms",
              content: "This chapter introduces fundamental algorithms for common data mining tasks. For classification, we cover decision trees and k-nearest neighbors. For clustering, we explore k-means and hierarchical clustering. For association rule mining, we introduce the Apriori algorithm for discovering frequent patterns and relationships.\n\nFor each algorithm, we provide intuitive explanations of how they work, their strengths and limitations, and appropriate use cases. We also discuss basic evaluation approaches for different types of data mining tasks, helping beginners understand how to assess the quality of their results. The chapter includes simple examples implemented with user-friendly libraries, focusing on practical understanding over mathematical complexity.",
              order_number: 4
            }
          ]
        },
        flashcards: [
          {
            question: "What is the difference between supervised and unsupervised data mining?",
            answer: "Supervised data mining works with labeled data and predefined outcomes (like classification and regression), while unsupervised data mining discovers patterns in unlabeled data without predetermined outputs (like clustering and association)."
          },
          {
            question: "What is the purpose of data preprocessing in data mining?",
            answer: "Data preprocessing transforms raw data into a clean, consistent format by handling missing values, removing outliers, normalizing values, and reducing dimensionality to improve the quality and effectiveness of subsequent data mining operations."
          }
        ],
        mcqs: [
          {
            question: "Which of the following is NOT a common data mining task?",
            options: ["Classification", "Clustering", "Compilation", "Association Rule Mining"],
            correct_answer: "Compilation"
          },
          {
            question: "Which algorithm is commonly used for discovering frequent itemsets in transaction data?",
            options: ["K-means", "Decision trees", "Apriori algorithm", "Linear regression"],
            correct_answer: "Apriori algorithm"
          }
        ],
        qnas: [
          {
            question: "How does data mining differ from traditional database querying?",
            answer: "Database querying retrieves existing information based on specific criteria from structured data using languages like SQL. Data mining, on the other hand, discovers previously unknown patterns, relationships, and insights from large datasets using algorithmic approaches. While database queries answer questions like 'What are the sales figures for Q1?', data mining answers questions like 'What product combinations are frequently purchased together?' or 'Which customer segments are most likely to respond to this promotion?'"
          },
          {
            question: "What are some common challenges in data preprocessing?",
            answer: "Common data preprocessing challenges include: 1) Handling missing values that may bias results, 2) Detecting and managing outliers that can skew analyses, 3) Integrating heterogeneous data from multiple sources with different formats and semantics, 4) Dealing with imbalanced datasets where some classes are underrepresented, 5) Reducing high dimensionality to avoid the 'curse of dimensionality', 6) Handling inconsistent or erroneous data entries, and 7) Converting categorical variables into a format suitable for algorithms that require numerical inputs."
          }
        ]
      }
    },
    intermediate: {
      title: "Advanced Data Mining Techniques",
      summary: "Explore sophisticated data mining algorithms and methodologies for complex pattern recognition and knowledge discovery.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This intermediate course builds upon basic data mining concepts to explore more advanced algorithms, techniques for complex data types, and real-world applications across various domains.",
          chapters: [
            {
              title: "Advanced Classification Methods",
              content: "This chapter explores sophisticated classification algorithms beyond the basics, including ensemble methods (random forests, boosting, bagging), support vector machines, Bayesian classifiers, and neural networks for classification tasks. We compare these methods across different problem types, datasets, and evaluation metrics.\n\nWe address challenges specific to classification, such as handling imbalanced datasets, multi-class classification strategies, cost-sensitive learning, and semi-supervised approaches that leverage both labeled and unlabeled data. The chapter includes detailed examples of algorithm selection based on problem characteristics and implementation considerations for optimizing classifier performance.",
              order_number: 1
            },
            {
              title: "Advanced Clustering and Outlier Analysis",
              content: "This chapter covers sophisticated approaches to clustering and outlier detection. For clustering, we explore density-based methods (DBSCAN, OPTICS), distribution-based clustering, spectral clustering, and evaluation metrics for cluster quality. We address challenges like determining optimal cluster numbers, handling clusters of different shapes and densities, and scalability concerns.\n\nFor outlier analysis, we examine statistical approaches, distance-based methods, density-based local outliers, and ensemble techniques for anomaly detection. The chapter discusses real-world applications of advanced clustering and outlier detection in areas such as customer segmentation, fraud detection, network intrusion detection, and scientific discovery of unusual patterns in data.",
              order_number: 2
            },
            {
              title: "Mining Complex Data Types",
              content: "Real-world data often extends beyond simple tabular formats. This chapter focuses on mining complex data types including text (document clustering, topic modeling, sentiment analysis), sequences and time series (pattern discovery, forecasting), spatial data (hotspot detection, co-location pattern mining), and graph data (community detection, influence analysis, frequent subgraph mining).\n\nFor each data type, we cover specialized preprocessing techniques, appropriate algorithms, and evaluation approaches. The chapter emphasizes how to adapt general data mining principles to the unique characteristics of different data structures, with practical examples of mining insights from complex real-world datasets.",
              order_number: 3
            },
            {
              title: "Pattern Evaluation and Knowledge Representation",
              content: "The final step in data mining is evaluating discovered patterns and presenting them in understandable forms. This chapter focuses on objective and subjective measures for pattern evaluation, techniques for visualizing complex patterns, and approaches for representing extracted knowledge in actionable formats.\n\nWe discuss strategies for distinguishing genuinely interesting patterns from coincidental ones, methods for handling redundancy in discovered knowledge, and techniques for communicating data mining results effectively to various stakeholders. The chapter also addresses the iterative nature of the data mining process and frameworks for incorporating discovered knowledge back into business or research processes to create tangible value.",
              order_number: 4
            }
          ]
        }
      }
    },
    advanced: {
      title: "Big Data Mining and Advanced Analytics",
      summary: "Master cutting-edge techniques for mining massive datasets and implementing advanced analytics solutions in enterprise environments.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This advanced course focuses on mining massive datasets, implementing scalable data mining solutions, and applying advanced analytics techniques to solve complex real-world problems in enterprise environments.",
          chapters: [
            {
              title: "Mining Massive Datasets",
              content: "This chapter addresses the unique challenges and solutions for mining truly massive datasets that exceed the capacity of traditional data mining approaches. We explore distributed computing frameworks (Hadoop, Spark) for data mining, sampling techniques for big data, sketch algorithms, and streaming data mining approaches for continuous, high-velocity data.\n\nWe examine specific algorithms adapted for massive scale, including distributed clustering, classification, and frequent pattern mining in the MapReduce paradigm. The chapter also covers dimensionality reduction techniques for high-dimensional big data and approaches for mining multi-terabyte datasets efficiently. Real-world case studies demonstrate how organizations handle data mining challenges at extreme scale.",
              order_number: 1
            },
            {
              title: "Advanced Predictive Analytics",
              content: "This chapter explores sophisticated predictive modeling techniques beyond standard classification and regression. Topics include ensemble strategies (stacking, blending), automated machine learning (AutoML), transfer learning approaches, active learning for optimizing labeled data acquisition, and multi-task learning frameworks for related prediction problems.\n\nWe address the end-to-end predictive analytics lifecycle in enterprise settings, including model governance, champion-challenger frameworks, A/B testing methodologies, and approaches for maintaining model performance over time. The chapter includes case studies from industries like insurance, finance, healthcare, and marketing where advanced predictive analytics drives significant business value.",
              order_number: 2
            },
            {
              title: "Deep Learning for Data Mining",
              content: "This chapter examines the application of deep learning techniques to data mining challenges. We cover deep neural networks for structured data, convolutional networks for spatial data mining, recurrent networks and transformers for sequential and temporal mining, and graph neural networks for relational data.\n\nWe explore deep learning approaches for specific data mining tasks including representation learning for complex features, deep clustering, anomaly detection with autoencoders, and pattern discovery in high-dimensional spaces. The chapter also addresses practical considerations including hardware requirements, hyperparameter optimization strategies, and frameworks for implementing deep learning in production data mining pipelines.",
              order_number: 3
            },
            {
              title: "Data Mining in Enterprise Analytics",
              content: "The final chapter focuses on implementing data mining as part of a comprehensive enterprise analytics strategy. We cover organizational aspects including analytics center of excellence models, data science team structures, and frameworks for prioritizing data mining initiatives based on business impact and feasibility.\n\nWe address technical architecture considerations for enterprise data mining platforms, governance frameworks for analytics, ethical considerations in advanced data mining, and approaches for measuring and communicating ROI from data mining initiatives. The chapter includes discussions on emerging trends including augmented analytics, automated insight discovery, and the integration of traditional data mining with newer AI approaches in next-generation enterprise systems.",
              order_number: 4
            }
          ]
        }
      }
    }
  },
  "full_stack": {
    beginner: {
      title: "Full Stack Web Development Fundamentals",
      summary: "Learn the essential technologies and concepts needed to build complete web applications as a full stack developer.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This course introduces the fundamental concepts, languages, and tools needed to become a full stack web developer. Learn both front-end and back-end development to build complete web applications from scratch.",
          chapters: [
            {
              title: "Introduction to Full Stack Development",
              content: "This chapter introduces the concept of full stack development and what it means to work across the entire web application stack. We define the main components of the stack including front-end (client-side), back-end (server-side), and database layers, explaining how they interact to create complete web applications.\n\nWe discuss the role of a full stack developer, required skill sets, typical responsibilities, and how full stack development fits into different team structures from startups to large enterprises. The chapter concludes with an overview of the current landscape of full stack technologies and frameworks, setting the foundation for the rest of the course.",
              order_number: 1
            },
            {
              title: "Front-End Development Basics",
              content: "This chapter covers the essential front-end technologies that form the foundation of modern web development. We start with HTML5 for creating structure, CSS3 for styling and responsive design, and JavaScript for adding interactivity to web pages. We explore the DOM (Document Object Model) and how to manipulate it with JavaScript.\n\nWe introduce basic concepts in responsive design using CSS flexbox and grid, and cover fundamental JavaScript concepts including variables, functions, events, and modern ES6+ syntax. The chapter includes practical exercises for creating simple web pages with interactive elements, setting up a development environment, and using browser developer tools for debugging.",
              order_number: 2
            },
            {
              title: "Back-End Development Fundamentals",
              content: "This chapter introduces server-side programming and the core concepts of back-end development. We cover a beginner-friendly back-end language and framework (Node.js with Express) to create simple APIs and server applications. We explain the client-server model, HTTP request/response cycle, RESTful API design principles, and how to handle basic routing and middleware functions.\n\nWe discuss server-side rendering versus client-side rendering approaches, and introduce the concept of APIs as interfaces between front and back ends. The chapter includes hands-on exercises for creating a simple server, defining routes, handling requests, and returning responses with different status codes and data formats.",
              order_number: 3
            },
            {
              title: "Database Integration",
              content: "This chapter covers the fundamentals of working with databases in web applications. We introduce both relational (SQL) and non-relational (NoSQL) database concepts, focusing on MongoDB as a beginner-friendly NoSQL option. We cover basic database operations (CRUD: Create, Read, Update, Delete) and how to integrate a database with a back-end application.\n\nWe discuss data modeling basics, simple schema design, and how to use an ODM (Object Document Mapper) or ORM (Object Relational Mapper) to interact with the database from application code. The chapter concludes with connecting our back-end server to the database to create a complete, albeit simple, full stack application that persists data.",
              order_number: 4
            }
          ]
        },
        flashcards: [
          {
            question: "What is the difference between front-end and back-end development?",
            answer: "Front-end development focuses on what users see and interact with in the browser (using HTML, CSS, JavaScript), while back-end development handles server-side logic, databases, and application infrastructure that powers the front-end experience."
          },
          {
            question: "What is a REST API?",
            answer: "REST (Representational State Transfer) API is an architectural style for designing networked applications that uses HTTP requests to access and manipulate data. RESTful APIs are stateless, support standard HTTP methods (GET, POST, PUT, DELETE), and return data in formats like JSON or XML."
          }
        ],
        mcqs: [
          {
            question: "Which of the following is NOT a front-end technology?",
            options: ["HTML", "CSS", "Express", "React"],
            correct_answer: "Express"
          },
          {
            question: "What does the C stand for in CRUD operations?",
            options: ["Create", "Compile", "Complete", "Confirm"],
            correct_answer: "Create"
          }
        ],
        qnas: [
          {
            question: "What skills should a beginner full stack developer focus on learning first?",
            answer: "Beginners should start with: 1) HTML and CSS fundamentals to understand web page structure and styling, 2) JavaScript basics for adding interactivity and logic, 3) A beginner-friendly back-end language/framework like Node.js with Express, 4) Basic database concepts using MongoDB or SQLite, 5) Version control with Git, 6) Understanding HTTP and basic API principles, and 7) Deployment basics. Master the fundamentals before moving to more complex frameworks and tools."
          },
          {
            question: "How do front-end and back-end components communicate in a web application?",
            answer: "Front-end and back-end components typically communicate through HTTP requests and responses. The front-end sends requests to specific endpoints (URLs) on the back-end server using methods like GET, POST, PUT, or DELETE. The back-end processes these requests, interacts with the database if needed, and returns responses containing data (often in JSON format) and status codes. This communication can happen through traditional form submissions, AJAX calls, or more modern approaches like RESTful APIs or GraphQL endpoints."
          }
        ]
      }
    },
    intermediate: {
      title: "Modern Full Stack Development",
      summary: "Build sophisticated web applications with modern frameworks and tools for both front-end and back-end development.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This intermediate course explores modern full stack development using contemporary frameworks, tools, and best practices for building robust, scalable web applications across the entire technology stack.",
          chapters: [
            {
              title: "Modern Front-End Frameworks",
              content: "This chapter focuses on modern JavaScript frameworks that have transformed front-end development. We cover React in depth, including component architecture, state management with hooks, context API, and common React patterns. We also provide overviews of alternatives like Vue.js and Angular to understand the broader ecosystem.\n\nWe explore front-end build systems (webpack, Vite), package management, and how to structure larger front-end applications. The chapter includes practical implementation of a feature-rich single-page application (SPA) with routing, form handling, API integration, and responsive design using a component library like Material UI or Bootstrap.",
              order_number: 1
            },
            {
              title: "Advanced Back-End Development",
              content: "This chapter dives deeper into back-end development with more advanced concepts and patterns. We explore Node.js/Express in greater depth, covering middleware patterns, authentication strategies (JWT, sessions), input validation, error handling, and logging. We also address performance considerations, security best practices, and testing approaches for back-end code.\n\nWe cover creating robust REST APIs with comprehensive documentation, versioning strategies, and thoughtful error responses. The chapter includes implementing authentication and authorization, rate limiting, and other common API features. We also touch on alternative back-end frameworks and languages to provide broader context for architectural decisions.",
              order_number: 2
            },
            {
              title: "Database Design and ORM",
              content: "This chapter explores more advanced database concepts critical for modern applications. We cover relational database design principles, normalization, indexing strategies, and query optimization. For NoSQL databases, we discuss data modeling patterns, aggregation frameworks, and when to choose different database types (document, key-value, graph, etc.).\n\nWe dive deeper into ORM/ODM tools (like Sequelize, Mongoose) for more efficient database interactions, covering associations/relationships, transactions, migrations, and seeding. The chapter also addresses database performance considerations, connection pooling, and caching strategies at the database level.",
              order_number: 3
            },
            {
              title: "Full Stack Integration and Deployment",
              content: "This chapter brings everything together by focusing on how to integrate front-end and back-end components into a cohesive application ready for production. We cover environment configuration, CI/CD pipelines, containerization with Docker, and deployment strategies for different platforms (Heroku, Vercel, AWS, etc.).\n\nWe address cross-cutting concerns like error handling across the stack, logging and monitoring, performance optimization, and security considerations. The chapter concludes with implementing a complete full stack project that demonstrates integration of all components, proper project structure, and deployment to a production environment with proper configuration for scalability and maintainability.",
              order_number: 4
            }
          ]
        }
      }
    },
    advanced: {
      title: "Enterprise Full Stack Architecture",
      summary: "Master advanced architectural patterns, scalability strategies, and enterprise considerations for complex full stack applications.",
      content: {
        status: "complete",
        parsedContent: {
          summary: "This advanced course explores enterprise-grade full stack development, focusing on scalable architectures, performance optimization, security, and modern development practices for complex applications.",
          chapters: [
            {
              title: "Scalable Application Architecture",
              content: "This chapter focuses on designing and implementing scalable architectures for enterprise applications. We explore microservices architecture in depth, including service decomposition strategies, inter-service communication patterns (synchronous APIs, message queues), API gateways, and service discovery. We contrast this with monolithic and serverless approaches to understand appropriate use cases for each.\n\nWe cover architectural patterns like CQRS (Command Query Responsibility Segregation), event sourcing, and hexagonal architecture. The chapter addresses cross-cutting concerns in distributed systems including distributed transactions, eventual consistency, and the challenges of maintaining data integrity across services. We also discuss strategies for breaking down legacy monoliths into more manageable services incrementally.",
              order_number: 1
            },
            {
              title: "Advanced Front-End Architecture",
              content: "This chapter explores sophisticated front-end architectures for complex enterprise applications. We cover state management patterns beyond basic React Context, including Redux, MobX, or Recoil for complex state requirements. We address front-end performance optimization techniques including code splitting, lazy loading, virtualization, memoization, and strategic rendering optimization.\n\nWe explore microfrontends as an architectural approach for large teams and applications, discussing implementation strategies, module federation, and integration challenges. The chapter also covers advanced TypeScript usage, design systems implementation, accessibility compliance for enterprise requirements, and testing strategies including unit, integration, and end-to-end testing for complex front-end applications.",
              order_number: 2
            },
            {
              title: "High-Performance Back-End Systems",
              content: "This chapter focuses on building high-performance, resilient back-end systems for enterprise workloads. We explore techniques for horizontal and vertical scaling, load balancing strategies, and database sharding. We address caching at multiple levels (application, database, CDN) and implementation of cache strategies like write-through and cache invalidation.\n\nWe cover handling asynchronous workflows using job queues, webhooks, and background processing. The chapter includes performance profiling, identifying bottlenecks, and optimization techniques for high-throughput systems. We also explore database performance tuning, connection management, and choosing appropriate database technologies for different workload patterns in enterprise applications.",
              order_number: 3
            },
            {
              title: "Enterprise Development Practices",
              content: "This final chapter addresses the practices and considerations unique to enterprise development environments. We cover enterprise security requirements including advanced authentication methods (OAuth 2.0, OIDC, SAML), fine-grained authorization, secure coding practices, and security testing methodologies.\n\nWe explore DevOps for enterprise applications including infrastructure as code, automated deployment pipelines, blue-green deployments, and monitoring/observability solutions. The chapter also addresses governance concerns like audit logging, compliance requirements (GDPR, HIPAA, SOC2), and disaster recovery strategies. We conclude with strategies for technical debt management, documentation practices for large codebases, and approaches for maintaining developer productivity on enterprise-scale applications.",
              order_number: 4
            }
          ]
        }
      }
    }
  }
};

// Helper function to get a static course based on topic and difficulty
export const getStaticCourse = (
  topic: string, 
  difficulty: "beginner" | "intermediate" | "advanced"
): any => {
  const normalizedTopic = topic.toLowerCase().includes("network") ? "network_security" :
                          topic.toLowerCase().includes("machine") ? "machine_learning" :
                          topic.toLowerCase().includes("data") ? "data_mining" :
                          topic.toLowerCase().includes("stack") ? "full_stack" :
                          "network_security"; // default fallback
  
  return staticCourses[normalizedTopic][difficulty];
};
