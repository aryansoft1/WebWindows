/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function dn(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const r of e.split(",")) t[r] = 1;
  return (r) => r in t;
}
const Q = {}, Bt = [], et = () => {
}, Ai = () => !1, Pr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), pn = (e) => e.startsWith("onUpdate:"), je = Object.assign, fn = (e, t) => {
  const r = e.indexOf(t);
  r > -1 && e.splice(r, 1);
}, Ro = Object.prototype.hasOwnProperty, X = (e, t) => Ro.call(e, t), V = Array.isArray, Ut = (e) => Rs(e) === "[object Map]", kr = (e) => Rs(e) === "[object Set]", Ln = (e) => Rs(e) === "[object Date]", H = (e) => typeof e == "function", de = (e) => typeof e == "string", tt = (e) => typeof e == "symbol", re = (e) => e !== null && typeof e == "object", ji = (e) => (re(e) || H(e)) && H(e.then) && H(e.catch), Ei = Object.prototype.toString, Rs = (e) => Ei.call(e), Do = (e) => Rs(e).slice(8, -1), Oi = (e) => Rs(e) === "[object Object]", mn = (e) => de(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Ps = /* @__PURE__ */ dn(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), $r = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((r) => t[r] || (t[r] = e(r)));
}, zo = /-\w/g, He = $r(
  (e) => e.replace(zo, (t) => t.slice(1).toUpperCase())
), Wo = /\B([A-Z])/g, jt = $r(
  (e) => e.replace(Wo, "-$1").toLowerCase()
), Ir = $r((e) => e.charAt(0).toUpperCase() + e.slice(1)), Nr = $r(
  (e) => e ? `on${Ir(e)}` : ""
), St = (e, t) => !Object.is(e, t), er = (e, ...t) => {
  for (let r = 0; r < e.length; r++)
    e[r](...t);
}, Ti = (e, t, r, a = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: a,
    value: r
  });
}, nr = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Rn;
const qr = () => Rn || (Rn = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function hn(e) {
  if (V(e)) {
    const t = {};
    for (let r = 0; r < e.length; r++) {
      const a = e[r], l = de(a) ? Bo(a) : hn(a);
      if (l)
        for (const u in l)
          t[u] = l[u];
    }
    return t;
  } else if (de(e) || re(e))
    return e;
}
const Fo = /;(?![^(]*\))/g, Vo = /:([^]+)/, Ho = /\/\*[^]*?\*\//g;
function Bo(e) {
  const t = {};
  return e.replace(Ho, "").split(Fo).forEach((r) => {
    if (r) {
      const a = r.split(Vo);
      a.length > 1 && (t[a[0].trim()] = a[1].trim());
    }
  }), t;
}
function we(e) {
  let t = "";
  if (de(e))
    t = e;
  else if (V(e))
    for (let r = 0; r < e.length; r++) {
      const a = we(e[r]);
      a && (t += a + " ");
    }
  else if (re(e))
    for (const r in e)
      e[r] && (t += r + " ");
  return t.trim();
}
const Uo = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Zo = /* @__PURE__ */ dn(Uo);
function Mi(e) {
  return !!e || e === "";
}
function Ko(e, t) {
  if (e.length !== t.length) return !1;
  let r = !0;
  for (let a = 0; r && a < e.length; a++)
    r = Sr(e[a], t[a]);
  return r;
}
function Sr(e, t) {
  if (e === t) return !0;
  let r = Ln(e), a = Ln(t);
  if (r || a)
    return r && a ? e.getTime() === t.getTime() : !1;
  if (r = tt(e), a = tt(t), r || a)
    return e === t;
  if (r = V(e), a = V(t), r || a)
    return r && a ? Ko(e, t) : !1;
  if (r = re(e), a = re(t), r || a) {
    if (!r || !a)
      return !1;
    const l = Object.keys(e).length, u = Object.keys(t).length;
    if (l !== u)
      return !1;
    for (const s in e) {
      const o = e.hasOwnProperty(s), c = t.hasOwnProperty(s);
      if (o && !c || !o && c || !Sr(e[s], t[s]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function Jo(e, t) {
  return e.findIndex((r) => Sr(r, t));
}
const Ci = (e) => !!(e && e.__v_isRef === !0), R = (e) => de(e) ? e : e == null ? "" : V(e) || re(e) && (e.toString === Ei || !H(e.toString)) ? Ci(e) ? R(e.value) : JSON.stringify(e, Ni, 2) : String(e), Ni = (e, t) => Ci(t) ? Ni(e, t.value) : Ut(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (r, [a, l], u) => (r[Lr(a, u) + " =>"] = l, r),
    {}
  )
} : kr(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((r) => Lr(r))
} : tt(t) ? Lr(t) : re(t) && !V(t) && !Oi(t) ? String(t) : t, Lr = (e, t = "") => {
  var r;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    tt(e) ? `Symbol(${(r = e.description) != null ? r : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Te;
class Go {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Te, !t && Te && (this.index = (Te.scopes || (Te.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, r;
      if (this.scopes)
        for (t = 0, r = this.scopes.length; t < r; t++)
          this.scopes[t].pause();
      for (t = 0, r = this.effects.length; t < r; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, r;
      if (this.scopes)
        for (t = 0, r = this.scopes.length; t < r; t++)
          this.scopes[t].resume();
      for (t = 0, r = this.effects.length; t < r; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const r = Te;
      try {
        return Te = this, t();
      } finally {
        Te = r;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Te, Te = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Te = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let r, a;
      for (r = 0, a = this.effects.length; r < a; r++)
        this.effects[r].stop();
      for (this.effects.length = 0, r = 0, a = this.cleanups.length; r < a; r++)
        this.cleanups[r]();
      if (this.cleanups.length = 0, this.scopes) {
        for (r = 0, a = this.scopes.length; r < a; r++)
          this.scopes[r].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const l = this.parent.scopes.pop();
        l && l !== this && (this.parent.scopes[this.index] = l, l.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Xo() {
  return Te;
}
let te;
const Rr = /* @__PURE__ */ new WeakSet();
class Li {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Te && Te.active && Te.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Rr.has(this) && (Rr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Di(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Dn(this), zi(this);
    const t = te, r = Je;
    te = this, Je = !0;
    try {
      return this.fn();
    } finally {
      Wi(this), te = t, Je = r, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        wn(t);
      this.deps = this.depsTail = void 0, Dn(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Rr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Gr(this) && this.run();
  }
  get dirty() {
    return Gr(this);
  }
}
let Ri = 0, ks, $s;
function Di(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = $s, $s = e;
    return;
  }
  e.next = ks, ks = e;
}
function yn() {
  Ri++;
}
function gn() {
  if (--Ri > 0)
    return;
  if ($s) {
    let t = $s;
    for ($s = void 0; t; ) {
      const r = t.next;
      t.next = void 0, t.flags &= -9, t = r;
    }
  }
  let e;
  for (; ks; ) {
    let t = ks;
    for (ks = void 0; t; ) {
      const r = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (a) {
          e || (e = a);
        }
      t = r;
    }
  }
  if (e) throw e;
}
function zi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Wi(e) {
  let t, r = e.depsTail, a = r;
  for (; a; ) {
    const l = a.prevDep;
    a.version === -1 ? (a === r && (r = l), wn(a), Yo(a)) : t = a, a.dep.activeLink = a.prevActiveLink, a.prevActiveLink = void 0, a = l;
  }
  e.deps = t, e.depsTail = r;
}
function Gr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Fi(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Fi(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === As) || (e.globalVersion = As, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Gr(e))))
    return;
  e.flags |= 2;
  const t = e.dep, r = te, a = Je;
  te = e, Je = !0;
  try {
    zi(e);
    const l = e.fn(e._value);
    (t.version === 0 || St(l, e._value)) && (e.flags |= 128, e._value = l, t.version++);
  } catch (l) {
    throw t.version++, l;
  } finally {
    te = r, Je = a, Wi(e), e.flags &= -3;
  }
}
function wn(e, t = !1) {
  const { dep: r, prevSub: a, nextSub: l } = e;
  if (a && (a.nextSub = l, e.prevSub = void 0), l && (l.prevSub = a, e.nextSub = void 0), r.subs === e && (r.subs = a, !a && r.computed)) {
    r.computed.flags &= -5;
    for (let u = r.computed.deps; u; u = u.nextDep)
      wn(u, !0);
  }
  !t && !--r.sc && r.map && r.map.delete(r.key);
}
function Yo(e) {
  const { prevDep: t, nextDep: r } = e;
  t && (t.nextDep = r, e.prevDep = void 0), r && (r.prevDep = t, e.nextDep = void 0);
}
let Je = !0;
const Vi = [];
function yt() {
  Vi.push(Je), Je = !1;
}
function gt() {
  const e = Vi.pop();
  Je = e === void 0 ? !0 : e;
}
function Dn(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const r = te;
    te = void 0;
    try {
      t();
    } finally {
      te = r;
    }
  }
}
let As = 0;
class Qo {
  constructor(t, r) {
    this.sub = t, this.dep = r, this.version = r.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class vn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!te || !Je || te === this.computed)
      return;
    let r = this.activeLink;
    if (r === void 0 || r.sub !== te)
      r = this.activeLink = new Qo(te, this), te.deps ? (r.prevDep = te.depsTail, te.depsTail.nextDep = r, te.depsTail = r) : te.deps = te.depsTail = r, Hi(r);
    else if (r.version === -1 && (r.version = this.version, r.nextDep)) {
      const a = r.nextDep;
      a.prevDep = r.prevDep, r.prevDep && (r.prevDep.nextDep = a), r.prevDep = te.depsTail, r.nextDep = void 0, te.depsTail.nextDep = r, te.depsTail = r, te.deps === r && (te.deps = a);
    }
    return r;
  }
  trigger(t) {
    this.version++, As++, this.notify(t);
  }
  notify(t) {
    yn();
    try {
      for (let r = this.subs; r; r = r.prevSub)
        r.sub.notify() && r.sub.dep.notify();
    } finally {
      gn();
    }
  }
}
function Hi(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let a = t.deps; a; a = a.nextDep)
        Hi(a);
    }
    const r = e.dep.subs;
    r !== e && (e.prevSub = r, r && (r.nextSub = e)), e.dep.subs = e;
  }
}
const Xr = /* @__PURE__ */ new WeakMap(), zt = Symbol(
  ""
), Yr = Symbol(
  ""
), js = Symbol(
  ""
);
function $e(e, t, r) {
  if (Je && te) {
    let a = Xr.get(e);
    a || Xr.set(e, a = /* @__PURE__ */ new Map());
    let l = a.get(r);
    l || (a.set(r, l = new vn()), l.map = a, l.key = r), l.track();
  }
}
function dt(e, t, r, a, l, u) {
  const s = Xr.get(e);
  if (!s) {
    As++;
    return;
  }
  const o = (c) => {
    c && c.trigger();
  };
  if (yn(), t === "clear")
    s.forEach(o);
  else {
    const c = V(e), n = c && mn(r);
    if (c && r === "length") {
      const i = Number(a);
      s.forEach((d, h) => {
        (h === "length" || h === js || !tt(h) && h >= i) && o(d);
      });
    } else
      switch ((r !== void 0 || s.has(void 0)) && o(s.get(r)), n && o(s.get(js)), t) {
        case "add":
          c ? n && o(s.get("length")) : (o(s.get(zt)), Ut(e) && o(s.get(Yr)));
          break;
        case "delete":
          c || (o(s.get(zt)), Ut(e) && o(s.get(Yr)));
          break;
        case "set":
          Ut(e) && o(s.get(zt));
          break;
      }
  }
  gn();
}
function Ft(e) {
  const t = G(e);
  return t === e ? t : ($e(t, "iterate", js), Ve(e) ? t : t.map(ve));
}
function xr(e) {
  return $e(e = G(e), "iterate", js), e;
}
const ea = {
  __proto__: null,
  [Symbol.iterator]() {
    return Dr(this, Symbol.iterator, ve);
  },
  concat(...e) {
    return Ft(this).concat(
      ...e.map((t) => V(t) ? Ft(t) : t)
    );
  },
  entries() {
    return Dr(this, "entries", (e) => (e[1] = ve(e[1]), e));
  },
  every(e, t) {
    return lt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return lt(this, "filter", e, t, (r) => r.map(ve), arguments);
  },
  find(e, t) {
    return lt(this, "find", e, t, ve, arguments);
  },
  findIndex(e, t) {
    return lt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return lt(this, "findLast", e, t, ve, arguments);
  },
  findLastIndex(e, t) {
    return lt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return lt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return zr(this, "includes", e);
  },
  indexOf(...e) {
    return zr(this, "indexOf", e);
  },
  join(e) {
    return Ft(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return zr(this, "lastIndexOf", e);
  },
  map(e, t) {
    return lt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return ps(this, "pop");
  },
  push(...e) {
    return ps(this, "push", e);
  },
  reduce(e, ...t) {
    return zn(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return zn(this, "reduceRight", e, t);
  },
  shift() {
    return ps(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return lt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return ps(this, "splice", e);
  },
  toReversed() {
    return Ft(this).toReversed();
  },
  toSorted(e) {
    return Ft(this).toSorted(e);
  },
  toSpliced(...e) {
    return Ft(this).toSpliced(...e);
  },
  unshift(...e) {
    return ps(this, "unshift", e);
  },
  values() {
    return Dr(this, "values", ve);
  }
};
function Dr(e, t, r) {
  const a = xr(e), l = a[t]();
  return a !== e && !Ve(e) && (l._next = l.next, l.next = () => {
    const u = l._next();
    return u.value && (u.value = r(u.value)), u;
  }), l;
}
const ta = Array.prototype;
function lt(e, t, r, a, l, u) {
  const s = xr(e), o = s !== e && !Ve(e), c = s[t];
  if (c !== ta[t]) {
    const d = c.apply(e, u);
    return o ? ve(d) : d;
  }
  let n = r;
  s !== e && (o ? n = function(d, h) {
    return r.call(this, ve(d), h, e);
  } : r.length > 2 && (n = function(d, h) {
    return r.call(this, d, h, e);
  }));
  const i = c.call(s, n, a);
  return o && l ? l(i) : i;
}
function zn(e, t, r, a) {
  const l = xr(e);
  let u = r;
  return l !== e && (Ve(e) ? r.length > 3 && (u = function(s, o, c) {
    return r.call(this, s, o, c, e);
  }) : u = function(s, o, c) {
    return r.call(this, s, ve(o), c, e);
  }), l[t](u, ...a);
}
function zr(e, t, r) {
  const a = G(e);
  $e(a, "iterate", js);
  const l = a[t](...r);
  return (l === -1 || l === !1) && $n(r[0]) ? (r[0] = G(r[0]), a[t](...r)) : l;
}
function ps(e, t, r = []) {
  yt(), yn();
  const a = G(e)[t].apply(e, r);
  return gn(), gt(), a;
}
const sa = /* @__PURE__ */ dn("__proto__,__v_isRef,__isVue"), Bi = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(tt)
);
function ra(e) {
  tt(e) || (e = String(e));
  const t = G(this);
  return $e(t, "has", e), t.hasOwnProperty(e);
}
class Ui {
  constructor(t = !1, r = !1) {
    this._isReadonly = t, this._isShallow = r;
  }
  get(t, r, a) {
    if (r === "__v_skip") return t.__v_skip;
    const l = this._isReadonly, u = this._isShallow;
    if (r === "__v_isReactive")
      return !l;
    if (r === "__v_isReadonly")
      return l;
    if (r === "__v_isShallow")
      return u;
    if (r === "__v_raw")
      return a === (l ? u ? fa : Gi : u ? Ji : Ki).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(a) ? t : void 0;
    const s = V(t);
    if (!l) {
      let c;
      if (s && (c = ea[r]))
        return c;
      if (r === "hasOwnProperty")
        return ra;
    }
    const o = Reflect.get(
      t,
      r,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      qe(t) ? t : a
    );
    return (tt(r) ? Bi.has(r) : sa(r)) || (l || $e(t, "get", r), u) ? o : qe(o) ? s && mn(r) ? o : o.value : re(o) ? l ? Xi(o) : Pn(o) : o;
  }
}
class Zi extends Ui {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, r, a, l) {
    let u = t[r];
    if (!this._isShallow) {
      const c = xt(u);
      if (!Ve(a) && !xt(a) && (u = G(u), a = G(a)), !V(t) && qe(u) && !qe(a))
        return c || (u.value = a), !0;
    }
    const s = V(t) && mn(r) ? Number(r) < t.length : X(t, r), o = Reflect.set(
      t,
      r,
      a,
      qe(t) ? t : l
    );
    return t === G(l) && (s ? St(a, u) && dt(t, "set", r, a) : dt(t, "add", r, a)), o;
  }
  deleteProperty(t, r) {
    const a = X(t, r);
    t[r];
    const l = Reflect.deleteProperty(t, r);
    return l && a && dt(t, "delete", r, void 0), l;
  }
  has(t, r) {
    const a = Reflect.has(t, r);
    return (!tt(r) || !Bi.has(r)) && $e(t, "has", r), a;
  }
  ownKeys(t) {
    return $e(
      t,
      "iterate",
      V(t) ? "length" : zt
    ), Reflect.ownKeys(t);
  }
}
class na extends Ui {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, r) {
    return !0;
  }
  deleteProperty(t, r) {
    return !0;
  }
}
const ia = /* @__PURE__ */ new Zi(), oa = /* @__PURE__ */ new na(), aa = /* @__PURE__ */ new Zi(!0);
const Qr = (e) => e, Ks = (e) => Reflect.getPrototypeOf(e);
function la(e, t, r) {
  return function(...a) {
    const l = this.__v_raw, u = G(l), s = Ut(u), o = e === "entries" || e === Symbol.iterator && s, c = e === "keys" && s, n = l[e](...a), i = r ? Qr : t ? ir : ve;
    return !t && $e(
      u,
      "iterate",
      c ? Yr : zt
    ), {
      // iterator protocol
      next() {
        const { value: d, done: h } = n.next();
        return h ? { value: d, done: h } : {
          value: o ? [i(d[0]), i(d[1])] : i(d),
          done: h
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Js(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function ua(e, t) {
  const r = {
    get(l) {
      const u = this.__v_raw, s = G(u), o = G(l);
      e || (St(l, o) && $e(s, "get", l), $e(s, "get", o));
      const { has: c } = Ks(s), n = t ? Qr : e ? ir : ve;
      if (c.call(s, l))
        return n(u.get(l));
      if (c.call(s, o))
        return n(u.get(o));
      u !== s && u.get(l);
    },
    get size() {
      const l = this.__v_raw;
      return !e && $e(G(l), "iterate", zt), l.size;
    },
    has(l) {
      const u = this.__v_raw, s = G(u), o = G(l);
      return e || (St(l, o) && $e(s, "has", l), $e(s, "has", o)), l === o ? u.has(l) : u.has(l) || u.has(o);
    },
    forEach(l, u) {
      const s = this, o = s.__v_raw, c = G(o), n = t ? Qr : e ? ir : ve;
      return !e && $e(c, "iterate", zt), o.forEach((i, d) => l.call(u, n(i), n(d), s));
    }
  };
  return je(
    r,
    e ? {
      add: Js("add"),
      set: Js("set"),
      delete: Js("delete"),
      clear: Js("clear")
    } : {
      add(l) {
        !t && !Ve(l) && !xt(l) && (l = G(l));
        const u = G(this);
        return Ks(u).has.call(u, l) || (u.add(l), dt(u, "add", l, l)), this;
      },
      set(l, u) {
        !t && !Ve(u) && !xt(u) && (u = G(u));
        const s = G(this), { has: o, get: c } = Ks(s);
        let n = o.call(s, l);
        n || (l = G(l), n = o.call(s, l));
        const i = c.call(s, l);
        return s.set(l, u), n ? St(u, i) && dt(s, "set", l, u) : dt(s, "add", l, u), this;
      },
      delete(l) {
        const u = G(this), { has: s, get: o } = Ks(u);
        let c = s.call(u, l);
        c || (l = G(l), c = s.call(u, l)), o && o.call(u, l);
        const n = u.delete(l);
        return c && dt(u, "delete", l, void 0), n;
      },
      clear() {
        const l = G(this), u = l.size !== 0, s = l.clear();
        return u && dt(
          l,
          "clear",
          void 0,
          void 0
        ), s;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((l) => {
    r[l] = la(l, e, t);
  }), r;
}
function bn(e, t) {
  const r = ua(e, t);
  return (a, l, u) => l === "__v_isReactive" ? !e : l === "__v_isReadonly" ? e : l === "__v_raw" ? a : Reflect.get(
    X(r, l) && l in a ? r : a,
    l,
    u
  );
}
const ca = {
  get: /* @__PURE__ */ bn(!1, !1)
}, da = {
  get: /* @__PURE__ */ bn(!1, !0)
}, pa = {
  get: /* @__PURE__ */ bn(!0, !1)
};
const Ki = /* @__PURE__ */ new WeakMap(), Ji = /* @__PURE__ */ new WeakMap(), Gi = /* @__PURE__ */ new WeakMap(), fa = /* @__PURE__ */ new WeakMap();
function ma(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function ha(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : ma(Do(e));
}
function Pn(e) {
  return xt(e) ? e : kn(
    e,
    !1,
    ia,
    ca,
    Ki
  );
}
function ya(e) {
  return kn(
    e,
    !1,
    aa,
    da,
    Ji
  );
}
function Xi(e) {
  return kn(
    e,
    !0,
    oa,
    pa,
    Gi
  );
}
function kn(e, t, r, a, l) {
  if (!re(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const u = ha(e);
  if (u === 0)
    return e;
  const s = l.get(e);
  if (s)
    return s;
  const o = new Proxy(
    e,
    u === 2 ? a : r
  );
  return l.set(e, o), o;
}
function Zt(e) {
  return xt(e) ? Zt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function xt(e) {
  return !!(e && e.__v_isReadonly);
}
function Ve(e) {
  return !!(e && e.__v_isShallow);
}
function $n(e) {
  return e ? !!e.__v_raw : !1;
}
function G(e) {
  const t = e && e.__v_raw;
  return t ? G(t) : e;
}
function ga(e) {
  return !X(e, "__v_skip") && Object.isExtensible(e) && Ti(e, "__v_skip", !0), e;
}
const ve = (e) => re(e) ? Pn(e) : e, ir = (e) => re(e) ? Xi(e) : e;
function qe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function Z(e) {
  return wa(e, !1);
}
function wa(e, t) {
  return qe(e) ? e : new va(e, t);
}
class va {
  constructor(t, r) {
    this.dep = new vn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = r ? t : G(t), this._value = r ? t : ve(t), this.__v_isShallow = r;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const r = this._rawValue, a = this.__v_isShallow || Ve(t) || xt(t);
    t = a ? t : G(t), St(t, r) && (this._rawValue = t, this._value = a ? t : ve(t), this.dep.trigger());
  }
}
function Yi(e) {
  return qe(e) ? e.value : e;
}
const ba = {
  get: (e, t, r) => t === "__v_raw" ? e : Yi(Reflect.get(e, t, r)),
  set: (e, t, r, a) => {
    const l = e[t];
    return qe(l) && !qe(r) ? (l.value = r, !0) : Reflect.set(e, t, r, a);
  }
};
function Qi(e) {
  return Zt(e) ? e : new Proxy(e, ba);
}
class Pa {
  constructor(t, r, a) {
    this.fn = t, this.setter = r, this._value = void 0, this.dep = new vn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = As - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !r, this.isSSR = a;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    te !== this)
      return Di(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Fi(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function ka(e, t, r = !1) {
  let a, l;
  return H(e) ? a = e : (a = e.get, l = e.set), new Pa(a, l, r);
}
const Gs = {}, or = /* @__PURE__ */ new WeakMap();
let Nt;
function $a(e, t = !1, r = Nt) {
  if (r) {
    let a = or.get(r);
    a || or.set(r, a = []), a.push(e);
  }
}
function Ia(e, t, r = Q) {
  const { immediate: a, deep: l, once: u, scheduler: s, augmentJob: o, call: c } = r, n = (N) => l ? N : Ve(N) || l === !1 || l === 0 ? pt(N, 1) : pt(N);
  let i, d, h, p, f = !1, g = !1;
  if (qe(e) ? (d = () => e.value, f = Ve(e)) : Zt(e) ? (d = () => n(e), f = !0) : V(e) ? (g = !0, f = e.some((N) => Zt(N) || Ve(N)), d = () => e.map((N) => {
    if (qe(N))
      return N.value;
    if (Zt(N))
      return n(N);
    if (H(N))
      return c ? c(N, 2) : N();
  })) : H(e) ? t ? d = c ? () => c(e, 2) : e : d = () => {
    if (h) {
      yt();
      try {
        h();
      } finally {
        gt();
      }
    }
    const N = Nt;
    Nt = i;
    try {
      return c ? c(e, 3, [p]) : e(p);
    } finally {
      Nt = N;
    }
  } : d = et, t && l) {
    const N = d, ee = l === !0 ? 1 / 0 : l;
    d = () => pt(N(), ee);
  }
  const k = Xo(), $ = () => {
    i.stop(), k && k.active && fn(k.effects, i);
  };
  if (u && t) {
    const N = t;
    t = (...ee) => {
      N(...ee), $();
    };
  }
  let O = g ? new Array(e.length).fill(Gs) : Gs;
  const C = (N) => {
    if (!(!(i.flags & 1) || !i.dirty && !N))
      if (t) {
        const ee = i.run();
        if (l || f || (g ? ee.some((fe, oe) => St(fe, O[oe])) : St(ee, O))) {
          h && h();
          const fe = Nt;
          Nt = i;
          try {
            const oe = [
              ee,
              // pass undefined as the old value when it's changed for the first time
              O === Gs ? void 0 : g && O[0] === Gs ? [] : O,
              p
            ];
            O = ee, c ? c(t, 3, oe) : (
              // @ts-expect-error
              t(...oe)
            );
          } finally {
            Nt = fe;
          }
        }
      } else
        i.run();
  };
  return o && o(C), i = new Li(d), i.scheduler = s ? () => s(C, !1) : C, p = (N) => $a(N, !1, i), h = i.onStop = () => {
    const N = or.get(i);
    if (N) {
      if (c)
        c(N, 4);
      else
        for (const ee of N) ee();
      or.delete(i);
    }
  }, t ? a ? C(!0) : O = i.run() : s ? s(C.bind(null, !0), !0) : i.run(), $.pause = i.pause.bind(i), $.resume = i.resume.bind(i), $.stop = $, $;
}
function pt(e, t = 1 / 0, r) {
  if (t <= 0 || !re(e) || e.__v_skip || (r = r || /* @__PURE__ */ new Map(), (r.get(e) || 0) >= t))
    return e;
  if (r.set(e, t), t--, qe(e))
    pt(e.value, t, r);
  else if (V(e))
    for (let a = 0; a < e.length; a++)
      pt(e[a], t, r);
  else if (kr(e) || Ut(e))
    e.forEach((a) => {
      pt(a, t, r);
    });
  else if (Oi(e)) {
    for (const a in e)
      pt(e[a], t, r);
    for (const a of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, a) && pt(e[a], t, r);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Ds(e, t, r, a) {
  try {
    return a ? e(...a) : e();
  } catch (l) {
    _r(l, t, r);
  }
}
function st(e, t, r, a) {
  if (H(e)) {
    const l = Ds(e, t, r, a);
    return l && ji(l) && l.catch((u) => {
      _r(u, t, r);
    }), l;
  }
  if (V(e)) {
    const l = [];
    for (let u = 0; u < e.length; u++)
      l.push(st(e[u], t, r, a));
    return l;
  }
}
function _r(e, t, r, a = !0) {
  const l = t ? t.vnode : null, { errorHandler: u, throwUnhandledErrorInProduction: s } = t && t.appContext.config || Q;
  if (t) {
    let o = t.parent;
    const c = t.proxy, n = `https://vuejs.org/error-reference/#runtime-${r}`;
    for (; o; ) {
      const i = o.ec;
      if (i) {
        for (let d = 0; d < i.length; d++)
          if (i[d](e, c, n) === !1)
            return;
      }
      o = o.parent;
    }
    if (u) {
      yt(), Ds(u, null, 10, [
        e,
        c,
        n
      ]), gt();
      return;
    }
  }
  qa(e, r, l, a, s);
}
function qa(e, t, r, a = !0, l = !1) {
  if (l)
    throw e;
  console.error(e);
}
const Ae = [];
let Ye = -1;
const Kt = [];
let It = null, Ht = 0;
const eo = /* @__PURE__ */ Promise.resolve();
let ar = null;
function In(e) {
  const t = ar || eo;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Sa(e) {
  let t = Ye + 1, r = Ae.length;
  for (; t < r; ) {
    const a = t + r >>> 1, l = Ae[a], u = Es(l);
    u < e || u === e && l.flags & 2 ? t = a + 1 : r = a;
  }
  return t;
}
function qn(e) {
  if (!(e.flags & 1)) {
    const t = Es(e), r = Ae[Ae.length - 1];
    !r || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Es(r) ? Ae.push(e) : Ae.splice(Sa(t), 0, e), e.flags |= 1, to();
  }
}
function to() {
  ar || (ar = eo.then(ro));
}
function xa(e) {
  V(e) ? Kt.push(...e) : It && e.id === -1 ? It.splice(Ht + 1, 0, e) : e.flags & 1 || (Kt.push(e), e.flags |= 1), to();
}
function Wn(e, t, r = Ye + 1) {
  for (; r < Ae.length; r++) {
    const a = Ae[r];
    if (a && a.flags & 2) {
      if (e && a.id !== e.uid)
        continue;
      Ae.splice(r, 1), r--, a.flags & 4 && (a.flags &= -2), a(), a.flags & 4 || (a.flags &= -2);
    }
  }
}
function so(e) {
  if (Kt.length) {
    const t = [...new Set(Kt)].sort(
      (r, a) => Es(r) - Es(a)
    );
    if (Kt.length = 0, It) {
      It.push(...t);
      return;
    }
    for (It = t, Ht = 0; Ht < It.length; Ht++) {
      const r = It[Ht];
      r.flags & 4 && (r.flags &= -2), r.flags & 8 || r(), r.flags &= -2;
    }
    It = null, Ht = 0;
  }
}
const Es = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function ro(e) {
  try {
    for (Ye = 0; Ye < Ae.length; Ye++) {
      const t = Ae[Ye];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Ds(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ye < Ae.length; Ye++) {
      const t = Ae[Ye];
      t && (t.flags &= -2);
    }
    Ye = -1, Ae.length = 0, so(), ar = null, (Ae.length || Kt.length) && ro();
  }
}
let Re = null, no = null;
function lr(e) {
  const t = Re;
  return Re = e, no = e && e.type.__scopeId || null, t;
}
function _a(e, t = Re, r) {
  if (!t || e._n)
    return e;
  const a = (...l) => {
    a._d && Yn(-1);
    const u = lr(t);
    let s;
    try {
      s = e(...l);
    } finally {
      lr(u), a._d && Yn(1);
    }
    return s;
  };
  return a._n = !0, a._c = !0, a._d = !0, a;
}
function fs(e, t) {
  if (Re === null)
    return e;
  const r = Or(Re), a = e.dirs || (e.dirs = []);
  for (let l = 0; l < t.length; l++) {
    let [u, s, o, c = Q] = t[l];
    u && (H(u) && (u = {
      mounted: u,
      updated: u
    }), u.deep && pt(s), a.push({
      dir: u,
      instance: r,
      value: s,
      oldValue: void 0,
      arg: o,
      modifiers: c
    }));
  }
  return e;
}
function Tt(e, t, r, a) {
  const l = e.dirs, u = t && t.dirs;
  for (let s = 0; s < l.length; s++) {
    const o = l[s];
    u && (o.oldValue = u[s].value);
    let c = o.dir[a];
    c && (yt(), st(c, r, 8, [
      e.el,
      o,
      e,
      t
    ]), gt());
  }
}
const Aa = Symbol("_vte"), ja = (e) => e.__isTeleport, Ea = Symbol("_leaveCb");
function Sn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Sn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function io(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const ur = /* @__PURE__ */ new WeakMap();
function Is(e, t, r, a, l = !1) {
  if (V(e)) {
    e.forEach(
      (f, g) => Is(
        f,
        t && (V(t) ? t[g] : t),
        r,
        a,
        l
      )
    );
    return;
  }
  if (qs(a) && !l) {
    a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && Is(e, t, r, a.component.subTree);
    return;
  }
  const u = a.shapeFlag & 4 ? Or(a.component) : a.el, s = l ? null : u, { i: o, r: c } = e, n = t && t.r, i = o.refs === Q ? o.refs = {} : o.refs, d = o.setupState, h = G(d), p = d === Q ? Ai : (f) => X(h, f);
  if (n != null && n !== c) {
    if (Fn(t), de(n))
      i[n] = null, p(n) && (d[n] = null);
    else if (qe(n)) {
      n.value = null;
      const f = t;
      f.k && (i[f.k] = null);
    }
  }
  if (H(c))
    Ds(c, o, 12, [s, i]);
  else {
    const f = de(c), g = qe(c);
    if (f || g) {
      const k = () => {
        if (e.f) {
          const $ = f ? p(c) ? d[c] : i[c] : c.value;
          if (l)
            V($) && fn($, u);
          else if (V($))
            $.includes(u) || $.push(u);
          else if (f)
            i[c] = [u], p(c) && (d[c] = i[c]);
          else {
            const O = [u];
            c.value = O, e.k && (i[e.k] = O);
          }
        } else f ? (i[c] = s, p(c) && (d[c] = s)) : g && (c.value = s, e.k && (i[e.k] = s));
      };
      if (s) {
        const $ = () => {
          k(), ur.delete(e);
        };
        $.id = -1, ur.set(e, $), Me($, r);
      } else
        Fn(e), k();
    }
  }
}
function Fn(e) {
  const t = ur.get(e);
  t && (t.flags |= 8, ur.delete(e));
}
qr().requestIdleCallback;
qr().cancelIdleCallback;
const qs = (e) => !!e.type.__asyncLoader, oo = (e) => e.type.__isKeepAlive;
function Oa(e, t) {
  ao(e, "a", t);
}
function Ta(e, t) {
  ao(e, "da", t);
}
function ao(e, t, r = Ie) {
  const a = e.__wdc || (e.__wdc = () => {
    let l = r;
    for (; l; ) {
      if (l.isDeactivated)
        return;
      l = l.parent;
    }
    return e();
  });
  if (Ar(t, a, r), r) {
    let l = r.parent;
    for (; l && l.parent; )
      oo(l.parent.vnode) && Ma(a, t, r, l), l = l.parent;
  }
}
function Ma(e, t, r, a) {
  const l = Ar(
    t,
    e,
    a,
    !0
    /* prepend */
  );
  lo(() => {
    fn(a[t], l);
  }, r);
}
function Ar(e, t, r = Ie, a = !1) {
  if (r) {
    const l = r[e] || (r[e] = []), u = t.__weh || (t.__weh = (...s) => {
      yt();
      const o = zs(r), c = st(t, r, e, s);
      return o(), gt(), c;
    });
    return a ? l.unshift(u) : l.push(u), u;
  }
}
const wt = (e) => (t, r = Ie) => {
  (!Ts || e === "sp") && Ar(e, (...a) => t(...a), r);
}, Ca = wt("bm"), xn = wt("m"), Na = wt(
  "bu"
), La = wt("u"), _n = wt(
  "bum"
), lo = wt("um"), Ra = wt(
  "sp"
), Da = wt("rtg"), za = wt("rtc");
function Wa(e, t = Ie) {
  Ar("ec", e, t);
}
const Fa = "components";
function Va(e, t) {
  return Ba(Fa, e, !0, t) || e;
}
const Ha = Symbol.for("v-ndc");
function Ba(e, t, r = !0, a = !1) {
  const l = Re || Ie;
  if (l) {
    const u = l.type;
    {
      const o = Ml(
        u,
        !1
      );
      if (o && (o === t || o === He(t) || o === Ir(He(t))))
        return u;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      Vn(l[e] || u[e], t) || // global registration
      Vn(l.appContext[e], t)
    );
    return !s && a ? u : s;
  }
}
function Vn(e, t) {
  return e && (e[t] || e[He(t)] || e[Ir(He(t))]);
}
function Ze(e, t, r, a) {
  let l;
  const u = r, s = V(e);
  if (s || de(e)) {
    const o = s && Zt(e);
    let c = !1, n = !1;
    o && (c = !Ve(e), n = xt(e), e = xr(e)), l = new Array(e.length);
    for (let i = 0, d = e.length; i < d; i++)
      l[i] = t(
        c ? n ? ir(ve(e[i])) : ve(e[i]) : e[i],
        i,
        void 0,
        u
      );
  } else if (typeof e == "number") {
    l = new Array(e);
    for (let o = 0; o < e; o++)
      l[o] = t(o + 1, o, void 0, u);
  } else if (re(e))
    if (e[Symbol.iterator])
      l = Array.from(
        e,
        (o, c) => t(o, c, void 0, u)
      );
    else {
      const o = Object.keys(e);
      l = new Array(o.length);
      for (let c = 0, n = o.length; c < n; c++) {
        const i = o[c];
        l[c] = t(e[i], i, c, u);
      }
    }
  else
    l = [];
  return l;
}
const en = (e) => e ? jo(e) ? Or(e) : en(e.parent) : null, Ss = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ je(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => en(e.parent),
    $root: (e) => en(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => co(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      qn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = In.bind(e.proxy)),
    $watch: (e) => fl.bind(e)
  })
), Wr = (e, t) => e !== Q && !e.__isScriptSetup && X(e, t), Ua = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: r, setupState: a, data: l, props: u, accessCache: s, type: o, appContext: c } = e;
    let n;
    if (t[0] !== "$") {
      const p = s[t];
      if (p !== void 0)
        switch (p) {
          case 1:
            return a[t];
          case 2:
            return l[t];
          case 4:
            return r[t];
          case 3:
            return u[t];
        }
      else {
        if (Wr(a, t))
          return s[t] = 1, a[t];
        if (l !== Q && X(l, t))
          return s[t] = 2, l[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (n = e.propsOptions[0]) && X(n, t)
        )
          return s[t] = 3, u[t];
        if (r !== Q && X(r, t))
          return s[t] = 4, r[t];
        tn && (s[t] = 0);
      }
    }
    const i = Ss[t];
    let d, h;
    if (i)
      return t === "$attrs" && $e(e.attrs, "get", ""), i(e);
    if (
      // css module (injected by vue-loader)
      (d = o.__cssModules) && (d = d[t])
    )
      return d;
    if (r !== Q && X(r, t))
      return s[t] = 4, r[t];
    if (
      // global properties
      h = c.config.globalProperties, X(h, t)
    )
      return h[t];
  },
  set({ _: e }, t, r) {
    const { data: a, setupState: l, ctx: u } = e;
    return Wr(l, t) ? (l[t] = r, !0) : a !== Q && X(a, t) ? (a[t] = r, !0) : X(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (u[t] = r, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: r, ctx: a, appContext: l, propsOptions: u, type: s }
  }, o) {
    let c, n;
    return !!(r[o] || e !== Q && o[0] !== "$" && X(e, o) || Wr(t, o) || (c = u[0]) && X(c, o) || X(a, o) || X(Ss, o) || X(l.config.globalProperties, o) || (n = s.__cssModules) && n[o]);
  },
  defineProperty(e, t, r) {
    return r.get != null ? e._.accessCache[t] = 0 : X(r, "value") && this.set(e, t, r.value, null), Reflect.defineProperty(e, t, r);
  }
};
function Hn(e) {
  return V(e) ? e.reduce(
    (t, r) => (t[r] = null, t),
    {}
  ) : e;
}
let tn = !0;
function Za(e) {
  const t = co(e), r = e.proxy, a = e.ctx;
  tn = !1, t.beforeCreate && Bn(t.beforeCreate, e, "bc");
  const {
    // state
    data: l,
    computed: u,
    methods: s,
    watch: o,
    provide: c,
    inject: n,
    // lifecycle
    created: i,
    beforeMount: d,
    mounted: h,
    beforeUpdate: p,
    updated: f,
    activated: g,
    deactivated: k,
    beforeDestroy: $,
    beforeUnmount: O,
    destroyed: C,
    unmounted: N,
    render: ee,
    renderTracked: fe,
    renderTriggered: oe,
    errorCaptured: pe,
    serverPrefetch: rt,
    // public API
    expose: Ee,
    inheritAttrs: nt,
    // assets
    components: vt,
    directives: me,
    filters: it
  } = t;
  if (n && Ka(n, a, null), s)
    for (const Y in s) {
      const B = s[Y];
      H(B) && (a[Y] = B.bind(r));
    }
  if (l) {
    const Y = l.call(r, r);
    re(Y) && (e.data = Pn(Y));
  }
  if (tn = !0, u)
    for (const Y in u) {
      const B = u[Y], ot = H(B) ? B.bind(r, r) : H(B.get) ? B.get.bind(r, r) : et, Wt = !H(B) && H(B.set) ? B.set.bind(r) : et, at = Le({
        get: ot,
        set: Wt
      });
      Object.defineProperty(a, Y, {
        enumerable: !0,
        configurable: !0,
        get: () => at.value,
        set: (ze) => at.value = ze
      });
    }
  if (o)
    for (const Y in o)
      uo(o[Y], a, r, Y);
  if (c) {
    const Y = H(c) ? c.call(r) : c;
    Reflect.ownKeys(Y).forEach((B) => {
      el(B, Y[B]);
    });
  }
  i && Bn(i, e, "c");
  function he(Y, B) {
    V(B) ? B.forEach((ot) => Y(ot.bind(r))) : B && Y(B.bind(r));
  }
  if (he(Ca, d), he(xn, h), he(Na, p), he(La, f), he(Oa, g), he(Ta, k), he(Wa, pe), he(za, fe), he(Da, oe), he(_n, O), he(lo, N), he(Ra, rt), V(Ee))
    if (Ee.length) {
      const Y = e.exposed || (e.exposed = {});
      Ee.forEach((B) => {
        Object.defineProperty(Y, B, {
          get: () => r[B],
          set: (ot) => r[B] = ot,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  ee && e.render === et && (e.render = ee), nt != null && (e.inheritAttrs = nt), vt && (e.components = vt), me && (e.directives = me), rt && io(e);
}
function Ka(e, t, r = et) {
  V(e) && (e = sn(e));
  for (const a in e) {
    const l = e[a];
    let u;
    re(l) ? "default" in l ? u = tr(
      l.from || a,
      l.default,
      !0
    ) : u = tr(l.from || a) : u = tr(l), qe(u) ? Object.defineProperty(t, a, {
      enumerable: !0,
      configurable: !0,
      get: () => u.value,
      set: (s) => u.value = s
    }) : t[a] = u;
  }
}
function Bn(e, t, r) {
  st(
    V(e) ? e.map((a) => a.bind(t.proxy)) : e.bind(t.proxy),
    t,
    r
  );
}
function uo(e, t, r, a) {
  let l = a.includes(".") ? Io(r, a) : () => r[a];
  if (de(e)) {
    const u = t[e];
    H(u) && xs(l, u);
  } else if (H(e))
    xs(l, e.bind(r));
  else if (re(e))
    if (V(e))
      e.forEach((u) => uo(u, t, r, a));
    else {
      const u = H(e.handler) ? e.handler.bind(r) : t[e.handler];
      H(u) && xs(l, u, e);
    }
}
function co(e) {
  const t = e.type, { mixins: r, extends: a } = t, {
    mixins: l,
    optionsCache: u,
    config: { optionMergeStrategies: s }
  } = e.appContext, o = u.get(t);
  let c;
  return o ? c = o : !l.length && !r && !a ? c = t : (c = {}, l.length && l.forEach(
    (n) => cr(c, n, s, !0)
  ), cr(c, t, s)), re(t) && u.set(t, c), c;
}
function cr(e, t, r, a = !1) {
  const { mixins: l, extends: u } = t;
  u && cr(e, u, r, !0), l && l.forEach(
    (s) => cr(e, s, r, !0)
  );
  for (const s in t)
    if (!(a && s === "expose")) {
      const o = Ja[s] || r && r[s];
      e[s] = o ? o(e[s], t[s]) : t[s];
    }
  return e;
}
const Ja = {
  data: Un,
  props: Zn,
  emits: Zn,
  // objects
  methods: ws,
  computed: ws,
  // lifecycle
  beforeCreate: xe,
  created: xe,
  beforeMount: xe,
  mounted: xe,
  beforeUpdate: xe,
  updated: xe,
  beforeDestroy: xe,
  beforeUnmount: xe,
  destroyed: xe,
  unmounted: xe,
  activated: xe,
  deactivated: xe,
  errorCaptured: xe,
  serverPrefetch: xe,
  // assets
  components: ws,
  directives: ws,
  // watch
  watch: Xa,
  // provide / inject
  provide: Un,
  inject: Ga
};
function Un(e, t) {
  return t ? e ? function() {
    return je(
      H(e) ? e.call(this, this) : e,
      H(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Ga(e, t) {
  return ws(sn(e), sn(t));
}
function sn(e) {
  if (V(e)) {
    const t = {};
    for (let r = 0; r < e.length; r++)
      t[e[r]] = e[r];
    return t;
  }
  return e;
}
function xe(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function ws(e, t) {
  return e ? je(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Zn(e, t) {
  return e ? V(e) && V(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : je(
    /* @__PURE__ */ Object.create(null),
    Hn(e),
    Hn(t ?? {})
  ) : t;
}
function Xa(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = je(/* @__PURE__ */ Object.create(null), e);
  for (const a in t)
    r[a] = xe(e[a], t[a]);
  return r;
}
function po() {
  return {
    app: null,
    config: {
      isNativeTag: Ai,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let Ya = 0;
function Qa(e, t) {
  return function(a, l = null) {
    H(a) || (a = je({}, a)), l != null && !re(l) && (l = null);
    const u = po(), s = /* @__PURE__ */ new WeakSet(), o = [];
    let c = !1;
    const n = u.app = {
      _uid: Ya++,
      _component: a,
      _props: l,
      _container: null,
      _context: u,
      _instance: null,
      version: Nl,
      get config() {
        return u.config;
      },
      set config(i) {
      },
      use(i, ...d) {
        return s.has(i) || (i && H(i.install) ? (s.add(i), i.install(n, ...d)) : H(i) && (s.add(i), i(n, ...d))), n;
      },
      mixin(i) {
        return u.mixins.includes(i) || u.mixins.push(i), n;
      },
      component(i, d) {
        return d ? (u.components[i] = d, n) : u.components[i];
      },
      directive(i, d) {
        return d ? (u.directives[i] = d, n) : u.directives[i];
      },
      mount(i, d, h) {
        if (!c) {
          const p = n._ceVNode || Ge(a, l);
          return p.appContext = u, h === !0 ? h = "svg" : h === !1 && (h = void 0), e(p, i, h), c = !0, n._container = i, i.__vue_app__ = n, Or(p.component);
        }
      },
      onUnmount(i) {
        o.push(i);
      },
      unmount() {
        c && (st(
          o,
          n._instance,
          16
        ), e(null, n._container), delete n._container.__vue_app__);
      },
      provide(i, d) {
        return u.provides[i] = d, n;
      },
      runWithContext(i) {
        const d = Jt;
        Jt = n;
        try {
          return i();
        } finally {
          Jt = d;
        }
      }
    };
    return n;
  };
}
let Jt = null;
function el(e, t) {
  if (Ie) {
    let r = Ie.provides;
    const a = Ie.parent && Ie.parent.provides;
    a === r && (r = Ie.provides = Object.create(a)), r[e] = t;
  }
}
function tr(e, t, r = !1) {
  const a = Al();
  if (a || Jt) {
    let l = Jt ? Jt._context.provides : a ? a.parent == null || a.ce ? a.vnode.appContext && a.vnode.appContext.provides : a.parent.provides : void 0;
    if (l && e in l)
      return l[e];
    if (arguments.length > 1)
      return r && H(t) ? t.call(a && a.proxy) : t;
  }
}
const fo = {}, mo = () => Object.create(fo), ho = (e) => Object.getPrototypeOf(e) === fo;
function tl(e, t, r, a = !1) {
  const l = {}, u = mo();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), yo(e, t, l, u);
  for (const s in e.propsOptions[0])
    s in l || (l[s] = void 0);
  r ? e.props = a ? l : ya(l) : e.type.props ? e.props = l : e.props = u, e.attrs = u;
}
function sl(e, t, r, a) {
  const {
    props: l,
    attrs: u,
    vnode: { patchFlag: s }
  } = e, o = G(l), [c] = e.propsOptions;
  let n = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (a || s > 0) && !(s & 16)
  ) {
    if (s & 8) {
      const i = e.vnode.dynamicProps;
      for (let d = 0; d < i.length; d++) {
        let h = i[d];
        if (jr(e.emitsOptions, h))
          continue;
        const p = t[h];
        if (c)
          if (X(u, h))
            p !== u[h] && (u[h] = p, n = !0);
          else {
            const f = He(h);
            l[f] = rn(
              c,
              o,
              f,
              p,
              e,
              !1
            );
          }
        else
          p !== u[h] && (u[h] = p, n = !0);
      }
    }
  } else {
    yo(e, t, l, u) && (n = !0);
    let i;
    for (const d in o)
      (!t || // for camelCase
      !X(t, d) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((i = jt(d)) === d || !X(t, i))) && (c ? r && // for camelCase
      (r[d] !== void 0 || // for kebab-case
      r[i] !== void 0) && (l[d] = rn(
        c,
        o,
        d,
        void 0,
        e,
        !0
      )) : delete l[d]);
    if (u !== o)
      for (const d in u)
        (!t || !X(t, d)) && (delete u[d], n = !0);
  }
  n && dt(e.attrs, "set", "");
}
function yo(e, t, r, a) {
  const [l, u] = e.propsOptions;
  let s = !1, o;
  if (t)
    for (let c in t) {
      if (Ps(c))
        continue;
      const n = t[c];
      let i;
      l && X(l, i = He(c)) ? !u || !u.includes(i) ? r[i] = n : (o || (o = {}))[i] = n : jr(e.emitsOptions, c) || (!(c in a) || n !== a[c]) && (a[c] = n, s = !0);
    }
  if (u) {
    const c = G(r), n = o || Q;
    for (let i = 0; i < u.length; i++) {
      const d = u[i];
      r[d] = rn(
        l,
        c,
        d,
        n[d],
        e,
        !X(n, d)
      );
    }
  }
  return s;
}
function rn(e, t, r, a, l, u) {
  const s = e[r];
  if (s != null) {
    const o = X(s, "default");
    if (o && a === void 0) {
      const c = s.default;
      if (s.type !== Function && !s.skipFactory && H(c)) {
        const { propsDefaults: n } = l;
        if (r in n)
          a = n[r];
        else {
          const i = zs(l);
          a = n[r] = c.call(
            null,
            t
          ), i();
        }
      } else
        a = c;
      l.ce && l.ce._setProp(r, a);
    }
    s[
      0
      /* shouldCast */
    ] && (u && !o ? a = !1 : s[
      1
      /* shouldCastTrue */
    ] && (a === "" || a === jt(r)) && (a = !0));
  }
  return a;
}
const rl = /* @__PURE__ */ new WeakMap();
function go(e, t, r = !1) {
  const a = r ? rl : t.propsCache, l = a.get(e);
  if (l)
    return l;
  const u = e.props, s = {}, o = [];
  let c = !1;
  if (!H(e)) {
    const i = (d) => {
      c = !0;
      const [h, p] = go(d, t, !0);
      je(s, h), p && o.push(...p);
    };
    !r && t.mixins.length && t.mixins.forEach(i), e.extends && i(e.extends), e.mixins && e.mixins.forEach(i);
  }
  if (!u && !c)
    return re(e) && a.set(e, Bt), Bt;
  if (V(u))
    for (let i = 0; i < u.length; i++) {
      const d = He(u[i]);
      Kn(d) && (s[d] = Q);
    }
  else if (u)
    for (const i in u) {
      const d = He(i);
      if (Kn(d)) {
        const h = u[i], p = s[d] = V(h) || H(h) ? { type: h } : je({}, h), f = p.type;
        let g = !1, k = !0;
        if (V(f))
          for (let $ = 0; $ < f.length; ++$) {
            const O = f[$], C = H(O) && O.name;
            if (C === "Boolean") {
              g = !0;
              break;
            } else C === "String" && (k = !1);
          }
        else
          g = H(f) && f.name === "Boolean";
        p[
          0
          /* shouldCast */
        ] = g, p[
          1
          /* shouldCastTrue */
        ] = k, (g || X(p, "default")) && o.push(d);
      }
    }
  const n = [s, o];
  return re(e) && a.set(e, n), n;
}
function Kn(e) {
  return e[0] !== "$" && !Ps(e);
}
const An = (e) => e === "_" || e === "_ctx" || e === "$stable", jn = (e) => V(e) ? e.map(Qe) : [Qe(e)], nl = (e, t, r) => {
  if (t._n)
    return t;
  const a = _a((...l) => jn(t(...l)), r);
  return a._c = !1, a;
}, wo = (e, t, r) => {
  const a = e._ctx;
  for (const l in e) {
    if (An(l)) continue;
    const u = e[l];
    if (H(u))
      t[l] = nl(l, u, a);
    else if (u != null) {
      const s = jn(u);
      t[l] = () => s;
    }
  }
}, vo = (e, t) => {
  const r = jn(t);
  e.slots.default = () => r;
}, bo = (e, t, r) => {
  for (const a in t)
    (r || !An(a)) && (e[a] = t[a]);
}, il = (e, t, r) => {
  const a = e.slots = mo();
  if (e.vnode.shapeFlag & 32) {
    const l = t._;
    l ? (bo(a, t, r), r && Ti(a, "_", l, !0)) : wo(t, a);
  } else t && vo(e, t);
}, ol = (e, t, r) => {
  const { vnode: a, slots: l } = e;
  let u = !0, s = Q;
  if (a.shapeFlag & 32) {
    const o = t._;
    o ? r && o === 1 ? u = !1 : bo(l, t, r) : (u = !t.$stable, wo(t, l)), s = t;
  } else t && (vo(e, t), s = { default: 1 });
  if (u)
    for (const o in l)
      !An(o) && s[o] == null && delete l[o];
}, Me = Pl;
function al(e) {
  return ll(e);
}
function ll(e, t) {
  const r = qr();
  r.__VUE__ = !0;
  const {
    insert: a,
    remove: l,
    patchProp: u,
    createElement: s,
    createText: o,
    createComment: c,
    setText: n,
    setElementText: i,
    parentNode: d,
    nextSibling: h,
    setScopeId: p = et,
    insertStaticContent: f
  } = e, g = (m, w, b, x = null, q = null, S = null, j = void 0, E = null, A = !!w.dynamicChildren) => {
    if (m === w)
      return;
    m && !ms(m, w) && (x = Et(m), ze(m, q, S, !0), m = null), w.patchFlag === -2 && (A = !1, w.dynamicChildren = null);
    const { type: _, ref: F, shapeFlag: T } = w;
    switch (_) {
      case Er:
        k(m, w, b, x);
        break;
      case _t:
        $(m, w, b, x);
        break;
      case Vr:
        m == null && O(w, b, x, j);
        break;
      case se:
        vt(
          m,
          w,
          b,
          x,
          q,
          S,
          j,
          E,
          A
        );
        break;
      default:
        T & 1 ? ee(
          m,
          w,
          b,
          x,
          q,
          S,
          j,
          E,
          A
        ) : T & 6 ? me(
          m,
          w,
          b,
          x,
          q,
          S,
          j,
          E,
          A
        ) : (T & 64 || T & 128) && _.process(
          m,
          w,
          b,
          x,
          q,
          S,
          j,
          E,
          A,
          Ot
        );
    }
    F != null && q ? Is(F, m && m.ref, S, w || m, !w) : F == null && m && m.ref != null && Is(m.ref, null, S, m, !0);
  }, k = (m, w, b, x) => {
    if (m == null)
      a(
        w.el = o(w.children),
        b,
        x
      );
    else {
      const q = w.el = m.el;
      w.children !== m.children && n(q, w.children);
    }
  }, $ = (m, w, b, x) => {
    m == null ? a(
      w.el = c(w.children || ""),
      b,
      x
    ) : w.el = m.el;
  }, O = (m, w, b, x) => {
    [m.el, m.anchor] = f(
      m.children,
      w,
      b,
      x,
      m.el,
      m.anchor
    );
  }, C = ({ el: m, anchor: w }, b, x) => {
    let q;
    for (; m && m !== w; )
      q = h(m), a(m, b, x), m = q;
    a(w, b, x);
  }, N = ({ el: m, anchor: w }) => {
    let b;
    for (; m && m !== w; )
      b = h(m), l(m), m = b;
    l(w);
  }, ee = (m, w, b, x, q, S, j, E, A) => {
    w.type === "svg" ? j = "svg" : w.type === "math" && (j = "mathml"), m == null ? fe(
      w,
      b,
      x,
      q,
      S,
      j,
      E,
      A
    ) : rt(
      m,
      w,
      q,
      S,
      j,
      E,
      A
    );
  }, fe = (m, w, b, x, q, S, j, E) => {
    let A, _;
    const { props: F, shapeFlag: T, transition: L, dirs: M } = m;
    if (A = m.el = s(
      m.type,
      S,
      F && F.is,
      F
    ), T & 8 ? i(A, m.children) : T & 16 && pe(
      m.children,
      A,
      null,
      x,
      q,
      Fr(m, S),
      j,
      E
    ), M && Tt(m, null, x, "created"), oe(A, m, m.scopeId, j, x), F) {
      for (const J in F)
        J !== "value" && !Ps(J) && u(A, J, null, F[J], S, x);
      "value" in F && u(A, "value", null, F.value, S), (_ = F.onVnodeBeforeMount) && Xe(_, x, m);
    }
    M && Tt(m, null, x, "beforeMount");
    const U = ul(q, L);
    U && L.beforeEnter(A), a(A, w, b), ((_ = F && F.onVnodeMounted) || U || M) && Me(() => {
      _ && Xe(_, x, m), U && L.enter(A), M && Tt(m, null, x, "mounted");
    }, q);
  }, oe = (m, w, b, x, q) => {
    if (b && p(m, b), x)
      for (let S = 0; S < x.length; S++)
        p(m, x[S]);
    if (q) {
      let S = q.subTree;
      if (w === S || So(S.type) && (S.ssContent === w || S.ssFallback === w)) {
        const j = q.vnode;
        oe(
          m,
          j,
          j.scopeId,
          j.slotScopeIds,
          q.parent
        );
      }
    }
  }, pe = (m, w, b, x, q, S, j, E, A = 0) => {
    for (let _ = A; _ < m.length; _++) {
      const F = m[_] = E ? qt(m[_]) : Qe(m[_]);
      g(
        null,
        F,
        w,
        b,
        x,
        q,
        S,
        j,
        E
      );
    }
  }, rt = (m, w, b, x, q, S, j) => {
    const E = w.el = m.el;
    let { patchFlag: A, dynamicChildren: _, dirs: F } = w;
    A |= m.patchFlag & 16;
    const T = m.props || Q, L = w.props || Q;
    let M;
    if (b && Mt(b, !1), (M = L.onVnodeBeforeUpdate) && Xe(M, b, w, m), F && Tt(w, m, b, "beforeUpdate"), b && Mt(b, !0), (T.innerHTML && L.innerHTML == null || T.textContent && L.textContent == null) && i(E, ""), _ ? Ee(
      m.dynamicChildren,
      _,
      E,
      b,
      x,
      Fr(w, q),
      S
    ) : j || B(
      m,
      w,
      E,
      null,
      b,
      x,
      Fr(w, q),
      S,
      !1
    ), A > 0) {
      if (A & 16)
        nt(E, T, L, b, q);
      else if (A & 2 && T.class !== L.class && u(E, "class", null, L.class, q), A & 4 && u(E, "style", T.style, L.style, q), A & 8) {
        const U = w.dynamicProps;
        for (let J = 0; J < U.length; J++) {
          const K = U[J], be = T[K], Pe = L[K];
          (Pe !== be || K === "value") && u(E, K, be, Pe, q, b);
        }
      }
      A & 1 && m.children !== w.children && i(E, w.children);
    } else !j && _ == null && nt(E, T, L, b, q);
    ((M = L.onVnodeUpdated) || F) && Me(() => {
      M && Xe(M, b, w, m), F && Tt(w, m, b, "updated");
    }, x);
  }, Ee = (m, w, b, x, q, S, j) => {
    for (let E = 0; E < w.length; E++) {
      const A = m[E], _ = w[E], F = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        A.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (A.type === se || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !ms(A, _) || // - In the case of a component, it could contain anything.
        A.shapeFlag & 198) ? d(A.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          b
        )
      );
      g(
        A,
        _,
        F,
        null,
        x,
        q,
        S,
        j,
        !0
      );
    }
  }, nt = (m, w, b, x, q) => {
    if (w !== b) {
      if (w !== Q)
        for (const S in w)
          !Ps(S) && !(S in b) && u(
            m,
            S,
            w[S],
            null,
            q,
            x
          );
      for (const S in b) {
        if (Ps(S)) continue;
        const j = b[S], E = w[S];
        j !== E && S !== "value" && u(m, S, E, j, q, x);
      }
      "value" in b && u(m, "value", w.value, b.value, q);
    }
  }, vt = (m, w, b, x, q, S, j, E, A) => {
    const _ = w.el = m ? m.el : o(""), F = w.anchor = m ? m.anchor : o("");
    let { patchFlag: T, dynamicChildren: L, slotScopeIds: M } = w;
    M && (E = E ? E.concat(M) : M), m == null ? (a(_, b, x), a(F, b, x), pe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      w.children || [],
      b,
      F,
      q,
      S,
      j,
      E,
      A
    )) : T > 0 && T & 64 && L && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    m.dynamicChildren ? (Ee(
      m.dynamicChildren,
      L,
      b,
      q,
      S,
      j,
      E
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (w.key != null || q && w === q.subTree) && Po(
      m,
      w,
      !0
      /* shallow */
    )) : B(
      m,
      w,
      b,
      F,
      q,
      S,
      j,
      E,
      A
    );
  }, me = (m, w, b, x, q, S, j, E, A) => {
    w.slotScopeIds = E, m == null ? w.shapeFlag & 512 ? q.ctx.activate(
      w,
      b,
      x,
      j,
      A
    ) : it(
      w,
      b,
      x,
      q,
      S,
      j,
      A
    ) : bt(m, w, A);
  }, it = (m, w, b, x, q, S, j) => {
    const E = m.component = _l(
      m,
      x,
      q
    );
    if (oo(m) && (E.ctx.renderer = Ot), jl(E, !1, j), E.asyncDep) {
      if (q && q.registerDep(E, he, j), !m.el) {
        const A = E.subTree = Ge(_t);
        $(null, A, w, b), m.placeholder = A.el;
      }
    } else
      he(
        E,
        m,
        w,
        b,
        q,
        S,
        j
      );
  }, bt = (m, w, b) => {
    const x = w.component = m.component;
    if (vl(m, w, b))
      if (x.asyncDep && !x.asyncResolved) {
        Y(x, w, b);
        return;
      } else
        x.next = w, x.update();
    else
      w.el = m.el, x.vnode = w;
  }, he = (m, w, b, x, q, S, j) => {
    const E = () => {
      if (m.isMounted) {
        let { next: T, bu: L, u: M, parent: U, vnode: J } = m;
        {
          const We = ko(m);
          if (We) {
            T && (T.el = J.el, Y(m, T, j)), We.asyncDep.then(() => {
              m.isUnmounted || E();
            });
            return;
          }
        }
        let K = T, be;
        Mt(m, !1), T ? (T.el = J.el, Y(m, T, j)) : T = J, L && er(L), (be = T.props && T.props.onVnodeBeforeUpdate) && Xe(be, U, T, J), Mt(m, !0);
        const Pe = Gn(m), ge = m.subTree;
        m.subTree = Pe, g(
          ge,
          Pe,
          // parent may have changed if it's in a teleport
          d(ge.el),
          // anchor may have changed if it's in a fragment
          Et(ge),
          m,
          q,
          S
        ), T.el = Pe.el, K === null && bl(m, Pe.el), M && Me(M, q), (be = T.props && T.props.onVnodeUpdated) && Me(
          () => Xe(be, U, T, J),
          q
        );
      } else {
        let T;
        const { el: L, props: M } = w, { bm: U, m: J, parent: K, root: be, type: Pe } = m, ge = qs(w);
        Mt(m, !1), U && er(U), !ge && (T = M && M.onVnodeBeforeMount) && Xe(T, K, w), Mt(m, !0);
        {
          be.ce && // @ts-expect-error _def is private
          be.ce._def.shadowRoot !== !1 && be.ce._injectChildStyle(Pe);
          const We = m.subTree = Gn(m);
          g(
            null,
            We,
            b,
            x,
            m,
            q,
            S
          ), w.el = We.el;
        }
        if (J && Me(J, q), !ge && (T = M && M.onVnodeMounted)) {
          const We = w;
          Me(
            () => Xe(T, K, We),
            q
          );
        }
        (w.shapeFlag & 256 || K && qs(K.vnode) && K.vnode.shapeFlag & 256) && m.a && Me(m.a, q), m.isMounted = !0, w = b = x = null;
      }
    };
    m.scope.on();
    const A = m.effect = new Li(E);
    m.scope.off();
    const _ = m.update = A.run.bind(A), F = m.job = A.runIfDirty.bind(A);
    F.i = m, F.id = m.uid, A.scheduler = () => qn(F), Mt(m, !0), _();
  }, Y = (m, w, b) => {
    w.component = m;
    const x = m.vnode.props;
    m.vnode = w, m.next = null, sl(m, w.props, x, b), ol(m, w.children, b), yt(), Wn(m), gt();
  }, B = (m, w, b, x, q, S, j, E, A = !1) => {
    const _ = m && m.children, F = m ? m.shapeFlag : 0, T = w.children, { patchFlag: L, shapeFlag: M } = w;
    if (L > 0) {
      if (L & 128) {
        Wt(
          _,
          T,
          b,
          x,
          q,
          S,
          j,
          E,
          A
        );
        return;
      } else if (L & 256) {
        ot(
          _,
          T,
          b,
          x,
          q,
          S,
          j,
          E,
          A
        );
        return;
      }
    }
    M & 8 ? (F & 16 && Be(_, q, S), T !== _ && i(b, T)) : F & 16 ? M & 16 ? Wt(
      _,
      T,
      b,
      x,
      q,
      S,
      j,
      E,
      A
    ) : Be(_, q, S, !0) : (F & 8 && i(b, ""), M & 16 && pe(
      T,
      b,
      x,
      q,
      S,
      j,
      E,
      A
    ));
  }, ot = (m, w, b, x, q, S, j, E, A) => {
    m = m || Bt, w = w || Bt;
    const _ = m.length, F = w.length, T = Math.min(_, F);
    let L;
    for (L = 0; L < T; L++) {
      const M = w[L] = A ? qt(w[L]) : Qe(w[L]);
      g(
        m[L],
        M,
        b,
        null,
        q,
        S,
        j,
        E,
        A
      );
    }
    _ > F ? Be(
      m,
      q,
      S,
      !0,
      !1,
      T
    ) : pe(
      w,
      b,
      x,
      q,
      S,
      j,
      E,
      A,
      T
    );
  }, Wt = (m, w, b, x, q, S, j, E, A) => {
    let _ = 0;
    const F = w.length;
    let T = m.length - 1, L = F - 1;
    for (; _ <= T && _ <= L; ) {
      const M = m[_], U = w[_] = A ? qt(w[_]) : Qe(w[_]);
      if (ms(M, U))
        g(
          M,
          U,
          b,
          null,
          q,
          S,
          j,
          E,
          A
        );
      else
        break;
      _++;
    }
    for (; _ <= T && _ <= L; ) {
      const M = m[T], U = w[L] = A ? qt(w[L]) : Qe(w[L]);
      if (ms(M, U))
        g(
          M,
          U,
          b,
          null,
          q,
          S,
          j,
          E,
          A
        );
      else
        break;
      T--, L--;
    }
    if (_ > T) {
      if (_ <= L) {
        const M = L + 1, U = M < F ? w[M].el : x;
        for (; _ <= L; )
          g(
            null,
            w[_] = A ? qt(w[_]) : Qe(w[_]),
            b,
            U,
            q,
            S,
            j,
            E,
            A
          ), _++;
      }
    } else if (_ > L)
      for (; _ <= T; )
        ze(m[_], q, S, !0), _++;
    else {
      const M = _, U = _, J = /* @__PURE__ */ new Map();
      for (_ = U; _ <= L; _++) {
        const Se = w[_] = A ? qt(w[_]) : Qe(w[_]);
        Se.key != null && J.set(Se.key, _);
      }
      let K, be = 0;
      const Pe = L - U + 1;
      let ge = !1, We = 0;
      const kt = new Array(Pe);
      for (_ = 0; _ < Pe; _++) kt[_] = 0;
      for (_ = M; _ <= T; _++) {
        const Se = m[_];
        if (be >= Pe) {
          ze(Se, q, S, !0);
          continue;
        }
        let Fe;
        if (Se.key != null)
          Fe = J.get(Se.key);
        else
          for (K = U; K <= L; K++)
            if (kt[K - U] === 0 && ms(Se, w[K])) {
              Fe = K;
              break;
            }
        Fe === void 0 ? ze(Se, q, S, !0) : (kt[Fe - U] = _ + 1, Fe >= We ? We = Fe : ge = !0, g(
          Se,
          w[Fe],
          b,
          null,
          q,
          S,
          j,
          E,
          A
        ), be++);
      }
      const ds = ge ? cl(kt) : Bt;
      for (K = ds.length - 1, _ = Pe - 1; _ >= 0; _--) {
        const Se = U + _, Fe = w[Se], Hs = w[Se + 1], Bs = Se + 1 < F ? (
          // #13559, fallback to el placeholder for unresolved async component
          Hs.el || Hs.placeholder
        ) : x;
        kt[_] === 0 ? g(
          null,
          Fe,
          b,
          Bs,
          q,
          S,
          j,
          E,
          A
        ) : ge && (K < 0 || _ !== ds[K] ? at(Fe, b, Bs, 2) : K--);
      }
    }
  }, at = (m, w, b, x, q = null) => {
    const { el: S, type: j, transition: E, children: A, shapeFlag: _ } = m;
    if (_ & 6) {
      at(m.component.subTree, w, b, x);
      return;
    }
    if (_ & 128) {
      m.suspense.move(w, b, x);
      return;
    }
    if (_ & 64) {
      j.move(m, w, b, Ot);
      return;
    }
    if (j === se) {
      a(S, w, b);
      for (let T = 0; T < A.length; T++)
        at(A[T], w, b, x);
      a(m.anchor, w, b);
      return;
    }
    if (j === Vr) {
      C(m, w, b);
      return;
    }
    if (x !== 2 && _ & 1 && E)
      if (x === 0)
        E.beforeEnter(S), a(S, w, b), Me(() => E.enter(S), q);
      else {
        const { leave: T, delayLeave: L, afterLeave: M } = E, U = () => {
          m.ctx.isUnmounted ? l(S) : a(S, w, b);
        }, J = () => {
          S._isLeaving && S[Ea](
            !0
            /* cancelled */
          ), T(S, () => {
            U(), M && M();
          });
        };
        L ? L(S, U, J) : J();
      }
    else
      a(S, w, b);
  }, ze = (m, w, b, x = !1, q = !1) => {
    const {
      type: S,
      props: j,
      ref: E,
      children: A,
      dynamicChildren: _,
      shapeFlag: F,
      patchFlag: T,
      dirs: L,
      cacheIndex: M
    } = m;
    if (T === -2 && (q = !1), E != null && (yt(), Is(E, null, b, m, !0), gt()), M != null && (w.renderCache[M] = void 0), F & 256) {
      w.ctx.deactivate(m);
      return;
    }
    const U = F & 1 && L, J = !qs(m);
    let K;
    if (J && (K = j && j.onVnodeBeforeUnmount) && Xe(K, w, m), F & 6)
      Fs(m.component, b, x);
    else {
      if (F & 128) {
        m.suspense.unmount(b, x);
        return;
      }
      U && Tt(m, null, w, "beforeUnmount"), F & 64 ? m.type.remove(
        m,
        w,
        b,
        Ot,
        x
      ) : _ && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !_.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (S !== se || T > 0 && T & 64) ? Be(
        _,
        w,
        b,
        !1,
        !0
      ) : (S === se && T & 384 || !q && F & 16) && Be(A, w, b), x && us(m);
    }
    (J && (K = j && j.onVnodeUnmounted) || U) && Me(() => {
      K && Xe(K, w, m), U && Tt(m, null, w, "unmounted");
    }, b);
  }, us = (m) => {
    const { type: w, el: b, anchor: x, transition: q } = m;
    if (w === se) {
      cs(b, x);
      return;
    }
    if (w === Vr) {
      N(m);
      return;
    }
    const S = () => {
      l(b), q && !q.persisted && q.afterLeave && q.afterLeave();
    };
    if (m.shapeFlag & 1 && q && !q.persisted) {
      const { leave: j, delayLeave: E } = q, A = () => j(b, S);
      E ? E(m.el, S, A) : A();
    } else
      S();
  }, cs = (m, w) => {
    let b;
    for (; m !== w; )
      b = h(m), l(m), m = b;
    l(w);
  }, Fs = (m, w, b) => {
    const { bum: x, scope: q, job: S, subTree: j, um: E, m: A, a: _ } = m;
    Jn(A), Jn(_), x && er(x), q.stop(), S && (S.flags |= 8, ze(j, m, w, b)), E && Me(E, w), Me(() => {
      m.isUnmounted = !0;
    }, w);
  }, Be = (m, w, b, x = !1, q = !1, S = 0) => {
    for (let j = S; j < m.length; j++)
      ze(m[j], w, b, x, q);
  }, Et = (m) => {
    if (m.shapeFlag & 6)
      return Et(m.component.subTree);
    if (m.shapeFlag & 128)
      return m.suspense.next();
    const w = h(m.anchor || m.el), b = w && w[Aa];
    return b ? h(b) : w;
  };
  let Pt = !1;
  const Vs = (m, w, b) => {
    m == null ? w._vnode && ze(w._vnode, null, null, !0) : g(
      w._vnode || null,
      m,
      w,
      null,
      null,
      null,
      b
    ), w._vnode = m, Pt || (Pt = !0, Wn(), so(), Pt = !1);
  }, Ot = {
    p: g,
    um: ze,
    m: at,
    r: us,
    mt: it,
    mc: pe,
    pc: B,
    pbc: Ee,
    n: Et,
    o: e
  };
  return {
    render: Vs,
    hydrate: void 0,
    createApp: Qa(Vs)
  };
}
function Fr({ type: e, props: t }, r) {
  return r === "svg" && e === "foreignObject" || r === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : r;
}
function Mt({ effect: e, job: t }, r) {
  r ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function ul(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Po(e, t, r = !1) {
  const a = e.children, l = t.children;
  if (V(a) && V(l))
    for (let u = 0; u < a.length; u++) {
      const s = a[u];
      let o = l[u];
      o.shapeFlag & 1 && !o.dynamicChildren && ((o.patchFlag <= 0 || o.patchFlag === 32) && (o = l[u] = qt(l[u]), o.el = s.el), !r && o.patchFlag !== -2 && Po(s, o)), o.type === Er && // avoid cached text nodes retaining detached dom nodes
      o.patchFlag !== -1 && (o.el = s.el), o.type === _t && !o.el && (o.el = s.el);
    }
}
function cl(e) {
  const t = e.slice(), r = [0];
  let a, l, u, s, o;
  const c = e.length;
  for (a = 0; a < c; a++) {
    const n = e[a];
    if (n !== 0) {
      if (l = r[r.length - 1], e[l] < n) {
        t[a] = l, r.push(a);
        continue;
      }
      for (u = 0, s = r.length - 1; u < s; )
        o = u + s >> 1, e[r[o]] < n ? u = o + 1 : s = o;
      n < e[r[u]] && (u > 0 && (t[a] = r[u - 1]), r[u] = a);
    }
  }
  for (u = r.length, s = r[u - 1]; u-- > 0; )
    r[u] = s, s = t[s];
  return r;
}
function ko(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : ko(t);
}
function Jn(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const dl = Symbol.for("v-scx"), pl = () => tr(dl);
function xs(e, t, r) {
  return $o(e, t, r);
}
function $o(e, t, r = Q) {
  const { immediate: a, deep: l, flush: u, once: s } = r, o = je({}, r), c = t && a || !t && u !== "post";
  let n;
  if (Ts) {
    if (u === "sync") {
      const p = pl();
      n = p.__watcherHandles || (p.__watcherHandles = []);
    } else if (!c) {
      const p = () => {
      };
      return p.stop = et, p.resume = et, p.pause = et, p;
    }
  }
  const i = Ie;
  o.call = (p, f, g) => st(p, i, f, g);
  let d = !1;
  u === "post" ? o.scheduler = (p) => {
    Me(p, i && i.suspense);
  } : u !== "sync" && (d = !0, o.scheduler = (p, f) => {
    f ? p() : qn(p);
  }), o.augmentJob = (p) => {
    t && (p.flags |= 4), d && (p.flags |= 2, i && (p.id = i.uid, p.i = i));
  };
  const h = Ia(e, t, o);
  return Ts && (n ? n.push(h) : c && h()), h;
}
function fl(e, t, r) {
  const a = this.proxy, l = de(e) ? e.includes(".") ? Io(a, e) : () => a[e] : e.bind(a, a);
  let u;
  H(t) ? u = t : (u = t.handler, r = t);
  const s = zs(this), o = $o(l, u.bind(a), r);
  return s(), o;
}
function Io(e, t) {
  const r = t.split(".");
  return () => {
    let a = e;
    for (let l = 0; l < r.length && a; l++)
      a = a[r[l]];
    return a;
  };
}
const ml = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${He(t)}Modifiers`] || e[`${jt(t)}Modifiers`];
function hl(e, t, ...r) {
  if (e.isUnmounted) return;
  const a = e.vnode.props || Q;
  let l = r;
  const u = t.startsWith("update:"), s = u && ml(a, t.slice(7));
  s && (s.trim && (l = r.map((i) => de(i) ? i.trim() : i)), s.number && (l = r.map(nr)));
  let o, c = a[o = Nr(t)] || // also try camelCase event handler (#2249)
  a[o = Nr(He(t))];
  !c && u && (c = a[o = Nr(jt(t))]), c && st(
    c,
    e,
    6,
    l
  );
  const n = a[o + "Once"];
  if (n) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[o])
      return;
    e.emitted[o] = !0, st(
      n,
      e,
      6,
      l
    );
  }
}
const yl = /* @__PURE__ */ new WeakMap();
function qo(e, t, r = !1) {
  const a = r ? yl : t.emitsCache, l = a.get(e);
  if (l !== void 0)
    return l;
  const u = e.emits;
  let s = {}, o = !1;
  if (!H(e)) {
    const c = (n) => {
      const i = qo(n, t, !0);
      i && (o = !0, je(s, i));
    };
    !r && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !u && !o ? (re(e) && a.set(e, null), null) : (V(u) ? u.forEach((c) => s[c] = null) : je(s, u), re(e) && a.set(e, s), s);
}
function jr(e, t) {
  return !e || !Pr(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), X(e, t[0].toLowerCase() + t.slice(1)) || X(e, jt(t)) || X(e, t));
}
function Gn(e) {
  const {
    type: t,
    vnode: r,
    proxy: a,
    withProxy: l,
    propsOptions: [u],
    slots: s,
    attrs: o,
    emit: c,
    render: n,
    renderCache: i,
    props: d,
    data: h,
    setupState: p,
    ctx: f,
    inheritAttrs: g
  } = e, k = lr(e);
  let $, O;
  try {
    if (r.shapeFlag & 4) {
      const N = l || a, ee = N;
      $ = Qe(
        n.call(
          ee,
          N,
          i,
          d,
          p,
          h,
          f
        )
      ), O = o;
    } else {
      const N = t;
      $ = Qe(
        N.length > 1 ? N(
          d,
          { attrs: o, slots: s, emit: c }
        ) : N(
          d,
          null
        )
      ), O = t.props ? o : gl(o);
    }
  } catch (N) {
    _s.length = 0, _r(N, e, 1), $ = Ge(_t);
  }
  let C = $;
  if (O && g !== !1) {
    const N = Object.keys(O), { shapeFlag: ee } = C;
    N.length && ee & 7 && (u && N.some(pn) && (O = wl(
      O,
      u
    )), C = ls(C, O, !1, !0));
  }
  return r.dirs && (C = ls(C, null, !1, !0), C.dirs = C.dirs ? C.dirs.concat(r.dirs) : r.dirs), r.transition && Sn(C, r.transition), $ = C, lr(k), $;
}
const gl = (e) => {
  let t;
  for (const r in e)
    (r === "class" || r === "style" || Pr(r)) && ((t || (t = {}))[r] = e[r]);
  return t;
}, wl = (e, t) => {
  const r = {};
  for (const a in e)
    (!pn(a) || !(a.slice(9) in t)) && (r[a] = e[a]);
  return r;
};
function vl(e, t, r) {
  const { props: a, children: l, component: u } = e, { props: s, children: o, patchFlag: c } = t, n = u.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (r && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return a ? Xn(a, s, n) : !!s;
    if (c & 8) {
      const i = t.dynamicProps;
      for (let d = 0; d < i.length; d++) {
        const h = i[d];
        if (s[h] !== a[h] && !jr(n, h))
          return !0;
      }
    }
  } else
    return (l || o) && (!o || !o.$stable) ? !0 : a === s ? !1 : a ? s ? Xn(a, s, n) : !0 : !!s;
  return !1;
}
function Xn(e, t, r) {
  const a = Object.keys(t);
  if (a.length !== Object.keys(e).length)
    return !0;
  for (let l = 0; l < a.length; l++) {
    const u = a[l];
    if (t[u] !== e[u] && !jr(r, u))
      return !0;
  }
  return !1;
}
function bl({ vnode: e, parent: t }, r) {
  for (; t; ) {
    const a = t.subTree;
    if (a.suspense && a.suspense.activeBranch === e && (a.el = e.el), a === e)
      (e = t.vnode).el = r, t = t.parent;
    else
      break;
  }
}
const So = (e) => e.__isSuspense;
function Pl(e, t) {
  t && t.pendingBranch ? V(e) ? t.effects.push(...e) : t.effects.push(e) : xa(e);
}
const se = Symbol.for("v-fgt"), Er = Symbol.for("v-txt"), _t = Symbol.for("v-cmt"), Vr = Symbol.for("v-stc"), _s = [];
let De = null;
function D(e = !1) {
  _s.push(De = e ? null : []);
}
function kl() {
  _s.pop(), De = _s[_s.length - 1] || null;
}
let Os = 1;
function Yn(e, t = !1) {
  Os += e, e < 0 && De && t && (De.hasOnce = !0);
}
function xo(e) {
  return e.dynamicChildren = Os > 0 ? De || Bt : null, kl(), Os > 0 && De && De.push(e), e;
}
function z(e, t, r, a, l, u) {
  return xo(
    y(
      e,
      t,
      r,
      a,
      l,
      u,
      !0
    )
  );
}
function dr(e, t, r, a, l) {
  return xo(
    Ge(
      e,
      t,
      r,
      a,
      l,
      !0
    )
  );
}
function _o(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function ms(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Ao = ({ key: e }) => e ?? null, sr = ({
  ref: e,
  ref_key: t,
  ref_for: r
}) => (typeof e == "number" && (e = "" + e), e != null ? de(e) || qe(e) || H(e) ? { i: Re, r: e, k: t, f: !!r } : e : null);
function y(e, t = null, r = null, a = 0, l = null, u = e === se ? 0 : 1, s = !1, o = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Ao(t),
    ref: t && sr(t),
    scopeId: no,
    slotScopeIds: null,
    children: r,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: u,
    patchFlag: a,
    dynamicProps: l,
    dynamicChildren: null,
    appContext: null,
    ctx: Re
  };
  return o ? (En(c, r), u & 128 && e.normalize(c)) : r && (c.shapeFlag |= de(r) ? 8 : 16), Os > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  De && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || u & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && De.push(c), c;
}
const Ge = $l;
function $l(e, t = null, r = null, a = 0, l = null, u = !1) {
  if ((!e || e === Ha) && (e = _t), _o(e)) {
    const o = ls(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return r && En(o, r), Os > 0 && !u && De && (o.shapeFlag & 6 ? De[De.indexOf(e)] = o : De.push(o)), o.patchFlag = -2, o;
  }
  if (Cl(e) && (e = e.__vccOpts), t) {
    t = Il(t);
    let { class: o, style: c } = t;
    o && !de(o) && (t.class = we(o)), re(c) && ($n(c) && !V(c) && (c = je({}, c)), t.style = hn(c));
  }
  const s = de(e) ? 1 : So(e) ? 128 : ja(e) ? 64 : re(e) ? 4 : H(e) ? 2 : 0;
  return y(
    e,
    t,
    r,
    a,
    l,
    s,
    u,
    !0
  );
}
function Il(e) {
  return e ? $n(e) || ho(e) ? je({}, e) : e : null;
}
function ls(e, t, r = !1, a = !1) {
  const { props: l, ref: u, patchFlag: s, children: o, transition: c } = e, n = t ? ql(l || {}, t) : l, i = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: n,
    key: n && Ao(n),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      r && u ? V(u) ? u.concat(sr(t)) : [u, sr(t)] : sr(t)
    ) : u,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: o,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== se ? s === -1 ? 16 : s | 16 : s,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: c,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && ls(e.ssContent),
    ssFallback: e.ssFallback && ls(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return c && a && Sn(
    i,
    c.clone(i)
  ), i;
}
function ae(e = " ", t = 0) {
  return Ge(Er, null, e, t);
}
function _e(e = "", t = !1) {
  return t ? (D(), dr(_t, null, e)) : Ge(_t, null, e);
}
function Qe(e) {
  return e == null || typeof e == "boolean" ? Ge(_t) : V(e) ? Ge(
    se,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : _o(e) ? qt(e) : Ge(Er, null, String(e));
}
function qt(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ls(e);
}
function En(e, t) {
  let r = 0;
  const { shapeFlag: a } = e;
  if (t == null)
    t = null;
  else if (V(t))
    r = 16;
  else if (typeof t == "object")
    if (a & 65) {
      const l = t.default;
      l && (l._c && (l._d = !1), En(e, l()), l._c && (l._d = !0));
      return;
    } else {
      r = 32;
      const l = t._;
      !l && !ho(t) ? t._ctx = Re : l === 3 && Re && (Re.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else H(t) ? (t = { default: t, _ctx: Re }, r = 32) : (t = String(t), a & 64 ? (r = 16, t = [ae(t)]) : r = 8);
  e.children = t, e.shapeFlag |= r;
}
function ql(...e) {
  const t = {};
  for (let r = 0; r < e.length; r++) {
    const a = e[r];
    for (const l in a)
      if (l === "class")
        t.class !== a.class && (t.class = we([t.class, a.class]));
      else if (l === "style")
        t.style = hn([t.style, a.style]);
      else if (Pr(l)) {
        const u = t[l], s = a[l];
        s && u !== s && !(V(u) && u.includes(s)) && (t[l] = u ? [].concat(u, s) : s);
      } else l !== "" && (t[l] = a[l]);
  }
  return t;
}
function Xe(e, t, r, a = null) {
  st(e, t, 7, [
    r,
    a
  ]);
}
const Sl = po();
let xl = 0;
function _l(e, t, r) {
  const a = e.type, l = (t ? t.appContext : e.appContext) || Sl, u = {
    uid: xl++,
    vnode: e,
    type: a,
    parent: t,
    appContext: l,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Go(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(l.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: go(a, l),
    emitsOptions: qo(a, l),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Q,
    // inheritAttrs
    inheritAttrs: a.inheritAttrs,
    // state
    ctx: Q,
    data: Q,
    props: Q,
    attrs: Q,
    slots: Q,
    refs: Q,
    setupState: Q,
    setupContext: null,
    // suspense related
    suspense: r,
    suspenseId: r ? r.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return u.ctx = { _: u }, u.root = t ? t.root : u, u.emit = hl.bind(null, u), e.ce && e.ce(u), u;
}
let Ie = null;
const Al = () => Ie || Re;
let pr, nn;
{
  const e = qr(), t = (r, a) => {
    let l;
    return (l = e[r]) || (l = e[r] = []), l.push(a), (u) => {
      l.length > 1 ? l.forEach((s) => s(u)) : l[0](u);
    };
  };
  pr = t(
    "__VUE_INSTANCE_SETTERS__",
    (r) => Ie = r
  ), nn = t(
    "__VUE_SSR_SETTERS__",
    (r) => Ts = r
  );
}
const zs = (e) => {
  const t = Ie;
  return pr(e), e.scope.on(), () => {
    e.scope.off(), pr(t);
  };
}, Qn = () => {
  Ie && Ie.scope.off(), pr(null);
};
function jo(e) {
  return e.vnode.shapeFlag & 4;
}
let Ts = !1;
function jl(e, t = !1, r = !1) {
  t && nn(t);
  const { props: a, children: l } = e.vnode, u = jo(e);
  tl(e, a, u, t), il(e, l, r || t);
  const s = u ? El(e, t) : void 0;
  return t && nn(!1), s;
}
function El(e, t) {
  const r = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Ua);
  const { setup: a } = r;
  if (a) {
    yt();
    const l = e.setupContext = a.length > 1 ? Tl(e) : null, u = zs(e), s = Ds(
      a,
      e,
      0,
      [
        e.props,
        l
      ]
    ), o = ji(s);
    if (gt(), u(), (o || e.sp) && !qs(e) && io(e), o) {
      if (s.then(Qn, Qn), t)
        return s.then((c) => {
          ei(e, c);
        }).catch((c) => {
          _r(c, e, 0);
        });
      e.asyncDep = s;
    } else
      ei(e, s);
  } else
    Eo(e);
}
function ei(e, t, r) {
  H(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : re(t) && (e.setupState = Qi(t)), Eo(e);
}
function Eo(e, t, r) {
  const a = e.type;
  e.render || (e.render = a.render || et);
  {
    const l = zs(e);
    yt();
    try {
      Za(e);
    } finally {
      gt(), l();
    }
  }
}
const Ol = {
  get(e, t) {
    return $e(e, "get", ""), e[t];
  }
};
function Tl(e) {
  const t = (r) => {
    e.exposed = r || {};
  };
  return {
    attrs: new Proxy(e.attrs, Ol),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Or(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Qi(ga(e.exposed)), {
    get(t, r) {
      if (r in t)
        return t[r];
      if (r in Ss)
        return Ss[r](e);
    },
    has(t, r) {
      return r in t || r in Ss;
    }
  })) : e.proxy;
}
function Ml(e, t = !0) {
  return H(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Cl(e) {
  return H(e) && "__vccOpts" in e;
}
const Le = (e, t) => ka(e, t, Ts), Nl = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let on;
const ti = typeof window < "u" && window.trustedTypes;
if (ti)
  try {
    on = /* @__PURE__ */ ti.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Oo = on ? (e) => on.createHTML(e) : (e) => e, Ll = "http://www.w3.org/2000/svg", Rl = "http://www.w3.org/1998/Math/MathML", ct = typeof document < "u" ? document : null, si = ct && /* @__PURE__ */ ct.createElement("template"), Dl = {
  insert: (e, t, r) => {
    t.insertBefore(e, r || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, r, a) => {
    const l = t === "svg" ? ct.createElementNS(Ll, e) : t === "mathml" ? ct.createElementNS(Rl, e) : r ? ct.createElement(e, { is: r }) : ct.createElement(e);
    return e === "select" && a && a.multiple != null && l.setAttribute("multiple", a.multiple), l;
  },
  createText: (e) => ct.createTextNode(e),
  createComment: (e) => ct.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => ct.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, r, a, l, u) {
    const s = r ? r.previousSibling : t.lastChild;
    if (l && (l === u || l.nextSibling))
      for (; t.insertBefore(l.cloneNode(!0), r), !(l === u || !(l = l.nextSibling)); )
        ;
    else {
      si.innerHTML = Oo(
        a === "svg" ? `<svg>${e}</svg>` : a === "mathml" ? `<math>${e}</math>` : e
      );
      const o = si.content;
      if (a === "svg" || a === "mathml") {
        const c = o.firstChild;
        for (; c.firstChild; )
          o.appendChild(c.firstChild);
        o.removeChild(c);
      }
      t.insertBefore(o, r);
    }
    return [
      // first
      s ? s.nextSibling : t.firstChild,
      // last
      r ? r.previousSibling : t.lastChild
    ];
  }
}, zl = Symbol("_vtc");
function Wl(e, t, r) {
  const a = e[zl];
  a && (t = (t ? [t, ...a] : [...a]).join(" ")), t == null ? e.removeAttribute("class") : r ? e.setAttribute("class", t) : e.className = t;
}
const fr = Symbol("_vod"), To = Symbol("_vsh"), Hr = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(e, { value: t }, { transition: r }) {
    e[fr] = e.style.display === "none" ? "" : e.style.display, r && t ? r.beforeEnter(e) : hs(e, t);
  },
  mounted(e, { value: t }, { transition: r }) {
    r && t && r.enter(e);
  },
  updated(e, { value: t, oldValue: r }, { transition: a }) {
    !t != !r && (a ? t ? (a.beforeEnter(e), hs(e, !0), a.enter(e)) : a.leave(e, () => {
      hs(e, !1);
    }) : hs(e, t));
  },
  beforeUnmount(e, { value: t }) {
    hs(e, t);
  }
};
function hs(e, t) {
  e.style.display = t ? e[fr] : "none", e[To] = !t;
}
const Fl = Symbol(""), Vl = /(?:^|;)\s*display\s*:/;
function Hl(e, t, r) {
  const a = e.style, l = de(r);
  let u = !1;
  if (r && !l) {
    if (t)
      if (de(t))
        for (const s of t.split(";")) {
          const o = s.slice(0, s.indexOf(":")).trim();
          r[o] == null && rr(a, o, "");
        }
      else
        for (const s in t)
          r[s] == null && rr(a, s, "");
    for (const s in r)
      s === "display" && (u = !0), rr(a, s, r[s]);
  } else if (l) {
    if (t !== r) {
      const s = a[Fl];
      s && (r += ";" + s), a.cssText = r, u = Vl.test(r);
    }
  } else t && e.removeAttribute("style");
  fr in e && (e[fr] = u ? a.display : "", e[To] && (a.display = "none"));
}
const ri = /\s*!important$/;
function rr(e, t, r) {
  if (V(r))
    r.forEach((a) => rr(e, t, a));
  else if (r == null && (r = ""), t.startsWith("--"))
    e.setProperty(t, r);
  else {
    const a = Bl(e, t);
    ri.test(r) ? e.setProperty(
      jt(a),
      r.replace(ri, ""),
      "important"
    ) : e[a] = r;
  }
}
const ni = ["Webkit", "Moz", "ms"], Br = {};
function Bl(e, t) {
  const r = Br[t];
  if (r)
    return r;
  let a = He(t);
  if (a !== "filter" && a in e)
    return Br[t] = a;
  a = Ir(a);
  for (let l = 0; l < ni.length; l++) {
    const u = ni[l] + a;
    if (u in e)
      return Br[t] = u;
  }
  return t;
}
const ii = "http://www.w3.org/1999/xlink";
function oi(e, t, r, a, l, u = Zo(t)) {
  a && t.startsWith("xlink:") ? r == null ? e.removeAttributeNS(ii, t.slice(6, t.length)) : e.setAttributeNS(ii, t, r) : r == null || u && !Mi(r) ? e.removeAttribute(t) : e.setAttribute(
    t,
    u ? "" : tt(r) ? String(r) : r
  );
}
function ai(e, t, r, a, l) {
  if (t === "innerHTML" || t === "textContent") {
    r != null && (e[t] = t === "innerHTML" ? Oo(r) : r);
    return;
  }
  const u = e.tagName;
  if (t === "value" && u !== "PROGRESS" && // custom elements may use _value internally
  !u.includes("-")) {
    const o = u === "OPTION" ? e.getAttribute("value") || "" : e.value, c = r == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(r);
    (o !== c || !("_value" in e)) && (e.value = c), r == null && e.removeAttribute(t), e._value = r;
    return;
  }
  let s = !1;
  if (r === "" || r == null) {
    const o = typeof e[t];
    o === "boolean" ? r = Mi(r) : r == null && o === "string" ? (r = "", s = !0) : o === "number" && (r = 0, s = !0);
  }
  try {
    e[t] = r;
  } catch {
  }
  s && e.removeAttribute(l || t);
}
function Rt(e, t, r, a) {
  e.addEventListener(t, r, a);
}
function Ul(e, t, r, a) {
  e.removeEventListener(t, r, a);
}
const li = Symbol("_vei");
function Zl(e, t, r, a, l = null) {
  const u = e[li] || (e[li] = {}), s = u[t];
  if (a && s)
    s.value = a;
  else {
    const [o, c] = Kl(t);
    if (a) {
      const n = u[t] = Xl(
        a,
        l
      );
      Rt(e, o, n, c);
    } else s && (Ul(e, o, s, c), u[t] = void 0);
  }
}
const ui = /(?:Once|Passive|Capture)$/;
function Kl(e) {
  let t;
  if (ui.test(e)) {
    t = {};
    let a;
    for (; a = e.match(ui); )
      e = e.slice(0, e.length - a[0].length), t[a[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : jt(e.slice(2)), t];
}
let Ur = 0;
const Jl = /* @__PURE__ */ Promise.resolve(), Gl = () => Ur || (Jl.then(() => Ur = 0), Ur = Date.now());
function Xl(e, t) {
  const r = (a) => {
    if (!a._vts)
      a._vts = Date.now();
    else if (a._vts <= r.attached)
      return;
    st(
      Yl(a, r.value),
      t,
      5,
      [a]
    );
  };
  return r.value = e, r.attached = Gl(), r;
}
function Yl(e, t) {
  if (V(t)) {
    const r = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      r.call(e), e._stopped = !0;
    }, t.map(
      (a) => (l) => !l._stopped && a && a(l)
    );
  } else
    return t;
}
const ci = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Ql = (e, t, r, a, l, u) => {
  const s = l === "svg";
  t === "class" ? Wl(e, a, s) : t === "style" ? Hl(e, r, a) : Pr(t) ? pn(t) || Zl(e, t, r, a, u) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : eu(e, t, a, s)) ? (ai(e, t, a), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && oi(e, t, a, s, u, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !de(a)) ? ai(e, He(t), a, u, t) : (t === "true-value" ? e._trueValue = a : t === "false-value" && (e._falseValue = a), oi(e, t, a, s));
};
function eu(e, t, r, a) {
  if (a)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ci(t) && H(r));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const l = e.tagName;
    if (l === "IMG" || l === "VIDEO" || l === "CANVAS" || l === "SOURCE")
      return !1;
  }
  return ci(t) && de(r) ? !1 : t in e;
}
const mr = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return V(t) ? (r) => er(t, r) : t;
};
function tu(e) {
  e.target.composing = !0;
}
function di(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Gt = Symbol("_assign"), su = {
  created(e, { modifiers: { lazy: t, trim: r, number: a } }, l) {
    e[Gt] = mr(l);
    const u = a || l.props && l.props.type === "number";
    Rt(e, t ? "change" : "input", (s) => {
      if (s.target.composing) return;
      let o = e.value;
      r && (o = o.trim()), u && (o = nr(o)), e[Gt](o);
    }), r && Rt(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Rt(e, "compositionstart", tu), Rt(e, "compositionend", di), Rt(e, "change", di));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: r, modifiers: { lazy: a, trim: l, number: u } }, s) {
    if (e[Gt] = mr(s), e.composing) return;
    const o = (u || e.type === "number") && !/^0\d/.test(e.value) ? nr(e.value) : e.value, c = t ?? "";
    o !== c && (document.activeElement === e && e.type !== "range" && (a && t === r || l && e.value.trim() === c) || (e.value = c));
  }
}, ru = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: r } }, a) {
    const l = kr(t);
    Rt(e, "change", () => {
      const u = Array.prototype.filter.call(e.options, (s) => s.selected).map(
        (s) => r ? nr(hr(s)) : hr(s)
      );
      e[Gt](
        e.multiple ? l ? new Set(u) : u : u[0]
      ), e._assigning = !0, In(() => {
        e._assigning = !1;
      });
    }), e[Gt] = mr(a);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    pi(e, t);
  },
  beforeUpdate(e, t, r) {
    e[Gt] = mr(r);
  },
  updated(e, { value: t }) {
    e._assigning || pi(e, t);
  }
};
function pi(e, t) {
  const r = e.multiple, a = V(t);
  if (!(r && !a && !kr(t))) {
    for (let l = 0, u = e.options.length; l < u; l++) {
      const s = e.options[l], o = hr(s);
      if (r)
        if (a) {
          const c = typeof o;
          c === "string" || c === "number" ? s.selected = t.some((n) => String(n) === String(o)) : s.selected = Jo(t, o) > -1;
        } else
          s.selected = t.has(o);
      else if (Sr(hr(s), t)) {
        e.selectedIndex !== l && (e.selectedIndex = l);
        return;
      }
    }
    !r && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function hr(e) {
  return "_value" in e ? e._value : e.value;
}
const nu = ["ctrl", "shift", "alt", "meta"], iu = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => nu.some((r) => e[`${r}Key`] && !t.includes(r))
}, On = (e, t) => {
  const r = e._withMods || (e._withMods = {}), a = t.join(".");
  return r[a] || (r[a] = ((l, ...u) => {
    for (let s = 0; s < t.length; s++) {
      const o = iu[t[s]];
      if (o && o(l, t)) return;
    }
    return e(l, ...u);
  }));
}, ou = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, au = (e, t) => {
  const r = e._withKeys || (e._withKeys = {}), a = t.join(".");
  return r[a] || (r[a] = ((l) => {
    if (!("key" in l))
      return;
    const u = jt(l.key);
    if (t.some(
      (s) => s === u || ou[s] === u
    ))
      return e(l);
  }));
}, lu = /* @__PURE__ */ je({ patchProp: Ql }, Dl);
let fi;
function uu() {
  return fi || (fi = al(lu));
}
const cu = ((...e) => {
  const t = uu().createApp(...e), { mount: r } = t;
  return t.mount = (a) => {
    const l = pu(a);
    if (!l) return;
    const u = t._component;
    !H(u) && !u.render && !u.template && (u.template = l.innerHTML), l.nodeType === 1 && (l.textContent = "");
    const s = r(l, !1, du(l));
    return l instanceof Element && (l.removeAttribute("v-cloak"), l.setAttribute("data-v-app", "")), s;
  }, t;
});
function du(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function pu(e) {
  return de(e) ? document.querySelector(e) : e;
}
const fu = { class: "tree-node" }, mu = ["title"], hu = { class: "tree-icon" }, yu = {
  key: 0,
  class: "tree-children"
}, gu = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
  __name: "FileTreeNode",
  props: {
    node: { type: Object, required: !0 },
    selectedPath: { type: String, default: "" }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const r = t, a = Z(!0);
    return (l, u) => {
      const s = Va("FileTreeNode", !0);
      return D(), z("div", fu, [
        y("div", {
          class: we(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: u[1] || (u[1] = (o) => r("select", e.node)),
          onDblclick: u[2] || (u[2] = (o) => e.node.kind === "directory" && (a.value = !a.value))
        }, [
          y("span", {
            class: "tree-toggle",
            onClick: u[0] || (u[0] = On((o) => e.node.kind === "directory" && (a.value = !a.value), ["stop"]))
          }, R(e.node.kind === "directory" ? a.value ? "⌄" : "›" : ""), 1),
          y("span", hu, R(e.node.kind === "directory" ? "▰" : "·"), 1),
          y("span", null, R(e.node.name), 1)
        ], 42, mu),
        e.node.kind === "directory" && a.value ? (D(), z("div", yu, [
          (D(!0), z(se, null, Ze(e.node.children, (o) => (D(), dr(s, {
            key: o.path,
            node: o,
            "selected-path": e.selectedPath,
            onSelect: u[3] || (u[3] = (c) => r("select", c))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : _e("", !0)
      ]);
    };
  }
}), wu = { class: "monaco-editor-shell" }, vu = {
  key: 0,
  class: "editor-loading"
}, bu = {
  __name: "MonacoEditor",
  props: {
    projectId: { type: String, required: !0 },
    path: { type: String, required: !0 },
    language: { type: String, default: "plaintext" },
    value: { type: String, default: "" },
    markers: { type: Array, default: () => [] }
  },
  emits: ["update:value", "save", "ready", "error"],
  setup(e, { emit: t }) {
    const r = e, a = t, l = Z(null), u = Z(!0);
    let s, o, c, n, i = !1, d;
    xn(async () => {
      try {
        const g = await import("./monaco-runtime-DJGSYZUV.js").then((k) => k.jz);
        ({ monaco: c } = await g.configureStudioMonaco()), d = g.configureManifestSchemaForText, o = h(), f(o.getValue()), s = c.editor.create(l.value, {
          model: o,
          automaticLayout: !0,
          minimap: { enabled: !1 },
          fontSize: 13,
          tabSize: 2,
          insertSpaces: !0,
          scrollBeyondLastLine: !1,
          wordWrap: "off",
          renderWhitespace: "selection",
          accessibilityPageSize: 20
        }), n = s.onDidChangeModelContent(() => {
          const k = o.getValue();
          f(k), i || a("update:value", k);
        }), s.addCommand(c.KeyMod.CtrlCmd | c.KeyCode.KeyS, () => a("save")), u.value = !1, p(), s.focus(), a("ready");
      } catch (g) {
        u.value = !1, a("error", g);
      }
    }), xs(() => r.value, (g) => {
      !o || o.getValue() === g || (i = !0, o.setValue(g), f(g), i = !1);
    }), xs(() => r.markers, p, { deep: !0 }), _n(() => {
      n?.dispose(), s?.dispose();
    });
    function h() {
      const g = c.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(r.projectId)}/${r.path}`), k = c.editor.getModel(g);
      return k ? (c.editor.setModelLanguage(k, r.language), k.getValue() !== r.value && k.setValue(r.value), k) : c.editor.createModel(r.value, r.language, g);
    }
    function p() {
      !c || !o || c.editor.setModelMarkers(o, "webwindows-manifest", r.markers.map((g) => ({
        severity: g.severity === "warning" ? c.MarkerSeverity.Warning : c.MarkerSeverity.Error,
        message: `${g.path}: ${g.message}`,
        startLineNumber: g.line || 1,
        startColumn: g.column || 1,
        endLineNumber: g.endLine || g.line || 1,
        endColumn: g.endColumn || Math.max(2, (g.column || 1) + 1)
      })));
    }
    function f(g) {
      r.path === "manifest.json" && d?.(g);
    }
    return (g, k) => (D(), z("div", wu, [
      y("div", {
        ref_key: "host",
        ref: l,
        class: "monaco-editor-host"
      }, null, 512),
      u.value ? (D(), z("div", vu, "正在载入本地编辑器…")) : _e("", !0)
    ]));
  }
}, Pu = 1, mi = 2;
function At(e) {
  return !e || typeof e != "object" || Array.isArray(e) ? null : Object.prototype.hasOwnProperty.call(e, "manifestVersion") ? e.manifestVersion === mi ? mi : null : Pu;
}
const ku = { class: "manifest-inspector" }, $u = { class: "inspector-mode-tabs" }, Iu = {
  key: 0,
  class: "inspector-note"
}, qu = {
  key: 1,
  class: "inspector-note error"
}, Su = ["value"], xu = { key: 0 }, _u = ["value"], Au = ["value"], ju = ["value"], Eu = ["value"], Ou = ["value"], Tu = ["value"], Mu = ["value"], Cu = ["value"], Nu = ["value"], Lu = ["value"], Ru = { class: "check" }, Du = ["checked"], zu = { class: "check" }, Wu = ["checked"], Fu = { class: "check" }, Vu = ["checked"], Hu = { class: "check" }, Bu = ["checked"], Uu = { class: "check" }, Zu = ["checked"], Ku = {
  key: 1,
  class: "permission-fieldset"
}, Ju = { class: "permission-heading" }, Gu = ["checked", "onChange"], Xu = { class: "permission-meta" }, Yu = { key: 0 }, Qu = {
  key: 2,
  class: "inspector-note"
}, ec = { class: "inspector-summary" }, tc = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const r = e, a = t, l = Z("form"), u = Le(() => r.manifest && typeof r.manifest == "object" && !Array.isArray(r.manifest)), s = Le(() => {
      if (!u.value) return "—";
      const h = At(r.manifest);
      return h === 1 ? "1 (legacy implicit)" : h === 2 ? "2" : `Unsupported (${String(r.manifest.manifestVersion)})`;
    }), o = Le(() => At(r.manifest) === 2), c = Le(() => {
      const h = new Set(r.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
      return (r.permissionRegistry?.permissions || []).filter((p) => p.sourceDeclarable === !0 && h.has(p.id));
    });
    function n(h) {
      const p = (r.brokerMethods?.methods || []).filter((f) => f.requiredPermission === h.id);
      return {
        description: h.description || h.publicApiTargets?.join(", ") || "No public API target registered",
        consent: p[0]?.consent || h.prompt || "unspecified",
        pilot: p.some((f) => f.currentStatus === "enabled") ? "Preview Pilot enabled" : "Pilot contract only",
        methods: p.map((f) => f.id)
      };
    }
    function i(h, p) {
      const f = new Set(Array.isArray(r.manifest.permissions) ? r.manifest.permissions : []);
      p ? f.add(h) : f.delete(h);
      const g = c.value.map((k) => k.id);
      d(["permissions"], g.filter((k) => f.has(k)));
    }
    function d(h, p) {
      if (!u.value) return;
      const f = JSON.parse(JSON.stringify(r.manifest));
      let g = f;
      h.slice(0, -1).forEach((k) => {
        (!g[k] || typeof g[k] != "object") && (g[k] = {}), g = g[k];
      }), g[h.at(-1)] = p, a("update:manifest", f);
    }
    return (h, p) => (D(), z("div", ku, [
      y("div", $u, [
        y("button", {
          type: "button",
          class: we({ active: l.value === "form" }),
          onClick: p[0] || (p[0] = (f) => l.value = "form")
        }, "表单", 2),
        y("button", {
          type: "button",
          class: we({ active: l.value === "json" }),
          onClick: p[1] || (p[1] = (f) => {
            l.value = "json", a("open-json");
          })
        }, "JSON", 2)
      ]),
      l.value === "json" ? (D(), z("div", Iu, [
        p[18] || (p[18] = ae(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        y("button", {
          type: "button",
          onClick: p[2] || (p[2] = (f) => a("open-json"))
        }, "打开 manifest.json")
      ])) : u.value ? (D(), z("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: p[17] || (p[17] = On(() => {
        }, ["prevent"]))
      }, [
        y("label", null, [
          p[19] || (p[19] = ae("Manifest Version", -1)),
          y("input", {
            value: s.value,
            readonly: ""
          }, null, 8, Su)
        ]),
        o.value ? (D(), z("label", xu, [
          p[20] || (p[20] = ae("SDK API Version", -1)),
          y("input", {
            value: e.manifest.sdk?.apiVersion,
            readonly: ""
          }, null, 8, _u)
        ])) : _e("", !0),
        y("label", null, [
          p[21] || (p[21] = ae("ID", -1)),
          y("input", {
            value: e.manifest.id,
            onInput: p[3] || (p[3] = (f) => d(["id"], f.target.value))
          }, null, 40, Au)
        ]),
        y("label", null, [
          p[22] || (p[22] = ae("名称", -1)),
          y("input", {
            value: e.manifest.name,
            onInput: p[4] || (p[4] = (f) => d(["name"], f.target.value))
          }, null, 40, ju)
        ]),
        y("label", null, [
          p[23] || (p[23] = ae("版本", -1)),
          y("input", {
            value: e.manifest.version,
            onInput: p[5] || (p[5] = (f) => d(["version"], f.target.value))
          }, null, 40, Eu)
        ]),
        y("label", null, [
          p[24] || (p[24] = ae("描述", -1)),
          y("textarea", {
            value: e.manifest.description,
            onInput: p[6] || (p[6] = (f) => d(["description"], f.target.value))
          }, null, 40, Ou)
        ]),
        y("label", null, [
          p[25] || (p[25] = ae("分类", -1)),
          y("input", {
            value: e.manifest.category,
            onInput: p[7] || (p[7] = (f) => d(["category"], f.target.value))
          }, null, 40, Tu)
        ]),
        y("label", null, [
          p[26] || (p[26] = ae("入口", -1)),
          y("input", {
            value: e.manifest.entry,
            onInput: p[8] || (p[8] = (f) => d(["entry"], f.target.value))
          }, null, 40, Mu)
        ]),
        y("label", null, [
          p[27] || (p[27] = ae("图标", -1)),
          y("input", {
            value: e.manifest.icon,
            onInput: p[9] || (p[9] = (f) => d(["icon"], f.target.value))
          }, null, 40, Cu)
        ]),
        y("fieldset", null, [
          p[31] || (p[31] = y("legend", null, "Window", -1)),
          y("label", null, [
            p[28] || (p[28] = ae("宽度", -1)),
            y("input", {
              value: e.manifest.window?.width,
              onInput: p[10] || (p[10] = (f) => d(["window", "width"], f.target.value))
            }, null, 40, Nu)
          ]),
          y("label", null, [
            p[29] || (p[29] = ae("高度", -1)),
            y("input", {
              value: e.manifest.window?.height,
              onInput: p[11] || (p[11] = (f) => d(["window", "height"], f.target.value))
            }, null, 40, Lu)
          ]),
          y("label", Ru, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: p[12] || (p[12] = (f) => d(["window", "singleton"], f.target.checked))
            }, null, 40, Du),
            p[30] || (p[30] = ae(" 单实例", -1))
          ])
        ]),
        y("fieldset", null, [
          p[36] || (p[36] = y("legend", null, "Placement", -1)),
          y("label", zu, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: p[13] || (p[13] = (f) => d(["placement", "startMenu"], f.target.checked))
            }, null, 40, Wu),
            p[32] || (p[32] = ae(" 开始菜单", -1))
          ]),
          y("label", Fu, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: p[14] || (p[14] = (f) => d(["placement", "allFunctions"], f.target.checked))
            }, null, 40, Vu),
            p[33] || (p[33] = ae(" 全部功能", -1))
          ]),
          y("label", Hu, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: p[15] || (p[15] = (f) => d(["placement", "desktop"], f.target.checked))
            }, null, 40, Bu),
            p[34] || (p[34] = ae(" 桌面", -1))
          ]),
          y("label", Uu, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: p[16] || (p[16] = (f) => d(["placement", "taskbar"], f.target.checked))
            }, null, 40, Zu),
            p[35] || (p[35] = ae(" 任务栏", -1))
          ])
        ]),
        o.value ? (D(), z("fieldset", Ku, [
          p[37] || (p[37] = y("legend", null, "Requested Permissions", -1)),
          p[38] || (p[38] = y("p", { class: "inspector-note" }, "声明仅表示请求授权，不表示 policy allowed、grant 或 Runtime capability。", -1)),
          (D(!0), z(se, null, Ze(c.value, (f) => (D(), z("label", {
            key: f.id,
            class: "permission-option"
          }, [
            y("span", Ju, [
              y("input", {
                type: "checkbox",
                checked: e.manifest.permissions?.includes(f.id),
                onChange: (g) => i(f.id, g.target.checked)
              }, null, 40, Gu),
              y("code", null, R(f.displayName || f.id) + " · " + R(f.id), 1)
            ]),
            y("small", null, R(n(f).description), 1),
            y("span", Xu, [
              y("b", null, R(f.risk), 1),
              y("span", null, R(n(f).consent), 1),
              y("span", null, R(n(f).pilot), 1)
            ]),
            n(f).methods.length ? (D(), z("small", Yu, R(n(f).methods.join(", ")), 1)) : _e("", !0)
          ]))), 128))
        ])) : (D(), z("p", Qu, "Manifest v1 不承载权限。升级到 v2 必须由开发者显式确认权限，Studio 不会从源码自动推断。")),
        p[39] || (p[39] = y("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (D(), z("div", qu, "修复 JSON 错误后才能使用可视化表单。")),
      y("div", ec, R(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
}, sc = { class: "permission-inspector" }, rc = {
  key: 0,
  class: "problems-empty"
}, nc = {
  __name: "PermissionInspector",
  props: {
    manifest: { type: Object, default: null },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null },
    runtimeCompatibility: { type: Object, default: null },
    decisions: { type: Array, default: () => [] }
  },
  setup(e) {
    const t = e, r = Le(() => {
      const a = new Set(t.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
      return (t.permissionRegistry?.permissions || []).filter((l) => l.sourceDeclarable === !0 && a.has(l.id)).map((l) => {
        const u = (t.brokerMethods?.methods || []).filter((n) => n.requiredPermission === l.id), s = [...t.decisions].reverse().find((n) => n.permission === l.id), o = u[0]?.requiredRuntimeCapability, c = (t.runtimeCompatibility?.hostRuntimes || []).filter((n) => n.capabilities?.[o]).map((n) => `${n.id}: ${n.capabilities[o].status}`);
        return {
          ...l,
          methods: u,
          latest: s,
          declared: Array.isArray(t.manifest?.permissions) && t.manifest.permissions.includes(l.id),
          consent: u[0]?.consent || l.prompt || "unspecified",
          capability: s?.capabilityState || (c.length ? c.join(" · ") : "unspecified")
        };
      });
    });
    return (a, l) => (D(), z("div", sc, [
      l[9] || (l[9] = y("p", { class: "inspector-note" }, "Declaration、review policy、Host grant 与 Runtime capability 是独立事实。", -1)),
      (D(!0), z(se, null, Ze(r.value, (u) => (D(), z("article", {
        key: u.id,
        class: "permission-card"
      }, [
        y("h3", null, R(u.displayName || u.id), 1),
        y("code", null, R(u.id), 1),
        y("p", null, R(u.description), 1),
        y("dl", null, [
          y("div", null, [
            l[0] || (l[0] = y("dt", null, "Risk", -1)),
            y("dd", null, R(u.risk), 1)
          ]),
          y("div", null, [
            l[1] || (l[1] = y("dt", null, "Consent", -1)),
            y("dd", null, R(u.consent), 1)
          ]),
          y("div", null, [
            l[2] || (l[2] = y("dt", null, "Declared", -1)),
            y("dd", null, R(u.declared ? "yes" : "no"), 1)
          ]),
          y("div", null, [
            l[3] || (l[3] = y("dt", null, "Policy", -1)),
            y("dd", null, R(u.latest?.policyDecision || "not-evaluated"), 1)
          ]),
          y("div", null, [
            l[4] || (l[4] = y("dt", null, "Grant", -1)),
            y("dd", null, R(u.latest?.grantState || "not-evaluated"), 1)
          ]),
          y("div", null, [
            l[5] || (l[5] = y("dt", null, "Runtime capability", -1)),
            y("dd", null, R(u.capability), 1)
          ]),
          y("div", null, [
            l[6] || (l[6] = y("dt", null, "Effective", -1)),
            y("dd", null, R(u.latest ? u.latest.finalDecision : "not-evaluated"), 1)
          ]),
          y("div", null, [
            l[7] || (l[7] = y("dt", null, "Policy version", -1)),
            y("dd", null, R(u.latest?.policyVersion || "—"), 1)
          ])
        ]),
        l[8] || (l[8] = y("h4", null, "Broker methods", -1)),
        (D(!0), z(se, null, Ze(u.methods, (s) => (D(), z("code", {
          key: s.id,
          class: "permission-method"
        }, R(s.id), 1))), 128))
      ]))), 128)),
      r.value.length ? _e("", !0) : (D(), z("div", rc, "当前 registry 没有可声明的 Preview permission。"))
    ]));
  }
};
function ic(e) {
  let t = 0;
  for (let r = 0; r < e.length; r += 1) {
    const a = e.charCodeAt(r);
    if (a >= 55296 && a <= 56319 && r + 1 < e.length) {
      const l = e.charCodeAt(r + 1);
      l >= 56320 && l <= 57343 && (r += 1);
    }
    t += 1;
  }
  return t;
}
const oc = { properties: { type: { enum: ["application", "system"] } } }, hi = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, ac = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, lc = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, uc = { properties: { status: { enum: ["published", "disabled"] } } }, Ce = ic, cc = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), dc = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), Mo = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), pc = new RegExp("^\\.[a-z0-9]+$", "u"), fc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), mc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function mt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = mt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Ce(e) > 240) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (Ce(e) < 1) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (!Mo.test(e)) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [n] : s.push(n), o++;
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [n] : s.push(n), o++;
  }
  if (typeof e == "string" && !mc.test(e)) {
    const n = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [n] : s.push(n), o++;
  }
  return mt.errors = s, o === 0;
}
mt.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const hc = new RegExp("^[a-f0-9]{64}$", "u"), yc = new RegExp("^/api/function-package\\.asp\\?", "u");
function Xt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Xt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.size === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sha256 === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.entry === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.downloadUrl === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const n = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.size !== void 0) {
      let n = e.size;
      if (!(typeof n == "number" && !(n % 1) && !isNaN(n))) {
        const i = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        s === null ? s = [i] : s.push(i), o++;
      }
      if (typeof n == "number" && (n < 0 || isNaN(n))) {
        const i = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.sha256 !== void 0) {
      let n = e.sha256;
      if (typeof n == "string") {
        if (!hc.test(n)) {
          const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (mt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? mt.errors : s.concat(mt.errors), o = s.length)), e.downloadUrl !== void 0) {
      let n = e.downloadUrl;
      if (typeof n == "string") {
        if (!yc.test(n)) {
          const i = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return Xt.errors = s, o === 0;
}
Xt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Yt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Yt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.id === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.name === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.icon === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.entry === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.install === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.placement === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.window === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.id !== void 0) {
      let n = e.id;
      if (typeof n == "string") {
        if (Ce(n) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!cc.test(n)) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.legacyIds !== void 0) {
      let n = e.legacyIds;
      if (Array.isArray(n)) {
        const i = n.length;
        for (let p = 0; p < i; p++) {
          let f = n[p];
          if (typeof f == "string") {
            if (Ce(f) < 1) {
              const g = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [g] : s.push(g), o++;
            }
          } else {
            const g = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [g] : s.push(g), o++;
          }
        }
        let d = n.length, h;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let f = n[d];
            if (typeof f == "string") {
              if (typeof p[f] == "number") {
                h = p[f];
                const g = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: h }, message: "must NOT have duplicate items (items ## " + h + " and " + d + " are identical)" };
                s === null ? s = [g] : s.push(g), o++;
                break;
              }
              p[f] = d;
            }
          }
        }
      } else {
        const i = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.type !== void 0) {
      let n = e.type;
      if (!(n === "application" || n === "system")) {
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: oc.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let n = e.name;
      if (typeof n == "string") {
        if (Ce(n) < 1) {
          const i = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const n = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const n = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version !== void 0) {
      let n = e.version;
      if (typeof n == "string") {
        if (Ce(n) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!dc.test(n)) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.icon !== void 0) {
      let n = e.icon;
      if (typeof n == "string") {
        if (Ce(n) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (Ce(n) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Mo.test(n)) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (mt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? mt.errors : s.concat(mt.errors), o = s.length)), e.install !== void 0) {
      let n = e.install;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.defaultState === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.source === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.uninstallable === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.defaultState !== void 0) {
          let i = n.defaultState;
          if (!(i === "available" || i === "installed")) {
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: hi.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.source !== void 0) {
          let i = n.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: hi.properties.source.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.uninstallable !== void 0 && typeof n.uninstallable != "boolean") {
          const i = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.placement !== void 0) {
      let n = e.placement;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.desktop === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.startMenu === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.allFunctions === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.taskbar === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.desktop !== void 0 && typeof n.desktop != "boolean") {
          const i = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.startMenu !== void 0 && typeof n.startMenu != "boolean") {
          const i = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.startMenuGroup !== void 0) {
          let i = n.startMenuGroup;
          if (!(i === "user" || i === "system")) {
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: ac.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.startMenuOrder !== void 0) {
          let i = n.startMenuOrder;
          if (!(typeof i == "number" && !(i % 1) && !isNaN(i))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            s === null ? s = [d] : s.push(d), o++;
          }
          if (typeof i == "number" && (i < 0 || isNaN(i))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.allFunctions !== void 0 && typeof n.allFunctions != "boolean") {
          const i = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.taskbar !== void 0 && typeof n.taskbar != "boolean") {
          const i = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.window !== void 0) {
      let n = e.window;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.mode === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.singleton === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.width === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.height === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.mode !== void 0) {
          let i = n.mode;
          if (!(i === "iframe" || i === "native" || i === "shell")) {
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: lc.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.singleton !== void 0 && typeof n.singleton != "boolean") {
          const i = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.width !== void 0) {
          let i = n.width;
          if (typeof i == "string") {
            if (Ce(i) < 1) {
              const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.height !== void 0) {
          let i = n.height;
          if (typeof i == "string") {
            if (Ce(i) < 1) {
              const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.className !== void 0 && typeof n.className != "string") {
          const i = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let n = e.fileHandlers;
      if (Array.isArray(n)) {
        const i = n.length;
        for (let d = 0; d < i; d++) {
          let h = n[d];
          if (h && typeof h == "object" && !Array.isArray(h)) {
            if (h.action === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              s === null ? s = [p] : s.push(p), o++;
            }
            if (h.adapter === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              s === null ? s = [p] : s.push(p), o++;
            }
            if (h.action !== void 0) {
              let p = h.action;
              if (typeof p == "string") {
                if (Ce(p) < 1) {
                  const f = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [f] : s.push(f), o++;
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (h.adapter !== void 0) {
              let p = h.adapter;
              if (typeof p == "string") {
                if (Ce(p) < 1) {
                  const f = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [f] : s.push(f), o++;
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (h.extensions !== void 0) {
              let p = h.extensions;
              if (Array.isArray(p)) {
                const f = p.length;
                for (let $ = 0; $ < f; $++) {
                  let O = p[$];
                  if (typeof O == "string") {
                    if (!pc.test(O)) {
                      const C = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [C] : s.push(C), o++;
                    }
                  } else {
                    const C = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [C] : s.push(C), o++;
                  }
                }
                let g = p.length, k;
                if (g > 1) {
                  const $ = {};
                  for (; g--; ) {
                    let O = p[g];
                    if (typeof O == "string") {
                      if (typeof $[O] == "number") {
                        k = $[O];
                        const C = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: g, j: k }, message: "must NOT have duplicate items (items ## " + k + " and " + g + " are identical)" };
                        s === null ? s = [C] : s.push(C), o++;
                        break;
                      }
                      $[O] = g;
                    }
                  }
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (h.mimeTypes !== void 0) {
              let p = h.mimeTypes;
              if (Array.isArray(p)) {
                const f = p.length;
                for (let $ = 0; $ < f; $++) {
                  let O = p[$];
                  if (typeof O == "string") {
                    if (!fc.test(O)) {
                      const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [C] : s.push(C), o++;
                    }
                  } else {
                    const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [C] : s.push(C), o++;
                  }
                }
                let g = p.length, k;
                if (g > 1) {
                  const $ = {};
                  for (; g--; ) {
                    let O = p[g];
                    if (typeof O == "string") {
                      if (typeof $[O] == "number") {
                        k = $[O];
                        const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: g, j: k }, message: "must NOT have duplicate items (items ## " + k + " and " + g + " are identical)" };
                        s === null ? s = [C] : s.push(C), o++;
                        break;
                      }
                      $[O] = g;
                    }
                  }
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (h.priority !== void 0 && typeof h.priority != "number") {
              const p = { instancePath: t + "/fileHandlers/" + d + "/priority", schemaPath: "#/$defs/fileHandler/properties/priority/type", keyword: "type", params: { type: "number" }, message: "must be number" };
              s === null ? s = [p] : s.push(p), o++;
            }
          } else {
            const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            s === null ? s = [p] : s.push(p), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/fileHandlers", schemaPath: "#/properties/fileHandlers/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.launch !== void 0) {
      let n = e.launch;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.adapter !== void 0) {
          let i = n.adapter;
          if (typeof i == "string") {
            if (Ce(i) < 1) {
              const d = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/launch", schemaPath: "#/$defs/launch/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.catalog !== void 0) {
      let n = e.catalog;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.status !== void 0) {
          let i = n.status;
          if (!(i === "published" || i === "disabled")) {
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: uc.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (Xt(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? Xt.errors : s.concat(Xt.errors), o = s.length)), e.runtime !== void 0) {
      let n = e.runtime;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.model === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.network === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.sameOrigin === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.model !== void 0 && n.model !== "browser-zip-sandbox-v1") {
          const i = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.network !== void 0 && n.network !== "none") {
          const i = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.sameOrigin !== void 0 && n.sameOrigin !== !1) {
          const i = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return Yt.errors = s, o === 0;
}
Yt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ms(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Ms.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Yt(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? Yt.errors : s.concat(Yt.errors), o = s.length), Ms.errors = s, o === 0;
}
Ms.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function gc(e) {
  let t = 0;
  for (let r = 0; r < e.length; r += 1) {
    const a = e.charCodeAt(r);
    if (a >= 55296 && a <= 56319 && r + 1 < e.length) {
      const l = e.charCodeAt(r + 1);
      l >= 56320 && l <= 57343 && (r += 1);
    }
    t += 1;
  }
  return t;
}
function wc(e, t) {
  return e === t;
}
const vc = { properties: { type: { enum: ["application", "system"] } } }, yi = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, bc = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, Pc = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, kc = { properties: { status: { enum: ["published", "disabled"] } } }, $c = { enum: ["device.battery-status.read"] }, Ic = wc;
function Qt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Qt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Array.isArray(e)) {
    const n = e.length;
    for (let h = 0; h < n; h++) {
      let p = e[h];
      if (typeof p != "string") {
        const f = { instancePath: t + "/" + h, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [f] : s.push(f), o++;
      }
      if (p !== "device.battery-status.read") {
        const f = { instancePath: t + "/" + h, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/enum", keyword: "enum", params: { allowedValues: $c.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [f] : s.push(f), o++;
      }
    }
    let i = e.length, d;
    if (i > 1) {
      e: for (; i--; )
        for (d = i; d--; )
          if (Ic(e[i], e[d])) {
            const h = { instancePath: t, schemaPath: "#/uniqueItems", keyword: "uniqueItems", params: { i, j: d }, message: "must NOT have duplicate items (items ## " + d + " and " + i + " are identical)" };
            s === null ? s = [h] : s.push(h), o++;
            break e;
          }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "array" }, message: "must be array" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return Qt.errors = s, o === 0;
}
Qt.evaluated = { items: !0, dynamicProps: !1, dynamicItems: !1 };
const Ne = gc, Co = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), qc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function ht(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ht.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Ne(e) > 240) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (Ne(e) < 1) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (!Co.test(e)) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [n] : s.push(n), o++;
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [n] : s.push(n), o++;
  }
  if (typeof e == "string" && !qc.test(e)) {
    const n = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [n] : s.push(n), o++;
  }
  return ht.errors = s, o === 0;
}
ht.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const Sc = new RegExp("^[a-f0-9]{64}$", "u"), xc = new RegExp("^/api/function-package\\.asp\\?", "u");
function es(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = es.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.size === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sha256 === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.entry === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.downloadUrl === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const n = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.size !== void 0) {
      let n = e.size;
      if (!(typeof n == "number" && !(n % 1) && !isNaN(n))) {
        const i = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        s === null ? s = [i] : s.push(i), o++;
      }
      if (typeof n == "number" && (n < 0 || isNaN(n))) {
        const i = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.sha256 !== void 0) {
      let n = e.sha256;
      if (typeof n == "string") {
        if (!Sc.test(n)) {
          const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (ht(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? ht.errors : s.concat(ht.errors), o = s.length)), e.downloadUrl !== void 0) {
      let n = e.downloadUrl;
      if (typeof n == "string") {
        if (!xc.test(n)) {
          const i = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return es.errors = s, o === 0;
}
es.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const _c = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), Ac = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), jc = new RegExp("^\\.[a-z0-9]+$", "u"), Ec = new RegExp("^[^/\\s]+/[^/\\s]+$", "u");
function ts(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ts.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.manifestVersion === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "manifestVersion" }, message: "must have required property 'manifestVersion'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sdk === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sdk" }, message: "must have required property 'sdk'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.permissions === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "permissions" }, message: "must have required property 'permissions'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.id === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.name === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.icon === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.entry === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.install === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.placement === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.window === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.manifestVersion !== void 0 && e.manifestVersion !== 2) {
      const n = { instancePath: t + "/manifestVersion", schemaPath: "#/properties/manifestVersion/const", keyword: "const", params: { allowedValue: 2 }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sdk !== void 0) {
      let n = e.sdk;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.apiVersion === void 0) {
          const i = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/required", keyword: "required", params: { missingProperty: "apiVersion" }, message: "must have required property 'apiVersion'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        for (const i in n)
          if (i !== "apiVersion") {
            const d = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: i }, message: "must NOT have additional properties" };
            s === null ? s = [d] : s.push(d), o++;
          }
        if (n.apiVersion !== void 0 && n.apiVersion !== "1") {
          const i = { instancePath: t + "/sdk/apiVersion", schemaPath: "#/$defs/sdk/properties/apiVersion/const", keyword: "const", params: { allowedValue: "1" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.permissions !== void 0 && (Qt(e.permissions, { instancePath: t + "/permissions", parentData: e, parentDataProperty: "permissions", rootData: l, dynamicAnchors: u }) || (s = s === null ? Qt.errors : s.concat(Qt.errors), o = s.length)), e.id !== void 0) {
      let n = e.id;
      if (typeof n == "string") {
        if (Ne(n) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!_c.test(n)) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.legacyIds !== void 0) {
      let n = e.legacyIds;
      if (Array.isArray(n)) {
        const i = n.length;
        for (let p = 0; p < i; p++) {
          let f = n[p];
          if (typeof f == "string") {
            if (Ne(f) < 1) {
              const g = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [g] : s.push(g), o++;
            }
          } else {
            const g = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [g] : s.push(g), o++;
          }
        }
        let d = n.length, h;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let f = n[d];
            if (typeof f == "string") {
              if (typeof p[f] == "number") {
                h = p[f];
                const g = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: h }, message: "must NOT have duplicate items (items ## " + h + " and " + d + " are identical)" };
                s === null ? s = [g] : s.push(g), o++;
                break;
              }
              p[f] = d;
            }
          }
        }
      } else {
        const i = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.type !== void 0) {
      let n = e.type;
      if (!(n === "application" || n === "system")) {
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: vc.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let n = e.name;
      if (typeof n == "string") {
        if (Ne(n) < 1) {
          const i = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const n = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const n = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version !== void 0) {
      let n = e.version;
      if (typeof n == "string") {
        if (Ne(n) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ac.test(n)) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.icon !== void 0) {
      let n = e.icon;
      if (typeof n == "string") {
        if (Ne(n) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (Ne(n) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Co.test(n)) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (ht(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? ht.errors : s.concat(ht.errors), o = s.length)), e.install !== void 0) {
      let n = e.install;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.defaultState === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.source === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.uninstallable === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.defaultState !== void 0) {
          let i = n.defaultState;
          if (!(i === "available" || i === "installed")) {
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: yi.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.source !== void 0) {
          let i = n.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: yi.properties.source.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.uninstallable !== void 0 && typeof n.uninstallable != "boolean") {
          const i = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.placement !== void 0) {
      let n = e.placement;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.desktop === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.startMenu === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.allFunctions === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.taskbar === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.desktop !== void 0 && typeof n.desktop != "boolean") {
          const i = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.startMenu !== void 0 && typeof n.startMenu != "boolean") {
          const i = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.startMenuGroup !== void 0) {
          let i = n.startMenuGroup;
          if (!(i === "user" || i === "system")) {
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: bc.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.startMenuOrder !== void 0) {
          let i = n.startMenuOrder;
          if (!(typeof i == "number" && !(i % 1) && !isNaN(i))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            s === null ? s = [d] : s.push(d), o++;
          }
          if (typeof i == "number" && (i < 0 || isNaN(i))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.allFunctions !== void 0 && typeof n.allFunctions != "boolean") {
          const i = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.taskbar !== void 0 && typeof n.taskbar != "boolean") {
          const i = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.window !== void 0) {
      let n = e.window;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.mode === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.singleton === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.width === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.height === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.mode !== void 0) {
          let i = n.mode;
          if (!(i === "iframe" || i === "native" || i === "shell")) {
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: Pc.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.singleton !== void 0 && typeof n.singleton != "boolean") {
          const i = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.width !== void 0) {
          let i = n.width;
          if (typeof i == "string") {
            if (Ne(i) < 1) {
              const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.height !== void 0) {
          let i = n.height;
          if (typeof i == "string") {
            if (Ne(i) < 1) {
              const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.className !== void 0 && typeof n.className != "string") {
          const i = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let n = e.fileHandlers;
      if (Array.isArray(n)) {
        const i = n.length;
        for (let d = 0; d < i; d++) {
          let h = n[d];
          if (h && typeof h == "object" && !Array.isArray(h)) {
            if (h.action === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              s === null ? s = [p] : s.push(p), o++;
            }
            if (h.adapter === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              s === null ? s = [p] : s.push(p), o++;
            }
            if (h.action !== void 0) {
              let p = h.action;
              if (typeof p == "string") {
                if (Ne(p) < 1) {
                  const f = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [f] : s.push(f), o++;
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (h.adapter !== void 0) {
              let p = h.adapter;
              if (typeof p == "string") {
                if (Ne(p) < 1) {
                  const f = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [f] : s.push(f), o++;
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (h.extensions !== void 0) {
              let p = h.extensions;
              if (Array.isArray(p)) {
                const f = p.length;
                for (let $ = 0; $ < f; $++) {
                  let O = p[$];
                  if (typeof O == "string") {
                    if (!jc.test(O)) {
                      const C = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [C] : s.push(C), o++;
                    }
                  } else {
                    const C = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [C] : s.push(C), o++;
                  }
                }
                let g = p.length, k;
                if (g > 1) {
                  const $ = {};
                  for (; g--; ) {
                    let O = p[g];
                    if (typeof O == "string") {
                      if (typeof $[O] == "number") {
                        k = $[O];
                        const C = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: g, j: k }, message: "must NOT have duplicate items (items ## " + k + " and " + g + " are identical)" };
                        s === null ? s = [C] : s.push(C), o++;
                        break;
                      }
                      $[O] = g;
                    }
                  }
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (h.mimeTypes !== void 0) {
              let p = h.mimeTypes;
              if (Array.isArray(p)) {
                const f = p.length;
                for (let $ = 0; $ < f; $++) {
                  let O = p[$];
                  if (typeof O == "string") {
                    if (!Ec.test(O)) {
                      const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [C] : s.push(C), o++;
                    }
                  } else {
                    const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [C] : s.push(C), o++;
                  }
                }
                let g = p.length, k;
                if (g > 1) {
                  const $ = {};
                  for (; g--; ) {
                    let O = p[g];
                    if (typeof O == "string") {
                      if (typeof $[O] == "number") {
                        k = $[O];
                        const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: g, j: k }, message: "must NOT have duplicate items (items ## " + k + " and " + g + " are identical)" };
                        s === null ? s = [C] : s.push(C), o++;
                        break;
                      }
                      $[O] = g;
                    }
                  }
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (h.priority !== void 0 && typeof h.priority != "number") {
              const p = { instancePath: t + "/fileHandlers/" + d + "/priority", schemaPath: "#/$defs/fileHandler/properties/priority/type", keyword: "type", params: { type: "number" }, message: "must be number" };
              s === null ? s = [p] : s.push(p), o++;
            }
          } else {
            const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            s === null ? s = [p] : s.push(p), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/fileHandlers", schemaPath: "#/properties/fileHandlers/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.launch !== void 0) {
      let n = e.launch;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.adapter !== void 0) {
          let i = n.adapter;
          if (typeof i == "string") {
            if (Ne(i) < 1) {
              const d = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/launch", schemaPath: "#/$defs/launch/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.catalog !== void 0) {
      let n = e.catalog;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.status !== void 0) {
          let i = n.status;
          if (!(i === "published" || i === "disabled")) {
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: kc.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (es(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? es.errors : s.concat(es.errors), o = s.length)), e.runtime !== void 0) {
      let n = e.runtime;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.model === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.network === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.sameOrigin === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.model !== void 0 && n.model !== "browser-zip-sandbox-v1") {
          const i = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.network !== void 0 && n.network !== "none") {
          const i = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.sameOrigin !== void 0 && n.sameOrigin !== !1) {
          const i = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return ts.errors = s, o === 0;
}
ts.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Cs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Cs.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), ts(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ts.errors : s.concat(ts.errors), o = s.length), Cs.errors = s, o === 0;
}
Cs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let Zr;
async function Oc() {
  return Zr || (Zr = Tc()), Zr;
}
async function Tc() {
  const e = await Promise.all([
    fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v2.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/permissions-v1.json", { credentials: "same-origin" })
  ]);
  if (e.some((l) => !l.ok)) throw new Error("无法载入 Manifest 平台契约。");
  const [t, r, a] = await Promise.all(e.map((l) => l.json()));
  return {
    schemas: { 1: t, 2: r },
    validators: { 1: Ms, 2: Cs },
    permissionRegistry: a,
    permissionIds: new Set(a.permissions.map((l) => l.id)),
    sourceDeclarableIds: new Set(a.sourceDeclaration?.declarablePermissionIds || [])
  };
}
async function Mc(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch (n) {
    return {
      manifest: null,
      diagnostics: [{
        severity: "error",
        path: "$",
        message: n.message,
        ...Dc(e, n.message)
      }]
    };
  }
  const r = At(t);
  if (r == null)
    return {
      manifest: t,
      manifestVersion: null,
      diagnostics: [{
        ruleId: "WWM005",
        severity: "error",
        path: "$.manifestVersion",
        message: "不支持的 Manifest 版本；v1 必须省略 manifestVersion，v2 必须显式使用数字 2。"
      }]
    };
  const a = await Oc(), l = a.schemas[r], u = a.validators[r];
  u(t);
  const s = (u.errors || []).filter((n) => !Lc(r, n)).map((n) => ({
    ruleId: "WWM002",
    severity: "error",
    path: Rc(n.instancePath || n.params?.missingProperty || ""),
    message: n.message || n.keyword
  }));
  Cc(t, r, a.permissionIds, a.sourceDeclarableIds, s), r === 2 && t.sdk?.apiVersion !== void 0 && t.sdk.apiVersion !== "1" && s.push({
    ruleId: "WWM009",
    severity: "error",
    path: "$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。"
  });
  const o = l.$defs?.sourceManifest?.properties || {};
  return Object.entries(o).filter(([, n]) => n.readOnly === !0 || n.description?.includes("Reserved") || n.description?.includes("Platform-reserved")).map(([n]) => n).forEach((n) => {
    Object.prototype.hasOwnProperty.call(t, n) && s.push({
      ruleId: n === "launch" ? "WWM004" : "WWM003",
      severity: "warning",
      path: `$.${n}`,
      message: `${n} 是平台保留或发布阶段只读字段，不应由 Source Manifest 编辑。`
    });
  }), { manifest: t, manifestVersion: r, diagnostics: s };
}
function Cc(e, t, r, a, l) {
  if (t === 1) {
    Object.prototype.hasOwnProperty.call(e, "permissions") && l.push({
      ruleId: "WWM008",
      severity: "error",
      path: "$.permissions",
      message: "Manifest v1 不承载权限声明；请显式迁移到 Manifest v2。"
    });
    return;
  }
  if (!Array.isArray(e.permissions)) return;
  const u = /* @__PURE__ */ new Set();
  e.permissions.forEach((s, o) => {
    if (typeof s != "string") return;
    const c = `$.permissions[${o}]`;
    u.has(s) && l.push({ ruleId: "WWM007", severity: "error", path: c, message: `重复权限：${s}` }), u.add(s), Nc(s) ? l.push({ ruleId: "WWM008", severity: "error", path: c, message: `禁止声明超级或私有权限：${s}` }) : r.has(s) ? a.has(s) || l.push({ ruleId: "WWM008", severity: "error", path: c, message: `权限尚未开放 Source Manifest 声明：${s}` }) : l.push({ ruleId: "WWM006", severity: "error", path: c, message: `未知权限：${s}` });
  });
}
function Nc(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function Lc(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function Rc(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const r = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(r) ? `[${r}]` : `.${r}`;
  }).join("")}` : `$.${e}` : "$";
}
function Dc(e, t) {
  const r = /position\s+(\d+)/i.exec(t);
  if (!r) return { line: 1, column: 1 };
  const a = Math.min(Number(r[1]), e.length), l = e.slice(0, a).split(`
`);
  return { line: l.length, column: l.at(-1).length + 1 };
}
const zc = {
  id: "com.example.hello",
  legacyIds: [],
  type: "application",
  name: "Hello WebWindows",
  description: "WebWindows 最小功能项目。",
  category: "tools",
  version: "1.0.0",
  icon: "assets/icon.svg",
  entry: "index.html",
  install: {
    defaultState: "available",
    source: "repository",
    uninstallable: !0
  },
  placement: {
    desktop: !1,
    startMenu: !0,
    startMenuGroup: "user",
    startMenuOrder: 100,
    allFunctions: !0,
    taskbar: !1
  },
  window: {
    mode: "iframe",
    singleton: !0,
    width: "760px",
    height: "520px"
  }
};
function Wc() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(zc, null, 2)}
` },
      {
        path: "index.html",
        kind: "file",
        content: `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello WebWindows</title>
  <link rel="stylesheet" href="styles/app.css">
</head>
<body>
  <main class="app-shell">
    <img src="assets/icon.svg" alt="" width="72" height="72">
    <h1>Hello WebWindows</h1>
    <p id="status">功能项目已经准备好。</p>
    <button id="hello" type="button">开始</button>
  </main>
  <script src="scripts/app.js"><\/script>
</body>
</html>
`
      },
      { path: "styles", kind: "directory" },
      {
        path: "styles/app.css",
        kind: "file",
        content: `:root {
  color-scheme: light dark;
  font-family: system-ui, sans-serif;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f4f7fb;
  color: #172033;
}

.app-shell {
  width: min(420px, calc(100% - 48px));
  padding: 32px;
  border: 1px solid #d8e0ed;
  border-radius: 18px;
  background: white;
  text-align: center;
  box-shadow: 0 18px 50px rgba(28, 45, 78, 0.12);
}

button {
  border: 0;
  border-radius: 9px;
  padding: 10px 18px;
  background: #1769e0;
  color: white;
  cursor: pointer;
}
`
      },
      { path: "scripts", kind: "directory" },
      {
        path: "scripts/app.js",
        kind: "file",
        content: `const button = document.getElementById("hello");
const status = document.getElementById("status");

button.addEventListener("click", () => {
  status.textContent = "Hello from WebWindows.";
});
`
      },
      { path: "assets", kind: "directory" },
      {
        path: "assets/icon.svg",
        kind: "file",
        content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#1769e0"/>
  <path d="M31 38h28v28H31zm38 0h28v28H69zM31 76h28v28H31zm38 0h28v28H69z" fill="#fff"/>
</svg>
`
      }
    ],
    editorState: {
      openFiles: ["index.html", "manifest.json"],
      activeFile: "index.html",
      recentFiles: ["index.html", "manifest.json"]
    }
  };
}
const gi = 240;
function ue(e, t = {}) {
  const r = String(e ?? "");
  if (r.includes("\0")) throw Lt("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(r)) throw Lt("项目路径不能使用盘符。", e);
  const a = r.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!a) {
    if (t.allowRoot === !0) return "";
    throw Lt("项目路径不能为空。", e);
  }
  if (a.startsWith("/")) throw Lt("项目路径必须是相对路径。", e);
  if (a.length > gi)
    throw Lt(`项目路径不能超过 ${gi} 个字符。`, e);
  const l = a.split("/");
  if (l.some((u) => !u || u === "." || u === ".."))
    throw Lt("项目路径包含不安全的路径段。", e);
  return l.join("/");
}
function Ns(e) {
  const t = ue(e), r = t.lastIndexOf("/");
  return r < 0 ? "" : t.slice(0, r);
}
function an(e) {
  const t = ue(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function Fc(e, t) {
  const r = ue(e, { allowRoot: !0 }), a = String(t ?? "");
  if (!a || a.includes("/") || a.includes("\\"))
    throw Lt("文件或目录名称必须是单个安全路径段。", t);
  return ue(r ? `${r}/${a}` : a);
}
function Lt(e, t) {
  const r = new TypeError(e);
  return r.code = "invalid-project-path", r.value = t, r;
}
const Vc = "webwindows-developer-studio-v1", wi = 1, Hc = 1, ie = "projects", le = "files", Ct = "projectId", Bc = Object.freeze({
  open: "打开",
  "open-blocked": "升级",
  "create-project": "写入",
  reset: "重建",
  "reset-blocked": "重建"
});
class Uc extends Error {
  constructor(t, r, a) {
    const l = String(r?.name || "StorageError"), u = String(r?.message || a || "未知错误"), s = Bc[t] || "访问";
    super(a || `Developer Studio 项目存储${s}失败（${l}: ${u}）。`), this.name = "StudioStorageError", this.code = "studio-storage-failure", this.stage = t, this.causeName = l, this.causeMessage = u, this.recoverable = t !== "open-blocked" && t !== "reset-blocked", this.cause = r;
  }
}
function Tn(e) {
  return e?.code === "studio-storage-failure";
}
class Zc {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || Vc, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, !this.indexedDB) throw new Error("IndexedDB is required by Developer Studio.");
  }
  async listProjects() {
    const t = await this.open();
    return (await Oe(
      t.transaction(ie, "readonly").objectStore(ie).getAll()
    )).sort((a, l) => String(l.updatedAt).localeCompare(String(a.updatedAt))).map(ut);
  }
  async createProject(t = {}) {
    return this.runStorageOperation("create-project", () => this.createProjectAttempt(t), { retry: !0 });
  }
  async createProjectAttempt(t = {}) {
    const r = Jc(this.crypto), a = this.now(), l = {
      uuid: r,
      displayName: bi(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: Hc,
      storageVersion: wi,
      createdAt: a,
      updatedAt: a,
      editorState: yr(t.editorState)
    }, u = Kc(t.files || [], r, a), o = (await this.open()).transaction([ie, le], "readwrite");
    o.objectStore(ie).add(l);
    const c = o.objectStore(le);
    return u.forEach((n) => c.add(n)), await $t(o), ut(l);
  }
  async getProject(t) {
    const r = await this.open(), a = await Oe(
      r.transaction(ie, "readonly").objectStore(ie).get(t)
    );
    if (!a) throw ye("project-not-found", "找不到项目。");
    return ut(a);
  }
  async renameProject(t, r) {
    return this.updateProject(t, (a) => {
      a.displayName = bi(r);
    });
  }
  async saveEditorState(t, r) {
    return this.updateProject(t, (a) => {
      a.editorState = yr(r);
    });
  }
  async deleteProject(t) {
    const a = (await this.open()).transaction([ie, le], "readwrite"), l = a.objectStore(ie);
    if (!await Oe(l.get(t))) throw ye("project-not-found", "找不到项目。");
    const s = a.objectStore(le);
    (await Oe(s.index(Ct).getAll(t))).forEach((c) => s.delete([t, c.path])), l.delete(t), await $t(a);
  }
  async listEntries(t) {
    await this.getProject(t);
    const r = await this.open();
    return (await Oe(
      r.transaction(le, "readonly").objectStore(le).index(Ct).getAll(t)
    )).sort(Pi).map(ut);
  }
  async readProjectState(t) {
    const a = (await this.open()).transaction([ie, le], "readonly"), l = await Oe(a.objectStore(ie).get(t));
    if (!l) throw ye("project-not-found", "找不到项目。");
    const u = await Oe(
      a.objectStore(le).index(Ct).getAll(t)
    );
    return await $t(a), {
      project: ut(l),
      entries: u.sort(Pi).map(ut)
    };
  }
  async readTextFile(t, r) {
    const a = await this.getEntry(t, r);
    if (a.kind !== "file") throw ye("not-a-file", "目标不是文本文件。");
    return a.content;
  }
  async writeTextFile(t, r, a) {
    const l = ue(r), s = (await this.open()).transaction([ie, le], "readwrite"), o = await Xs(s, t), c = s.objectStore(le), n = await Oe(c.get([t, l]));
    if (!n) throw ye("file-not-found", "找不到文件。");
    if (n.kind !== "file") throw ye("not-a-file", "目标不是文本文件。");
    const i = this.now();
    c.put({ ...n, content: String(a), updatedAt: i }), o.updatedAt = i, s.objectStore(ie).put(o), await $t(s);
  }
  async createFile(t, r, a = "") {
    return this.createEntry(t, r, "file", String(a));
  }
  async createDirectory(t, r) {
    return this.createEntry(t, r, "directory", void 0);
  }
  async renameEntry(t, r, a) {
    const l = ue(r), u = ue(a);
    if (l === u) return this.getEntry(t, l);
    if (u.startsWith(`${l}/`))
      throw ye("invalid-project-path", "目录不能移动到自身内部。");
    const o = (await this.open()).transaction([ie, le], "readwrite"), c = await Xs(o, t), n = o.objectStore(le), i = await Oe(n.index(Ct).getAll(t)), d = i.filter((g) => g.path === l || g.path.startsWith(`${l}/`));
    if (!d.length) throw ye("entry-not-found", "找不到文件或目录。");
    await vi(i, u);
    const h = new Set(d.map((g) => g.path)), p = new Set(d.map((g) => g.path === l ? u : `${u}${g.path.slice(l.length)}`));
    if (i.some((g) => !h.has(g.path) && p.has(g.path)))
      throw ye("entry-exists", "目标路径已经存在。");
    const f = this.now();
    return d.forEach((g) => {
      const k = g.path === l ? u : `${u}${g.path.slice(l.length)}`;
      n.delete([t, g.path]), n.add({ ...g, path: k, updatedAt: f });
    }), c.editorState = Gc(c.editorState, l, u), c.updatedAt = f, o.objectStore(ie).put(c), await $t(o), this.getEntry(t, u);
  }
  async deleteEntry(t, r) {
    const a = ue(r), u = (await this.open()).transaction([ie, le], "readwrite"), s = await Xs(u, t), o = u.objectStore(le), n = (await Oe(o.index(Ct).getAll(t))).filter((d) => d.path === a || d.path.startsWith(`${a}/`));
    if (!n.length) throw ye("entry-not-found", "找不到文件或目录。");
    n.forEach((d) => o.delete([t, d.path]));
    const i = this.now();
    s.editorState = Xc(s.editorState, a), s.updatedAt = i, u.objectStore(ie).put(s), await $t(u);
  }
  async getEntry(t, r) {
    const a = ue(r);
    await this.getProject(t);
    const l = await this.open(), u = await Oe(
      l.transaction(le, "readonly").objectStore(le).get([t, a])
    );
    if (!u) throw ye("entry-not-found", "找不到文件或目录。");
    return ut(u);
  }
  async close() {
    if (!this.databasePromise) return;
    (await this.databasePromise).close(), this.databasePromise = null;
  }
  async resetStorage() {
    await this.close(), await new Promise((t, r) => {
      const a = this.indexedDB.deleteDatabase(this.databaseName);
      a.onsuccess = () => t(), a.onerror = () => r(Vt("reset", a.error)), a.onblocked = () => r(Vt(
        "reset-blocked",
        null,
        "Developer Studio 项目存储正在被其他窗口使用。请关闭其他 Developer Studio 窗口后重试。"
      ));
    });
  }
  async open() {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((t, r) => {
      const a = this.indexedDB.open(this.databaseName, wi);
      a.onupgradeneeded = () => {
        const l = a.result;
        l.objectStoreNames.contains(ie) || l.createObjectStore(ie, { keyPath: "uuid" }), l.objectStoreNames.contains(le) || l.createObjectStore(le, { keyPath: ["projectId", "path"] }).createIndex(Ct, "projectId", { unique: !1 });
      }, a.onsuccess = () => t(a.result), a.onerror = () => r(Vt("open", a.error)), a.onblocked = () => r(Vt(
        "open-blocked",
        null,
        "Developer Studio 项目存储升级被其他窗口阻止。请关闭其他 Developer Studio 窗口后重试。"
      ));
    });
    try {
      const t = await this.databasePromise;
      return t.onversionchange = () => t.close(), t;
    } catch (t) {
      throw this.databasePromise = null, t;
    }
  }
  async runStorageOperation(t, r, a = {}) {
    const l = a.retry ? 2 : 1;
    for (let u = 0; u < l; u += 1)
      try {
        return await r();
      } catch (s) {
        if (!Yc(s)) throw s;
        const o = Tn(s) ? s : Vt(t, s);
        if (u + 1 >= l || !Qc(o)) throw o;
        await this.close();
      }
    throw Vt(t, null);
  }
  async updateProject(t, r) {
    const l = (await this.open()).transaction(ie, "readwrite"), u = l.objectStore(ie), s = await Oe(u.get(t));
    if (!s) throw ye("project-not-found", "找不到项目。");
    return r(s), s.updatedAt = this.now(), u.put(s), await $t(l), ut(s);
  }
  async createEntry(t, r, a, l) {
    const u = ue(r), o = (await this.open()).transaction([ie, le], "readwrite"), c = await Xs(o, t), n = o.objectStore(le), i = await Oe(n.index(Ct).getAll(t));
    if (i.some((p) => p.path === u))
      throw ye("entry-exists", "目标路径已经存在。");
    await vi(i, u);
    const d = this.now(), h = {
      projectId: t,
      path: u,
      kind: a,
      ...a === "file" ? { content: String(l ?? "") } : {},
      createdAt: d,
      updatedAt: d
    };
    return n.add(h), c.updatedAt = d, o.objectStore(ie).put(c), await $t(o), ut(h);
  }
}
function Kc(e, t, r) {
  const a = /* @__PURE__ */ new Set(), l = e.map((u) => {
    const s = ue(u.path);
    if (a.has(s)) throw ye("entry-exists", `模板包含重复路径：${s}`);
    a.add(s);
    const o = u.kind === "directory" ? "directory" : "file";
    return {
      projectId: t,
      path: s,
      kind: o,
      ...o === "file" ? { content: String(u.content ?? "") } : {},
      createdAt: r,
      updatedAt: r
    };
  });
  return l.forEach((u) => {
    const s = Ns(u.path);
    if (!s) return;
    const o = l.find((c) => c.path === s);
    if (!o || o.kind !== "directory")
      throw ye("parent-directory-not-found", `模板缺少父目录：${s}`);
  }), l;
}
async function Xs(e, t) {
  const r = await Oe(e.objectStore(ie).get(t));
  if (!r) throw ye("project-not-found", "找不到项目。");
  return r;
}
async function vi(e, t) {
  const r = Ns(t);
  if (!r) return;
  const a = e.find((l) => l.path === r);
  if (!a || a.kind !== "directory")
    throw ye("parent-directory-not-found", "父目录不存在。");
}
function Jc(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const r = [...t].map((a) => a.toString(16).padStart(2, "0"));
  return `${r.slice(0, 4).join("")}-${r.slice(4, 6).join("")}-${r.slice(6, 8).join("")}-${r.slice(8, 10).join("")}-${r.slice(10).join("")}`;
}
function bi(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw ye("invalid-project-name", "项目名称不能为空。");
  return t;
}
function yr(e) {
  const t = e && typeof e == "object" ? e : {}, r = (u) => [...new Set((Array.isArray(u) ? u : []).map((s) => {
    try {
      return ue(s);
    } catch {
      return null;
    }
  }).filter(Boolean))], a = r(t.openFiles), l = t.activeFile ? ue(t.activeFile) : a[0] || null;
  return {
    openFiles: a,
    activeFile: l,
    recentFiles: r(t.recentFiles).slice(0, 20)
  };
}
function Gc(e, t, r) {
  const a = (l) => l === t || l?.startsWith(`${t}/`) ? `${r}${l.slice(t.length)}` : l;
  return yr({
    openFiles: e?.openFiles?.map(a),
    activeFile: a(e?.activeFile),
    recentFiles: e?.recentFiles?.map(a)
  });
}
function Xc(e, t) {
  const r = (l) => l !== t && !l.startsWith(`${t}/`), a = (e?.openFiles || []).filter(r);
  return yr({
    openFiles: a,
    activeFile: e?.activeFile && r(e.activeFile) ? e.activeFile : a[0] || null,
    recentFiles: (e?.recentFiles || []).filter(r)
  });
}
function Pi(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function ut(e) {
  return structuredClone(e);
}
function Oe(e) {
  return new Promise((t, r) => {
    e.onsuccess = () => t(e.result), e.onerror = () => r(e.error || new Error("IndexedDB request failed."));
  });
}
function $t(e) {
  return new Promise((t, r) => {
    let a = null;
    e.oncomplete = () => t(), e.onerror = () => {
      a = e.error || a;
    }, e.onabort = () => r(e.error || a || new DOMException(
      "IndexedDB transaction was aborted.",
      "AbortError"
    ));
  });
}
function Vt(e, t, r) {
  return new Uc(e, t, r);
}
function Yc(e) {
  return Tn(e) ? !0 : ["UnknownError", "InvalidStateError", "AbortError", "QuotaExceededError", "SecurityError"].includes(String(e?.name || "")) || /internal error/i.test(String(e?.message || ""));
}
function Qc(e) {
  return ["UnknownError", "InvalidStateError", "AbortError"].includes(String(e?.causeName || e?.name || "")) || /internal error/i.test(String(e?.causeMessage || e?.message || ""));
}
function ye(e, t) {
  const r = new Error(t);
  return r.code = e, r;
}
function ki(e, t) {
  return Fc(e, t);
}
function ed(e) {
  const t = [], r = /* @__PURE__ */ new Map();
  e.forEach((l) => r.set(l.path, {
    ...l,
    name: an(l.path),
    children: []
  })), r.forEach((l) => {
    const u = Ns(l.path);
    u ? r.get(u)?.children.push(l) : t.push(l);
  });
  const a = (l) => l.sort((u, s) => u.kind !== s.kind ? u.kind === "directory" ? -1 : 1 : u.name.localeCompare(s.name)).forEach((u) => a(u.children));
  return a(t), t;
}
function td(e) {
  const t = String(e).toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";
  return {
    html: "html",
    htm: "html",
    css: "css",
    js: "javascript",
    json: "json",
    svg: "xml",
    md: "markdown",
    txt: "plaintext"
  }[t] || "plaintext";
}
const No = "webwindows-project-snapshot-v1";
async function sd(e, t, r = {}) {
  if (!e || typeof e.readProjectState != "function")
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  const a = await e.readProjectState(t), l = a.entries.filter((n) => n.kind === "file").map((n) => Object.freeze({
    path: ue(n.path),
    content: String(n.content ?? ""),
    byteLength: ss(n.content ?? "").byteLength
  })).sort((n, i) => id(n.path, i.path)), u = /* @__PURE__ */ new Set();
  for (const n of l) {
    if (u.has(n.path)) throw new Error(`Snapshot contains duplicate path: ${n.path}`);
    u.add(n.path);
  }
  const s = l.reduce((n, i) => n + i.byteLength, 0), o = await rd(nd(a.project.uuid, l)), c = {
    contract: No,
    schemaVersion: 1,
    projectUuid: a.project.uuid,
    projectDisplayName: a.project.displayName,
    snapshotId: `wws1-${o}`,
    revisionHash: o,
    createdAt: r.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    manifestPath: "manifest.json",
    fileCount: l.length,
    totalBytes: s,
    files: Object.freeze(l)
  };
  return Object.freeze(c);
}
function gr(e, t) {
  const r = ue(t);
  return e.files.find((a) => a.path === r) || null;
}
async function rd(e) {
  const t = globalThis.crypto;
  if (!t?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const r = await t.subtle.digest("SHA-256", e);
  return [...new Uint8Array(r)].map((a) => a.toString(16).padStart(2, "0")).join("");
}
function nd(e, t) {
  const r = [ss(`${No}\0${e}\0`)];
  for (const s of t) {
    const o = ss(s.path), c = ss(s.content);
    r.push($i(o.byteLength), o, $i(c.byteLength), c);
  }
  const a = r.reduce((s, o) => s + o.byteLength, 0), l = new Uint8Array(a);
  let u = 0;
  for (const s of r)
    l.set(s, u), u += s.byteLength;
  return l;
}
function $i(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e, !1), t;
}
function ss(e) {
  return new TextEncoder().encode(String(e));
}
function id(e, t) {
  const r = ss(e), a = ss(t), l = Math.min(r.length, a.length);
  for (let u = 0; u < l; u += 1)
    if (r[u] !== a[u]) return r[u] - a[u];
  return r.length - a.length;
}
let Kr;
async function vs() {
  return Kr || (Kr = od()), Kr;
}
async function od() {
  const e = await Promise.all([
    Ue("/data/sdk/manifest-v1.schema.json"),
    Ue("/data/sdk/manifest-v2.schema.json"),
    Ue("/data/sdk/permissions-v1.json"),
    Ue("/data/sdk/capability-broker-v1.schema.json"),
    Ue("/data/sdk/capability-broker-methods-v1.json"),
    Ue("/data/sdk/capability-broker-errors-v1.json"),
    Ue("/data/sdk/capability-broker-policy-v1.json"),
    Ue("/data/sdk/permission-decision-v1.json"),
    Ue("/data/sdk/package-runtime-policy-v1.json"),
    Ue("/data/sdk/runtime-compatibility-v1.json"),
    Ue("/data/sdk/studio-validator-rules-v1.json"),
    ad("/data/sdk/webwindows-public-api-v1.d.ts")
  ]);
  return Object.freeze({
    manifestSchema: e[0],
    manifestSchemas: Object.freeze({ 1: e[0], 2: e[1] }),
    permissionRegistry: e[2],
    brokerSchema: e[3],
    brokerMethods: e[4],
    brokerErrors: e[5],
    brokerPolicy: e[6],
    permissionDecision: e[7],
    packagePolicy: e[8],
    runtimeCompatibility: e[9],
    ruleCatalog: e[10],
    publicApiText: e[11]
  });
}
async function Ue(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.json();
}
async function ad(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.text();
}
function ld(e) {
  if (typeof e != "string" || e.charCodeAt(0) === 65279) throw ke("JSON BOM is forbidden");
  let t = 0;
  const r = () => {
    for (; /[\u0009\u000a\u000d\u0020]/.test(e[t] || ""); ) t += 1;
  }, a = () => {
    if (e[t++] !== '"') throw ke("Expected JSON string");
    let u = "";
    for (; t < e.length; ) {
      const s = e[t++];
      if (s === '"')
        return ud(u), u;
      if (s.charCodeAt(0) < 32) throw ke("Control character in JSON string");
      if (s !== "\\") {
        u += s;
        continue;
      }
      const o = e[t++], c = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: `
`, r: "\r", t: "	" };
      if (Object.prototype.hasOwnProperty.call(c, o)) {
        u += c[o];
        continue;
      }
      if (o !== "u") throw ke("Invalid JSON escape");
      const n = e.slice(t, t + 4);
      if (!/^[0-9a-fA-F]{4}$/.test(n)) throw ke("Invalid JSON Unicode escape");
      u += String.fromCharCode(Number.parseInt(n, 16)), t += 4;
    }
    throw ke("Unterminated JSON string");
  }, l = (u = 0) => {
    if (u > 100) throw ke("JSON nesting limit exceeded");
    if (r(), e[t] === "{") {
      t += 1, r();
      const o = /* @__PURE__ */ new Set();
      if (e[t] === "}") {
        t += 1;
        return;
      }
      for (; ; ) {
        const c = a();
        if (o.has(c)) throw ke(`Duplicate JSON property: ${c}`);
        if (o.add(c), r(), e[t++] !== ":") throw ke("Expected JSON colon");
        if (l(u + 1), r(), e[t] === "}") {
          t += 1;
          return;
        }
        if (e[t++] !== ",") throw ke("Expected JSON comma");
        r();
      }
    }
    if (e[t] === "[") {
      if (t += 1, r(), e[t] === "]") {
        t += 1;
        return;
      }
      for (; ; ) {
        if (l(u + 1), r(), e[t] === "]") {
          t += 1;
          return;
        }
        if (e[t++] !== ",") throw ke("Expected JSON comma");
        r();
      }
    }
    if (e[t] === '"') {
      a();
      return;
    }
    for (const o of ["true", "false", "null"]) if (e.startsWith(o, t)) {
      t += o.length;
      return;
    }
    const s = e.slice(t).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!s) throw ke("Invalid JSON value");
    if (!Number.isFinite(Number(s[0]))) throw ke("Non-finite JSON number");
    t += s[0].length;
  };
  if (r(), l(), r(), t !== e.length) throw ke("Trailing JSON data is forbidden");
}
function ud(e) {
  for (let t = 0; t < e.length; t += 1) {
    const r = e.charCodeAt(t);
    if (r >= 55296 && r <= 56319) {
      const a = e.charCodeAt(t + 1);
      if (!(a >= 56320 && a <= 57343)) throw ke("Unpaired JSON surrogate");
      t += 1;
    } else if (r >= 56320 && r <= 57343) throw ke("Unpaired JSON surrogate");
  }
}
function ke(e) {
  const t = new SyntaxError(e);
  return t.code = "ambiguous-json", t;
}
const cd = "webwindows-studio-validation-report-v1";
async function ln(e, t = {}) {
  const r = t.contracts || await vs(), a = kd(r.ruleCatalog), l = [], u = (h, p = {}) => l.push($d(a, h, p));
  dd(r, u), pd(e, r.packagePolicy, u);
  const s = e.files.find((h) => h.path === "manifest.json");
  let o = null;
  if (!s)
    u("WWP001", { path: "manifest.json", message: "ZIP root 必须包含 manifest.json。" });
  else
    try {
      ld(s.content), o = JSON.parse(s.content);
    } catch (h) {
      u("WWM001", {
        path: "manifest.json",
        location: _d(s.content, h.message),
        message: h.message
      });
    }
  o && (fd(o, r, u), gd(e, o, r.packagePolicy, u)), wd(e, o, r, u);
  const c = [...new Map(l.map((h) => [Od(h), h])).values()].sort(Ed), n = c.filter((h) => h.severity === "error").length, i = c.filter((h) => h.severity === "warning").length, d = typeof o?.entry == "string" ? o.entry : null;
  return {
    contract: cd,
    schemaVersion: 1,
    validatorVersion: r.ruleCatalog.validatorVersion,
    snapshotId: e.snapshotId,
    projectUuid: e.projectUuid,
    manifestIdentity: jd(o),
    passed: n === 0,
    errorCount: n,
    warningCount: i,
    diagnostics: c,
    packageFacts: {
      fileCount: e.fileCount,
      unpackedBytes: e.totalBytes,
      entry: d,
      runtimeModel: r.packagePolicy.runtimeModel
    },
    scannerLimitations: [
      "Source diagnostics are conservative static checks, not a complete JavaScript security analysis.",
      "Dynamic URLs and computed property access may require future server/admin review."
    ]
  };
}
function dd(e, t) {
  const r = e.runtimeCompatibility.packageRuntime;
  (r?.status !== "supported" || r?.model !== e.packagePolicy.runtimeModel) && t("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
}
function pd(e, t, r) {
  (!e.files.length || e.fileCount !== e.files.length || e.fileCount > t.limits.maxFiles) && r("WWP003", {
    message: `文件数量必须为 1-${t.limits.maxFiles}，当前为 ${e.fileCount}。`,
    metadata: { limit: t.limits.maxFiles, actual: e.fileCount }
  }), e.totalBytes > t.limits.maxUnpackedBytes && r("WWP004", {
    message: `项目解压后不能超过 ${t.limits.maxUnpackedBytes} bytes。`,
    metadata: { limit: t.limits.maxUnpackedBytes, actual: e.totalBytes }
  });
  const a = new Set(t.allowedExtensions);
  for (const l of e.files) {
    try {
      const s = ue(l.path);
      if (s !== l.path || s.length > t.limits.maxPathCharacters)
        throw new Error("not canonical");
    } catch {
      r("WWP002", { path: l.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const u = Mn(l.path);
    a.has(u) || r("WWP005", {
      path: l.path,
      message: `Package Runtime 不允许文件类型 ${u || "(none)"}。`,
      metadata: { extension: u }
    });
  }
}
function fd(e, t, r) {
  const a = At(e);
  if (a == null) {
    r("WWM005", {
      path: "manifest.json$.manifestVersion",
      message: "不支持的 Manifest 版本；legacy v1 省略 manifestVersion，v2 显式使用数字 2。"
    });
    return;
  }
  const l = t.manifestSchemas?.[a] || t.manifestSchema, u = a === 2 ? Cs : Ms;
  if (!u(e))
    for (const c of u.errors || [])
      yd(a, c) || r("WWM002", {
        path: `manifest.json${Ad(c.instancePath, c.params?.missingProperty)}`,
        message: c.message || c.keyword,
        metadata: { keyword: c.keyword, schemaPath: c.schemaPath }
      });
  md(e, a, t.permissionRegistry, r), a === 2 && e.sdk?.apiVersion !== void 0 && e.sdk.apiVersion !== "1" && r("WWM009", {
    path: "manifest.json$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。",
    metadata: { actual: e.sdk.apiVersion }
  });
  const s = l.$defs?.sourceManifest?.properties || {};
  for (const [c, n] of Object.entries(s)) {
    if (!Object.prototype.hasOwnProperty.call(e, c)) continue;
    const i = qd(l, n), d = `${n.description || ""} ${i.description || ""}`;
    i.readOnly === !0 || /server-(?:managed|generated)|published catalog/i.test(d) ? r("WWM003", {
      path: `manifest.json$.${c}`,
      message: `${c} 是发布端生成的只读字段，不能进入 Source Manifest。`
    }) : /platform-reserved/i.test(d) && r("WWM004", {
      path: `manifest.json$.${c}`,
      message: `${c} 是平台保留字段。`
    });
  }
  const o = [
    [e.type === "system", "$.type", "system 类型属于第一方平台能力。"],
    [e.install?.source && e.install.source !== "repository", "$.install.source", "第三方 Source Manifest 应使用 repository source。"],
    [e.window?.mode && e.window.mode !== "iframe", "$.window.mode", "第三方功能当前仅兼容 iframe window mode。"]
  ];
  for (const [c, n, i] of o)
    c && r("WWM004", { path: `manifest.json${n}`, message: i });
}
function md(e, t, r, a) {
  if (t === 1) {
    Object.prototype.hasOwnProperty.call(e, "permissions") && a("WWM008", {
      path: "manifest.json$.permissions",
      message: "Manifest v1 不承载权限声明；该字段不会授予能力，请显式迁移到 v2。"
    });
    return;
  }
  if (!Array.isArray(e.permissions)) return;
  const l = new Set((r?.permissions || []).map((o) => o.id)), u = new Set(r?.sourceDeclaration?.declarablePermissionIds || []), s = /* @__PURE__ */ new Set();
  e.permissions.forEach((o, c) => {
    if (typeof o != "string") return;
    const n = `manifest.json$.permissions[${c}]`;
    s.has(o) && a("WWM007", { path: n, message: `重复权限：${o}`, metadata: { permission: o } }), s.add(o), hd(o) ? a("WWM008", { path: n, message: `禁止声明超级或私有权限：${o}`, metadata: { permission: o } }) : l.has(o) ? u.has(o) || a("WWM008", { path: n, message: `权限尚未开放 Source Manifest 声明：${o}`, metadata: { permission: o } }) : a("WWM006", { path: n, message: `未知权限：${o}`, metadata: { permission: o } });
  });
}
function hd(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function yd(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function gd(e, t, r, a) {
  if (typeof t.entry != "string") return;
  let l;
  try {
    l = ue(t.entry);
  } catch {
    a("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  (!r.entryExtensions.includes(Mn(l)) || !gr(e, l)) && a("WWP006", {
    path: "manifest.json$.entry",
    message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
    metadata: { entry: l }
  });
}
function wd(e, t, r, a) {
  const l = Id(r.publicApiText), u = new Set(e.files.map((s) => s.path));
  for (const s of e.files) {
    const o = Mn(s.path);
    o === ".js" && vd(s, l, t, a), (o === ".html" || o === ".htm") && bd(s, u, a), o === ".css" && Pd(s, a);
  }
  (r.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported" || r.runtimeCompatibility.packageRuntime.execution.network !== "none") && a("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
}
function vd(e, t, r, a) {
  const l = xd(e.content);
  ft(l, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (s, o) => {
    a("WWS001", { path: e.path, location: Ke(e.content, o), message: "Package Runtime 仅支持 classic JavaScript。" });
  }), ft(l, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (s, o) => {
    a("WWS003", { path: e.path, location: Ke(e.content, o), message: "功能代码不能引用私有 Native API。" });
  }), ft(l, /\bparent\s*\.\s*WebWindows\b/g, (s, o) => {
    a("WWS004", { path: e.path, location: Ke(e.content, o), message: "功能代码不能访问 parent.WebWindows。" });
  }), ft(l, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (s, o) => {
    const c = s[1];
    t.has(c) || a("WWS004", {
      path: e.path,
      location: Ke(e.content, o),
      message: `WebWindows.${c} 不属于 Public API v1。`,
      metadata: { namespace: c }
    });
  }), ft(l, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (s, o) => {
    a("WWS005", {
      path: e.path,
      location: Ke(e.content, o),
      message: `${s[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
  const u = /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*device\s*\.\s*battery\s*\.\s*(?:getState|refresh)\s*\(/g.exec(l);
  u && (At(r) !== 2 || !r.permissions?.includes("device.battery-status.read")) && a("WWM010", {
    path: e.path,
    location: Ke(e.content, u.index),
    message: "Battery Broker API 需要 Manifest v2 声明 device.battery-status.read；静态提示不会自动授予权限。",
    metadata: { requiredPermission: "device.battery-status.read" }
  });
}
function bd(e, t, r) {
  ft(e.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (a, l) => {
    r("WWS001", { path: e.path, location: Ke(e.content, l), message: "Package Runtime 不支持 script type=module。" });
  }), ft(e.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (a, l) => {
    const u = a[2], s = Sd(e.path, u);
    (!s || !t.has(s)) && r("WWS002", {
      path: e.path,
      location: Ke(e.content, l),
      message: `脚本或样式依赖必须包含在功能包内：${u}`,
      metadata: { reference: u }
    });
  }), ft(e.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (a, l) => {
    r("WWS002", {
      path: e.path,
      location: Ke(e.content, l),
      message: `外部资源在无网络 Runtime 中不可用：${a[1]}`,
      metadata: { reference: a[1] }
    });
  });
}
function Pd(e, t) {
  ft(e.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (r, a) => {
    t("WWS002", {
      path: e.path,
      location: Ke(e.content, a),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${r[1]}`,
      metadata: { reference: r[1] }
    });
  });
}
function kd(e) {
  return new Map(e.rules.map((t) => [t.ruleId, t]));
}
function $d(e, t, r) {
  const a = e.get(t);
  if (!a) throw new Error(`Unknown validator rule: ${t}`);
  return {
    ruleId: t,
    category: a.category,
    severity: r.severity || a.defaultSeverity,
    path: r.path || null,
    location: r.location || null,
    message: r.message || a.title,
    ...r.metadata ? { metadata: r.metadata } : {}
  };
}
function Id(e) {
  const t = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(e)?.[1] || "";
  return new Set([...t.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((r) => r[1]));
}
function qd(e, t) {
  return t?.$ref?.startsWith("#/$defs/") ? e.$defs?.[t.$ref.slice(8)] || t : t || {};
}
function Sd(e, t) {
  const r = String(t || "").split(/[?#]/, 1)[0];
  if (!r || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(r)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of r.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  return a.join("/");
}
function xd(e) {
  return e.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (t) => t.replace(/[^\n]/g, " ")
  );
}
function ft(e, t, r) {
  for (const a of e.matchAll(t)) r(a, a.index || 0);
}
function Ke(e, t) {
  const r = e.slice(0, t).split(`
`);
  return { line: r.length, column: r.at(-1).length + 1 };
}
function _d(e, t) {
  const r = /position\s+(\d+)/i.exec(t);
  return Ke(e, r ? Number(r[1]) : 0);
}
function Ad(e, t) {
  return `$${(e || (t ? `/${t}` : "")).split("/").slice(1).map((a) => /^\d+$/.test(a) ? `[${a}]` : `.${a.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}
function jd(e) {
  return !e || typeof e.id != "string" || typeof e.version != "string" ? null : {
    id: e.id,
    version: e.version,
    name: typeof e.name == "string" ? e.name : null,
    manifestVersion: At(e),
    sdkApiVersion: typeof e.sdk?.apiVersion == "string" ? e.sdk.apiVersion : null
  };
}
function Mn(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function Ed(e, t) {
  return e.ruleId.localeCompare(t.ruleId) || String(e.path || "").localeCompare(String(t.path || "")) || (e.location?.line || 0) - (t.location?.line || 0) || e.message.localeCompare(t.message);
}
function Od(e) {
  return [
    e.ruleId,
    e.severity,
    e.path || "",
    e.location?.line || 0,
    e.location?.column || 0,
    e.message
  ].join("\0");
}
const Ys = "webwindows-studio-preview-control-v1", Td = "webwindows-studio-preview-console-v1", Md = "webwindows-studio-preview-console-init-v1", Cd = "webwindows-studio-preview-sdk-init-v1", Nd = "webwindows-studio-preview-session-v1", Ld = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'", Rd = 30 * 1024 * 1024;
function Ls(e = "preview") {
  const t = globalThis.crypto;
  if (!t?.getRandomValues) throw new Error("Web Crypto is required for Preview sessions.");
  const r = new Uint8Array(24);
  t.getRandomValues(r);
  const a = [...r].map((l) => l.toString(16).padStart(2, "0")).join("");
  return `${e}-${a}`;
}
function Lo(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class Dd {
  constructor({ onConsole: t, onState: r, onBroker: a } = {}) {
    this.onConsole = t || (() => {
    }), this.onState = r || (() => {
    }), this.onBroker = a || null, this.port = null, this.hostNonce = null, this.requests = /* @__PURE__ */ new Map();
  }
  async connect(t) {
    if (this.disconnect(), !t?.contentWindow) throw new Error("Developer Preview Host 尚未加载。");
    this.hostNonce = Ls("host");
    const r = new MessageChannel();
    this.port = r.port1, this.port.onmessage = (a) => this.#n(a.data), this.port.start(), t.contentWindow.postMessage({
      protocol: Ys,
      version: 1,
      type: "host.connect",
      hostNonce: this.hostNonce
    }, location.origin, [r.port2]), await this.#t("host.ping", {}, 5e3);
  }
  async start(t, r, a = { facadeEnabled: !1 }) {
    const l = new TextEncoder().encode(r).byteLength;
    if (l > Rd) throw new Error("Preview document 超过 30 MB 上限。");
    return this.#t("preview.start", {
      session: zd(t),
      token: t.token,
      documentHtml: r,
      documentBytes: l,
      brokerLaunch: a
    }, 1e4);
  }
  stop(t) {
    return !this.port || !t ? Promise.resolve() : this.#t("preview.stop", { sessionId: t.sessionId, token: t.token }, 5e3);
  }
  disconnect() {
    this.port?.close(), this.port = null, this.hostNonce = null;
    for (const t of this.requests.values()) t.reject(new Error("Developer Preview Host 已断开。"));
    this.requests.clear();
  }
  #t(t, r, a) {
    if (!this.port || !this.hostNonce) return Promise.reject(new Error("Developer Preview Host 未连接。"));
    const l = Ls("request");
    return new Promise((u, s) => {
      const o = setTimeout(() => {
        this.requests.delete(l), s(new Error(`Developer Preview Host 请求超时：${t}`));
      }, a);
      this.requests.set(l, {
        resolve: (c) => {
          clearTimeout(o), u(c);
        },
        reject: (c) => {
          clearTimeout(o), s(c);
        }
      }), this.port.postMessage({
        protocol: Ys,
        version: 1,
        type: t,
        hostNonce: this.hostNonce,
        requestId: l,
        payload: r
      });
    });
  }
  #n(t) {
    if (!Lo(t) || t.protocol !== Ys || t.version !== 1 || t.hostNonce !== this.hostNonce || typeof t.type != "string") return;
    if (t.type === "preview.console") {
      this.onConsole(t.payload);
      return;
    }
    if (t.type === "preview.state") {
      this.onState(t.payload);
      return;
    }
    if (t.type === "preview.broker") {
      const a = this.port, l = this.hostNonce;
      Promise.resolve(this.onBroker?.(t.payload)).then((u) => {
        !u || this.port !== a || this.hostNonce !== l || a.postMessage({
          protocol: Ys,
          version: 1,
          type: "preview.broker.response",
          hostNonce: l,
          payload: u
        });
      }).catch(() => {
      });
      return;
    }
    if (t.type !== "host.response" || typeof t.requestId != "string") return;
    const r = this.requests.get(t.requestId);
    r && (this.requests.delete(t.requestId), t.ok === !0 ? r.resolve(t.payload) : r.reject(new Error(t.error || "Developer Preview Host 请求失败。")));
  }
}
function zd(e) {
  return {
    contract: e.contract,
    sessionId: e.sessionId,
    projectUuid: e.projectUuid,
    snapshotId: e.snapshotId,
    createdAt: e.createdAt,
    expiresAt: e.expiresAt,
    state: e.state
  };
}
function Wd({ sessionId: e, snapshotId: t, token: r }) {
  const a = JSON.stringify({
    initProtocol: Md,
    protocol: Td,
    sessionId: e,
    snapshotId: t,
    token: r
  }).replace(/</g, "\\u003c");
  return `;(${Fd.toString()})(${a});`;
}
function Fd(e) {
  let u = null, s = 0;
  const o = [];
  function c(h) {
    const p = String(h);
    return p.length <= 4096 ? p : `${p.slice(0, 4096)}…[truncated]`;
  }
  function n(h, p, f) {
    if (h == null || typeof h == "boolean") return h;
    if (typeof h == "string" || typeof h == "number") return c(h);
    if (typeof h == "bigint") return `${h}n`;
    if (typeof h > "u") return "[undefined]";
    if (typeof h == "function") return `[Function${h.name ? ` ${h.name}` : ""}]`;
    if (typeof h == "symbol") return c(h.toString());
    if (h === globalThis || h === globalThis.window) return "[Window]";
    if (p >= 4) return "[Max depth]";
    if (f.has(h)) return "[Circular]";
    f.add(h);
    try {
      if (typeof Error < "u" && h instanceof Error)
        return { name: c(h.name), message: c(h.message), stack: c(h.stack || "") };
      if (typeof Node < "u" && h instanceof Node)
        return `[DOM ${h.nodeName || "Node"}]`;
      if (Array.isArray(h)) {
        const $ = h.slice(0, 40).map((O) => n(O, p + 1, f));
        return h.length > 40 && $.push(`[${h.length - 40} more items]`), $;
      }
      const g = {}, k = Object.keys(h).slice(0, 40);
      for (const $ of k)
        try {
          g[c($)] = n(h[$], p + 1, f);
        } catch (O) {
          g[c($)] = `[Unreadable: ${c(O?.message || O)}]`;
        }
      return Object.keys(h).length > 40 && (g["…"] = "[truncated properties]"), g;
    } catch (g) {
      return `[Unserializable: ${c(g?.message || g)}]`;
    } finally {
      f.delete(h);
    }
  }
  function i(h, p) {
    return {
      protocol: e.protocol,
      version: 1,
      type: "console.event",
      sessionId: e.sessionId,
      snapshotId: e.snapshotId,
      token: e.token,
      sequence: s++,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: h,
      arguments: Array.from(p).map((f) => n(f, 0, /* @__PURE__ */ new Set()))
    };
  }
  function d(h, p) {
    const f = i(h, p);
    if (u)
      try {
        u.postMessage(f);
      } catch {
      }
    else o.length < 200 && o.push(f);
  }
  for (const h of ["log", "info", "warn", "error", "debug"]) {
    const p = console[h]?.bind(console) || console.log.bind(console);
    console[h] = function(...f) {
      d(h, f), p(...f);
    };
  }
  addEventListener("error", (h) => d("error", [{
    name: "UncaughtError",
    message: h.message || "Uncaught error",
    file: h.filename || null,
    line: h.lineno || null,
    column: h.colno || null,
    error: h.error || null
  }])), addEventListener("unhandledrejection", (h) => d("error", [{
    name: "UnhandledRejection",
    reason: h.reason
  }])), addEventListener("message", function(p) {
    const f = p.data;
    if (!(!f || f.protocol !== e.initProtocol || f.version !== 1 || f.sessionId !== e.sessionId || f.snapshotId !== e.snapshotId || f.token !== e.token || p.ports.length !== 1 || u))
      for (u = p.ports[0], u.start?.(); o.length; ) u.postMessage(o.shift());
  });
}
function Vd(e, t, r) {
  if (!t?.facadeEnabled) return "";
  const a = JSON.stringify({
    initProtocol: r,
    protocol: t.protocol,
    version: t.version,
    sessionId: e.sessionId,
    snapshotId: e.snapshotId,
    channelId: t.channelId,
    refreshTimeoutMs: t.refreshTimeoutMs,
    clientErrors: t.clientErrors,
    handshake: t.handshake
  }).replace(/</g, "\\u003c");
  return `;(${Hd.toString()})(${a});`;
}
function Hd(e) {
  let t = null, r = 0, a = e.handshake?.ok === !0 ? o(e.handshake.result) : null;
  const l = e.handshake?.ok === !1 ? e.handshake.error : null, u = /* @__PURE__ */ new Map(), s = [];
  function o(f) {
    return { supported: f.supported, present: f.present, level: f.level, charging: f.charging, connected: f.connected, source: f.source };
  }
  function c(f) {
    const g = new Error(f?.message || "The WebWindows capability request failed.");
    return g.name = "WebWindowsCapabilityError", g.code = f?.code || "broker-unavailable", g.retryable = f?.retryable === !0, g;
  }
  function n() {
    const f = new Uint8Array(16);
    return crypto.getRandomValues(f), `sdk-${r++}-${Array.from(f, (g) => g.toString(16).padStart(2, "0")).join("")}`;
  }
  function i(f) {
    t ? t.postMessage(f) : s.push(f);
  }
  function d() {
    const f = n(), g = {
      protocol: e.protocol,
      version: e.version,
      type: "request",
      sessionId: e.sessionId,
      snapshotId: e.snapshotId,
      channelId: e.channelId,
      requestId: f,
      method: "device.battery.refresh",
      params: {}
    };
    return new Promise((k, $) => {
      const O = setTimeout(() => {
        if (!u.delete(f)) return;
        const { params: C, ...N } = g;
        i({ ...N, type: "cancel" }), $(c(e.clientErrors?.["request-timeout"]));
      }, e.refreshTimeoutMs);
      u.set(f, { resolve: k, reject: $, timer: O }), i(g);
    });
  }
  function h(f) {
    if (!f || f.protocol !== e.protocol || f.version !== e.version || f.type !== "response" || f.sessionId !== e.sessionId || f.snapshotId !== e.snapshotId || f.channelId !== e.channelId || f.method !== "device.battery.refresh" || typeof f.requestId != "string") return;
    const g = u.get(f.requestId);
    g && (u.delete(f.requestId), clearTimeout(g.timer), f.ok === !0 ? (a = o(f.result), g.resolve(o(a))) : g.reject(c(f.error)));
  }
  const p = Object.freeze({ getState() {
    if (!a) throw c(l || e.clientErrors?.["broker-unavailable"]);
    return o(a);
  }, refresh: d });
  Object.defineProperty(globalThis, "WebWindows", { value: Object.freeze({ device: Object.freeze({ battery: p }) }), configurable: !1, enumerable: !0, writable: !1 }), addEventListener("message", function(g) {
    const k = g.data;
    if (!(!k || k.protocol !== e.initProtocol || k.version !== 1 || k.sessionId !== e.sessionId || k.snapshotId !== e.snapshotId || k.channelId !== e.channelId || g.ports.length !== 1 || t))
      for (t = g.ports[0], t.onmessage = ($) => h($.data), t.start?.(); s.length; ) t.postMessage(s.shift());
  });
}
function Bd({ sessionId: e, snapshotId: t }, r) {
  return Vd({ sessionId: e, snapshotId: t }, r, Cd);
}
const un = Object.freeze({
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8",
  ".svg": "image/svg+xml;charset=utf-8"
}), Ud = /* @__PURE__ */ new Set([".html", ".htm", ...Object.keys(un)]);
function Zd(e, t, r = {}) {
  const a = gr(e, "manifest.json");
  if (!a) throw new Error("Preview Snapshot 缺少 manifest.json。");
  const l = JSON.parse(a.content), u = ue(l.entry), s = gr(e, u);
  if (!s || ![".html", ".htm"].includes(ys(u)))
    throw new Error("Preview Snapshot 的 HTML entry 不存在。");
  const c = (r.domParser || new DOMParser()).parseFromString(s.content, "text/html");
  if (c.querySelector('script[type="module"]')) throw new Error("Developer Preview 不支持 ES Module。");
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const f of e.files) {
    const g = ys(f.path);
    Ud.has(g) && Object.prototype.hasOwnProperty.call(un, g) && ![".css", ".js"].includes(g) && n.set(f.path, Kd(f.content, un[g]));
  }
  for (const f of e.files) {
    const g = ys(f.path);
    g === ".js" && i.set(f.path, f.content), g === ".css" && i.set(f.path, Ii(f.content, f.path, n));
  }
  const d = c.createElement("meta");
  d.httpEquiv = "Content-Security-Policy", d.content = Ld, c.head.prepend(d);
  const h = c.createElement("script");
  h.setAttribute("data-webwindows-preview-bootstrap", "v1"), h.textContent = Wd(t), c.head.insertBefore(h, d.nextSibling);
  const p = Bd(t, r.sdkLaunch);
  if (p) {
    const f = c.createElement("script");
    f.setAttribute("data-webwindows-preview-sdk", "v1"), f.textContent = p, c.head.insertBefore(f, h.nextSibling);
  }
  return c.querySelectorAll("script[src]").forEach((f) => {
    const g = f.getAttribute("src"), k = bs(u, g);
    if (!k || ys(k) !== ".js" || !i.has(k))
      throw new Error(`Preview 脚本必须来自 Snapshot：${g}`);
    f.removeAttribute("src"), f.textContent = i.get(k);
  }), c.querySelectorAll('link[rel~="stylesheet"][href]').forEach((f) => {
    const g = f.getAttribute("href"), k = bs(u, g);
    if (!k || ys(k) !== ".css" || !i.has(k))
      throw new Error(`Preview 样式必须来自 Snapshot：${g}`);
    const $ = c.createElement("style");
    $.textContent = i.get(k), f.replaceWith($);
  }), c.querySelectorAll("style").forEach((f) => {
    f.textContent = Ii(f.textContent, u, n);
  }), c.querySelectorAll("[src],[href],[poster]").forEach((f) => {
    for (const g of ["src", "href", "poster"]) {
      if (!f.hasAttribute(g)) continue;
      const k = bs(u, f.getAttribute(g));
      k && n.has(k) && f.setAttribute(g, n.get(k));
    }
  }), c.querySelectorAll("[srcset]").forEach((f) => {
    const g = f.getAttribute("srcset").split(",").map((k) => {
      const $ = k.trim().split(/\s+/), O = bs(u, $[0]);
      return O && n.has(O) && ($[0] = n.get(O)), $.join(" ");
    });
    f.setAttribute("srcset", g.join(", "));
  }), `<!DOCTYPE html>
` + c.documentElement.outerHTML;
}
function bs(e, t) {
  const r = String(t || "").split(/[?#]/, 1)[0];
  if (!r || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(r)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of r.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  try {
    return ue(a.join("/"));
  } catch {
    return null;
  }
}
function Ii(e, t, r) {
  return String(e).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (a, l, u) => {
    const s = bs(t, u);
    return s && r.has(s) ? `url("${r.get(s)}")` : a;
  });
}
function Kd(e, t) {
  const r = new TextEncoder().encode(String(e));
  let a = "";
  for (let l = 0; l < r.length; l += 32768)
    a += String.fromCharCode(...r.subarray(l, l + 32768));
  return `data:${t};base64,${btoa(a)}`;
}
function ys(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function Jd(e) {
  let t = 0;
  for (let r = 0; r < e.length; r += 1) {
    const a = e.charCodeAt(r);
    if (a >= 55296 && a <= 56319 && r + 1 < e.length) {
      const l = e.charCodeAt(r + 1);
      l >= 56320 && l <= 57343 && (r += 1);
    }
    t += 1;
  }
  return t;
}
const qi = wr, Gd = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "request" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, params: { type: "object", maxProperties: 64 } } }, Tr = Object.prototype.hasOwnProperty, W = Jd, ce = new RegExp("^[A-Za-z0-9._:-]+$", "u"), Ws = new RegExp("^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$", "u");
function rs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = rs.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.snapshotId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.channelId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.requestId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.method === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.params === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "params" }, message: "must have required property 'params'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!Tr.call(Gd.properties, n)) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: n }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const n = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const n = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type !== void 0 && e.type !== "request") {
      const n = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "request" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId !== void 0) {
      let n = e.sessionId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let n = e.snapshotId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let n = e.channelId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let n = e.requestId;
      if (typeof n == "string") {
        if (W(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let n = e.method;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ws.test(n)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.params !== void 0) {
      let n = e.params;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (Object.keys(n).length > 64) {
          const i = { instancePath: t + "/params", schemaPath: "#/properties/params/maxProperties", keyword: "maxProperties", params: { limit: 64 }, message: "must NOT have more than 64 properties" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/params", schemaPath: "#/properties/params/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return rs.errors = s, o === 0;
}
rs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Xd = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !0 }, result: {} } };
function ns(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ns.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.snapshotId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.channelId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.requestId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.method === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.ok === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ok" }, message: "must have required property 'ok'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.result === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "result" }, message: "must have required property 'result'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!Tr.call(Xd.properties, n)) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: n }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const n = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const n = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type !== void 0 && e.type !== "response") {
      const n = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "response" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId !== void 0) {
      let n = e.sessionId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let n = e.snapshotId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let n = e.channelId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let n = e.requestId;
      if (typeof n == "string") {
        if (W(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let n = e.method;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ws.test(n)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.ok !== void 0 && e.ok !== !0) {
      const n = { instancePath: t + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: !0 }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return ns.errors = s, o === 0;
}
ns.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Yd = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !1 }, error: { $ref: "#/$defs/publicError" } } }, Qd = new RegExp("^[a-z]+(?:-[a-z]+)*$", "u");
function is(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = is.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.snapshotId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.channelId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.requestId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.method === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.ok === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ok" }, message: "must have required property 'ok'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.error === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "error" }, message: "must have required property 'error'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!Tr.call(Yd.properties, n)) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: n }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const n = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const n = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type !== void 0 && e.type !== "response") {
      const n = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "response" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId !== void 0) {
      let n = e.sessionId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let n = e.snapshotId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let n = e.channelId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let n = e.requestId;
      if (typeof n == "string") {
        if (W(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let n = e.method;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ws.test(n)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.ok !== void 0 && e.ok !== !1) {
      const n = { instancePath: t + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.error !== void 0) {
      let n = e.error;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (n.code === void 0) {
          const i = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/required", keyword: "required", params: { missingProperty: "code" }, message: "must have required property 'code'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.message === void 0) {
          const i = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/required", keyword: "required", params: { missingProperty: "message" }, message: "must have required property 'message'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n.retryable === void 0) {
          const i = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/required", keyword: "required", params: { missingProperty: "retryable" }, message: "must have required property 'retryable'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        for (const i in n)
          if (!(i === "code" || i === "message" || i === "retryable")) {
            const d = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: i }, message: "must NOT have additional properties" };
            s === null ? s = [d] : s.push(d), o++;
          }
        if (n.code !== void 0) {
          let i = n.code;
          if (typeof i == "string") {
            if (W(i) > 64) {
              const d = { instancePath: t + "/error/code", schemaPath: "#/$defs/publicError/properties/code/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (!Qd.test(i)) {
              const d = { instancePath: t + "/error/code", schemaPath: "#/$defs/publicError/properties/code/pattern", keyword: "pattern", params: { pattern: "^[a-z]+(?:-[a-z]+)*$" }, message: 'must match pattern "^[a-z]+(?:-[a-z]+)*$"' };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/error/code", schemaPath: "#/$defs/publicError/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.message !== void 0) {
          let i = n.message;
          if (typeof i == "string") {
            if (W(i) > 240) {
              const d = { instancePath: t + "/error/message", schemaPath: "#/$defs/publicError/properties/message/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (W(i) < 1) {
              const d = { instancePath: t + "/error/message", schemaPath: "#/$defs/publicError/properties/message/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/error/message", schemaPath: "#/$defs/publicError/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.retryable !== void 0 && typeof n.retryable != "boolean") {
          const i = { instancePath: t + "/error/retryable", schemaPath: "#/$defs/publicError/properties/retryable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return is.errors = s, o === 0;
}
is.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Dt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Dt.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const n = o;
  let i = !1, d = null;
  const h = o;
  ns(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ns.errors : s.concat(ns.errors), o = s.length);
  var g = h === o;
  if (g) {
    i = !0, d = 0;
    var p = !0;
  }
  const f = o;
  is(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? is.errors : s.concat(is.errors), o = s.length);
  var g = f === o;
  if (g && i ? (i = !1, d = [d, 1]) : g && (i = !0, d = 1, p !== !0 && (p = !0)), i)
    o = n, s !== null && (n ? s.length = n : s = null);
  else {
    const k = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [k] : s.push(k), o++;
  }
  return Dt.errors = s, c.props = p, o === 0;
}
Dt.evaluated = { dynamicProps: !0, dynamicItems: !1 };
function os(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = os.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.snapshotId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.channelId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.requestId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.method === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!(n === "protocol" || n === "version" || n === "type" || n === "sessionId" || n === "snapshotId" || n === "channelId" || n === "requestId" || n === "method")) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: n }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const n = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const n = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type !== void 0 && e.type !== "cancel") {
      const n = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "cancel" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId !== void 0) {
      let n = e.sessionId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let n = e.snapshotId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let n = e.channelId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let n = e.requestId;
      if (typeof n == "string") {
        if (W(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let n = e.method;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ws.test(n)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return os.errors = s, o === 0;
}
os.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Si = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "event" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, event: { enum: ["snapshot.update", "capability.change"] }, detail: { type: "object", maxProperties: 64 } } };
function as(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = as.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.snapshotId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.channelId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.requestId === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.method === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.event === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "event" }, message: "must have required property 'event'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.detail === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "detail" }, message: "must have required property 'detail'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!Tr.call(Si.properties, n)) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: n }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const n = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const n = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.type !== void 0 && e.type !== "event") {
      const n = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "event" }, message: "must be equal to constant" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.sessionId !== void 0) {
      let n = e.sessionId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let n = e.snapshotId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let n = e.channelId;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let n = e.requestId;
      if (typeof n == "string") {
        if (W(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(n)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let n = e.method;
      if (typeof n == "string") {
        if (W(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (W(n) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ws.test(n)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.event !== void 0) {
      let n = e.event;
      if (!(n === "snapshot.update" || n === "capability.change")) {
        const i = { instancePath: t + "/event", schemaPath: "#/properties/event/enum", keyword: "enum", params: { allowedValues: Si.properties.event.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.detail !== void 0) {
      let n = e.detail;
      if (n && typeof n == "object" && !Array.isArray(n)) {
        if (Object.keys(n).length > 64) {
          const i = { instancePath: t + "/detail", schemaPath: "#/properties/detail/maxProperties", keyword: "maxProperties", params: { limit: 64 }, message: "must NOT have more than 64 properties" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/detail", schemaPath: "#/properties/detail/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return as.errors = s, o === 0;
}
as.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function wr(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = wr.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const n = o;
  let i = !1, d = null;
  const h = o;
  rs(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? rs.errors : s.concat(rs.errors), o = s.length);
  var k = h === o;
  if (k) {
    i = !0, d = 0;
    var p = !0;
  }
  const f = o;
  if (!Dt(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }))
    s = s === null ? Dt.errors : s.concat(Dt.errors), o = s.length;
  else
    var g = Dt.evaluated.props;
  var k = f === o;
  if (k && i)
    i = !1, d = [d, 1];
  else {
    k && (i = !0, d = 1, p !== !0 && g !== void 0 && (g === !0 ? p = !0 : (p = p || {}, Object.assign(p, g))));
    const $ = o;
    os(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? os.errors : s.concat(os.errors), o = s.length);
    var k = $ === o;
    if (k && i)
      i = !1, d = [d, 2];
    else {
      k && (i = !0, d = 2, p !== !0 && (p = !0));
      const C = o;
      as(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? as.errors : s.concat(as.errors), o = s.length);
      var k = C === o;
      k && i ? (i = !1, d = [d, 3]) : k && (i = !0, d = 3, p !== !0 && (p = !0));
    }
  }
  if (i)
    o = n, s !== null && (n ? s.length = n : s = null);
  else {
    const $ = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [$] : s.push($), o++;
  }
  return wr.errors = s, c.props = p, o === 0;
}
wr.evaluated = { dynamicProps: !0, dynamicItems: !1 };
const ep = vr;
function vr(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = vr.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (Object.keys(e).length > 0) {
      const n = { instancePath: t, schemaPath: "#/maxProperties", keyword: "maxProperties", params: { limit: 0 }, message: "must NOT have more than 0 properties" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e) {
      const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: n }, message: "must NOT have additional properties" };
      s === null ? s = [i] : s.push(i), o++;
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return vr.errors = s, o === 0;
}
vr.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const tp = br, gs = { properties: { present: { type: ["boolean", "null"] }, level: { type: ["number", "null"] }, charging: { type: ["boolean", "null"] }, connected: { type: ["boolean", "null"] }, source: { enum: ["browser", "runtime", "unsupported"] } } };
function br(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = br.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.supported === void 0) {
      const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "supported" }, message: "must have required property 'supported'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.present === void 0) {
      const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "present" }, message: "must have required property 'present'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.level === void 0) {
      const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "level" }, message: "must have required property 'level'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.charging === void 0) {
      const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "charging" }, message: "must have required property 'charging'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.connected === void 0) {
      const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "connected" }, message: "must have required property 'connected'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.source === void 0) {
      const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!(n === "supported" || n === "present" || n === "level" || n === "charging" || n === "connected" || n === "source")) {
        const i = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: n }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.supported !== void 0 && typeof e.supported != "boolean") {
      const n = { instancePath: t + "/supported", schemaPath: "#/$defs/sanitizedBatteryState/properties/supported/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.present !== void 0) {
      let n = e.present;
      if (typeof n != "boolean" && n !== null) {
        const i = { instancePath: t + "/present", schemaPath: "#/$defs/sanitizedBatteryState/properties/present/type", keyword: "type", params: { type: gs.properties.present.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.level !== void 0) {
      let n = e.level;
      if (typeof n != "number" && n !== null) {
        const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/type", keyword: "type", params: { type: gs.properties.level.type }, message: "must be number,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
      if (typeof n == "number") {
        if (n > 1 || isNaN(n)) {
          const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1 }, message: "must be <= 1" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (n < 0 || isNaN(n)) {
          const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          s === null ? s = [i] : s.push(i), o++;
        }
      }
    }
    if (e.charging !== void 0) {
      let n = e.charging;
      if (typeof n != "boolean" && n !== null) {
        const i = { instancePath: t + "/charging", schemaPath: "#/$defs/sanitizedBatteryState/properties/charging/type", keyword: "type", params: { type: gs.properties.charging.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.connected !== void 0) {
      let n = e.connected;
      if (typeof n != "boolean" && n !== null) {
        const i = { instancePath: t + "/connected", schemaPath: "#/$defs/sanitizedBatteryState/properties/connected/type", keyword: "type", params: { type: gs.properties.connected.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.source !== void 0) {
      let n = e.source;
      if (!(n === "browser" || n === "runtime" || n === "unsupported")) {
        const i = { instancePath: t + "/source", schemaPath: "#/$defs/sanitizedBatteryState/properties/source/enum", keyword: "enum", params: { allowedValues: gs.properties.source.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return br.errors = s, o === 0;
}
br.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function sp({
  manifest: e,
  method: t,
  decisionContract: r,
  platformPolicyAllowed: a,
  hostGrant: l,
  capabilitySupported: u
}) {
  if (!r || r.policyVersion !== 1)
    throw new TypeError("Permission decision contract v1 is required.");
  const s = t?.requiredPermission || null, o = t?.id || null, c = !!(s && Array.isArray(e?.permissions) && e.permissions.includes(s)), n = t?.previewAvailability === "enabled" && t?.currentStatus === "enabled" ? "enabled" : "disabled";
  let i = "not-evaluated", d = "denied", h = "not-evaluated", p = null;
  if (!c)
    p = "not-declared";
  else if (i = (typeof a == "function" ? a() : a) === !0 ? "allowed" : "denied", i === "denied")
    p = "policy-denied";
  else {
    const k = typeof l == "function" ? l() : l;
    d = rp(t?.consent, k), d === "denied" ? p = "grant-denied" : (h = (typeof u == "function" ? u() : u) === !0 ? "supported" : "unsupported", h === "unsupported" ? p = "capability-unsupported" : n !== "enabled" && (p = "method-disabled"));
  }
  const f = p ? r.stableDenialReasons[p] || "permission-denied" : null;
  return Object.freeze({
    contract: r.contract,
    permissionId: s,
    methodId: o,
    declared: c,
    policy: i,
    consentMode: t?.consent || "unspecified",
    grantState: d,
    capability: h,
    methodPolicy: n,
    effective: p === null,
    denialReason: p,
    publicErrorCode: f,
    policyVersion: r.policyVersion
  });
}
function rp(e, t) {
  if (t === !1 || t?.allowed === !1 || t?.state === "denied") return "denied";
  if (e === "no-consent") return "not-required";
  const r = t?.state;
  return t?.allowed === !0 && [
    "session-grant",
    "persistent-user-grant",
    "resource-scoped-grant"
  ].includes(r) ? r : "denied";
}
function xi(e) {
  return e?.effective ? null : e?.publicErrorCode || "permission-denied";
}
function np(e, t) {
  if (cn(e) > t.maximumResponseBytes) throw Qs("response-too-large");
  if (!op(e)) throw Qs("internal-error");
  const r = {
    supported: e.supported,
    present: e.present,
    level: e.level,
    charging: e.charging,
    connected: e.connected,
    source: ip(e.supported, e.source)
  };
  if (!tp(r)) throw Qs("internal-error");
  if (cn(r) > t.maximumResponseBytes) throw Qs("response-too-large");
  return Object.freeze(r);
}
function cn(e) {
  try {
    return new TextEncoder().encode(JSON.stringify(e)).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
function Qs(e) {
  const t = new Error(e);
  return t.code = e, t;
}
function ip(e, t) {
  return !e || t === "unsupported" ? "unsupported" : t === "battery-status-api" || t === "browser" ? "browser" : "runtime";
}
function op(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class ap {
  constructor(t) {
    this.session = t.session, this.manifest = t.manifest, this.contracts = t.contracts, this.publicApi = t.publicApi || null, this.platformPolicyPermits = t.platformPolicyPermits ?? !0, this.grantResolver = t.grantResolver || lp, this.now = t.now || (() => Date.now()), this.setTimer = t.setTimer || ((r, a) => setTimeout(r, a)), this.clearTimer = t.clearTimer || ((r) => clearTimeout(r)), this.onDiagnostic = typeof t.onDiagnostic == "function" ? t.onDiagnostic : null, this.channelId = t.channelId || Ls("broker"), this.methods = new Map(this.contracts.brokerMethods.methods.map((r) => [r.id, r])), this.errors = new Map(this.contracts.brokerErrors.errors.map((r) => [r.code, r])), this.seen = /* @__PURE__ */ new Set(), this.pending = /* @__PURE__ */ new Map(), this.requestTimes = [], this.audit = [], this.diagnostics = [], this.closed = !1;
  }
  async createLaunchDescriptor() {
    if (At(this.manifest) !== 2 || this.manifest.sdk?.apiVersion !== "1")
      return Object.freeze({ facadeEnabled: !1 });
    const t = this.methods.get("device.battery.getState"), r = this.#t(t), a = xi(r);
    let l;
    if (a)
      l = { ok: !1, error: this.#a(a) }, this.#s("handshake", t, "deny", a, 0, r);
    else {
      const o = this.now();
      try {
        const c = this.#i().getState();
        l = { ok: !0, result: this.#l(c, t) }, this.#s("handshake", t, "allow", "success", this.now() - o, r);
      } catch (c) {
        const n = _i(c);
        l = { ok: !1, error: this.#a(n) }, this.#s("handshake", t, "allow", n, this.now() - o, r);
      }
    }
    const u = this.methods.get("device.battery.refresh"), s = ["request-timeout", "broker-unavailable"];
    return Object.freeze({
      facadeEnabled: !0,
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      channelId: this.channelId,
      refreshTimeoutMs: u.timeoutMs,
      clientErrors: Object.fromEntries(s.map((o) => [o, this.#a(o)])),
      handshake: structuredClone(l)
    });
  }
  handleEnvelope(t) {
    if (!this.#c(t) || this.closed) return Promise.resolve(this.#e(t, "session-invalid"));
    if (this.now() >= Date.parse(this.session.expiresAt))
      return Promise.resolve(this.#e(t, "session-expired"));
    if (t?.protocol !== this.contracts.brokerPolicy.protocol || t?.version !== this.contracts.brokerPolicy.protocolVersion)
      return Promise.resolve(this.#e(t, "protocol-unsupported"));
    if (t.type === "cancel") return Promise.resolve(this.#u(t));
    if (t.type !== "request" || typeof t.requestId != "string")
      return Promise.resolve(this.#e(t, "invalid-params"));
    if (this.seen.has(t.requestId)) return Promise.resolve(this.#e(t, "duplicate-request-id"));
    if (this.seen.add(t.requestId), cn(t) > this.contracts.brokerPolicy.limits.maximumRequestBytes)
      return Promise.resolve(this.#e(t, "request-too-large"));
    const r = this.methods.get(t.method);
    if (!r || r.invocation !== "request-response" || r.previewAvailability !== "enabled")
      return Promise.resolve(this.#e(t, "method-not-allowed", r));
    const a = this.#t(r), l = xi(a);
    if (l) return Promise.resolve(this.#e(t, l, r, !0, a));
    if (!qi(t) || !ep(t.params))
      return Promise.resolve(this.#e(t, "invalid-params", r, !0, a));
    if (r.userGesture === "host-required")
      return Promise.resolve(this.#e(t, "gesture-required", r, !0, a));
    this.#p();
    const u = this.contracts.brokerPolicy.limits;
    return this.pending.size >= u.maximumConcurrentRequests || this.requestTimes.length >= u.maximumRequestsPerMinute ? Promise.resolve(this.#e(t, "rate-limited", r, !0, a)) : (this.requestTimes.push(this.now()), this.#o(t, r, a));
  }
  close(t = "request-cancelled") {
    if (!this.closed) {
      this.closed = !0;
      for (const r of [...this.pending.values()]) this.#r(r, this.#e(r.message, t, r.method, !1));
    }
  }
  getAudit() {
    return this.audit.map((t) => Object.freeze({ ...t }));
  }
  getDiagnostics() {
    return this.diagnostics.map((t) => Object.freeze({ ...t }));
  }
  clearDiagnostics() {
    this.diagnostics = [];
  }
  #t(t) {
    return sp({
      manifest: this.manifest,
      method: t,
      decisionContract: this.contracts.permissionDecision,
      platformPolicyAllowed: () => typeof this.platformPolicyPermits == "function" ? this.platformPolicyPermits(t, this.manifest, this.session) === !0 : this.platformPolicyPermits === !0,
      hostGrant: () => this.grantResolver(t, this.manifest, this.session),
      capabilitySupported: () => this.#n(t.requiredRuntimeCapability)
    });
  }
  #n(t) {
    if (t !== "battery.status") return !1;
    try {
      const r = this.#i();
      return typeof r.getState == "function" && typeof r.refresh == "function" && r.getCapabilities?.().status?.supported === !0;
    } catch {
      return !1;
    }
  }
  #i() {
    const t = this.publicApi?.device?.battery;
    if (!t) throw cp("capability-unsupported");
    return t;
  }
  #o(t, r, a) {
    const l = this.now(), u = r.timeoutMs || this.contracts.brokerPolicy.limits.defaultRequestTimeoutMs, s = Math.max(0, Date.parse(this.session.expiresAt) - this.now()), o = Math.min(u, this.contracts.brokerPolicy.limits.maximumRequestTimeoutMs, s);
    return new Promise((c) => {
      const n = { message: t, method: r, permissionDecision: a, startedAt: l, resolve: c, timer: null, settled: !1 };
      n.timer = this.setTimer(() => {
        this.#r(n, this.#e(t, "request-timeout", r, !1));
      }, o), this.pending.set(t.requestId, n), this.#s(t.requestId, r, "allow", "pending", 0, a), Promise.resolve().then(() => this.#i().refresh()).then(
        (i) => {
          if (n.settled) {
            this.#s(t.requestId, r, "allow", "late-result-ignored", this.now() - l);
            return;
          }
          try {
            const d = this.#l(i, r);
            this.#r(n, this.#d(t, d));
          } catch (d) {
            this.#r(n, this.#e(t, _i(d), r, !1));
          }
        },
        () => {
          if (n.settled) {
            this.#s(t.requestId, r, "allow", "late-result-ignored", this.now() - l);
            return;
          }
          this.#r(n, this.#e(t, "internal-error", r, !1));
        }
      );
    });
  }
  #u(t) {
    if (!qi(t)) return null;
    const r = this.pending.get(t.requestId);
    return !r || r.message.method !== t.method || this.#r(r, this.#e(r.message, "request-cancelled", r.method, !1)), null;
  }
  #r(t, r) {
    if (t.settled) return;
    t.settled = !0, this.clearTimer(t.timer), this.pending.delete(t.message.requestId);
    const a = r.ok ? "success" : r.error.code;
    this.#s(t.message.requestId, t.method, r.ok ? "allow" : dp(a), a, this.now() - t.startedAt, t.permissionDecision), t.resolve(r);
  }
  #l(t, r) {
    return np(t, r);
  }
  #c(t) {
    return Lo(t) && t.sessionId === this.session.sessionId && t.snapshotId === this.session.snapshotId && t.channelId === this.channelId;
  }
  #d(t, r) {
    return {
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      type: "response",
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      channelId: this.channelId,
      requestId: t.requestId,
      method: t.method,
      ok: !0,
      result: structuredClone(r)
    };
  }
  #e(t, r, a = null, l = !0, u = null) {
    return l && this.#s(t?.requestId || null, a, "deny", r, 0, u), {
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      type: "response",
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      channelId: this.channelId,
      requestId: typeof t?.requestId == "string" && t.requestId ? t.requestId : "invalid-request",
      method: typeof t?.method == "string" && t.method ? t.method : "device.battery.refresh",
      ok: !1,
      error: this.#a(r)
    };
  }
  #a(t) {
    const r = this.errors.get(t) || this.errors.get("internal-error");
    return { code: r.code, message: r.message, retryable: r.retryable };
  }
  #s(t, r, a, l, u, s = null) {
    const o = Object.freeze({
      timestamp: new Date(this.now()).toISOString(),
      mode: "preview",
      appIdentity: typeof this.manifest.id == "string" ? this.manifest.id : null,
      projectIdentity: this.session.projectUuid,
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      requestId: t,
      method: r?.id || null,
      permission: r?.requiredPermission || null,
      decision: a,
      resultCategory: l,
      latencyMs: u
    });
    this.audit.push(o);
    const c = s?.denialReason || up(l), n = Object.freeze({
      timestamp: o.timestamp,
      sessionId: o.sessionId,
      snapshotId: o.snapshotId,
      projectIdentity: o.projectIdentity,
      appIdentity: o.appIdentity,
      requestId: t,
      method: o.method,
      permission: o.permission,
      declared: s?.declared ?? null,
      policyDecision: s?.policy || "not-evaluated",
      consentMode: s?.consentMode || r?.consent || null,
      grantState: s?.grantState || null,
      capabilityState: s?.capability || "not-evaluated",
      methodPolicy: s?.methodPolicy || (r ? "enabled" : "not-evaluated"),
      finalDecision: a,
      resultCategory: l,
      publicError: this.errors.has(l) ? l : null,
      denialReason: c,
      latencyMs: u,
      policyVersion: this.contracts.permissionDecision.policyVersion
    });
    this.diagnostics.push(n);
    try {
      this.onDiagnostic?.(Object.freeze({ ...n }));
    } catch {
    }
  }
  #p() {
    const t = this.now() - 6e4;
    this.requestTimes = this.requestTimes.filter((r) => r > t);
  }
}
function lp(e) {
  return e.consent === "no-consent";
}
function up(e) {
  return {
    "permission-not-declared": "not-declared",
    "policy-denied": "policy-denied",
    "permission-denied": "grant-denied",
    "capability-unsupported": "capability-unsupported",
    "method-not-allowed": "method-disabled",
    "gesture-required": "gesture-required",
    "rate-limited": "rate-limited"
  }[e] || null;
}
function cp(e) {
  const t = new Error(e);
  return t.code = e, t;
}
function _i(e) {
  return ["response-too-large", "capability-unsupported"].includes(e?.code) ? e.code : "internal-error";
}
function dp(e) {
  return [
    "session-invalid",
    "session-expired",
    "protocol-unsupported",
    "duplicate-request-id",
    "method-not-allowed",
    "permission-not-declared",
    "policy-denied",
    "permission-denied",
    "capability-unsupported",
    "invalid-params",
    "request-too-large",
    "gesture-required",
    "rate-limited"
  ].includes(e) ? "deny" : "allow";
}
const pp = 1800 * 1e3;
class fp {
  constructor({
    hostClient: t,
    ttlMs: r = pp,
    now: a = () => Date.now(),
    publicApiProvider: l = mp,
    platformPolicyPermits: u = !0,
    grantResolver: s,
    onBrokerDiagnostic: o
  }) {
    if (!t) throw new TypeError("PreviewHostClient is required.");
    this.hostClient = t, this.ttlMs = r, this.now = a, this.publicApiProvider = l, this.platformPolicyPermits = u, this.grantResolver = s, this.onBrokerDiagnostic = typeof o == "function" ? o : null, this.sessions = /* @__PURE__ */ new Map(), this.activeSessionId = null, this.hostClient.onBroker = (c) => this.#n(c);
  }
  get activeSession() {
    return this.activeSessionId && this.sessions.get(this.activeSessionId) || null;
  }
  async run(t, { contracts: r, domParser: a } = {}) {
    const l = await ln(t, { contracts: r });
    if (!l.passed) return { started: !1, validationReport: l, session: null };
    this.activeSession && await this.stop(this.activeSession.sessionId);
    const u = this.#t(t);
    this.sessions.set(u.sessionId, u), this.activeSessionId = u.sessionId;
    try {
      const s = JSON.parse(gr(t, "manifest.json").content);
      u.broker = new ap({
        session: u,
        manifest: s,
        contracts: r,
        publicApi: this.publicApiProvider(),
        platformPolicyPermits: this.platformPolicyPermits,
        grantResolver: this.grantResolver,
        onDiagnostic: this.onBrokerDiagnostic,
        now: this.now
      }), u.brokerLaunch = await u.broker.createLaunchDescriptor();
      const o = Zd(t, u, { domParser: a, sdkLaunch: u.brokerLaunch });
      return await this.hostClient.start(u, o, u.brokerLaunch), u.state = "running", u.expiryTimer = setTimeout(() => this.#i(u.sessionId).catch(() => {
      }), this.ttlMs), { started: !0, validationReport: l, session: Jr(u) };
    } catch (s) {
      throw u.state = "failed", u.failure = s?.message || String(s), this.#o(u), s;
    }
  }
  async reload(t, r = {}) {
    const a = this.activeSession;
    a && (a.state = "reloading");
    const l = await ln(t, { contracts: r.contracts });
    return l.passed ? (a && await this.stop(a.sessionId), this.run(t, r)) : (a && (a.state = "running"), { started: !1, validationReport: l, session: a ? Jr(a) : null });
  }
  async stop(t = this.activeSessionId) {
    const r = t ? this.sessions.get(t) : null;
    if (!r) return null;
    r.broker?.close("request-cancelled");
    try {
      await this.hostClient.stop(r);
    } finally {
      r.state = "closed", this.#o(r);
    }
    return Jr(r);
  }
  async dispose() {
    const t = [...this.sessions.keys()];
    for (const r of t) await this.stop(r).catch(() => {
    });
    this.hostClient.disconnect?.(), this.hostClient.onBroker = null;
  }
  getBrokerAudit(t = this.activeSessionId) {
    return t ? this.sessions.get(t)?.broker?.getAudit() || [] : [];
  }
  getBrokerDiagnostics(t = this.activeSessionId) {
    return t ? this.sessions.get(t)?.broker?.getDiagnostics() || [] : [];
  }
  clearBrokerDiagnostics(t = this.activeSessionId) {
    t && this.sessions.get(t)?.broker?.clearDiagnostics();
  }
  #t(t) {
    const r = this.now();
    return {
      contract: Nd,
      sessionId: Ls("session"),
      projectUuid: t.projectUuid,
      snapshotId: t.snapshotId,
      token: Ls("token"),
      createdAt: new Date(r).toISOString(),
      expiresAt: new Date(r + this.ttlMs).toISOString(),
      state: "created",
      snapshot: t,
      expiryTimer: null,
      failure: null,
      broker: null,
      brokerLaunch: null
    };
  }
  #n(t) {
    const r = t?.sessionId ? this.sessions.get(t.sessionId) : null;
    return r?.broker ? r.broker.handleEnvelope(t) : Promise.resolve(null);
  }
  async #i(t) {
    const r = this.sessions.get(t);
    if (r) {
      r.broker?.close("session-expired");
      try {
        await this.hostClient.stop(r);
      } finally {
        r.state = "closed", this.#o(r);
      }
    }
  }
  #o(t) {
    clearTimeout(t.expiryTimer), t.expiryTimer = null, t.token = null, t.snapshot = null, t.broker?.close("request-cancelled"), t.broker = null, t.brokerLaunch = null, this.sessions.delete(t.sessionId), this.activeSessionId === t.sessionId && (this.activeSessionId = null);
  }
}
function Jr(e) {
  return Object.freeze({
    contract: e.contract,
    sessionId: e.sessionId,
    projectUuid: e.projectUuid,
    snapshotId: e.snapshotId,
    createdAt: e.createdAt,
    expiresAt: e.expiresAt,
    state: e.state,
    brokerEnabled: e.brokerLaunch?.facadeEnabled === !0,
    ...e.failure ? { failure: e.failure } : {}
  });
}
function mp() {
  return globalThis.top?.WebWindows || globalThis.WebWindows || null;
}
const hp = { class: "developer-studio" }, yp = { class: "studio-toolbar" }, gp = ["value"], wp = ["value"], vp = ["disabled"], bp = ["disabled"], Pp = ["disabled"], kp = ["disabled"], $p = ["disabled"], Ip = ["disabled"], qp = ["disabled"], Sp = {
  key: 0,
  class: "studio-main"
}, xp = { class: "explorer-panel" }, _p = { class: "panel-heading" }, Ap = { class: "panel-actions" }, jp = ["disabled"], Ep = ["disabled"], Op = { class: "file-tree" }, Tp = { class: "editor-workbench" }, Mp = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, Cp = ["onClick"], Np = {
  key: 0,
  class: "dirty-dot"
}, Lp = { class: "editor-host" }, Rp = {
  key: 1,
  class: "empty-editor"
}, Dp = { class: "inspector-panel" }, zp = { class: "panel-heading" }, Wp = { class: "panel-switcher" }, Fp = { class: "inspector-content" }, Vp = { class: "project-uuid" }, Hp = { class: "build-inspector" }, Bp = { key: 0 }, Up = { key: 1 }, Zp = {
  key: 0,
  class: "build-blocked"
}, Kp = { key: 1 }, Jp = { class: "hash-row" }, Gp = ["disabled"], Xp = { class: "inspector-content" }, Yp = { class: "preview-inspector" }, Qp = { class: "preview-session-banner" }, ef = { key: 0 }, tf = { key: 1 }, sf = {
  key: 1,
  class: "empty-workspace studio-main"
}, rf = {
  key: 2,
  class: "storage-recovery",
  role: "alert"
}, nf = { class: "problems-panel" }, of = { class: "bottom-tabs" }, af = ["value"], lf = {
  key: 0,
  class: "problems-empty"
}, uf = ["onClick"], cf = {
  key: 0,
  class: "problems-empty"
}, df = {
  key: 0,
  class: "problems-empty"
}, pf = { class: "studio-dialog-actions" }, ff = {
  class: "primary",
  type: "submit"
}, mf = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new Zc(), r = Z([]), a = Z(null), l = Z([]), u = Z(""), s = Z([]), o = Z(""), c = Z(""), n = Z(/* @__PURE__ */ new Set()), i = Z(null), d = Z([]), h = Z(null), p = Z(null), f = Z(null), g = Z(null), k = Z(null), $ = Z(!1), O = Z(null), C = Z(!1), N = Z(null), ee = Z([]), fe = Z([]), oe = Z("problems"), pe = Z("preview"), rt = Z("all"), Ee = Z(""), nt = Z(""), vt = Z(!1), me = Z(null);
    let it = null, bt = 0, he = 0, Y = null, B = null;
    const ot = Le(() => ed(l.value)), Wt = Le(() => l.value.find((P) => P.path === o.value)), at = Le(() => td(o.value)), ze = Le(() => o.value === "manifest.json" ? d.value : []), us = Le(() => At(i.value)), cs = Le(() => g.value?.diagnostics || d.value.map((P) => ({
      ruleId: "Manifest",
      severity: P.severity,
      path: P.path,
      message: P.message
    }))), Fs = Le(() => rt.value === "all" ? ee.value : ee.value.filter((P) => P.level === rt.value));
    xn(async () => {
      try {
        const P = await vs();
        h.value = P.permissionRegistry, p.value = P.brokerMethods, f.value = P.runtimeCompatibility, await Be(), r.value.length && await Pt(r.value[0].uuid);
      } catch (P) {
        M(P);
      }
    }), _n(() => {
      clearTimeout(bt), B?.dispose().catch(() => {
      }), t.close();
    });
    async function Be() {
      r.value = await t.listProjects();
    }
    async function Et() {
      try {
        await j();
        const P = Wc(), v = await Us("新建 WebWindows 功能", "项目名称", P.displayName);
        if (v == null) return;
        const I = await t.createProject({ ...P, displayName: v });
        await Be(), await Pt(I.uuid), L("Hello WebWindows 项目已创建。");
      } catch (P) {
        M(P);
      }
    }
    async function Pt(P) {
      if (!P) return;
      N.value && await ds(), await j(), a.value = await t.getProject(P), l.value = await t.listEntries(P);
      const v = a.value.editorState || {};
      s.value = (v.openFiles || []).filter((I) => l.value.some((ne) => ne.path === I && ne.kind === "file")), o.value = l.value.some((I) => I.path === v.activeFile && I.kind === "file") ? v.activeFile : s.value[0] || "", u.value = o.value, n.value = /* @__PURE__ */ new Set(), ge(), await w(), await q(), await E();
    }
    async function Vs() {
      if (!a.value) return;
      const P = await Us("重命名项目", "新的项目名称", a.value.displayName);
      if (P != null)
        try {
          a.value = await t.renameProject(a.value.uuid, P), await Be(), L("项目已重命名。");
        } catch (v) {
          M(v);
        }
    }
    async function Ot() {
      if (a.value && await Mr("删除项目", `永久删除项目“${a.value.displayName}”及其全部文件吗？`))
        try {
          const P = a.value.uuid;
          await t.deleteProject(P), a.value = null, l.value = [], s.value = [], o.value = "", u.value = "", c.value = "", ge(), await Be(), r.value.length && await Pt(r.value[0].uuid), L("项目已删除。");
        } catch (P) {
          M(P);
        }
    }
    async function Cn(P) {
      u.value = P.path, P.kind === "file" && await m(P.path);
    }
    async function m(P) {
      if (!a.value) return;
      await j();
      const v = ue(P);
      s.value.includes(v) || s.value.push(v), o.value = v, u.value = v, await w(), await E();
    }
    async function w() {
      if (!a.value || !o.value) {
        c.value = "";
        return;
      }
      c.value = await t.readTextFile(a.value.uuid, o.value), o.value === "manifest.json" && await x(c.value), await In();
    }
    function b(P) {
      c.value = P, o.value && (n.value = new Set(n.value).add(o.value), ge(), o.value === "manifest.json" && x(P).catch(M), clearTimeout(bt), bt = window.setTimeout(() => j().catch(M), 700));
    }
    async function x(P) {
      const v = ++he, I = await Mc(P);
      v === he && (i.value = I.manifest, d.value = I.diagnostics);
    }
    async function q() {
      if (!a.value || !l.value.some((v) => v.path === "manifest.json" && v.kind === "file")) {
        i.value = null, d.value = [];
        return;
      }
      const P = o.value === "manifest.json" ? c.value : await t.readTextFile(a.value.uuid, "manifest.json");
      await x(P);
    }
    async function S(P) {
      o.value !== "manifest.json" && await m("manifest.json"), b(`${JSON.stringify(P, null, 2)}
`);
    }
    async function j() {
      if (clearTimeout(bt), bt = 0, !a.value || !o.value || !n.value.has(o.value)) return;
      const P = o.value;
      await t.writeTextFile(a.value.uuid, P, c.value);
      const v = new Set(n.value);
      v.delete(P), n.value = v, a.value = await t.getProject(a.value.uuid);
    }
    async function E() {
      if (!a.value) return;
      const P = [o.value, ...a.value.editorState?.recentFiles || []].filter(Boolean);
      a.value = await t.saveEditorState(a.value.uuid, {
        openFiles: s.value,
        activeFile: o.value || null,
        recentFiles: [...new Set(P)].slice(0, 20)
      });
    }
    function A() {
      const P = l.value.find((v) => v.path === u.value);
      return P?.kind === "directory" ? P.path : P?.path ? Ns(P.path) : "";
    }
    async function _(P) {
      if (!a.value) return;
      const I = await Us(P === "directory" ? "新建目录" : "新建文件", P === "directory" ? "目录名称" : "文件名称", P === "directory" ? "new-folder" : "new-file.js");
      if (I != null)
        try {
          const ne = ki(A(), I);
          P === "directory" ? await t.createDirectory(a.value.uuid, ne) : await t.createFile(a.value.uuid, ne, ""), ge(), l.value = await t.listEntries(a.value.uuid), u.value = ne, P === "file" && await m(ne);
        } catch (ne) {
          M(ne);
        }
    }
    async function F() {
      const P = l.value.find((I) => I.path === u.value);
      if (!P || !a.value) return;
      const v = await Us("重命名", "新的名称", an(P.path));
      if (v != null)
        try {
          await j();
          const I = ki(Ns(P.path), v);
          await t.renameEntry(a.value.uuid, P.path, I), ge(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = I, await w();
        } catch (I) {
          M(I);
        }
    }
    async function T() {
      const P = l.value.find((v) => v.path === u.value);
      if (!(!P || !a.value) && await Mr("删除文件或目录", `删除“${P.path}”${P.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(a.value.uuid, P.path), ge(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = o.value, await w();
        } catch (v) {
          M(v);
        }
    }
    function L(P) {
      Ee.value = P, nt.value = "", window.setTimeout(() => {
        Ee.value === P && (Ee.value = "");
      }, 2400);
    }
    function M(P) {
      console.error("[DeveloperStudio]", P), vt.value = Tn(P) && P.recoverable !== !1, Ee.value = P?.message || "操作失败。", nt.value = "error";
    }
    async function U() {
      if (await Mr(
        "修复 Developer Studio 项目存储",
        "这将永久删除当前浏览器中的所有 Developer Studio 项目和文件，并重新创建独立工作区。不会删除其他 WebWindows 数据。继续吗？"
      ))
        try {
          await t.resetStorage(), a.value = null, r.value = [], l.value = [], s.value = [], o.value = "", u.value = "", c.value = "", vt.value = !1, await Be(), L("Developer Studio 项目存储已重建，可以重新创建功能。");
        } catch (v) {
          M(v);
        }
    }
    async function J() {
      if (!a.value) throw new Error("请先打开项目。");
      return await j(), sd(t, a.value.uuid);
    }
    async function K() {
      if (!$.value) {
        $.value = !0;
        try {
          const P = await J(), v = await vs();
          g.value = await ln(P, { contracts: v }), k.value = null, L(g.value.passed ? "项目验证通过。" : `验证发现 ${g.value.errorCount} 个错误。`);
        } catch (P) {
          M(P);
        } finally {
          $.value = !1;
        }
      }
    }
    async function be() {
      if (!$.value) {
        $.value = !0;
        try {
          const P = await J(), v = await vs(), { buildProjectPackage: I } = await import("./deterministic-builder-BYHR4q3g.js");
          k.value = await I(P, { contracts: v }), g.value = k.value.validationReport, L(k.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
        } catch (P) {
          M(P);
        } finally {
          $.value = !1;
        }
      }
    }
    function Pe() {
      if (!k.value?.artifactReady || !k.value.zipBytes) return;
      const P = k.value.manifestIdentity, v = `${P?.id || "webwindows-function"}-${P?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-"), I = new Blob([k.value.zipBytes], { type: "application/zip" }), ne = URL.createObjectURL(I), Zs = document.createElement("a");
      Zs.href = ne, Zs.download = `${v}.zip`, Zs.click(), window.setTimeout(() => URL.revokeObjectURL(ne), 0);
    }
    function ge() {
      g.value = null, k.value = null;
    }
    async function We() {
      C.value = !1, B?.dispose().catch(() => {
      }), Y = new Dd({
        onConsole: (P) => {
          const v = N.value || B?.activeSession;
          !v || P?.sessionId !== v.sessionId || P?.snapshotId !== v.snapshotId || (ee.value = [...ee.value, P].slice(-1e3));
        },
        onState: (P) => {
          !N.value || P?.sessionId !== N.value.sessionId || (N.value = { ...N.value, state: P.state });
        }
      }), B = new fp({
        hostClient: Y,
        onBrokerDiagnostic: (P) => {
          fe.value = [...fe.value, P].slice(-500);
        }
      });
      try {
        await Y.connect(O.value), C.value = !0;
      } catch (P) {
        M(P);
      }
    }
    async function kt({ reload: P = !1 } = {}) {
      if (!($.value || !B || !C.value)) {
        $.value = !0;
        try {
          fe.value = [];
          const v = await J(), I = await vs(), ne = P && N.value ? await B.reload(v, { contracts: I }) : await B.run(v, { contracts: I });
          if (g.value = ne.validationReport, k.value = null, oe.value = ne.started ? "console" : "problems", pe.value = "preview", !ne.started) {
            L(`Developer Preview 被 ${ne.validationReport.errorCount} 个验证错误阻止。`);
            return;
          }
          N.value = ne.session, L(P ? "Developer Preview 已从新 Snapshot 重新加载。" : "Developer Preview 已启动。");
        } catch (v) {
          M(v);
        } finally {
          $.value = !1;
        }
      }
    }
    async function ds() {
      if (!(!B || !N.value))
        try {
          await B.stop(N.value.sessionId), N.value = null, fe.value = [], L("Developer Preview 已停止，会话凭据已撤销。");
        } catch (P) {
          M(P);
        }
    }
    function Se() {
      ee.value = [];
    }
    function Fe() {
      B?.clearBrokerDiagnostics(), fe.value = [];
    }
    function Hs(P) {
      return P.arguments.map((v) => typeof v == "string" ? v : JSON.stringify(v)).join(" ");
    }
    function Bs(P) {
      const v = l.value.find((I) => I.kind === "file" && (P.path === I.path || P.path?.startsWith(`${I.path}$`)));
      v && m(v.path).catch(M);
    }
    function Us(P, v, I) {
      return Nn({ kind: "text", title: P, message: v, value: I });
    }
    function Mr(P, v) {
      return Nn({ kind: "confirm", title: P, message: v, value: "" });
    }
    function Nn(P) {
      return it && it(null), me.value = { ...P }, new Promise((v) => {
        it = v;
      });
    }
    function Cr(P) {
      const v = it;
      it = null, me.value = null, v?.(P);
    }
    return (P, v) => (D(), z("main", hp, [
      y("header", yp, [
        v[20] || (v[20] = y("div", { class: "studio-brand" }, [
          y("strong", null, "Developer Studio"),
          y("span", null, "WebWindows Function IDE")
        ], -1)),
        y("button", {
          class: "primary",
          type: "button",
          onClick: Et
        }, "新建功能"),
        y("select", {
          "aria-label": "打开项目",
          value: a.value?.uuid || "",
          onChange: v[0] || (v[0] = (I) => Pt(I.target.value).catch(M))
        }, [
          v[19] || (v[19] = y("option", {
            value: "",
            disabled: ""
          }, "打开项目…", -1)),
          (D(!0), z(se, null, Ze(r.value, (I) => (D(), z("option", {
            key: I.uuid,
            value: I.uuid
          }, R(I.displayName), 9, wp))), 128))
        ], 40, gp),
        y("button", {
          type: "button",
          disabled: !a.value,
          onClick: Vs
        }, "重命名项目", 8, vp),
        y("button", {
          type: "button",
          disabled: !a.value,
          onClick: Ot
        }, "删除项目", 8, bp),
        v[21] || (v[21] = y("span", { class: "toolbar-spacer" }, null, -1)),
        y("button", {
          type: "button",
          disabled: !a.value || $.value,
          onClick: K
        }, "Validate", 8, Pp),
        y("button", {
          class: "primary",
          type: "button",
          disabled: !a.value || $.value,
          onClick: be
        }, "Build", 8, kp),
        y("button", {
          class: "primary",
          type: "button",
          disabled: !a.value || $.value || !C.value,
          onClick: v[1] || (v[1] = (I) => kt())
        }, "Run", 8, $p),
        y("button", {
          type: "button",
          disabled: !N.value || $.value,
          onClick: v[2] || (v[2] = (I) => kt({ reload: !0 }))
        }, "Reload", 8, Ip),
        y("button", {
          type: "button",
          disabled: !N.value,
          onClick: ds
        }, "Stop", 8, qp)
      ]),
      a.value ? (D(), z("section", Sp, [
        y("aside", xp, [
          y("div", _p, [
            y("span", null, "Project · " + R(a.value.displayName), 1),
            y("div", Ap, [
              y("button", {
                type: "button",
                title: "新建文件",
                onClick: v[3] || (v[3] = (I) => _("file"))
              }, "＋F"),
              y("button", {
                type: "button",
                title: "新建目录",
                onClick: v[4] || (v[4] = (I) => _("directory"))
              }, "＋D"),
              y("button", {
                type: "button",
                title: "重命名",
                disabled: !u.value,
                onClick: F
              }, "R", 8, jp),
              y("button", {
                type: "button",
                title: "删除",
                disabled: !u.value,
                onClick: T
              }, "×", 8, Ep)
            ])
          ]),
          y("div", Op, [
            (D(!0), z(se, null, Ze(ot.value, (I) => (D(), dr(gu, {
              key: I.path,
              node: I,
              "selected-path": u.value,
              onSelect: Cn
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ]),
        y("section", Tp, [
          y("nav", Mp, [
            (D(!0), z(se, null, Ze(s.value, (I) => (D(), z("button", {
              key: I,
              type: "button",
              class: we(["editor-tab", { active: I === o.value }]),
              onClick: (ne) => m(I).catch(M)
            }, [
              y("span", null, R(Yi(an)(I)), 1),
              n.value.has(I) ? (D(), z("span", Np, "•")) : _e("", !0)
            ], 10, Cp))), 128))
          ]),
          y("div", Lp, [
            Wt.value?.kind === "file" ? (D(), dr(bu, {
              key: `${a.value.uuid}:${o.value}`,
              "project-id": a.value.uuid,
              path: o.value,
              language: at.value,
              value: c.value,
              markers: ze.value,
              "onUpdate:value": b,
              onSave: v[5] || (v[5] = (I) => j().then(() => L("已保存。")).catch(M)),
              onError: M
            }, null, 8, ["project-id", "path", "language", "value", "markers"])) : (D(), z("div", Rp, [...v[22] || (v[22] = [
              y("h2", null, "选择文件开始编辑", -1),
              y("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ])
        ]),
        y("aside", Dp, [
          y("div", zp, [
            v[23] || (v[23] = y("span", null, "Inspector", -1)),
            y("div", Wp, [
              y("button", {
                type: "button",
                class: we({ active: pe.value === "manifest" }),
                onClick: v[6] || (v[6] = (I) => pe.value = "manifest")
              }, "Manifest", 2),
              y("button", {
                type: "button",
                class: we({ active: pe.value === "permissions" }),
                onClick: v[7] || (v[7] = (I) => pe.value = "permissions")
              }, "Permissions", 2),
              y("button", {
                type: "button",
                class: we({ active: pe.value === "preview" }),
                onClick: v[8] || (v[8] = (I) => pe.value = "preview")
              }, "Preview", 2)
            ])
          ]),
          fs(y("div", Fp, [
            y("h2", null, "Manifest " + R(us.value === 2 ? "v2" : us.value === 1 ? "v1" : "unsupported"), 1),
            y("p", Vp, "项目 UUID：" + R(a.value.uuid), 1),
            Ge(tc, {
              manifest: i.value,
              diagnostics: d.value,
              "permission-registry": h.value,
              "broker-methods": p.value,
              "onUpdate:manifest": v[9] || (v[9] = (I) => S(I).catch(M)),
              onOpenJson: v[10] || (v[10] = (I) => m("manifest.json").catch(M))
            }, null, 8, ["manifest", "diagnostics", "permission-registry", "broker-methods"]),
            y("section", Hp, [
              v[33] || (v[33] = y("h3", null, "Validation", -1)),
              g.value ? (D(), z("dl", Up, [
                y("div", null, [
                  v[24] || (v[24] = y("dt", null, "Result", -1)),
                  y("dd", null, R(g.value.passed ? "Passed" : "Blocked"), 1)
                ]),
                y("div", null, [
                  v[25] || (v[25] = y("dt", null, "Errors", -1)),
                  y("dd", null, R(g.value.errorCount), 1)
                ]),
                y("div", null, [
                  v[26] || (v[26] = y("dt", null, "Warnings", -1)),
                  y("dd", null, R(g.value.warningCount), 1)
                ]),
                y("div", null, [
                  v[27] || (v[27] = y("dt", null, "Files", -1)),
                  y("dd", null, R(g.value.packageFacts.fileCount), 1)
                ]),
                y("div", null, [
                  v[28] || (v[28] = y("dt", null, "Bytes", -1)),
                  y("dd", null, R(g.value.packageFacts.unpackedBytes), 1)
                ])
              ])) : (D(), z("p", Bp, "尚未创建 Snapshot 验证。")),
              k.value ? (D(), z(se, { key: 2 }, [
                v[32] || (v[32] = y("h3", null, "Build Result", -1)),
                k.value.artifactReady ? (D(), z("dl", Kp, [
                  y("div", null, [
                    v[29] || (v[29] = y("dt", null, "Size", -1)),
                    y("dd", null, R(k.value.zipSize) + " bytes", 1)
                  ]),
                  y("div", null, [
                    v[30] || (v[30] = y("dt", null, "Files", -1)),
                    y("dd", null, R(k.value.fileCount), 1)
                  ]),
                  y("div", Jp, [
                    v[31] || (v[31] = y("dt", null, "SHA-256", -1)),
                    y("dd", null, R(k.value.sha256), 1)
                  ])
                ])) : (D(), z("p", Zp, "验证未通过，没有生成可发布 ZIP。")),
                y("button", {
                  type: "button",
                  disabled: !k.value.artifactReady,
                  onClick: Pe
                }, "Export ZIP", 8, Gp)
              ], 64)) : _e("", !0)
            ])
          ], 512), [
            [Hr, pe.value === "manifest"]
          ]),
          fs(y("div", Xp, [
            v[34] || (v[34] = y("h2", null, "Permission Inspector", -1)),
            Ge(nc, {
              manifest: i.value,
              "permission-registry": h.value,
              "broker-methods": p.value,
              "runtime-compatibility": f.value,
              decisions: fe.value
            }, null, 8, ["manifest", "permission-registry", "broker-methods", "runtime-compatibility", "decisions"])
          ], 512), [
            [Hr, pe.value === "permissions"]
          ]),
          fs(y("div", Yp, [
            y("div", Qp, [
              v[35] || (v[35] = y("strong", null, "Developer Preview", -1)),
              N.value ? (D(), z("span", ef, R(N.value.state) + " · " + R(N.value.snapshotId), 1)) : (D(), z("span", tf, "无活动会话"))
            ]),
            y("iframe", {
              ref_key: "previewHostFrame",
              ref: O,
              class: "preview-host-frame",
              src: "developer-preview-host.html?v=20260829-1",
              title: "Trusted Developer Preview Host",
              referrerpolicy: "no-referrer",
              onLoad: We
            }, null, 544)
          ], 512), [
            [Hr, pe.value === "preview"]
          ])
        ])
      ])) : (D(), z("section", sf, [
        v[36] || (v[36] = y("h2", null, "创建第一个 WebWindows 功能", -1)),
        v[37] || (v[37] = y("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        y("button", {
          class: "primary",
          type: "button",
          onClick: Et
        }, "新建 Hello WebWindows")
      ])),
      vt.value ? (D(), z("section", rf, [
        v[38] || (v[38] = y("div", null, [
          y("strong", null, "项目存储需要修复"),
          y("span", null, "仅在错误持续出现时使用；修复会删除此浏览器中的 Developer Studio 项目。")
        ], -1)),
        y("button", {
          type: "button",
          onClick: U
        }, "修复项目存储")
      ])) : _e("", !0),
      y("section", nf, [
        y("div", of, [
          y("button", {
            type: "button",
            class: we({ active: oe.value === "problems" }),
            onClick: v[11] || (v[11] = (I) => oe.value = "problems")
          }, [
            v[39] || (v[39] = ae("Problems ", -1)),
            y("span", null, R(cs.value.length), 1)
          ], 2),
          y("button", {
            type: "button",
            class: we({ active: oe.value === "console" }),
            onClick: v[12] || (v[12] = (I) => oe.value = "console")
          }, [
            v[40] || (v[40] = ae("Console ", -1)),
            y("span", null, R(ee.value.length), 1)
          ], 2),
          y("button", {
            type: "button",
            class: we({ active: oe.value === "broker" }),
            onClick: v[13] || (v[13] = (I) => oe.value = "broker")
          }, [
            v[41] || (v[41] = ae("Permissions ", -1)),
            y("span", null, R(fe.value.length), 1)
          ], 2),
          v[43] || (v[43] = y("span", { class: "bottom-spacer" }, null, -1)),
          oe.value === "console" ? (D(), z(se, { key: 0 }, [
            fs(y("select", {
              "onUpdate:modelValue": v[14] || (v[14] = (I) => rt.value = I),
              "aria-label": "Console level"
            }, [
              v[42] || (v[42] = y("option", { value: "all" }, "All levels", -1)),
              (D(), z(se, null, Ze(["log", "info", "warn", "error", "debug"], (I) => y("option", {
                key: I,
                value: I
              }, R(I), 9, af)), 64))
            ], 512), [
              [ru, rt.value]
            ]),
            y("button", {
              type: "button",
              onClick: Se
            }, "Clear")
          ], 64)) : oe.value === "broker" ? (D(), z("button", {
            key: 1,
            type: "button",
            onClick: Fe
          }, "Clear")) : _e("", !0)
        ]),
        oe.value === "problems" ? (D(), z(se, { key: 0 }, [
          cs.value.length ? _e("", !0) : (D(), z("div", lf, "当前 Snapshot 未发现问题。")),
          (D(!0), z(se, null, Ze(cs.value, (I, ne) => (D(), z("button", {
            key: `${I.ruleId}:${I.path}:${ne}`,
            type: "button",
            class: "problem-row",
            onClick: (Zs) => Bs(I)
          }, [
            y("span", {
              class: we(["problem-severity", I.severity])
            }, R(I.ruleId), 3),
            y("code", null, R(I.path), 1),
            y("span", null, R(I.message), 1)
          ], 8, uf))), 128))
        ], 64)) : oe.value === "console" ? (D(), z(se, { key: 1 }, [
          Fs.value.length ? _e("", !0) : (D(), z("div", cf, "当前 Developer Preview 尚无 Console 输出。")),
          (D(!0), z(se, null, Ze(Fs.value, (I) => (D(), z("div", {
            key: `${I.sessionId}:${I.sequence}`,
            class: we(["console-row", I.level])
          }, [
            y("time", null, R(I.timestamp), 1),
            y("strong", null, R(I.level), 1),
            y("span", null, R(Hs(I)), 1),
            y("code", null, R(I.snapshotId), 1)
          ], 2))), 128))
        ], 64)) : (D(), z(se, { key: 2 }, [
          fe.value.length ? _e("", !0) : (D(), z("div", df, "当前 Preview 尚无 Broker permission diagnostics。")),
          (D(!0), z(se, null, Ze(fe.value, (I, ne) => (D(), z("div", {
            key: `${I.sessionId}:${I.requestId}:${ne}`,
            class: "broker-row"
          }, [
            y("time", null, R(I.timestamp), 1),
            y("code", null, R(I.method || "protocol"), 1),
            y("span", null, R(I.permission || "—"), 1),
            y("span", null, "declared: " + R(I.declared == null ? "n/a" : I.declared ? "yes" : "no"), 1),
            y("span", null, "policy: " + R(I.policyDecision), 1),
            y("span", null, "grant: " + R(I.grantState || "n/a"), 1),
            y("span", null, "capability: " + R(I.capabilityState), 1),
            y("strong", {
              class: we(I.finalDecision)
            }, R(I.denialReason || I.resultCategory), 3)
          ]))), 128))
        ], 64))
      ]),
      Ee.value ? (D(), z("div", {
        key: 3,
        class: we(["studio-status", nt.value]),
        role: "status"
      }, R(Ee.value), 3)) : _e("", !0),
      me.value ? (D(), z("div", {
        key: 4,
        class: "studio-dialog-backdrop",
        onKeydown: v[18] || (v[18] = au((I) => Cr(me.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        y("form", {
          class: "studio-dialog",
          onSubmit: v[17] || (v[17] = On((I) => Cr(me.value.kind === "confirm" ? !0 : me.value.value), ["prevent"]))
        }, [
          y("h2", null, R(me.value.title), 1),
          y("p", null, R(me.value.message), 1),
          me.value.kind === "text" ? fs((D(), z("input", {
            key: 0,
            "onUpdate:modelValue": v[15] || (v[15] = (I) => me.value.value = I),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [su, me.value.value]
          ]) : _e("", !0),
          y("div", pf, [
            y("button", {
              type: "button",
              onClick: v[16] || (v[16] = (I) => Cr(me.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            y("button", ff, R(me.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : _e("", !0)
    ]));
  }
};
cu(mf).mount("#developer-studio-app");
export {
  At as a,
  gr as g,
  rd as s,
  ln as v
};
