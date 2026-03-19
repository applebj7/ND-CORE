import traceback
try:
    import sys
    class _DummyLangchain: pass
    sys.modules.setdefault('langchain.docstore', _DummyLangchain())
    import langchain_core.documents
    sys.modules.setdefault('langchain.docstore.document', langchain_core.documents)
    import langchain_text_splitters
    sys.modules.setdefault('langchain.text_splitter', langchain_text_splitters)
    from paddleocr import PaddleOCR
except Exception:
    traceback.print_exc()
