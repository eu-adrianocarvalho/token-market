import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <Package className="w-16 h-16 mx-auto text-muted-foreground" />
        <div>
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-xl text-muted-foreground">Page not found</p>
        </div>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="w-full">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
