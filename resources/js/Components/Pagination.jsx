import { Link } from "@inertiajs/react";

export default function Pagination({ links }) {
    return (
        <div className="flex flex-wrap mt-6 -mb-1">
            {links.map((link, key) =>
                link.url === null ? (
                    <div
                        key={key}
                        className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded hover:bg-white focus:border-primary focus:text-primary ${
                            link.active
                                ? "bg-orange-500 text-white border-orange-600 font-bold"
                                : "bg-white"
                        }`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            )}
        </div>
    );
}
