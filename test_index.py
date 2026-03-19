import sys
import traceback
from services.ai_service import AIService

try:
    with open('out.txt', 'w', encoding='utf-8') as f:
        sys.stdout = f
        sys.stderr = f
        svc = AIService()
        svc.index_directory(r'C:\PJT_new\educate')
except Exception as e:
    with open('out.txt', 'a', encoding='utf-8') as f:
        traceback.print_exc(file=f)
