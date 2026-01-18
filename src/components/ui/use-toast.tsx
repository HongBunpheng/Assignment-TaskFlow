export function useToast() {
  return {
    toast: (args: { title?: string; description?: string }) => {
      console.log("Toast:", args);
    },
  };
}
