import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Layout from "./Layout";
import Success from "./success";
import ContactPage from "./ContactPage";
import MeetingScheduler from "./MeetingScheduler";

const router = createBrowserRouter ( createRoutesFromElements (
  <>
    <Route path="/" element={<Layout />} />
    <Route path="/success" element={<Success />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/meeting" element={<MeetingScheduler />} />
  </>
) )

function App () {
  return (
    <RouterProvider router={router}/>
  )
}

export default App