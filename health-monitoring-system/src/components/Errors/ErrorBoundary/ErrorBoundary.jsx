import React from "react";
import DFE from "@/components/Errors/DFE/DEF";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <DFE retry={() => this.setState({ hasError: false })} />
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
