import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SavedProductsProvider } from "./contexts/SavedProductsContext";
import { QuoteCartProvider } from "./contexts/QuoteCartContext";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
import { useAuth } from "./contexts/AuthContext";
import { ScrollToTopButton } from "./components/ScrollToTopButton";

const HomePage            = lazy(() => import("./pages/HomePage"));
const ProductsPage        = lazy(() => import("./pages/ProductsPage"));
const ProductDetail       = lazy(() => import("./pages/ProductDetail"));
const CartPage            = lazy(() => import("./pages/CartPage"));
const CheckoutPage        = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmation   = lazy(() => import("./pages/OrderConfirmation"));
const AboutPage           = lazy(() => import("./pages/AboutPage"));
const GeneralMedicinePage = lazy(() => import("./pages/GeneralMedicinePage"));
const LaboratoryPage      = lazy(() => import("./pages/LaboratoryPage"));
const SurgeryPage         = lazy(() => import("./pages/SurgeryPage"));
const LoginPage           = lazy(() => import("./pages/LoginPage"));
const SignUpPage          = lazy(() => import("./pages/SignUpPage"));
const ForgotPasswordPage  = lazy(() => import("./pages/ForgotPasswordPage"));
const DashboardPage       = lazy(() => import("./pages/DashboardPage"));
const NotFound            = lazy(() => import("./pages/not-found"));
const AdminLoginPage      = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage  = lazy(() => import("./pages/AdminDashboardPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[40vh]">
      <div className="h-9 w-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdminAuthenticated } = useAdminAuth();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-9 w-9 rounded-full border-2 border-[#8B0000] border-t-transparent animate-spin" /></div>;
  }

  const isUserAdmin = isAuthenticated && user?.role === "admin";

  if (!isAdminAuthenticated && !isUserAdmin) {
    if (isAuthenticated && user?.role === "customer") {
      navigate("/account");
    } else {
      navigate("/admin/login");
    }
    return null;
  }

  return <Component />;
}

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isAdminAuthenticated } = useAdminAuth();
  const [, navigate] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  if (isAdminRoute && !isLoading && isAuthenticated && user?.role === "customer" && !isAdminAuthenticated) {
    navigate("/account");
    return null;
  }

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-9 w-9 rounded-full border-2 border-[#8B0000] border-t-transparent animate-spin" /></div>}>
        <Switch>
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/admin">
            {() => <AdminRoute component={AdminDashboardPage} />}
          </Route>
        </Switch>
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ScrollToTop />
      <Header />
      <main className="flex-1 bg-background text-foreground flex flex-col">
        <Suspense fallback={<PageSpinner />}>
          <Switch>
            <Route path="/"                       component={HomePage} />
            <Route path="/about"                  component={AboutPage} />
            <Route path="/general-medicine"       component={GeneralMedicinePage} />
            <Route path="/laboratory"             component={LaboratoryPage} />
            <Route path="/surgery"                component={SurgeryPage} />
            <Route path="/products"               component={ProductsPage} />
            <Route path="/products/:id"           component={ProductDetail} />
            <Route path="/cart"                   component={CartPage} />
            <Route path="/checkout"               component={CheckoutPage} />
            <Route path="/order-confirmation/:id" component={OrderConfirmation} />
            <Route path="/login"                  component={LoginPage} />
            <Route path="/signup"                 component={SignUpPage} />
            <Route path="/forgot-password"        component={ForgotPasswordPage} />
            <Route path="/account">
              {() => <ProtectedRoute component={DashboardPage} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <AuthProvider>
            <SavedProductsProvider>
              <QuoteCartProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
              </QuoteCartProvider>
            </SavedProductsProvider>
          </AuthProvider>
        </AdminAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
