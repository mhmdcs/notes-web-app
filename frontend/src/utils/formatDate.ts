
export function formatDate(date: string): string {
    return new Date(date).toLocaleString("en-US", 
    {
       year: "numeric",
       month: "short",
       day: "numeric",
       hour: "numeric",
       minute: "numeric",
    });
}