'use client'
import DataFetchError from "@/components/Errors/DataFetchError/DataFetchError"

function Demo() {
    return (
        <>
            <DataFetchError fetchError={"Error fetching user profile."}/>
        </>
    )
}

export default Demo;