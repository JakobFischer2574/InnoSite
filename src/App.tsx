import { BrowserRouter, Routes, Route } from "react-router";
import InnoPotProductIdeasPage from "./pages/InnoPotProductIdeasPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<InnoPotProductIdeasPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;