"""Test Supabase connection"""
from app.core.config import settings
from app.services.supabase_service import supabase_service

print("=" * 50)
print("Checking Supabase connection...")
print("=" * 50)
print(f"SUPABASE_URL: {settings.SUPABASE_URL}")
print(f"SUPABASE_KEY: {settings.SUPABASE_KEY[:50] if settings.SUPABASE_KEY else 'EMPTY'}...")
print()
print(f"Connected: {supabase_service.is_connected()}")
print("=" * 50)

if supabase_service.is_connected():
    print("✅ Supabase is connected!")
    # Try a simple query
    try:
        result = supabase_service.supabase.table('users').select('*').limit(1).execute()
        print(f"✅ Can query users table: {len(result.data) if result.data else 0} users found")
    except Exception as e:
        print(f"❌ Error querying: {e}")
else:
    print("❌ Supabase is NOT connected")
    print("\nMake sure .env file has:")
    print("SUPABASE_URL=https://your-project.supabase.co")
    print("SUPABASE_KEY=your-service-role-key")

