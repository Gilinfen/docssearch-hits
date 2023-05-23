import algoliasearch from 'algoliasearch'

const client = algoliasearch('S65A0TTPZ3', '678a9bd7e36c111e939190aa2194faf2')
const index = client.initIndex('test')

async function upload(res: any) {
    return index.saveObjects(res).catch((err: any) => {
        console.log('Error___objectID___     ', res[0].objectID)
        console.log(err)
    })
}

export async function uploadSequentially(prearr: any[]) {
    for (const item of prearr) {
        await upload(item)
    }
}
