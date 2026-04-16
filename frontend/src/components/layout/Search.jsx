import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Search = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    // Debounce search (better performance)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            navigate(`/search?q=${searchTerm}`)
            setIsMenuOpen(false);
        }

    }
    return (
        <form onSubmit={handleSearch}>
            <div className="relative w-full">
                <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-20 rounded-full"
                />
                <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-3"
                >
                    <Search className="h-4 w-4" />
                </Button>
            </div>
        </form>
    )
}