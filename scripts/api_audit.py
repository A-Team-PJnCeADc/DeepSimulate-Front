"""扫描前端 screens.ts / d2caps.ts，逐个打 /api/ext 判断接口是否打通。

输出：按分组列出「不通」的接口及上游原因；全部通过则打印汇总。
"""

import concurrent.futures as cf
import json
import re
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://127.0.0.1:9010/api/ext/"
ROOT = r"C:/Users/81103/Desktop/DeepSimulate-Front/src/"


def load_d2caps():
    ts = open(ROOT + "d2caps.ts", encoding="utf-8").read()
    start = ts.index("export const D2_CAPS")
    start = ts.index("= [", start) + 2
    return json.loads(ts[start:ts.rindex("]") + 1])


def load_screens():
    """从 screens.ts 里抽 D6/D1 的 path + 参数（正则足够，格式固定）"""
    ts = open(ROOT + "screens.ts", encoding="utf-8").read()
    out = []
    # D6 直接 path
    for m in re.finditer(r"id: '([a-z0-9_]+)',[^}]*?path: '(d6/[^']+)'", ts):
        out.append({"id": m.group(1), "path": m.group(2), "params": {}, "source": "D6"})
    # d1(...) 形式：path 与 a/c
    for m in re.finditer(r"d1\(\s*'([^']+)',\s*'([^']+)',\s*'[^']*',\s*'([^']+)',\s*\{([^}]*)\}", ts):
        body_txt = m.group(4)
        pairs = dict(re.findall(r"(\w+):\s*'([^']*)'", body_txt))
        out.append({"id": m.group(1), "name": m.group(2), "path": m.group(3), "params": pairs, "source": "D1"})
    return out


def probe(item):
    path = item["path"]
    params = {k: v for k, v in (item.get("params") or {}).items() if v and "{{" not in str(v)}
    url = BASE + path
    method = "GET"
    body = None
    if item.get("method") == "POST" or "d1/" in path:
        method = "POST"
        body = json.dumps(params).encode()
    elif params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, data=body, method=method, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            raw = r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        return item, f"HTTP {e.code}: {raw[:80]}"
    except Exception as e:  # noqa: BLE001
        return item, f"连接失败: {type(e).__name__}"
    try:
        d = json.loads(raw)
    except Exception:
        return item, f"非 JSON: {raw.strip()[:60]}"
    if isinstance(d, dict):
        code = d.get("code")
        if isinstance(code, int) and code not in (0, 1, 200):
            return item, f"code={code} {str(d.get('message') or d.get('Msg') or '')[:60]}"
        if d.get("success") is False:
            return item, f"{str(d.get('message') or '')[:60]}"
    return item, None


def main():
    items = []
    for c in load_d2caps():
        p = {"sub": c["sub"]} if c.get("sub") else {}
        if c.get("view_param") and c.get("view_val"):
            p[c["view_param"]] = c["view_val"]
        for pd in c.get("params") or []:
            p.setdefault(pd["key"], pd["def"])
        items.append({
            "id": c["id"], "name": c["name"], "group": c.get("category"),
            "path": "d2/gc", "params": {k: v for k, v in p.items() if v}, "method": c.get("method"),
        })
    items += load_screens()

    bad = []
    with cf.ThreadPoolExecutor(max_workers=8) as ex:
        for item, err in ex.map(probe, items):
            if err:
                bad.append((item, err))

    print(f"总数 {len(items)}  不通 {len(bad)}  通过 {len(items) - len(bad)}")
    by_group = {}
    for item, err in bad:
        by_group.setdefault(item.get("group") or item.get("source"), []).append((item["name"] if item.get("name") else item["id"], err))
    for g, rows in sorted(by_group.items()):
        print(f"\n[{g}] {len(rows)} 个")
        for name, err in rows[:12]:
            print(f"  - {name}: {err}")
        if len(rows) > 12:
            print(f"  … 另有 {len(rows) - 12} 个同类")

    with open(r"C:/Users/81103/AppData/Local/Temp/api_report.json", "w", encoding="utf-8") as f:
        json.dump([{"id": i["id"], "name": i.get("name"), "error": e} for i, e in bad], f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
