export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Course {
    id: string;
    title: string;
    category: string;
    description: string;
    durationWeeks: number;
    level: CourseLevel;
    instructor: string;
    imageUrl: string;
}

export const COURSES: Course[] = [
    {
        id: "horticulture-fundamentals",
        title: "Horticulture Fundamentals",
        category: "Agriculture",
        description:
            "A foundational course covering essential principles of plant cultivation, soil health, and greenhouse management techniques.",
        durationWeeks: 8,
        level: "Beginner",
        instructor: "Grace Kamau",
        imageUrl:
            "https://images.unsplash.com/photo-1471194411894-71211c1d2b5d?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "food-safety-management",
        title: "Food Safety Management",
        category: "Food Safety",
        description:
            "Learn about critical control points, hazard analysis, and regulatory compliance to keep fresh produce safe from farm to fork.",
        durationWeeks: 6,
        level: "Intermediate",
        instructor: "Dr. Samuel Mbogo",
        imageUrl:
            "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "supply-chain-logistics",
        title: "Supply Chain Logistics for Produce",
        category: "Supply Chain",
        description:
            "Understand the intricacies of managing the fresh produce supply chain, including cold storage, transport, and traceability.",
        durationWeeks: 10,
        level: "Advanced",
        instructor: "Felix Otieno",
        imageUrl:
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "organic-farming-principles",
        title: "Organic Farming Principles",
        category: "Agriculture",
        description:
            "Explore the methods and benefits of organic farming, focusing on ecological balance, biodiversity, and sustainable inputs.",
        durationWeeks: 12,
        level: "Beginner",
        instructor: "Ruth Wangari",
        imageUrl:
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "post-harvest-handling",
        title: "Post-Harvest Handling Techniques",
        category: "Food Safety",
        description:
            "Master techniques to minimize post-harvest losses, maintain produce quality, and extend shelf life for local and export markets.",
        durationWeeks: 7,
        level: "Intermediate",
        instructor: "Moses Kariuki",
        imageUrl:
            "https://images.unsplash.com/photo-1597305877032-2349e7a286b3?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "agricultural-business-management",
        title: "Agricultural Business Management",
        category: "Agriculture",
        description:
            "Develop business acumen for the agricultural sector, covering financial planning, marketing, and cooperative strategies.",
        durationWeeks: 14,
        level: "Advanced",
        instructor: "John Mwangi",
        imageUrl:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "digital-agriculture-innovations",
        title: "Digital Agriculture Innovations",
        category: "Technology",
        description:
            "Discover the latest technologies transforming agriculture, including precision farming, IoT sensors, and data-driven decision tools.",
        durationWeeks: 9,
        level: "Intermediate",
        instructor: "Mwikali Nduta",
        imageUrl:
            "https://images.unsplash.com/photo-1525791646156-1c04ccf7b6c1?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "pest-disease-control",
        title: "Pest & Disease Control Strategies",
        category: "Agriculture",
        description:
            "Learn effective and sustainable methods for managing common pests and diseases in fruits and vegetables.",
        durationWeeks: 5,
        level: "Intermediate",
        instructor: "Beatrice Achieng",
        imageUrl:
            "https://images.unsplash.com/photo-1441123285228-1448e608f3d5?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "climate-smart-farming",
        title: "Climate-Smart Farming",
        category: "Sustainability",
        description:
            "Adapt to climate change impacts by implementing resilient farming practices and regenerative soil management techniques.",
        durationWeeks: 11,
        level: "Advanced",
        instructor: "Dr. Amina Ali",
        imageUrl:
            "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "fresh-produce-export-readiness",
        title: "Fresh Produce Export Readiness",
        category: "Supply Chain",
        description:
            "Prepare your agribusiness for export markets with guidance on quality standards, certifications, and logistics planning.",
        durationWeeks: 8,
        level: "Intermediate",
        instructor: "Mary Wanjiku",
        imageUrl:
            "https://images.unsplash.com/photo-1542834369-f10ebf06d3cb?auto=format&fit=crop&w=1000&q=80",
    },
    {
        id: "agrifinance-essentials",
        title: "Agri-Finance Essentials",
        category: "Business",
        description:
            "Navigate financing options, risk management, and investment planning tailored for growers and fresh produce cooperatives.",
        durationWeeks: 6,
        level: "Beginner",
        instructor: "Peter Njoroge",
        imageUrl:
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80",
    },
];
