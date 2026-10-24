const fs = require('fs');
const path = require('path');

function generateResumePDF() {
  const lines = [
    { type: 'header', text: 'MEENA KANNAN' },
    { type: 'subheader', text: 'Senior Full-Stack & Cloud Solutions Architect' },
    { type: 'contact', text: 'meenakannan.dev@gmail.com | linkedin.com/in/meena-kannan | github.com/meenak95' },
    { type: 'divider', text: '------------------------------------------------------------------------------------------------------------------------' },
    { type: 'section', text: 'EXECUTIVE SUMMARY' },
    { type: 'body', text: 'Senior Full-Stack Software Engineer & Solutions Architect with 7+ years of experience engineering high-concurrency' },
    { type: 'body', text: 'distributed microservices, multi-tenant SaaS products, and resilient cloud architectures. Expert in Clean Architecture,' },
    { type: 'body', text: 'Domain-Driven Design (DDD), Java 21 LTS, Spring Boot 3, React 19, TypeScript, PostgreSQL, Redis, and AWS Cloud Native.' },
    { type: 'space', text: '' },
    { type: 'section', text: 'CORE TECHNICAL ARSENAL' },
    { type: 'bullet', text: '• Backend & JVM: Java 21, Spring Boot 3, Spring Security, Spring Cloud, Hibernate/JPA, Node.js' },
    { type: 'bullet', text: '• Cloud & DevOps: AWS (EC2, S3, RDS, ECS, Lambda), Docker, Kubernetes (K8s), GitHub Actions CI/CD, Terraform' },
    { type: 'bullet', text: '• Databases & Streams: PostgreSQL, Redis (Caching & Distributed Locks), Apache Kafka, Oracle DB, Flyway' },
    { type: 'bullet', text: '• Frontend & UI: React 19, TypeScript, Next.js, Tailwind CSS 4, Framer Motion, Real-Time WebSockets' },
    { type: 'bullet', text: '• Architectural Patterns: Clean Architecture, Domain-Driven Design (DDD), CQRS, Saga Pattern, Resilience4j' },
    { type: 'space', text: '' },
    { type: 'section', text: 'PROFESSIONAL EXPERIENCE' },
    { type: 'role', text: 'Lead Full-Stack & Cloud Solutions Architect | Enterprise Cloud & SaaS Consulting (2022 - Present)' },
    { type: 'bullet', text: '• Decomposed monolithic legacy architectures into 12 autonomous microservices with Kafka, achieving 99.99% SLA.' },
    { type: 'bullet', text: '• Established automated GitHub Actions CI/CD pipelines, slashing release turnaround from 2 days to under 15 minutes.' },
    { type: 'bullet', text: '• Optimized PostgreSQL queries and implemented multi-tier Redis caching, cutting monthly cloud spend by 40%.' },
    { type: 'bullet', text: '• Spearheaded Clean Architecture & DDD best practices, mentoring 10+ cross-functional software engineers.' },
    { type: 'space', text: '' },
    { type: 'role', text: 'Senior Full-Stack Software Engineer | FinTech & Scale-up Technologies (2020 - 2022)' },
    { type: 'bullet', text: '• Engineered high-throughput REST APIs handling 50,000+ concurrent active sessions with sub-80ms response times.' },
    { type: 'bullet', text: '• Implemented secure JWT and OAuth2 authorization flows with Spring Security, passing 100% compliance audits.' },
    { type: 'bullet', text: '• Tuned HikariCP connection pools and database indexing, speeding up query retrieval by 60%.' },
    { type: 'space', text: '' },
    { type: 'role', text: 'Software Engineer | Enterprise Web Solutions (2018 - 2020)' },
    { type: 'bullet', text: '• Developed mission-critical core inventory modules processing over 25M+ relational records with zero downtime.' },
    { type: 'bullet', text: '• Authored comprehensive unit and integration testing suites with JUnit & Mockito, cutting production defects by 75%.' },
    { type: 'space', text: '' },
    { type: 'section', text: 'FEATURED ARCHITECTURAL PROJECTS' },
    { type: 'bullet', text: '• Enterprise SaaS Platform: Multi-tenant portfolio & management platform with Spring Boot 3, React 19, Redis, Docker.' },
    { type: 'bullet', text: '• Distributed E-Commerce Microservices: Event-driven engine handling 10,000+ RPS with Kafka & Kubernetes autoscaling.' },
    { type: 'bullet', text: '• Real-Time Collaboration Engine: Sub-20ms WebSocket broadcast sync supporting 50,000+ concurrent sessions.' },
    { type: 'bullet', text: '• FinTech Transaction & Compliance Gateway: PCI-DSS compliant payment gateway handling $10M+ daily volume.' }
  ];

  let stream = 'BT\n';
  let currentY = 800;

  for (const item of lines) {
    const safeText = item.text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    
    if (item.type === 'header') {
      stream += `/F2 18 Tf\n50 ${currentY} Td\n(${safeText}) Tj\n`;
      currentY -= 20;
    } else if (item.type === 'subheader') {
      stream += `/F2 11 Tf\n50 ${currentY} Td\n(${safeText}) Tj\n`;
      currentY -= 15;
    } else if (item.type === 'contact') {
      stream += `/F1 9 Tf\n50 ${currentY} Td\n(${safeText}) Tj\n`;
      currentY -= 14;
    } else if (item.type === 'divider') {
      stream += `/F1 8 Tf\n50 ${currentY} Td\n(${safeText}) Tj\n`;
      currentY -= 16;
    } else if (item.type === 'section') {
      stream += `/F2 11 Tf\n50 ${currentY} Td\n(${safeText}) Tj\n`;
      currentY -= 15;
    } else if (item.type === 'role') {
      stream += `/F2 9.5 Tf\n50 ${currentY} Td\n(${safeText}) Tj\n`;
      currentY -= 13;
    } else if (item.type === 'bullet' || item.type === 'body') {
      stream += `/F1 8.5 Tf\n50 ${currentY} Td\n(${safeText}) Tj\n`;
      currentY -= 12;
    } else if (item.type === 'space') {
      currentY -= 6;
    }
  }
  stream += 'ET\n';

  const streamLen = Buffer.byteLength(stream, 'utf8');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}endstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n'
  ];

  let body = '%PDF-1.4\n';
  const offsets = [0];
  
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body, 'utf8'));
    body += obj;
  }

  const xrefOffset = Buffer.byteLength(body, 'utf8');
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body + xref + trailer, 'utf8');
}

const outputPath = path.join(__dirname, '..', 'public', 'Meena_Kannan_Senior_Architect_Resume.pdf');
fs.writeFileSync(outputPath, generateResumePDF());
console.log('Successfully created:', outputPath);
