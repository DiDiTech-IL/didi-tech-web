import { CourseCardProps } from "@/components/course-card";

const mockCourseData: CourseCardProps[] = [
  {
    id: "1",
    title: "React למתקדמים",
    description:
      "A comprehensive course on React.js for building dynamic web applications.",
    imageUrl: "https://via.placeholder.com/900x400.png?text=Mastering+React",
    chaptersNum: 15,
    price: 49.99,
    progress: 75,
    category: "Web Development",
  },
  {
    id: "2",
    title: "Introduction to TypeScript",
    description:
      "Learn TypeScript from scratch and enhance your JavaScript skills.",
    imageUrl:
      "https://via.placeholder.com/900x400.png?text=Intro+to+TypeScript",
    chaptersNum: 10,
    price: 29.99,
    progress: null,
    category: "Programming Languages",
  },
  {
    id: "3",
    title: "Advanced JavaScript",
    description:
      "Deep dive into JavaScript with advanced concepts and patterns.",
    imageUrl:
      "https://via.placeholder.com/900x400.png?text=Advanced+JavaScript",
    chaptersNum: 12,
    price: 39.99,
    progress: 50,
    category: "Web Development",
  },
  {
    id: "4",
    title: "UI/UX Design Principles",
    description:
      "Learn the fundamentals of user interface and user experience design.",
    imageUrl: "https://via.placeholder.com/900x400.png?text=UI%2FUX+Design",
    chaptersNum: 8,
    price: 24.99,
    progress: null,
    category: "Design",
  },
  {
    id: "5",
    title: "Python for Data Science",
    description: "Harness the power of Python to analyze and visualize data.",
    imageUrl:
      "https://via.placeholder.com/900x400.png?text=Python+for+Data+Science",
    chaptersNum: 18,
    price: 59.99,
    progress: 90,
    category: "Data Science",
  },
  {
    id: "6",
    title: "Complete Guide to Node.js",
    description: "Learn to build scalable backend applications using Node.js.",
    imageUrl: "https://via.placeholder.com/900x400.png?text=Guide+to+Node.js",
    chaptersNum: 20,
    price: 69.99,
    progress: null,
    category: "Backend Development",
  },
  {
    id: "7",
    title: "DevOps Essentials",
    description: "Understand the key concepts of DevOps and CI/CD pipelines.",
    imageUrl: "https://via.placeholder.com/900x400.png?text=DevOps+Essentials",
    chaptersNum: 10,
    price: 34.99,
    progress: 20,
    category: "DevOps",
  },
  {
    id: "8",
    title: "Introduction to Machine Learning",
    description:
      "Get started with machine learning using Python and Scikit-Learn.",
    imageUrl: "https://via.placeholder.com/900x400.png?text=Machine+Learning",
    chaptersNum: 15,
    price: 74.99,
    progress: null,
    category: "Data Science",
  },
  {
    id: "9",
    title: "Full Stack Web Development",
    description:
      "Become a full stack web developer by learning both frontend and backend technologies.",
    imageUrl:
      "https://via.placeholder.com/900x400.png?text=Full+Stack+Development",
    chaptersNum: 25,
    price: 99.99,
    progress: 60,
    category: "Web Development",
  },
  {
    id: "10",
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications using React Native.",
    imageUrl:
      "https://via.placeholder.com/900x400.png?text=React+Native+Development",
    chaptersNum: 12,
    price: 49.99,
    progress: null,
    category: "Mobile Development",
  },
];

const mockServiceData = [
  {
    id: "1",
    title: "Frontend Development",
    description:
      "Learn the fundamentals of frontend development using HTML, CSS, and JavaScript.",
    imageUrl:
      "https://via.placeholder.com/900x400.png?text=Frontend+Development",
    duration: 12,
    price: 29.99,
    category: "Web Development",
  },
  {
    id: "2",
    title: "Backend Development",
    description:
      "Learn the fundamentals of backend development using Python and Node.js.",
    imageUrl:
      "https://via.placeholder.com/900x400.png?text=Backend+Development",
    duration: 18,
    price: 49.99,
    category: "Backend Development",
  },
  {
    id: "3",
    title: "Mobile Development",
    description: "Learn the fundamentals of mobile development",
    imageUrl: "https://via.placeholder.com/900x400.png?text=Mobile+Development",
    duration: 15,
    price: 39.99,
    category: "Mobile Development",
  },
];

export const getCourses = async () => {
  return mockCourseData;
};

export const getServices = async () => {
  return mockServiceData;
};
