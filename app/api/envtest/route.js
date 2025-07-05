export async function GET() {
  console.log("🔍 ENV MONGODB_URI:", process.env.MONGODB_URI);
  return new Response(JSON.stringify({
    uri: process.env.MONGODB_URI
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
