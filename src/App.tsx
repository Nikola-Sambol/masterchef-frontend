import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import AddRecipe from "./components/recipe/AddRecipe.tsx";
import AddComponent from "./components/component/AddComponent.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import RecipeCard from "./components/recipe/RecipeCard.tsx";
import RecipeDetails from "./components/recipe/RecipeDetails.tsx";
import LandingPage from "./components/LandingPage.tsx";
import {Toaster} from "react-hot-toast";
import Signup from "./components/auth/Signup.tsx";
import Signin from "./components/auth/Signin.tsx";
import AdminUsersPage from "./components/admin/AdminUsersPage.tsx";
import EditUserPage from "./components/user/EditUserPage.tsx";
import RecipesForCurrentUser from "./components/recipe/RecipesForCurrentUser.tsx";
import AccessDenied from "./components/auth/AccessDenied.tsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import AdminPage from "./components/admin/AdminPage.tsx";
import AdminCategoryPage from "./components/admin/AdminCategoryPage.tsx";
import NotFoundPage from "./components/NotFoundPage.tsx";

function App() {


    return (
        <BrowserRouter>
            <Navbar/>
            <Toaster position="bottom-center" reverseOrder={false}/>
            <div className="mt-24 min-h-[calc(100vh-96px)] flex flex-col justify-between">
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="allrecipes" element={<RecipeCard/>}/>
                    <Route path="recipedetails/:id" element={<RecipeDetails/>}/>
                    <Route path="signup" element={<Signup/>}/>
                    <Route path="signin" element={<Signin/>}/>
                    <Route path="access-denied" element={<AccessDenied/>}/>
                    <Route path="category" element={<AdminCategoryPage/>}/>

                    <Route path="/addrecipe" element={
                        <ProtectedRoute adminPage={false}>
                            <AddRecipe/>
                        </ProtectedRoute>
                    }/>

                    <Route path="/recipe/:id/addcomponent" element={
                        <ProtectedRoute adminPage={false}>
                            <AddComponent/>
                        </ProtectedRoute>
                    }/>


                    <Route path="adminuser" element={
                        <ProtectedRoute adminPage={true}>
                            <AdminUsersPage/>
                        </ProtectedRoute>
                    }/>

                    <Route path="useredit/:id?" element={
                        <ProtectedRoute adminPage={false}>
                            <EditUserPage/>
                        </ProtectedRoute>
                    }/>

                    <Route path="alluserrecipes" element={
                        <ProtectedRoute adminPage={false}>
                            <RecipesForCurrentUser/>
                        </ProtectedRoute>
                    }/>


                    <Route path="/admin" element={
                        <ProtectedRoute adminPage={true}>
                            <AdminPage />
                        </ProtectedRoute>
                    }>
                        <Route
                            path="users"
                            element={
                                <ProtectedRoute adminPage={true}>
                                    <AdminUsersPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="categories"
                            element={
                                <ProtectedRoute adminPage={true}>
                                    <AdminCategoryPage />
                                </ProtectedRoute>
                            }
                        />
                        {/* Dodaj ovdje još ruta po potrebi */}
                    </Route>

                </Routes>
            </div>


            <Footer/>
        </BrowserRouter>
    )
}

export default App
