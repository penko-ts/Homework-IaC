export const handler = async (event: any) => {
    console.log('event', event);
    return {
        body: 'Yes',
        statusCode: 200,
        
    };
}