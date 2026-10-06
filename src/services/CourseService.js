import { catalogApi } from "./api";

export const CourseService = {
  getCourses: async () => {
    try {
      const res = await catalogApi.get("/courses");
      return res.data.content || res.data;
    } catch (err) {
      console.error("Error fetching courses:", err);
      throw err;
    }
  },

  getCourseById: async (courseId) => {
    try {
      const res = await catalogApi.get(`/courses/${courseId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching course:", err);
      throw err;
    }
  },

  getModules: async (courseId) => {
    try {
      const res = await catalogApi.get(`/courses/${courseId}/modules`);
      return res.data;
    } catch (err) {
      console.error("Error fetching modules:", err);
      throw err;
    }
  },

  enrollCourse: async (userId, courseId) => {
    try {
      const res = await catalogApi.post(`/courses/${courseId}/enroll`, {
        userId,
      });
      return res.data;
    } catch (err) {
      console.error("Error enrolling in course:", err);
      throw err;
    }
  },
};

export default CourseService;
