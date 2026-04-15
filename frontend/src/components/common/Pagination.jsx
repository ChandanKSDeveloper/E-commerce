import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    maxButtons = 5,
}) {

    const getPageNumbers = () => {
        const page = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            page.push(i);
        }

        return page;
    };

    const handlePageChange = (page) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
            // smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    if (totalPages <= 1) return null;


    return (
        <div className="flex justify-center mt-8 mb-4">
            <nav className="flex items-center gap-1" aria-label="Pagination">
                {/* First Page Button */}
                {showFirstLast && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="h-9 w-9 cursor-pointer"
                    >
                        <ChevronsLeft className="h-4 w-4 cursor-pointer" />
                    </Button>
                )}

                {/* Previous Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 cursor-pointer"
                >
                    <ChevronLeft className="h-4 w-4 cursor-pointer" />
                </Button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum) => (
                    <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        className="h-9 w-9 cursor-pointer"
                    >
                        {pageNum}
                    </Button>
                ))}

                {/* Next Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 cursor-pointer"
                >
                    <ChevronRight className="h-4 w-4 cursor-pointer" />
                </Button>

                {/* Last Page Button */}
                {showFirstLast && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 cursor-pointer"
                    >
                        <ChevronsRight className="h-4 w-4 cursor-pointer" />
                    </Button>
                )}
            </nav>
        </div>
    );

}
