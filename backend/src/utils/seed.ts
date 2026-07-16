import { prisma } from "./prisma"


const addData = async() =>{
    const addedData = await prisma.course.createMany({
        data : [
            {title : 'js' , userId : 'e9aa0d78-3f39-4da8-a430-29cdc053ff5e'},
            {title : 'ts' , userId : 'e9aa0d78-3f39-4da8-a430-29cdc053ff5e'},
            {title : 'node' , userId : 'e9aa0d78-3f39-4da8-a430-29cdc053ff5e'},
        ]
    })

    console.log(addData)
}

addData()