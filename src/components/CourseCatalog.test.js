import { render, screen } from "@testing-library/react";
import CourseCatalog from "./CourseCatalog";

test("renders the instructorName returned by the catalog API", () => {
  render(
    <CourseCatalog
      courses={[
        {
          id: 1,
          title: "API instructor",
          instructorName: "Ada Lovelace",
          instructor: "Outdated name",
        },
        {
          id: 2,
          title: "Legacy instructor",
          instructor: "Grace Hopper",
        },
        {
          id: 3,
          title: "No instructor",
          instructorName: null,
        },
      ]}
    />,
  );

  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  expect(screen.queryByText("Outdated name")).not.toBeInTheDocument();
  expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  expect(screen.getAllByText("Instructor:")).toHaveLength(2);
});
