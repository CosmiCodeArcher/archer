import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Layout from "./Layout";
import Success from "./success";

const router = createBrowserRouter ( createRoutesFromElements (
  <>
    <Route path="/" element={<Layout />} />
    <Route path="/success" element={<Success />} />
  </>
) )

function App () {
  return (
    <RouterProvider router={router}/>
  )
}

export default App
