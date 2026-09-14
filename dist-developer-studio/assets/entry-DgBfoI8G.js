/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function qn(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const r of e.split(",")) t[r] = 1;
  return (r) => r in t;
}
const Q = {}, Qt = [], ot = () => {
}, Hi = () => !1, _r = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Sn = (e) => e.startsWith("onUpdate:"), Me = Object.assign, xn = (e, t) => {
  const r = e.indexOf(t);
  r > -1 && e.splice(r, 1);
}, la = Object.prototype.hasOwnProperty, X = (e, t) => la.call(e, t), H = Array.isArray, es = (e) => Us(e) === "[object Map]", Cr = (e) => Us(e) === "[object Set]", Yn = (e) => Us(e) === "[object Date]", B = (e) => typeof e == "function", ge = (e) => typeof e == "string", at = (e) => typeof e == "symbol", ne = (e) => e !== null && typeof e == "object", Bi = (e) => (ne(e) || B(e)) && B(e.then) && B(e.catch), Ui = Object.prototype.toString, Us = (e) => Ui.call(e), ua = (e) => Us(e).slice(8, -1), Ki = (e) => Us(e) === "[object Object]", An = (e) => ge(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Es = /* @__PURE__ */ qn(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Mr = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((r) => t[r] || (t[r] = e(r)));
}, ca = /-\w/g, Xe = Mr(
  (e) => e.replace(ca, (t) => t.slice(1).toUpperCase())
), da = /\B([A-Z])/g, Ct = Mr(
  (e) => e.replace(da, "-$1").toLowerCase()
), Nr = Mr((e) => e.charAt(0).toUpperCase() + e.slice(1)), Gr = Mr(
  (e) => e ? `on${Nr(e)}` : ""
), Et = (e, t) => !Object.is(e, t), dr = (e, ...t) => {
  for (let r = 0; r < e.length; r++)
    e[r](...t);
}, Zi = (e, t, r, a = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: a,
    value: r
  });
}, mr = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Qn;
const Lr = () => Qn || (Qn = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function jn(e) {
  if (H(e)) {
    const t = {};
    for (let r = 0; r < e.length; r++) {
      const a = e[r], l = ge(a) ? ma(a) : jn(a);
      if (l)
        for (const u in l)
          t[u] = l[u];
    }
    return t;
  } else if (ge(e) || ne(e))
    return e;
}
const pa = /;(?![^(]*\))/g, fa = /:([^]+)/, ha = /\/\*[^]*?\*\//g;
function ma(e) {
  const t = {};
  return e.replace(ha, "").split(pa).forEach((r) => {
    if (r) {
      const a = r.split(fa);
      a.length > 1 && (t[a[0].trim()] = a[1].trim());
    }
  }), t;
}
function ue(e) {
  let t = "";
  if (ge(e))
    t = e;
  else if (H(e))
    for (let r = 0; r < e.length; r++) {
      const a = ue(e[r]);
      a && (t += a + " ");
    }
  else if (ne(e))
    for (const r in e)
      e[r] && (t += r + " ");
  return t.trim();
}
const ya = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", ga = /* @__PURE__ */ qn(ya);
function Ji(e) {
  return !!e || e === "";
}
function wa(e, t) {
  if (e.length !== t.length) return !1;
  let r = !0;
  for (let a = 0; r && a < e.length; a++)
    r = Dr(e[a], t[a]);
  return r;
}
function Dr(e, t) {
  if (e === t) return !0;
  let r = Yn(e), a = Yn(t);
  if (r || a)
    return r && a ? e.getTime() === t.getTime() : !1;
  if (r = at(e), a = at(t), r || a)
    return e === t;
  if (r = H(e), a = H(t), r || a)
    return r && a ? wa(e, t) : !1;
  if (r = ne(e), a = ne(t), r || a) {
    if (!r || !a)
      return !1;
    const l = Object.keys(e).length, u = Object.keys(t).length;
    if (l !== u)
      return !1;
    for (const s in e) {
      const o = e.hasOwnProperty(s), c = t.hasOwnProperty(s);
      if (o && !c || !o && c || !Dr(e[s], t[s]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function va(e, t) {
  return e.findIndex((r) => Dr(r, t));
}
const Gi = (e) => !!(e && e.__v_isRef === !0), N = (e) => ge(e) ? e : e == null ? "" : H(e) || ne(e) && (e.toString === Ui || !B(e.toString)) ? Gi(e) ? N(e.value) : JSON.stringify(e, Xi, 2) : String(e), Xi = (e, t) => Gi(t) ? Xi(e, t.value) : es(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (r, [a, l], u) => (r[Xr(a, u) + " =>"] = l, r),
    {}
  )
} : Cr(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((r) => Xr(r))
} : at(t) ? Xr(t) : ne(t) && !H(t) && !Ki(t) ? String(t) : t, Xr = (e, t = "") => {
  var r;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    at(e) ? `Symbol(${(r = e.description) != null ? r : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ze;
class ba {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = ze, !t && ze && (this.index = (ze.scopes || (ze.scopes = [])).push(
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
      const r = ze;
      try {
        return ze = this, t();
      } finally {
        ze = r;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = ze, ze = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (ze = this.prevScope, this.prevScope = void 0);
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
function ka() {
  return ze;
}
let te;
const Yr = /* @__PURE__ */ new WeakSet();
class Yi {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, ze && ze.active && ze.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Yr.has(this) && (Yr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || eo(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, ei(this), to(this);
    const t = te, r = tt;
    te = this, tt = !0;
    try {
      return this.fn();
    } finally {
      so(this), te = t, tt = r, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Tn(t);
      this.deps = this.depsTail = void 0, ei(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Yr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    dn(this) && this.run();
  }
  get dirty() {
    return dn(this);
  }
}
let Qi = 0, Os, Ts;
function eo(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Ts, Ts = e;
    return;
  }
  e.next = Os, Os = e;
}
function En() {
  Qi++;
}
function On() {
  if (--Qi > 0)
    return;
  if (Ts) {
    let t = Ts;
    for (Ts = void 0; t; ) {
      const r = t.next;
      t.next = void 0, t.flags &= -9, t = r;
    }
  }
  let e;
  for (; Os; ) {
    let t = Os;
    for (Os = void 0; t; ) {
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
function to(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function so(e) {
  let t, r = e.depsTail, a = r;
  for (; a; ) {
    const l = a.prevDep;
    a.version === -1 ? (a === r && (r = l), Tn(a), Pa(a)) : t = a, a.dep.activeLink = a.prevActiveLink, a.prevActiveLink = void 0, a = l;
  }
  e.deps = t, e.depsTail = r;
}
function dn(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (ro(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function ro(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ls) || (e.globalVersion = Ls, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !dn(e))))
    return;
  e.flags |= 2;
  const t = e.dep, r = te, a = tt;
  te = e, tt = !0;
  try {
    to(e);
    const l = e.fn(e._value);
    (t.version === 0 || Et(l, e._value)) && (e.flags |= 128, e._value = l, t.version++);
  } catch (l) {
    throw t.version++, l;
  } finally {
    te = r, tt = a, so(e), e.flags &= -3;
  }
}
function Tn(e, t = !1) {
  const { dep: r, prevSub: a, nextSub: l } = e;
  if (a && (a.nextSub = l, e.prevSub = void 0), l && (l.prevSub = a, e.nextSub = void 0), r.subs === e && (r.subs = a, !a && r.computed)) {
    r.computed.flags &= -5;
    for (let u = r.computed.deps; u; u = u.nextDep)
      Tn(u, !0);
  }
  !t && !--r.sc && r.map && r.map.delete(r.key);
}
function Pa(e) {
  const { prevDep: t, nextDep: r } = e;
  t && (t.nextDep = r, e.prevDep = void 0), r && (r.prevDep = t, e.nextDep = void 0);
}
let tt = !0;
const no = [];
function kt() {
  no.push(tt), tt = !1;
}
function Pt() {
  const e = no.pop();
  tt = e === void 0 ? !0 : e;
}
function ei(e) {
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
let Ls = 0;
class $a {
  constructor(t, r) {
    this.sub = t, this.dep = r, this.version = r.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class _n {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!te || !tt || te === this.computed)
      return;
    let r = this.activeLink;
    if (r === void 0 || r.sub !== te)
      r = this.activeLink = new $a(te, this), te.deps ? (r.prevDep = te.depsTail, te.depsTail.nextDep = r, te.depsTail = r) : te.deps = te.depsTail = r, io(r);
    else if (r.version === -1 && (r.version = this.version, r.nextDep)) {
      const a = r.nextDep;
      a.prevDep = r.prevDep, r.prevDep && (r.prevDep.nextDep = a), r.prevDep = te.depsTail, r.nextDep = void 0, te.depsTail.nextDep = r, te.depsTail = r, te.deps === r && (te.deps = a);
    }
    return r;
  }
  trigger(t) {
    this.version++, Ls++, this.notify(t);
  }
  notify(t) {
    En();
    try {
      for (let r = this.subs; r; r = r.prevSub)
        r.sub.notify() && r.sub.dep.notify();
    } finally {
      On();
    }
  }
}
function io(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let a = t.deps; a; a = a.nextDep)
        io(a);
    }
    const r = e.dep.subs;
    r !== e && (e.prevSub = r, r && (r.nextSub = e)), e.dep.subs = e;
  }
}
const pn = /* @__PURE__ */ new WeakMap(), Bt = Symbol(
  ""
), fn = Symbol(
  ""
), Ds = Symbol(
  ""
);
function xe(e, t, r) {
  if (tt && te) {
    let a = pn.get(e);
    a || pn.set(e, a = /* @__PURE__ */ new Map());
    let l = a.get(r);
    l || (a.set(r, l = new _n()), l.map = a, l.key = r), l.track();
  }
}
function yt(e, t, r, a, l, u) {
  const s = pn.get(e);
  if (!s) {
    Ls++;
    return;
  }
  const o = (c) => {
    c && c.trigger();
  };
  if (En(), t === "clear")
    s.forEach(o);
  else {
    const c = H(e), n = c && An(r);
    if (c && r === "length") {
      const i = Number(a);
      s.forEach((d, y) => {
        (y === "length" || y === Ds || !at(y) && y >= i) && o(d);
      });
    } else
      switch ((r !== void 0 || s.has(void 0)) && o(s.get(r)), n && o(s.get(Ds)), t) {
        case "add":
          c ? n && o(s.get("length")) : (o(s.get(Bt)), es(e) && o(s.get(fn)));
          break;
        case "delete":
          c || (o(s.get(Bt)), es(e) && o(s.get(fn)));
          break;
        case "set":
          es(e) && o(s.get(Bt));
          break;
      }
  }
  On();
}
function Jt(e) {
  const t = G(e);
  return t === e ? t : (xe(t, "iterate", Ds), Ge(e) ? t : t.map($e));
}
function zr(e) {
  return xe(e = G(e), "iterate", Ds), e;
}
const Ia = {
  __proto__: null,
  [Symbol.iterator]() {
    return Qr(this, Symbol.iterator, $e);
  },
  concat(...e) {
    return Jt(this).concat(
      ...e.map((t) => H(t) ? Jt(t) : t)
    );
  },
  entries() {
    return Qr(this, "entries", (e) => (e[1] = $e(e[1]), e));
  },
  every(e, t) {
    return pt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return pt(this, "filter", e, t, (r) => r.map($e), arguments);
  },
  find(e, t) {
    return pt(this, "find", e, t, $e, arguments);
  },
  findIndex(e, t) {
    return pt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return pt(this, "findLast", e, t, $e, arguments);
  },
  findLastIndex(e, t) {
    return pt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return pt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return en(this, "includes", e);
  },
  indexOf(...e) {
    return en(this, "indexOf", e);
  },
  join(e) {
    return Jt(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return en(this, "lastIndexOf", e);
  },
  map(e, t) {
    return pt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Ps(this, "pop");
  },
  push(...e) {
    return Ps(this, "push", e);
  },
  reduce(e, ...t) {
    return ti(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return ti(this, "reduceRight", e, t);
  },
  shift() {
    return Ps(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return pt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Ps(this, "splice", e);
  },
  toReversed() {
    return Jt(this).toReversed();
  },
  toSorted(e) {
    return Jt(this).toSorted(e);
  },
  toSpliced(...e) {
    return Jt(this).toSpliced(...e);
  },
  unshift(...e) {
    return Ps(this, "unshift", e);
  },
  values() {
    return Qr(this, "values", $e);
  }
};
function Qr(e, t, r) {
  const a = zr(e), l = a[t]();
  return a !== e && !Ge(e) && (l._next = l.next, l.next = () => {
    const u = l._next();
    return u.value && (u.value = r(u.value)), u;
  }), l;
}
const qa = Array.prototype;
function pt(e, t, r, a, l, u) {
  const s = zr(e), o = s !== e && !Ge(e), c = s[t];
  if (c !== qa[t]) {
    const d = c.apply(e, u);
    return o ? $e(d) : d;
  }
  let n = r;
  s !== e && (o ? n = function(d, y) {
    return r.call(this, $e(d), y, e);
  } : r.length > 2 && (n = function(d, y) {
    return r.call(this, d, y, e);
  }));
  const i = c.call(s, n, a);
  return o && l ? l(i) : i;
}
function ti(e, t, r, a) {
  const l = zr(e);
  let u = r;
  return l !== e && (Ge(e) ? r.length > 3 && (u = function(s, o, c) {
    return r.call(this, s, o, c, e);
  }) : u = function(s, o, c) {
    return r.call(this, s, $e(o), c, e);
  }), l[t](u, ...a);
}
function en(e, t, r) {
  const a = G(e);
  xe(a, "iterate", Ds);
  const l = a[t](...r);
  return (l === -1 || l === !1) && Ln(r[0]) ? (r[0] = G(r[0]), a[t](...r)) : l;
}
function Ps(e, t, r = []) {
  kt(), En();
  const a = G(e)[t].apply(e, r);
  return On(), Pt(), a;
}
const Sa = /* @__PURE__ */ qn("__proto__,__v_isRef,__isVue"), oo = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(at)
);
function xa(e) {
  at(e) || (e = String(e));
  const t = G(this);
  return xe(t, "has", e), t.hasOwnProperty(e);
}
class ao {
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
      return a === (l ? u ? La : po : u ? co : uo).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(a) ? t : void 0;
    const s = H(t);
    if (!l) {
      let c;
      if (s && (c = Ia[r]))
        return c;
      if (r === "hasOwnProperty")
        return xa;
    }
    const o = Reflect.get(
      t,
      r,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      je(t) ? t : a
    );
    return (at(r) ? oo.has(r) : Sa(r)) || (l || xe(t, "get", r), u) ? o : je(o) ? s && An(r) ? o : o.value : ne(o) ? l ? fo(o) : Mn(o) : o;
  }
}
class lo extends ao {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, r, a, l) {
    let u = t[r];
    if (!this._isShallow) {
      const c = Ot(u);
      if (!Ge(a) && !Ot(a) && (u = G(u), a = G(a)), !H(t) && je(u) && !je(a))
        return c || (u.value = a), !0;
    }
    const s = H(t) && An(r) ? Number(r) < t.length : X(t, r), o = Reflect.set(
      t,
      r,
      a,
      je(t) ? t : l
    );
    return t === G(l) && (s ? Et(a, u) && yt(t, "set", r, a) : yt(t, "add", r, a)), o;
  }
  deleteProperty(t, r) {
    const a = X(t, r);
    t[r];
    const l = Reflect.deleteProperty(t, r);
    return l && a && yt(t, "delete", r, void 0), l;
  }
  has(t, r) {
    const a = Reflect.has(t, r);
    return (!at(r) || !oo.has(r)) && xe(t, "has", r), a;
  }
  ownKeys(t) {
    return xe(
      t,
      "iterate",
      H(t) ? "length" : Bt
    ), Reflect.ownKeys(t);
  }
}
class Aa extends ao {
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
const ja = /* @__PURE__ */ new lo(), Ea = /* @__PURE__ */ new Aa(), Oa = /* @__PURE__ */ new lo(!0);
const hn = (e) => e, nr = (e) => Reflect.getPrototypeOf(e);
function Ta(e, t, r) {
  return function(...a) {
    const l = this.__v_raw, u = G(l), s = es(u), o = e === "entries" || e === Symbol.iterator && s, c = e === "keys" && s, n = l[e](...a), i = r ? hn : t ? yr : $e;
    return !t && xe(
      u,
      "iterate",
      c ? fn : Bt
    ), {
      // iterator protocol
      next() {
        const { value: d, done: y } = n.next();
        return y ? { value: d, done: y } : {
          value: o ? [i(d[0]), i(d[1])] : i(d),
          done: y
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function ir(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function _a(e, t) {
  const r = {
    get(l) {
      const u = this.__v_raw, s = G(u), o = G(l);
      e || (Et(l, o) && xe(s, "get", l), xe(s, "get", o));
      const { has: c } = nr(s), n = t ? hn : e ? yr : $e;
      if (c.call(s, l))
        return n(u.get(l));
      if (c.call(s, o))
        return n(u.get(o));
      u !== s && u.get(l);
    },
    get size() {
      const l = this.__v_raw;
      return !e && xe(G(l), "iterate", Bt), l.size;
    },
    has(l) {
      const u = this.__v_raw, s = G(u), o = G(l);
      return e || (Et(l, o) && xe(s, "has", l), xe(s, "has", o)), l === o ? u.has(l) : u.has(l) || u.has(o);
    },
    forEach(l, u) {
      const s = this, o = s.__v_raw, c = G(o), n = t ? hn : e ? yr : $e;
      return !e && xe(c, "iterate", Bt), o.forEach((i, d) => l.call(u, n(i), n(d), s));
    }
  };
  return Me(
    r,
    e ? {
      add: ir("add"),
      set: ir("set"),
      delete: ir("delete"),
      clear: ir("clear")
    } : {
      add(l) {
        !t && !Ge(l) && !Ot(l) && (l = G(l));
        const u = G(this);
        return nr(u).has.call(u, l) || (u.add(l), yt(u, "add", l, l)), this;
      },
      set(l, u) {
        !t && !Ge(u) && !Ot(u) && (u = G(u));
        const s = G(this), { has: o, get: c } = nr(s);
        let n = o.call(s, l);
        n || (l = G(l), n = o.call(s, l));
        const i = c.call(s, l);
        return s.set(l, u), n ? Et(u, i) && yt(s, "set", l, u) : yt(s, "add", l, u), this;
      },
      delete(l) {
        const u = G(this), { has: s, get: o } = nr(u);
        let c = s.call(u, l);
        c || (l = G(l), c = s.call(u, l)), o && o.call(u, l);
        const n = u.delete(l);
        return c && yt(u, "delete", l, void 0), n;
      },
      clear() {
        const l = G(this), u = l.size !== 0, s = l.clear();
        return u && yt(
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
    r[l] = Ta(l, e, t);
  }), r;
}
function Cn(e, t) {
  const r = _a(e, t);
  return (a, l, u) => l === "__v_isReactive" ? !e : l === "__v_isReadonly" ? e : l === "__v_raw" ? a : Reflect.get(
    X(r, l) && l in a ? r : a,
    l,
    u
  );
}
const Ca = {
  get: /* @__PURE__ */ Cn(!1, !1)
}, Ma = {
  get: /* @__PURE__ */ Cn(!1, !0)
}, Na = {
  get: /* @__PURE__ */ Cn(!0, !1)
};
const uo = /* @__PURE__ */ new WeakMap(), co = /* @__PURE__ */ new WeakMap(), po = /* @__PURE__ */ new WeakMap(), La = /* @__PURE__ */ new WeakMap();
function Da(e) {
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
function za(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Da(ua(e));
}
function Mn(e) {
  return Ot(e) ? e : Nn(
    e,
    !1,
    ja,
    Ca,
    uo
  );
}
function Ra(e) {
  return Nn(
    e,
    !1,
    Oa,
    Ma,
    co
  );
}
function fo(e) {
  return Nn(
    e,
    !0,
    Ea,
    Na,
    po
  );
}
function Nn(e, t, r, a, l) {
  if (!ne(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const u = za(e);
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
function ts(e) {
  return Ot(e) ? ts(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Ot(e) {
  return !!(e && e.__v_isReadonly);
}
function Ge(e) {
  return !!(e && e.__v_isShallow);
}
function Ln(e) {
  return e ? !!e.__v_raw : !1;
}
function G(e) {
  const t = e && e.__v_raw;
  return t ? G(t) : e;
}
function Wa(e) {
  return !X(e, "__v_skip") && Object.isExtensible(e) && Zi(e, "__v_skip", !0), e;
}
const $e = (e) => ne(e) ? Mn(e) : e, yr = (e) => ne(e) ? fo(e) : e;
function je(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function K(e) {
  return Fa(e, !1);
}
function Fa(e, t) {
  return je(e) ? e : new Va(e, t);
}
class Va {
  constructor(t, r) {
    this.dep = new _n(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = r ? t : G(t), this._value = r ? t : $e(t), this.__v_isShallow = r;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const r = this._rawValue, a = this.__v_isShallow || Ge(t) || Ot(t);
    t = a ? t : G(t), Et(t, r) && (this._rawValue = t, this._value = a ? t : $e(t), this.dep.trigger());
  }
}
function ho(e) {
  return je(e) ? e.value : e;
}
const Ha = {
  get: (e, t, r) => t === "__v_raw" ? e : ho(Reflect.get(e, t, r)),
  set: (e, t, r, a) => {
    const l = e[t];
    return je(l) && !je(r) ? (l.value = r, !0) : Reflect.set(e, t, r, a);
  }
};
function mo(e) {
  return ts(e) ? e : new Proxy(e, Ha);
}
class Ba {
  constructor(t, r, a) {
    this.fn = t, this.setter = r, this._value = void 0, this.dep = new _n(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ls - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !r, this.isSSR = a;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    te !== this)
      return eo(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return ro(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Ua(e, t, r = !1) {
  let a, l;
  return B(e) ? a = e : (a = e.get, l = e.set), new Ba(a, l, r);
}
const or = {}, gr = /* @__PURE__ */ new WeakMap();
let Wt;
function Ka(e, t = !1, r = Wt) {
  if (r) {
    let a = gr.get(r);
    a || gr.set(r, a = []), a.push(e);
  }
}
function Za(e, t, r = Q) {
  const { immediate: a, deep: l, once: u, scheduler: s, augmentJob: o, call: c } = r, n = (D) => l ? D : Ge(D) || l === !1 || l === 0 ? gt(D, 1) : gt(D);
  let i, d, y, p, h = !1, w = !1;
  if (je(e) ? (d = () => e.value, h = Ge(e)) : ts(e) ? (d = () => n(e), h = !0) : H(e) ? (w = !0, h = e.some((D) => ts(D) || Ge(D)), d = () => e.map((D) => {
    if (je(D))
      return D.value;
    if (ts(D))
      return n(D);
    if (B(D))
      return c ? c(D, 2) : D();
  })) : B(e) ? t ? d = c ? () => c(e, 2) : e : d = () => {
    if (y) {
      kt();
      try {
        y();
      } finally {
        Pt();
      }
    }
    const D = Wt;
    Wt = i;
    try {
      return c ? c(e, 3, [p]) : e(p);
    } finally {
      Wt = D;
    }
  } : d = ot, t && l) {
    const D = d, ee = l === !0 ? 1 / 0 : l;
    d = () => gt(D(), ee);
  }
  const $ = ka(), I = () => {
    i.stop(), $ && $.active && xn($.effects, i);
  };
  if (u && t) {
    const D = t;
    t = (...ee) => {
      D(...ee), I();
    };
  }
  let M = w ? new Array(e.length).fill(or) : or;
  const L = (D) => {
    if (!(!(i.flags & 1) || !i.dirty && !D))
      if (t) {
        const ee = i.run();
        if (l || h || (w ? ee.some((ve, ce) => Et(ve, M[ce])) : Et(ee, M))) {
          y && y();
          const ve = Wt;
          Wt = i;
          try {
            const ce = [
              ee,
              // pass undefined as the old value when it's changed for the first time
              M === or ? void 0 : w && M[0] === or ? [] : M,
              p
            ];
            M = ee, c ? c(t, 3, ce) : (
              // @ts-expect-error
              t(...ce)
            );
          } finally {
            Wt = ve;
          }
        }
      } else
        i.run();
  };
  return o && o(L), i = new Yi(d), i.scheduler = s ? () => s(L, !1) : L, p = (D) => Ka(D, !1, i), y = i.onStop = () => {
    const D = gr.get(i);
    if (D) {
      if (c)
        c(D, 4);
      else
        for (const ee of D) ee();
      gr.delete(i);
    }
  }, t ? a ? L(!0) : M = i.run() : s ? s(L.bind(null, !0), !0) : i.run(), I.pause = i.pause.bind(i), I.resume = i.resume.bind(i), I.stop = I, I;
}
function gt(e, t = 1 / 0, r) {
  if (t <= 0 || !ne(e) || e.__v_skip || (r = r || /* @__PURE__ */ new Map(), (r.get(e) || 0) >= t))
    return e;
  if (r.set(e, t), t--, je(e))
    gt(e.value, t, r);
  else if (H(e))
    for (let a = 0; a < e.length; a++)
      gt(e[a], t, r);
  else if (Cr(e) || es(e))
    e.forEach((a) => {
      gt(a, t, r);
    });
  else if (Ki(e)) {
    for (const a in e)
      gt(e[a], t, r);
    for (const a of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, a) && gt(e[a], t, r);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Ks(e, t, r, a) {
  try {
    return a ? e(...a) : e();
  } catch (l) {
    Rr(l, t, r);
  }
}
function lt(e, t, r, a) {
  if (B(e)) {
    const l = Ks(e, t, r, a);
    return l && Bi(l) && l.catch((u) => {
      Rr(u, t, r);
    }), l;
  }
  if (H(e)) {
    const l = [];
    for (let u = 0; u < e.length; u++)
      l.push(lt(e[u], t, r, a));
    return l;
  }
}
function Rr(e, t, r, a = !0) {
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
      kt(), Ks(u, null, 10, [
        e,
        c,
        n
      ]), Pt();
      return;
    }
  }
  Ja(e, r, l, a, s);
}
function Ja(e, t, r, a = !0, l = !1) {
  if (l)
    throw e;
  console.error(e);
}
const Ce = [];
let nt = -1;
const ss = [];
let At = null, Yt = 0;
const yo = /* @__PURE__ */ Promise.resolve();
let wr = null;
function Dn(e) {
  const t = wr || yo;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Ga(e) {
  let t = nt + 1, r = Ce.length;
  for (; t < r; ) {
    const a = t + r >>> 1, l = Ce[a], u = zs(l);
    u < e || u === e && l.flags & 2 ? t = a + 1 : r = a;
  }
  return t;
}
function zn(e) {
  if (!(e.flags & 1)) {
    const t = zs(e), r = Ce[Ce.length - 1];
    !r || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= zs(r) ? Ce.push(e) : Ce.splice(Ga(t), 0, e), e.flags |= 1, go();
  }
}
function go() {
  wr || (wr = yo.then(vo));
}
function Xa(e) {
  H(e) ? ss.push(...e) : At && e.id === -1 ? At.splice(Yt + 1, 0, e) : e.flags & 1 || (ss.push(e), e.flags |= 1), go();
}
function si(e, t, r = nt + 1) {
  for (; r < Ce.length; r++) {
    const a = Ce[r];
    if (a && a.flags & 2) {
      if (e && a.id !== e.uid)
        continue;
      Ce.splice(r, 1), r--, a.flags & 4 && (a.flags &= -2), a(), a.flags & 4 || (a.flags &= -2);
    }
  }
}
function wo(e) {
  if (ss.length) {
    const t = [...new Set(ss)].sort(
      (r, a) => zs(r) - zs(a)
    );
    if (ss.length = 0, At) {
      At.push(...t);
      return;
    }
    for (At = t, Yt = 0; Yt < At.length; Yt++) {
      const r = At[Yt];
      r.flags & 4 && (r.flags &= -2), r.flags & 8 || r(), r.flags &= -2;
    }
    At = null, Yt = 0;
  }
}
const zs = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function vo(e) {
  try {
    for (nt = 0; nt < Ce.length; nt++) {
      const t = Ce[nt];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Ks(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; nt < Ce.length; nt++) {
      const t = Ce[nt];
      t && (t.flags &= -2);
    }
    nt = -1, Ce.length = 0, wo(), wr = null, (Ce.length || ss.length) && vo();
  }
}
let Ue = null, bo = null;
function vr(e) {
  const t = Ue;
  return Ue = e, bo = e && e.type.__scopeId || null, t;
}
function Ya(e, t = Ue, r) {
  if (!t || e._n)
    return e;
  const a = (...l) => {
    a._d && fi(-1);
    const u = vr(t);
    let s;
    try {
      s = e(...l);
    } finally {
      vr(u), a._d && fi(1);
    }
    return s;
  };
  return a._n = !0, a._c = !0, a._d = !0, a;
}
function St(e, t) {
  if (Ue === null)
    return e;
  const r = Hr(Ue), a = e.dirs || (e.dirs = []);
  for (let l = 0; l < t.length; l++) {
    let [u, s, o, c = Q] = t[l];
    u && (B(u) && (u = {
      mounted: u,
      updated: u
    }), u.deep && gt(s), a.push({
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
function Lt(e, t, r, a) {
  const l = e.dirs, u = t && t.dirs;
  for (let s = 0; s < l.length; s++) {
    const o = l[s];
    u && (o.oldValue = u[s].value);
    let c = o.dir[a];
    c && (kt(), lt(c, r, 8, [
      e.el,
      o,
      e,
      t
    ]), Pt());
  }
}
const Qa = Symbol("_vte"), el = (e) => e.__isTeleport, tl = Symbol("_leaveCb");
function Rn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Rn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function ko(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const br = /* @__PURE__ */ new WeakMap();
function _s(e, t, r, a, l = !1) {
  if (H(e)) {
    e.forEach(
      (h, w) => _s(
        h,
        t && (H(t) ? t[w] : t),
        r,
        a,
        l
      )
    );
    return;
  }
  if (Cs(a) && !l) {
    a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && _s(e, t, r, a.component.subTree);
    return;
  }
  const u = a.shapeFlag & 4 ? Hr(a.component) : a.el, s = l ? null : u, { i: o, r: c } = e, n = t && t.r, i = o.refs === Q ? o.refs = {} : o.refs, d = o.setupState, y = G(d), p = d === Q ? Hi : (h) => X(y, h);
  if (n != null && n !== c) {
    if (ri(t), ge(n))
      i[n] = null, p(n) && (d[n] = null);
    else if (je(n)) {
      n.value = null;
      const h = t;
      h.k && (i[h.k] = null);
    }
  }
  if (B(c))
    Ks(c, o, 12, [s, i]);
  else {
    const h = ge(c), w = je(c);
    if (h || w) {
      const $ = () => {
        if (e.f) {
          const I = h ? p(c) ? d[c] : i[c] : c.value;
          if (l)
            H(I) && xn(I, u);
          else if (H(I))
            I.includes(u) || I.push(u);
          else if (h)
            i[c] = [u], p(c) && (d[c] = i[c]);
          else {
            const M = [u];
            c.value = M, e.k && (i[e.k] = M);
          }
        } else h ? (i[c] = s, p(c) && (d[c] = s)) : w && (c.value = s, e.k && (i[e.k] = s));
      };
      if (s) {
        const I = () => {
          $(), br.delete(e);
        };
        I.id = -1, br.set(e, I), Ve(I, r);
      } else
        ri(e), $();
    }
  }
}
function ri(e) {
  const t = br.get(e);
  t && (t.flags |= 8, br.delete(e));
}
Lr().requestIdleCallback;
Lr().cancelIdleCallback;
const Cs = (e) => !!e.type.__asyncLoader, Po = (e) => e.type.__isKeepAlive;
function sl(e, t) {
  $o(e, "a", t);
}
function rl(e, t) {
  $o(e, "da", t);
}
function $o(e, t, r = Ae) {
  const a = e.__wdc || (e.__wdc = () => {
    let l = r;
    for (; l; ) {
      if (l.isDeactivated)
        return;
      l = l.parent;
    }
    return e();
  });
  if (Wr(t, a, r), r) {
    let l = r.parent;
    for (; l && l.parent; )
      Po(l.parent.vnode) && nl(a, t, r, l), l = l.parent;
  }
}
function nl(e, t, r, a) {
  const l = Wr(
    t,
    e,
    a,
    !0
    /* prepend */
  );
  Io(() => {
    xn(a[t], l);
  }, r);
}
function Wr(e, t, r = Ae, a = !1) {
  if (r) {
    const l = r[e] || (r[e] = []), u = t.__weh || (t.__weh = (...s) => {
      kt();
      const o = Zs(r), c = lt(t, r, e, s);
      return o(), Pt(), c;
    });
    return a ? l.unshift(u) : l.push(u), u;
  }
}
const $t = (e) => (t, r = Ae) => {
  (!Ws || e === "sp") && Wr(e, (...a) => t(...a), r);
}, il = $t("bm"), Wn = $t("m"), ol = $t(
  "bu"
), al = $t("u"), Fn = $t(
  "bum"
), Io = $t("um"), ll = $t(
  "sp"
), ul = $t("rtg"), cl = $t("rtc");
function dl(e, t = Ae) {
  Wr("ec", e, t);
}
const pl = "components";
function fl(e, t) {
  return ml(pl, e, !0, t) || e;
}
const hl = Symbol.for("v-ndc");
function ml(e, t, r = !0, a = !1) {
  const l = Ue || Ae;
  if (l) {
    const u = l.type;
    {
      const o = nu(
        u,
        !1
      );
      if (o && (o === t || o === Xe(t) || o === Nr(Xe(t))))
        return u;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      ni(l[e] || u[e], t) || // global registration
      ni(l.appContext[e], t)
    );
    return !s && a ? u : s;
  }
}
function ni(e, t) {
  return e && (e[t] || e[Xe(t)] || e[Nr(Xe(t))]);
}
function Je(e, t, r, a) {
  let l;
  const u = r, s = H(e);
  if (s || ge(e)) {
    const o = s && ts(e);
    let c = !1, n = !1;
    o && (c = !Ge(e), n = Ot(e), e = zr(e)), l = new Array(e.length);
    for (let i = 0, d = e.length; i < d; i++)
      l[i] = t(
        c ? n ? yr($e(e[i])) : $e(e[i]) : e[i],
        i,
        void 0,
        u
      );
  } else if (typeof e == "number") {
    l = new Array(e);
    for (let o = 0; o < e; o++)
      l[o] = t(o + 1, o, void 0, u);
  } else if (ne(e))
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
const mn = (e) => e ? Bo(e) ? Hr(e) : mn(e.parent) : null, Ms = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Me(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => mn(e.parent),
    $root: (e) => mn(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => So(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      zn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Dn.bind(e.proxy)),
    $watch: (e) => Ll.bind(e)
  })
), tn = (e, t) => e !== Q && !e.__isScriptSetup && X(e, t), yl = {
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
        if (tn(a, t))
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
        yn && (s[t] = 0);
      }
    }
    const i = Ms[t];
    let d, y;
    if (i)
      return t === "$attrs" && xe(e.attrs, "get", ""), i(e);
    if (
      // css module (injected by vue-loader)
      (d = o.__cssModules) && (d = d[t])
    )
      return d;
    if (r !== Q && X(r, t))
      return s[t] = 4, r[t];
    if (
      // global properties
      y = c.config.globalProperties, X(y, t)
    )
      return y[t];
  },
  set({ _: e }, t, r) {
    const { data: a, setupState: l, ctx: u } = e;
    return tn(l, t) ? (l[t] = r, !0) : a !== Q && X(a, t) ? (a[t] = r, !0) : X(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (u[t] = r, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: r, ctx: a, appContext: l, propsOptions: u, type: s }
  }, o) {
    let c, n;
    return !!(r[o] || e !== Q && o[0] !== "$" && X(e, o) || tn(t, o) || (c = u[0]) && X(c, o) || X(a, o) || X(Ms, o) || X(l.config.globalProperties, o) || (n = s.__cssModules) && n[o]);
  },
  defineProperty(e, t, r) {
    return r.get != null ? e._.accessCache[t] = 0 : X(r, "value") && this.set(e, t, r.value, null), Reflect.defineProperty(e, t, r);
  }
};
function ii(e) {
  return H(e) ? e.reduce(
    (t, r) => (t[r] = null, t),
    {}
  ) : e;
}
let yn = !0;
function gl(e) {
  const t = So(e), r = e.proxy, a = e.ctx;
  yn = !1, t.beforeCreate && oi(t.beforeCreate, e, "bc");
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
    mounted: y,
    beforeUpdate: p,
    updated: h,
    activated: w,
    deactivated: $,
    beforeDestroy: I,
    beforeUnmount: M,
    destroyed: L,
    unmounted: D,
    render: ee,
    renderTracked: ve,
    renderTriggered: ce,
    errorCaptured: we,
    serverPrefetch: ut,
    // public API
    expose: Ne,
    inheritAttrs: ct,
    // assets
    components: It,
    directives: Mt,
    filters: Pe
  } = t;
  if (n && wl(n, a, null), s)
    for (const Z in s) {
      const F = s[Z];
      B(F) && (a[Z] = F.bind(r));
    }
  if (l) {
    const Z = l.call(r, r);
    ne(Z) && (e.data = Mn(Z));
  }
  if (yn = !0, u)
    for (const Z in u) {
      const F = u[Z], Le = B(F) ? F.bind(r, r) : B(F.get) ? F.get.bind(r, r) : ot, st = !B(F) && B(F.set) ? F.set.bind(r) : ot, Re = _e({
        get: Le,
        set: st
      });
      Object.defineProperty(a, Z, {
        enumerable: !0,
        configurable: !0,
        get: () => Re.value,
        set: (Ie) => Re.value = Ie
      });
    }
  if (o)
    for (const Z in o)
      qo(o[Z], a, r, Z);
  if (c) {
    const Z = B(c) ? c.call(r) : c;
    Reflect.ownKeys(Z).forEach((F) => {
      Il(F, Z[F]);
    });
  }
  i && oi(i, e, "c");
  function ie(Z, F) {
    H(F) ? F.forEach((Le) => Z(Le.bind(r))) : F && Z(F.bind(r));
  }
  if (ie(il, d), ie(Wn, y), ie(ol, p), ie(al, h), ie(sl, w), ie(rl, $), ie(dl, we), ie(cl, ve), ie(ul, ce), ie(Fn, M), ie(Io, D), ie(ll, ut), H(Ne))
    if (Ne.length) {
      const Z = e.exposed || (e.exposed = {});
      Ne.forEach((F) => {
        Object.defineProperty(Z, F, {
          get: () => r[F],
          set: (Le) => r[F] = Le,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  ee && e.render === ot && (e.render = ee), ct != null && (e.inheritAttrs = ct), It && (e.components = It), Mt && (e.directives = Mt), ut && ko(e);
}
function wl(e, t, r = ot) {
  H(e) && (e = gn(e));
  for (const a in e) {
    const l = e[a];
    let u;
    ne(l) ? "default" in l ? u = pr(
      l.from || a,
      l.default,
      !0
    ) : u = pr(l.from || a) : u = pr(l), je(u) ? Object.defineProperty(t, a, {
      enumerable: !0,
      configurable: !0,
      get: () => u.value,
      set: (s) => u.value = s
    }) : t[a] = u;
  }
}
function oi(e, t, r) {
  lt(
    H(e) ? e.map((a) => a.bind(t.proxy)) : e.bind(t.proxy),
    t,
    r
  );
}
function qo(e, t, r, a) {
  let l = a.includes(".") ? zo(r, a) : () => r[a];
  if (ge(e)) {
    const u = t[e];
    B(u) && ns(l, u);
  } else if (B(e))
    ns(l, e.bind(r));
  else if (ne(e))
    if (H(e))
      e.forEach((u) => qo(u, t, r, a));
    else {
      const u = B(e.handler) ? e.handler.bind(r) : t[e.handler];
      B(u) && ns(l, u, e);
    }
}
function So(e) {
  const t = e.type, { mixins: r, extends: a } = t, {
    mixins: l,
    optionsCache: u,
    config: { optionMergeStrategies: s }
  } = e.appContext, o = u.get(t);
  let c;
  return o ? c = o : !l.length && !r && !a ? c = t : (c = {}, l.length && l.forEach(
    (n) => kr(c, n, s, !0)
  ), kr(c, t, s)), ne(t) && u.set(t, c), c;
}
function kr(e, t, r, a = !1) {
  const { mixins: l, extends: u } = t;
  u && kr(e, u, r, !0), l && l.forEach(
    (s) => kr(e, s, r, !0)
  );
  for (const s in t)
    if (!(a && s === "expose")) {
      const o = vl[s] || r && r[s];
      e[s] = o ? o(e[s], t[s]) : t[s];
    }
  return e;
}
const vl = {
  data: ai,
  props: li,
  emits: li,
  // objects
  methods: xs,
  computed: xs,
  // lifecycle
  beforeCreate: Te,
  created: Te,
  beforeMount: Te,
  mounted: Te,
  beforeUpdate: Te,
  updated: Te,
  beforeDestroy: Te,
  beforeUnmount: Te,
  destroyed: Te,
  unmounted: Te,
  activated: Te,
  deactivated: Te,
  errorCaptured: Te,
  serverPrefetch: Te,
  // assets
  components: xs,
  directives: xs,
  // watch
  watch: kl,
  // provide / inject
  provide: ai,
  inject: bl
};
function ai(e, t) {
  return t ? e ? function() {
    return Me(
      B(e) ? e.call(this, this) : e,
      B(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function bl(e, t) {
  return xs(gn(e), gn(t));
}
function gn(e) {
  if (H(e)) {
    const t = {};
    for (let r = 0; r < e.length; r++)
      t[e[r]] = e[r];
    return t;
  }
  return e;
}
function Te(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function xs(e, t) {
  return e ? Me(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function li(e, t) {
  return e ? H(e) && H(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Me(
    /* @__PURE__ */ Object.create(null),
    ii(e),
    ii(t ?? {})
  ) : t;
}
function kl(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = Me(/* @__PURE__ */ Object.create(null), e);
  for (const a in t)
    r[a] = Te(e[a], t[a]);
  return r;
}
function xo() {
  return {
    app: null,
    config: {
      isNativeTag: Hi,
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
let Pl = 0;
function $l(e, t) {
  return function(a, l = null) {
    B(a) || (a = Me({}, a)), l != null && !ne(l) && (l = null);
    const u = xo(), s = /* @__PURE__ */ new WeakSet(), o = [];
    let c = !1;
    const n = u.app = {
      _uid: Pl++,
      _component: a,
      _props: l,
      _container: null,
      _context: u,
      _instance: null,
      version: ou,
      get config() {
        return u.config;
      },
      set config(i) {
      },
      use(i, ...d) {
        return s.has(i) || (i && B(i.install) ? (s.add(i), i.install(n, ...d)) : B(i) && (s.add(i), i(n, ...d))), n;
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
      mount(i, d, y) {
        if (!c) {
          const p = n._ceVNode || ke(a, l);
          return p.appContext = u, y === !0 ? y = "svg" : y === !1 && (y = void 0), e(p, i, y), c = !0, n._container = i, i.__vue_app__ = n, Hr(p.component);
        }
      },
      onUnmount(i) {
        o.push(i);
      },
      unmount() {
        c && (lt(
          o,
          n._instance,
          16
        ), e(null, n._container), delete n._container.__vue_app__);
      },
      provide(i, d) {
        return u.provides[i] = d, n;
      },
      runWithContext(i) {
        const d = rs;
        rs = n;
        try {
          return i();
        } finally {
          rs = d;
        }
      }
    };
    return n;
  };
}
let rs = null;
function Il(e, t) {
  if (Ae) {
    let r = Ae.provides;
    const a = Ae.parent && Ae.parent.provides;
    a === r && (r = Ae.provides = Object.create(a)), r[e] = t;
  }
}
function pr(e, t, r = !1) {
  const a = Ql();
  if (a || rs) {
    let l = rs ? rs._context.provides : a ? a.parent == null || a.ce ? a.vnode.appContext && a.vnode.appContext.provides : a.parent.provides : void 0;
    if (l && e in l)
      return l[e];
    if (arguments.length > 1)
      return r && B(t) ? t.call(a && a.proxy) : t;
  }
}
const Ao = {}, jo = () => Object.create(Ao), Eo = (e) => Object.getPrototypeOf(e) === Ao;
function ql(e, t, r, a = !1) {
  const l = {}, u = jo();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Oo(e, t, l, u);
  for (const s in e.propsOptions[0])
    s in l || (l[s] = void 0);
  r ? e.props = a ? l : Ra(l) : e.type.props ? e.props = l : e.props = u, e.attrs = u;
}
function Sl(e, t, r, a) {
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
        let y = i[d];
        if (Fr(e.emitsOptions, y))
          continue;
        const p = t[y];
        if (c)
          if (X(u, y))
            p !== u[y] && (u[y] = p, n = !0);
          else {
            const h = Xe(y);
            l[h] = wn(
              c,
              o,
              h,
              p,
              e,
              !1
            );
          }
        else
          p !== u[y] && (u[y] = p, n = !0);
      }
    }
  } else {
    Oo(e, t, l, u) && (n = !0);
    let i;
    for (const d in o)
      (!t || // for camelCase
      !X(t, d) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((i = Ct(d)) === d || !X(t, i))) && (c ? r && // for camelCase
      (r[d] !== void 0 || // for kebab-case
      r[i] !== void 0) && (l[d] = wn(
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
  n && yt(e.attrs, "set", "");
}
function Oo(e, t, r, a) {
  const [l, u] = e.propsOptions;
  let s = !1, o;
  if (t)
    for (let c in t) {
      if (Es(c))
        continue;
      const n = t[c];
      let i;
      l && X(l, i = Xe(c)) ? !u || !u.includes(i) ? r[i] = n : (o || (o = {}))[i] = n : Fr(e.emitsOptions, c) || (!(c in a) || n !== a[c]) && (a[c] = n, s = !0);
    }
  if (u) {
    const c = G(r), n = o || Q;
    for (let i = 0; i < u.length; i++) {
      const d = u[i];
      r[d] = wn(
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
function wn(e, t, r, a, l, u) {
  const s = e[r];
  if (s != null) {
    const o = X(s, "default");
    if (o && a === void 0) {
      const c = s.default;
      if (s.type !== Function && !s.skipFactory && B(c)) {
        const { propsDefaults: n } = l;
        if (r in n)
          a = n[r];
        else {
          const i = Zs(l);
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
    ] && (a === "" || a === Ct(r)) && (a = !0));
  }
  return a;
}
const xl = /* @__PURE__ */ new WeakMap();
function To(e, t, r = !1) {
  const a = r ? xl : t.propsCache, l = a.get(e);
  if (l)
    return l;
  const u = e.props, s = {}, o = [];
  let c = !1;
  if (!B(e)) {
    const i = (d) => {
      c = !0;
      const [y, p] = To(d, t, !0);
      Me(s, y), p && o.push(...p);
    };
    !r && t.mixins.length && t.mixins.forEach(i), e.extends && i(e.extends), e.mixins && e.mixins.forEach(i);
  }
  if (!u && !c)
    return ne(e) && a.set(e, Qt), Qt;
  if (H(u))
    for (let i = 0; i < u.length; i++) {
      const d = Xe(u[i]);
      ui(d) && (s[d] = Q);
    }
  else if (u)
    for (const i in u) {
      const d = Xe(i);
      if (ui(d)) {
        const y = u[i], p = s[d] = H(y) || B(y) ? { type: y } : Me({}, y), h = p.type;
        let w = !1, $ = !0;
        if (H(h))
          for (let I = 0; I < h.length; ++I) {
            const M = h[I], L = B(M) && M.name;
            if (L === "Boolean") {
              w = !0;
              break;
            } else L === "String" && ($ = !1);
          }
        else
          w = B(h) && h.name === "Boolean";
        p[
          0
          /* shouldCast */
        ] = w, p[
          1
          /* shouldCastTrue */
        ] = $, (w || X(p, "default")) && o.push(d);
      }
    }
  const n = [s, o];
  return ne(e) && a.set(e, n), n;
}
function ui(e) {
  return e[0] !== "$" && !Es(e);
}
const Vn = (e) => e === "_" || e === "_ctx" || e === "$stable", Hn = (e) => H(e) ? e.map(it) : [it(e)], Al = (e, t, r) => {
  if (t._n)
    return t;
  const a = Ya((...l) => Hn(t(...l)), r);
  return a._c = !1, a;
}, _o = (e, t, r) => {
  const a = e._ctx;
  for (const l in e) {
    if (Vn(l)) continue;
    const u = e[l];
    if (B(u))
      t[l] = Al(l, u, a);
    else if (u != null) {
      const s = Hn(u);
      t[l] = () => s;
    }
  }
}, Co = (e, t) => {
  const r = Hn(t);
  e.slots.default = () => r;
}, Mo = (e, t, r) => {
  for (const a in t)
    (r || !Vn(a)) && (e[a] = t[a]);
}, jl = (e, t, r) => {
  const a = e.slots = jo();
  if (e.vnode.shapeFlag & 32) {
    const l = t._;
    l ? (Mo(a, t, r), r && Zi(a, "_", l, !0)) : _o(t, a);
  } else t && Co(e, t);
}, El = (e, t, r) => {
  const { vnode: a, slots: l } = e;
  let u = !0, s = Q;
  if (a.shapeFlag & 32) {
    const o = t._;
    o ? r && o === 1 ? u = !1 : Mo(l, t, r) : (u = !t.$stable, _o(t, l)), s = t;
  } else t && (Co(e, t), s = { default: 1 });
  if (u)
    for (const o in l)
      !Vn(o) && s[o] == null && delete l[o];
}, Ve = Bl;
function Ol(e) {
  return Tl(e);
}
function Tl(e, t) {
  const r = Lr();
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
    nextSibling: y,
    setScopeId: p = ot,
    insertStaticContent: h
  } = e, w = (g, v, P, A = null, S = null, q = null, T = void 0, E = null, j = !!v.dynamicChildren) => {
    if (g === v)
      return;
    g && !$s(g, v) && (A = Ut(g), Ie(g, S, q, !0), g = null), v.patchFlag === -2 && (j = !1, v.dynamicChildren = null);
    const { type: x, ref: R, shapeFlag: C } = v;
    switch (x) {
      case Vr:
        $(g, v, P, A);
        break;
      case Tt:
        I(g, v, P, A);
        break;
      case rn:
        g == null && M(v, P, A, T);
        break;
      case se:
        It(
          g,
          v,
          P,
          A,
          S,
          q,
          T,
          E,
          j
        );
        break;
      default:
        C & 1 ? ee(
          g,
          v,
          P,
          A,
          S,
          q,
          T,
          E,
          j
        ) : C & 6 ? Mt(
          g,
          v,
          P,
          A,
          S,
          q,
          T,
          E,
          j
        ) : (C & 64 || C & 128) && x.process(
          g,
          v,
          P,
          A,
          S,
          q,
          T,
          E,
          j,
          qt
        );
    }
    R != null && S ? _s(R, g && g.ref, q, v || g, !v) : R == null && g && g.ref != null && _s(g.ref, null, q, g, !0);
  }, $ = (g, v, P, A) => {
    if (g == null)
      a(
        v.el = o(v.children),
        P,
        A
      );
    else {
      const S = v.el = g.el;
      v.children !== g.children && n(S, v.children);
    }
  }, I = (g, v, P, A) => {
    g == null ? a(
      v.el = c(v.children || ""),
      P,
      A
    ) : v.el = g.el;
  }, M = (g, v, P, A) => {
    [g.el, g.anchor] = h(
      g.children,
      v,
      P,
      A,
      g.el,
      g.anchor
    );
  }, L = ({ el: g, anchor: v }, P, A) => {
    let S;
    for (; g && g !== v; )
      S = y(g), a(g, P, A), g = S;
    a(v, P, A);
  }, D = ({ el: g, anchor: v }) => {
    let P;
    for (; g && g !== v; )
      P = y(g), l(g), g = P;
    l(v);
  }, ee = (g, v, P, A, S, q, T, E, j) => {
    v.type === "svg" ? T = "svg" : v.type === "math" && (T = "mathml"), g == null ? ve(
      v,
      P,
      A,
      S,
      q,
      T,
      E,
      j
    ) : ut(
      g,
      v,
      S,
      q,
      T,
      E,
      j
    );
  }, ve = (g, v, P, A, S, q, T, E) => {
    let j, x;
    const { props: R, shapeFlag: C, transition: z, dirs: V } = g;
    if (j = g.el = s(
      g.type,
      q,
      R && R.is,
      R
    ), C & 8 ? i(j, g.children) : C & 16 && we(
      g.children,
      j,
      null,
      A,
      S,
      sn(g, q),
      T,
      E
    ), V && Lt(g, null, A, "created"), ce(j, g, g.scopeId, T, A), R) {
      for (const Y in R)
        Y !== "value" && !Es(Y) && u(j, Y, null, R[Y], q, A);
      "value" in R && u(j, "value", null, R.value, q), (x = R.onVnodeBeforeMount) && rt(x, A, g);
    }
    V && Lt(g, null, A, "beforeMount");
    const U = _l(S, z);
    U && z.beforeEnter(j), a(j, v, P), ((x = R && R.onVnodeMounted) || U || V) && Ve(() => {
      x && rt(x, A, g), U && z.enter(j), V && Lt(g, null, A, "mounted");
    }, S);
  }, ce = (g, v, P, A, S) => {
    if (P && p(g, P), A)
      for (let q = 0; q < A.length; q++)
        p(g, A[q]);
    if (S) {
      let q = S.subTree;
      if (v === q || Wo(q.type) && (q.ssContent === v || q.ssFallback === v)) {
        const T = S.vnode;
        ce(
          g,
          T,
          T.scopeId,
          T.slotScopeIds,
          S.parent
        );
      }
    }
  }, we = (g, v, P, A, S, q, T, E, j = 0) => {
    for (let x = j; x < g.length; x++) {
      const R = g[x] = E ? jt(g[x]) : it(g[x]);
      w(
        null,
        R,
        v,
        P,
        A,
        S,
        q,
        T,
        E
      );
    }
  }, ut = (g, v, P, A, S, q, T) => {
    const E = v.el = g.el;
    let { patchFlag: j, dynamicChildren: x, dirs: R } = v;
    j |= g.patchFlag & 16;
    const C = g.props || Q, z = v.props || Q;
    let V;
    if (P && Dt(P, !1), (V = z.onVnodeBeforeUpdate) && rt(V, P, v, g), R && Lt(v, g, P, "beforeUpdate"), P && Dt(P, !0), (C.innerHTML && z.innerHTML == null || C.textContent && z.textContent == null) && i(E, ""), x ? Ne(
      g.dynamicChildren,
      x,
      E,
      P,
      A,
      sn(v, S),
      q
    ) : T || F(
      g,
      v,
      E,
      null,
      P,
      A,
      sn(v, S),
      q,
      !1
    ), j > 0) {
      if (j & 16)
        ct(E, C, z, P, S);
      else if (j & 2 && C.class !== z.class && u(E, "class", null, z.class, S), j & 4 && u(E, "style", C.style, z.style, S), j & 8) {
        const U = v.dynamicProps;
        for (let Y = 0; Y < U.length; Y++) {
          const J = U[Y], qe = C[J], de = z[J];
          (de !== qe || J === "value") && u(E, J, qe, de, S, P);
        }
      }
      j & 1 && g.children !== v.children && i(E, v.children);
    } else !T && x == null && ct(E, C, z, P, S);
    ((V = z.onVnodeUpdated) || R) && Ve(() => {
      V && rt(V, P, v, g), R && Lt(v, g, P, "updated");
    }, A);
  }, Ne = (g, v, P, A, S, q, T) => {
    for (let E = 0; E < v.length; E++) {
      const j = g[E], x = v[E], R = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        j.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (j.type === se || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !$s(j, x) || // - In the case of a component, it could contain anything.
        j.shapeFlag & 198) ? d(j.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          P
        )
      );
      w(
        j,
        x,
        R,
        null,
        A,
        S,
        q,
        T,
        !0
      );
    }
  }, ct = (g, v, P, A, S) => {
    if (v !== P) {
      if (v !== Q)
        for (const q in v)
          !Es(q) && !(q in P) && u(
            g,
            q,
            v[q],
            null,
            S,
            A
          );
      for (const q in P) {
        if (Es(q)) continue;
        const T = P[q], E = v[q];
        T !== E && q !== "value" && u(g, q, E, T, S, A);
      }
      "value" in P && u(g, "value", v.value, P.value, S);
    }
  }, It = (g, v, P, A, S, q, T, E, j) => {
    const x = v.el = g ? g.el : o(""), R = v.anchor = g ? g.anchor : o("");
    let { patchFlag: C, dynamicChildren: z, slotScopeIds: V } = v;
    V && (E = E ? E.concat(V) : V), g == null ? (a(x, P, A), a(R, P, A), we(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      v.children || [],
      P,
      R,
      S,
      q,
      T,
      E,
      j
    )) : C > 0 && C & 64 && z && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    g.dynamicChildren ? (Ne(
      g.dynamicChildren,
      z,
      P,
      S,
      q,
      T,
      E
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (v.key != null || S && v === S.subTree) && No(
      g,
      v,
      !0
      /* shallow */
    )) : F(
      g,
      v,
      P,
      R,
      S,
      q,
      T,
      E,
      j
    );
  }, Mt = (g, v, P, A, S, q, T, E, j) => {
    v.slotScopeIds = E, g == null ? v.shapeFlag & 512 ? S.ctx.activate(
      v,
      P,
      A,
      T,
      j
    ) : Pe(
      v,
      P,
      A,
      S,
      q,
      T,
      j
    ) : Ye(g, v, j);
  }, Pe = (g, v, P, A, S, q, T) => {
    const E = g.component = Yl(
      g,
      A,
      S
    );
    if (Po(g) && (E.ctx.renderer = qt), eu(E, !1, T), E.asyncDep) {
      if (S && S.registerDep(E, ie, T), !g.el) {
        const j = E.subTree = ke(Tt);
        I(null, j, v, P), g.placeholder = j.el;
      }
    } else
      ie(
        E,
        g,
        v,
        P,
        S,
        q,
        T
      );
  }, Ye = (g, v, P) => {
    const A = v.component = g.component;
    if (Vl(g, v, P))
      if (A.asyncDep && !A.asyncResolved) {
        Z(A, v, P);
        return;
      } else
        A.next = v, A.update();
    else
      v.el = g.el, A.vnode = v;
  }, ie = (g, v, P, A, S, q, T) => {
    const E = () => {
      if (g.isMounted) {
        let { next: C, bu: z, u: V, parent: U, vnode: Y } = g;
        {
          const We = Lo(g);
          if (We) {
            C && (C.el = Y.el, Z(g, C, T)), We.asyncDep.then(() => {
              g.isUnmounted || E();
            });
            return;
          }
        }
        let J = C, qe;
        Dt(g, !1), C ? (C.el = Y.el, Z(g, C, T)) : C = Y, z && dr(z), (qe = C.props && C.props.onVnodeBeforeUpdate) && rt(qe, U, C, Y), Dt(g, !0);
        const de = di(g), Ee = g.subTree;
        g.subTree = de, w(
          Ee,
          de,
          // parent may have changed if it's in a teleport
          d(Ee.el),
          // anchor may have changed if it's in a fragment
          Ut(Ee),
          g,
          S,
          q
        ), C.el = de.el, J === null && Hl(g, de.el), V && Ve(V, S), (qe = C.props && C.props.onVnodeUpdated) && Ve(
          () => rt(qe, U, C, Y),
          S
        );
      } else {
        let C;
        const { el: z, props: V } = v, { bm: U, m: Y, parent: J, root: qe, type: de } = g, Ee = Cs(v);
        Dt(g, !1), U && dr(U), !Ee && (C = V && V.onVnodeBeforeMount) && rt(C, J, v), Dt(g, !0);
        {
          qe.ce && // @ts-expect-error _def is private
          qe.ce._def.shadowRoot !== !1 && qe.ce._injectChildStyle(de);
          const We = g.subTree = di(g);
          w(
            null,
            We,
            P,
            A,
            g,
            S,
            q
          ), v.el = We.el;
        }
        if (Y && Ve(Y, S), !Ee && (C = V && V.onVnodeMounted)) {
          const We = v;
          Ve(
            () => rt(C, J, We),
            S
          );
        }
        (v.shapeFlag & 256 || J && Cs(J.vnode) && J.vnode.shapeFlag & 256) && g.a && Ve(g.a, S), g.isMounted = !0, v = P = A = null;
      }
    };
    g.scope.on();
    const j = g.effect = new Yi(E);
    g.scope.off();
    const x = g.update = j.run.bind(j), R = g.job = j.runIfDirty.bind(j);
    R.i = g, R.id = g.uid, j.scheduler = () => zn(R), Dt(g, !0), x();
  }, Z = (g, v, P) => {
    v.component = g;
    const A = g.vnode.props;
    g.vnode = v, g.next = null, Sl(g, v.props, A, P), El(g, v.children, P), kt(), si(g), Pt();
  }, F = (g, v, P, A, S, q, T, E, j = !1) => {
    const x = g && g.children, R = g ? g.shapeFlag : 0, C = v.children, { patchFlag: z, shapeFlag: V } = v;
    if (z > 0) {
      if (z & 128) {
        st(
          x,
          C,
          P,
          A,
          S,
          q,
          T,
          E,
          j
        );
        return;
      } else if (z & 256) {
        Le(
          x,
          C,
          P,
          A,
          S,
          q,
          T,
          E,
          j
        );
        return;
      }
    }
    V & 8 ? (R & 16 && Nt(x, S, q), C !== x && i(P, C)) : R & 16 ? V & 16 ? st(
      x,
      C,
      P,
      A,
      S,
      q,
      T,
      E,
      j
    ) : Nt(x, S, q, !0) : (R & 8 && i(P, ""), V & 16 && we(
      C,
      P,
      A,
      S,
      q,
      T,
      E,
      j
    ));
  }, Le = (g, v, P, A, S, q, T, E, j) => {
    g = g || Qt, v = v || Qt;
    const x = g.length, R = v.length, C = Math.min(x, R);
    let z;
    for (z = 0; z < C; z++) {
      const V = v[z] = j ? jt(v[z]) : it(v[z]);
      w(
        g[z],
        V,
        P,
        null,
        S,
        q,
        T,
        E,
        j
      );
    }
    x > R ? Nt(
      g,
      S,
      q,
      !0,
      !1,
      C
    ) : we(
      v,
      P,
      A,
      S,
      q,
      T,
      E,
      j,
      C
    );
  }, st = (g, v, P, A, S, q, T, E, j) => {
    let x = 0;
    const R = v.length;
    let C = g.length - 1, z = R - 1;
    for (; x <= C && x <= z; ) {
      const V = g[x], U = v[x] = j ? jt(v[x]) : it(v[x]);
      if ($s(V, U))
        w(
          V,
          U,
          P,
          null,
          S,
          q,
          T,
          E,
          j
        );
      else
        break;
      x++;
    }
    for (; x <= C && x <= z; ) {
      const V = g[C], U = v[z] = j ? jt(v[z]) : it(v[z]);
      if ($s(V, U))
        w(
          V,
          U,
          P,
          null,
          S,
          q,
          T,
          E,
          j
        );
      else
        break;
      C--, z--;
    }
    if (x > C) {
      if (x <= z) {
        const V = z + 1, U = V < R ? v[V].el : A;
        for (; x <= z; )
          w(
            null,
            v[x] = j ? jt(v[x]) : it(v[x]),
            P,
            U,
            S,
            q,
            T,
            E,
            j
          ), x++;
      }
    } else if (x > z)
      for (; x <= C; )
        Ie(g[x], S, q, !0), x++;
    else {
      const V = x, U = x, Y = /* @__PURE__ */ new Map();
      for (x = U; x <= z; x++) {
        const Oe = v[x] = j ? jt(v[x]) : it(v[x]);
        Oe.key != null && Y.set(Oe.key, x);
      }
      let J, qe = 0;
      const de = z - U + 1;
      let Ee = !1, We = 0;
      const dt = new Array(de);
      for (x = 0; x < de; x++) dt[x] = 0;
      for (x = V; x <= C; x++) {
        const Oe = g[x];
        if (qe >= de) {
          Ie(Oe, S, q, !0);
          continue;
        }
        let fe;
        if (Oe.key != null)
          fe = Y.get(Oe.key);
        else
          for (J = U; J <= z; J++)
            if (dt[J - U] === 0 && $s(Oe, v[J])) {
              fe = J;
              break;
            }
        fe === void 0 ? Ie(Oe, S, q, !0) : (dt[fe - U] = x + 1, fe >= We ? We = fe : Ee = !0, w(
          Oe,
          v[fe],
          P,
          null,
          S,
          q,
          T,
          E,
          j
        ), qe++);
      }
      const Ys = Ee ? Cl(dt) : Qt;
      for (J = Ys.length - 1, x = de - 1; x >= 0; x--) {
        const Oe = U + x, fe = v[Oe], bs = v[Oe + 1], Qs = Oe + 1 < R ? (
          // #13559, fallback to el placeholder for unresolved async component
          bs.el || bs.placeholder
        ) : A;
        dt[x] === 0 ? w(
          null,
          fe,
          P,
          Qs,
          S,
          q,
          T,
          E,
          j
        ) : Ee && (J < 0 || x !== Ys[J] ? Re(fe, P, Qs, 2) : J--);
      }
    }
  }, Re = (g, v, P, A, S = null) => {
    const { el: q, type: T, transition: E, children: j, shapeFlag: x } = g;
    if (x & 6) {
      Re(g.component.subTree, v, P, A);
      return;
    }
    if (x & 128) {
      g.suspense.move(v, P, A);
      return;
    }
    if (x & 64) {
      T.move(g, v, P, qt);
      return;
    }
    if (T === se) {
      a(q, v, P);
      for (let C = 0; C < j.length; C++)
        Re(j[C], v, P, A);
      a(g.anchor, v, P);
      return;
    }
    if (T === rn) {
      L(g, v, P);
      return;
    }
    if (A !== 2 && x & 1 && E)
      if (A === 0)
        E.beforeEnter(q), a(q, v, P), Ve(() => E.enter(q), S);
      else {
        const { leave: C, delayLeave: z, afterLeave: V } = E, U = () => {
          g.ctx.isUnmounted ? l(q) : a(q, v, P);
        }, Y = () => {
          q._isLeaving && q[tl](
            !0
            /* cancelled */
          ), C(q, () => {
            U(), V && V();
          });
        };
        z ? z(q, U, Y) : Y();
      }
    else
      a(q, v, P);
  }, Ie = (g, v, P, A = !1, S = !1) => {
    const {
      type: q,
      props: T,
      ref: E,
      children: j,
      dynamicChildren: x,
      shapeFlag: R,
      patchFlag: C,
      dirs: z,
      cacheIndex: V
    } = g;
    if (C === -2 && (S = !1), E != null && (kt(), _s(E, null, P, g, !0), Pt()), V != null && (v.renderCache[V] = void 0), R & 256) {
      v.ctx.deactivate(g);
      return;
    }
    const U = R & 1 && z, Y = !Cs(g);
    let J;
    if (Y && (J = T && T.onVnodeBeforeUnmount) && rt(J, v, g), R & 6)
      Ze(g.component, P, A);
    else {
      if (R & 128) {
        g.suspense.unmount(P, A);
        return;
      }
      U && Lt(g, null, v, "beforeUnmount"), R & 64 ? g.type.remove(
        g,
        v,
        P,
        qt,
        A
      ) : x && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !x.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (q !== se || C > 0 && C & 64) ? Nt(
        x,
        v,
        P,
        !1,
        !0
      ) : (q === se && C & 384 || !S && R & 16) && Nt(j, v, P), A && ws(g);
    }
    (Y && (J = T && T.onVnodeUnmounted) || U) && Ve(() => {
      J && rt(J, v, g), U && Lt(g, null, v, "unmounted");
    }, P);
  }, ws = (g) => {
    const { type: v, el: P, anchor: A, transition: S } = g;
    if (v === se) {
      vs(P, A);
      return;
    }
    if (v === rn) {
      D(g);
      return;
    }
    const q = () => {
      l(P), S && !S.persisted && S.afterLeave && S.afterLeave();
    };
    if (g.shapeFlag & 1 && S && !S.persisted) {
      const { leave: T, delayLeave: E } = S, j = () => T(P, q);
      E ? E(g.el, q, j) : j();
    } else
      q();
  }, vs = (g, v) => {
    let P;
    for (; g !== v; )
      P = y(g), l(g), g = P;
    l(v);
  }, Ze = (g, v, P) => {
    const { bum: A, scope: S, job: q, subTree: T, um: E, m: j, a: x } = g;
    ci(j), ci(x), A && dr(A), S.stop(), q && (q.flags |= 8, Ie(T, g, v, P)), E && Ve(E, v), Ve(() => {
      g.isUnmounted = !0;
    }, v);
  }, Nt = (g, v, P, A = !1, S = !1, q = 0) => {
    for (let T = q; T < g.length; T++)
      Ie(g[T], v, P, A, S);
  }, Ut = (g) => {
    if (g.shapeFlag & 6)
      return Ut(g.component.subTree);
    if (g.shapeFlag & 128)
      return g.suspense.next();
    const v = y(g.anchor || g.el), P = v && v[Qa];
    return P ? y(P) : v;
  };
  let Kt = !1;
  const Gs = (g, v, P) => {
    g == null ? v._vnode && Ie(v._vnode, null, null, !0) : w(
      v._vnode || null,
      g,
      v,
      null,
      null,
      null,
      P
    ), v._vnode = g, Kt || (Kt = !0, si(), wo(), Kt = !1);
  }, qt = {
    p: w,
    um: Ie,
    m: Re,
    r: ws,
    mt: Pe,
    mc: we,
    pc: F,
    pbc: Ne,
    n: Ut,
    o: e
  };
  return {
    render: Gs,
    hydrate: void 0,
    createApp: $l(Gs)
  };
}
function sn({ type: e, props: t }, r) {
  return r === "svg" && e === "foreignObject" || r === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : r;
}
function Dt({ effect: e, job: t }, r) {
  r ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function _l(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function No(e, t, r = !1) {
  const a = e.children, l = t.children;
  if (H(a) && H(l))
    for (let u = 0; u < a.length; u++) {
      const s = a[u];
      let o = l[u];
      o.shapeFlag & 1 && !o.dynamicChildren && ((o.patchFlag <= 0 || o.patchFlag === 32) && (o = l[u] = jt(l[u]), o.el = s.el), !r && o.patchFlag !== -2 && No(s, o)), o.type === Vr && // avoid cached text nodes retaining detached dom nodes
      o.patchFlag !== -1 && (o.el = s.el), o.type === Tt && !o.el && (o.el = s.el);
    }
}
function Cl(e) {
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
function Lo(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Lo(t);
}
function ci(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Ml = Symbol.for("v-scx"), Nl = () => pr(Ml);
function ns(e, t, r) {
  return Do(e, t, r);
}
function Do(e, t, r = Q) {
  const { immediate: a, deep: l, flush: u, once: s } = r, o = Me({}, r), c = t && a || !t && u !== "post";
  let n;
  if (Ws) {
    if (u === "sync") {
      const p = Nl();
      n = p.__watcherHandles || (p.__watcherHandles = []);
    } else if (!c) {
      const p = () => {
      };
      return p.stop = ot, p.resume = ot, p.pause = ot, p;
    }
  }
  const i = Ae;
  o.call = (p, h, w) => lt(p, i, h, w);
  let d = !1;
  u === "post" ? o.scheduler = (p) => {
    Ve(p, i && i.suspense);
  } : u !== "sync" && (d = !0, o.scheduler = (p, h) => {
    h ? p() : zn(p);
  }), o.augmentJob = (p) => {
    t && (p.flags |= 4), d && (p.flags |= 2, i && (p.id = i.uid, p.i = i));
  };
  const y = Za(e, t, o);
  return Ws && (n ? n.push(y) : c && y()), y;
}
function Ll(e, t, r) {
  const a = this.proxy, l = ge(e) ? e.includes(".") ? zo(a, e) : () => a[e] : e.bind(a, a);
  let u;
  B(t) ? u = t : (u = t.handler, r = t);
  const s = Zs(this), o = Do(l, u.bind(a), r);
  return s(), o;
}
function zo(e, t) {
  const r = t.split(".");
  return () => {
    let a = e;
    for (let l = 0; l < r.length && a; l++)
      a = a[r[l]];
    return a;
  };
}
const Dl = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Xe(t)}Modifiers`] || e[`${Ct(t)}Modifiers`];
function zl(e, t, ...r) {
  if (e.isUnmounted) return;
  const a = e.vnode.props || Q;
  let l = r;
  const u = t.startsWith("update:"), s = u && Dl(a, t.slice(7));
  s && (s.trim && (l = r.map((i) => ge(i) ? i.trim() : i)), s.number && (l = r.map(mr)));
  let o, c = a[o = Gr(t)] || // also try camelCase event handler (#2249)
  a[o = Gr(Xe(t))];
  !c && u && (c = a[o = Gr(Ct(t))]), c && lt(
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
    e.emitted[o] = !0, lt(
      n,
      e,
      6,
      l
    );
  }
}
const Rl = /* @__PURE__ */ new WeakMap();
function Ro(e, t, r = !1) {
  const a = r ? Rl : t.emitsCache, l = a.get(e);
  if (l !== void 0)
    return l;
  const u = e.emits;
  let s = {}, o = !1;
  if (!B(e)) {
    const c = (n) => {
      const i = Ro(n, t, !0);
      i && (o = !0, Me(s, i));
    };
    !r && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !u && !o ? (ne(e) && a.set(e, null), null) : (H(u) ? u.forEach((c) => s[c] = null) : Me(s, u), ne(e) && a.set(e, s), s);
}
function Fr(e, t) {
  return !e || !_r(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), X(e, t[0].toLowerCase() + t.slice(1)) || X(e, Ct(t)) || X(e, t));
}
function di(e) {
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
    data: y,
    setupState: p,
    ctx: h,
    inheritAttrs: w
  } = e, $ = vr(e);
  let I, M;
  try {
    if (r.shapeFlag & 4) {
      const D = l || a, ee = D;
      I = it(
        n.call(
          ee,
          D,
          i,
          d,
          p,
          y,
          h
        )
      ), M = o;
    } else {
      const D = t;
      I = it(
        D.length > 1 ? D(
          d,
          { attrs: o, slots: s, emit: c }
        ) : D(
          d,
          null
        )
      ), M = t.props ? o : Wl(o);
    }
  } catch (D) {
    Ns.length = 0, Rr(D, e, 1), I = ke(Tt);
  }
  let L = I;
  if (M && w !== !1) {
    const D = Object.keys(M), { shapeFlag: ee } = L;
    D.length && ee & 7 && (u && D.some(Sn) && (M = Fl(
      M,
      u
    )), L = gs(L, M, !1, !0));
  }
  return r.dirs && (L = gs(L, null, !1, !0), L.dirs = L.dirs ? L.dirs.concat(r.dirs) : r.dirs), r.transition && Rn(L, r.transition), I = L, vr($), I;
}
const Wl = (e) => {
  let t;
  for (const r in e)
    (r === "class" || r === "style" || _r(r)) && ((t || (t = {}))[r] = e[r]);
  return t;
}, Fl = (e, t) => {
  const r = {};
  for (const a in e)
    (!Sn(a) || !(a.slice(9) in t)) && (r[a] = e[a]);
  return r;
};
function Vl(e, t, r) {
  const { props: a, children: l, component: u } = e, { props: s, children: o, patchFlag: c } = t, n = u.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (r && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return a ? pi(a, s, n) : !!s;
    if (c & 8) {
      const i = t.dynamicProps;
      for (let d = 0; d < i.length; d++) {
        const y = i[d];
        if (s[y] !== a[y] && !Fr(n, y))
          return !0;
      }
    }
  } else
    return (l || o) && (!o || !o.$stable) ? !0 : a === s ? !1 : a ? s ? pi(a, s, n) : !0 : !!s;
  return !1;
}
function pi(e, t, r) {
  const a = Object.keys(t);
  if (a.length !== Object.keys(e).length)
    return !0;
  for (let l = 0; l < a.length; l++) {
    const u = a[l];
    if (t[u] !== e[u] && !Fr(r, u))
      return !0;
  }
  return !1;
}
function Hl({ vnode: e, parent: t }, r) {
  for (; t; ) {
    const a = t.subTree;
    if (a.suspense && a.suspense.activeBranch === e && (a.el = e.el), a === e)
      (e = t.vnode).el = r, t = t.parent;
    else
      break;
  }
}
const Wo = (e) => e.__isSuspense;
function Bl(e, t) {
  t && t.pendingBranch ? H(e) ? t.effects.push(...e) : t.effects.push(e) : Xa(e);
}
const se = Symbol.for("v-fgt"), Vr = Symbol.for("v-txt"), Tt = Symbol.for("v-cmt"), rn = Symbol.for("v-stc"), Ns = [];
let Ke = null;
function O(e = !1) {
  Ns.push(Ke = e ? null : []);
}
function Ul() {
  Ns.pop(), Ke = Ns[Ns.length - 1] || null;
}
let Rs = 1;
function fi(e, t = !1) {
  Rs += e, e < 0 && Ke && t && (Ke.hasOnce = !0);
}
function Fo(e) {
  return e.dynamicChildren = Rs > 0 ? Ke || Qt : null, Ul(), Rs > 0 && Ke && Ke.push(e), e;
}
function _(e, t, r, a, l, u) {
  return Fo(
    f(
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
function Pr(e, t, r, a, l) {
  return Fo(
    ke(
      e,
      t,
      r,
      a,
      l,
      !0
    )
  );
}
function Vo(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function $s(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Ho = ({ key: e }) => e ?? null, fr = ({
  ref: e,
  ref_key: t,
  ref_for: r
}) => (typeof e == "number" && (e = "" + e), e != null ? ge(e) || je(e) || B(e) ? { i: Ue, r: e, k: t, f: !!r } : e : null);
function f(e, t = null, r = null, a = 0, l = null, u = e === se ? 0 : 1, s = !1, o = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Ho(t),
    ref: t && fr(t),
    scopeId: bo,
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
    ctx: Ue
  };
  return o ? (Bn(c, r), u & 128 && e.normalize(c)) : r && (c.shapeFlag |= ge(r) ? 8 : 16), Rs > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  Ke && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || u & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && Ke.push(c), c;
}
const ke = Kl;
function Kl(e, t = null, r = null, a = 0, l = null, u = !1) {
  if ((!e || e === hl) && (e = Tt), Vo(e)) {
    const o = gs(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return r && Bn(o, r), Rs > 0 && !u && Ke && (o.shapeFlag & 6 ? Ke[Ke.indexOf(e)] = o : Ke.push(o)), o.patchFlag = -2, o;
  }
  if (iu(e) && (e = e.__vccOpts), t) {
    t = Zl(t);
    let { class: o, style: c } = t;
    o && !ge(o) && (t.class = ue(o)), ne(c) && (Ln(c) && !H(c) && (c = Me({}, c)), t.style = jn(c));
  }
  const s = ge(e) ? 1 : Wo(e) ? 128 : el(e) ? 64 : ne(e) ? 4 : B(e) ? 2 : 0;
  return f(
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
function Zl(e) {
  return e ? Ln(e) || Eo(e) ? Me({}, e) : e : null;
}
function gs(e, t, r = !1, a = !1) {
  const { props: l, ref: u, patchFlag: s, children: o, transition: c } = e, n = t ? Jl(l || {}, t) : l, i = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: n,
    key: n && Ho(n),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      r && u ? H(u) ? u.concat(fr(t)) : [u, fr(t)] : fr(t)
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
    ssContent: e.ssContent && gs(e.ssContent),
    ssFallback: e.ssFallback && gs(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return c && a && Rn(
    i,
    c.clone(i)
  ), i;
}
function pe(e = " ", t = 0) {
  return ke(Vr, null, e, t);
}
function le(e = "", t = !1) {
  return t ? (O(), Pr(Tt, null, e)) : ke(Tt, null, e);
}
function it(e) {
  return e == null || typeof e == "boolean" ? ke(Tt) : H(e) ? ke(
    se,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Vo(e) ? jt(e) : ke(Vr, null, String(e));
}
function jt(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : gs(e);
}
function Bn(e, t) {
  let r = 0;
  const { shapeFlag: a } = e;
  if (t == null)
    t = null;
  else if (H(t))
    r = 16;
  else if (typeof t == "object")
    if (a & 65) {
      const l = t.default;
      l && (l._c && (l._d = !1), Bn(e, l()), l._c && (l._d = !0));
      return;
    } else {
      r = 32;
      const l = t._;
      !l && !Eo(t) ? t._ctx = Ue : l === 3 && Ue && (Ue.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else B(t) ? (t = { default: t, _ctx: Ue }, r = 32) : (t = String(t), a & 64 ? (r = 16, t = [pe(t)]) : r = 8);
  e.children = t, e.shapeFlag |= r;
}
function Jl(...e) {
  const t = {};
  for (let r = 0; r < e.length; r++) {
    const a = e[r];
    for (const l in a)
      if (l === "class")
        t.class !== a.class && (t.class = ue([t.class, a.class]));
      else if (l === "style")
        t.style = jn([t.style, a.style]);
      else if (_r(l)) {
        const u = t[l], s = a[l];
        s && u !== s && !(H(u) && u.includes(s)) && (t[l] = u ? [].concat(u, s) : s);
      } else l !== "" && (t[l] = a[l]);
  }
  return t;
}
function rt(e, t, r, a = null) {
  lt(e, t, 7, [
    r,
    a
  ]);
}
const Gl = xo();
let Xl = 0;
function Yl(e, t, r) {
  const a = e.type, l = (t ? t.appContext : e.appContext) || Gl, u = {
    uid: Xl++,
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
    scope: new ba(
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
    propsOptions: To(a, l),
    emitsOptions: Ro(a, l),
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
  return u.ctx = { _: u }, u.root = t ? t.root : u, u.emit = zl.bind(null, u), e.ce && e.ce(u), u;
}
let Ae = null;
const Ql = () => Ae || Ue;
let $r, vn;
{
  const e = Lr(), t = (r, a) => {
    let l;
    return (l = e[r]) || (l = e[r] = []), l.push(a), (u) => {
      l.length > 1 ? l.forEach((s) => s(u)) : l[0](u);
    };
  };
  $r = t(
    "__VUE_INSTANCE_SETTERS__",
    (r) => Ae = r
  ), vn = t(
    "__VUE_SSR_SETTERS__",
    (r) => Ws = r
  );
}
const Zs = (e) => {
  const t = Ae;
  return $r(e), e.scope.on(), () => {
    e.scope.off(), $r(t);
  };
}, hi = () => {
  Ae && Ae.scope.off(), $r(null);
};
function Bo(e) {
  return e.vnode.shapeFlag & 4;
}
let Ws = !1;
function eu(e, t = !1, r = !1) {
  t && vn(t);
  const { props: a, children: l } = e.vnode, u = Bo(e);
  ql(e, a, u, t), jl(e, l, r || t);
  const s = u ? tu(e, t) : void 0;
  return t && vn(!1), s;
}
function tu(e, t) {
  const r = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, yl);
  const { setup: a } = r;
  if (a) {
    kt();
    const l = e.setupContext = a.length > 1 ? ru(e) : null, u = Zs(e), s = Ks(
      a,
      e,
      0,
      [
        e.props,
        l
      ]
    ), o = Bi(s);
    if (Pt(), u(), (o || e.sp) && !Cs(e) && ko(e), o) {
      if (s.then(hi, hi), t)
        return s.then((c) => {
          mi(e, c);
        }).catch((c) => {
          Rr(c, e, 0);
        });
      e.asyncDep = s;
    } else
      mi(e, s);
  } else
    Uo(e);
}
function mi(e, t, r) {
  B(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ne(t) && (e.setupState = mo(t)), Uo(e);
}
function Uo(e, t, r) {
  const a = e.type;
  e.render || (e.render = a.render || ot);
  {
    const l = Zs(e);
    kt();
    try {
      gl(e);
    } finally {
      Pt(), l();
    }
  }
}
const su = {
  get(e, t) {
    return xe(e, "get", ""), e[t];
  }
};
function ru(e) {
  const t = (r) => {
    e.exposed = r || {};
  };
  return {
    attrs: new Proxy(e.attrs, su),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Hr(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(mo(Wa(e.exposed)), {
    get(t, r) {
      if (r in t)
        return t[r];
      if (r in Ms)
        return Ms[r](e);
    },
    has(t, r) {
      return r in t || r in Ms;
    }
  })) : e.proxy;
}
function nu(e, t = !0) {
  return B(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function iu(e) {
  return B(e) && "__vccOpts" in e;
}
const _e = (e, t) => Ua(e, t, Ws), ou = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let bn;
const yi = typeof window < "u" && window.trustedTypes;
if (yi)
  try {
    bn = /* @__PURE__ */ yi.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Ko = bn ? (e) => bn.createHTML(e) : (e) => e, au = "http://www.w3.org/2000/svg", lu = "http://www.w3.org/1998/Math/MathML", mt = typeof document < "u" ? document : null, gi = mt && /* @__PURE__ */ mt.createElement("template"), uu = {
  insert: (e, t, r) => {
    t.insertBefore(e, r || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, r, a) => {
    const l = t === "svg" ? mt.createElementNS(au, e) : t === "mathml" ? mt.createElementNS(lu, e) : r ? mt.createElement(e, { is: r }) : mt.createElement(e);
    return e === "select" && a && a.multiple != null && l.setAttribute("multiple", a.multiple), l;
  },
  createText: (e) => mt.createTextNode(e),
  createComment: (e) => mt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => mt.querySelector(e),
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
      gi.innerHTML = Ko(
        a === "svg" ? `<svg>${e}</svg>` : a === "mathml" ? `<math>${e}</math>` : e
      );
      const o = gi.content;
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
}, cu = Symbol("_vtc");
function du(e, t, r) {
  const a = e[cu];
  a && (t = (t ? [t, ...a] : [...a]).join(" ")), t == null ? e.removeAttribute("class") : r ? e.setAttribute("class", t) : e.className = t;
}
const Ir = Symbol("_vod"), Zo = Symbol("_vsh"), Gt = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(e, { value: t }, { transition: r }) {
    e[Ir] = e.style.display === "none" ? "" : e.style.display, r && t ? r.beforeEnter(e) : Is(e, t);
  },
  mounted(e, { value: t }, { transition: r }) {
    r && t && r.enter(e);
  },
  updated(e, { value: t, oldValue: r }, { transition: a }) {
    !t != !r && (a ? t ? (a.beforeEnter(e), Is(e, !0), a.enter(e)) : a.leave(e, () => {
      Is(e, !1);
    }) : Is(e, t));
  },
  beforeUnmount(e, { value: t }) {
    Is(e, t);
  }
};
function Is(e, t) {
  e.style.display = t ? e[Ir] : "none", e[Zo] = !t;
}
const pu = Symbol(""), fu = /(?:^|;)\s*display\s*:/;
function hu(e, t, r) {
  const a = e.style, l = ge(r);
  let u = !1;
  if (r && !l) {
    if (t)
      if (ge(t))
        for (const s of t.split(";")) {
          const o = s.slice(0, s.indexOf(":")).trim();
          r[o] == null && hr(a, o, "");
        }
      else
        for (const s in t)
          r[s] == null && hr(a, s, "");
    for (const s in r)
      s === "display" && (u = !0), hr(a, s, r[s]);
  } else if (l) {
    if (t !== r) {
      const s = a[pu];
      s && (r += ";" + s), a.cssText = r, u = fu.test(r);
    }
  } else t && e.removeAttribute("style");
  Ir in e && (e[Ir] = u ? a.display : "", e[Zo] && (a.display = "none"));
}
const wi = /\s*!important$/;
function hr(e, t, r) {
  if (H(r))
    r.forEach((a) => hr(e, t, a));
  else if (r == null && (r = ""), t.startsWith("--"))
    e.setProperty(t, r);
  else {
    const a = mu(e, t);
    wi.test(r) ? e.setProperty(
      Ct(a),
      r.replace(wi, ""),
      "important"
    ) : e[a] = r;
  }
}
const vi = ["Webkit", "Moz", "ms"], nn = {};
function mu(e, t) {
  const r = nn[t];
  if (r)
    return r;
  let a = Xe(t);
  if (a !== "filter" && a in e)
    return nn[t] = a;
  a = Nr(a);
  for (let l = 0; l < vi.length; l++) {
    const u = vi[l] + a;
    if (u in e)
      return nn[t] = u;
  }
  return t;
}
const bi = "http://www.w3.org/1999/xlink";
function ki(e, t, r, a, l, u = ga(t)) {
  a && t.startsWith("xlink:") ? r == null ? e.removeAttributeNS(bi, t.slice(6, t.length)) : e.setAttributeNS(bi, t, r) : r == null || u && !Ji(r) ? e.removeAttribute(t) : e.setAttribute(
    t,
    u ? "" : at(r) ? String(r) : r
  );
}
function Pi(e, t, r, a, l) {
  if (t === "innerHTML" || t === "textContent") {
    r != null && (e[t] = t === "innerHTML" ? Ko(r) : r);
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
    o === "boolean" ? r = Ji(r) : r == null && o === "string" ? (r = "", s = !0) : o === "number" && (r = 0, s = !0);
  }
  try {
    e[t] = r;
  } catch {
  }
  s && e.removeAttribute(l || t);
}
function Vt(e, t, r, a) {
  e.addEventListener(t, r, a);
}
function yu(e, t, r, a) {
  e.removeEventListener(t, r, a);
}
const $i = Symbol("_vei");
function gu(e, t, r, a, l = null) {
  const u = e[$i] || (e[$i] = {}), s = u[t];
  if (a && s)
    s.value = a;
  else {
    const [o, c] = wu(t);
    if (a) {
      const n = u[t] = ku(
        a,
        l
      );
      Vt(e, o, n, c);
    } else s && (yu(e, o, s, c), u[t] = void 0);
  }
}
const Ii = /(?:Once|Passive|Capture)$/;
function wu(e) {
  let t;
  if (Ii.test(e)) {
    t = {};
    let a;
    for (; a = e.match(Ii); )
      e = e.slice(0, e.length - a[0].length), t[a[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Ct(e.slice(2)), t];
}
let on = 0;
const vu = /* @__PURE__ */ Promise.resolve(), bu = () => on || (vu.then(() => on = 0), on = Date.now());
function ku(e, t) {
  const r = (a) => {
    if (!a._vts)
      a._vts = Date.now();
    else if (a._vts <= r.attached)
      return;
    lt(
      Pu(a, r.value),
      t,
      5,
      [a]
    );
  };
  return r.value = e, r.attached = bu(), r;
}
function Pu(e, t) {
  if (H(t)) {
    const r = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      r.call(e), e._stopped = !0;
    }, t.map(
      (a) => (l) => !l._stopped && a && a(l)
    );
  } else
    return t;
}
const qi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, $u = (e, t, r, a, l, u) => {
  const s = l === "svg";
  t === "class" ? du(e, a, s) : t === "style" ? hu(e, r, a) : _r(t) ? Sn(t) || gu(e, t, r, a, u) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Iu(e, t, a, s)) ? (Pi(e, t, a), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ki(e, t, a, s, u, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !ge(a)) ? Pi(e, Xe(t), a, u, t) : (t === "true-value" ? e._trueValue = a : t === "false-value" && (e._falseValue = a), ki(e, t, a, s));
};
function Iu(e, t, r, a) {
  if (a)
    return !!(t === "innerHTML" || t === "textContent" || t in e && qi(t) && B(r));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const l = e.tagName;
    if (l === "IMG" || l === "VIDEO" || l === "CANVAS" || l === "SOURCE")
      return !1;
  }
  return qi(t) && ge(r) ? !1 : t in e;
}
const qr = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return H(t) ? (r) => dr(t, r) : t;
};
function qu(e) {
  e.target.composing = !0;
}
function Si(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const is = Symbol("_assign"), Su = {
  created(e, { modifiers: { lazy: t, trim: r, number: a } }, l) {
    e[is] = qr(l);
    const u = a || l.props && l.props.type === "number";
    Vt(e, t ? "change" : "input", (s) => {
      if (s.target.composing) return;
      let o = e.value;
      r && (o = o.trim()), u && (o = mr(o)), e[is](o);
    }), r && Vt(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Vt(e, "compositionstart", qu), Vt(e, "compositionend", Si), Vt(e, "change", Si));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: r, modifiers: { lazy: a, trim: l, number: u } }, s) {
    if (e[is] = qr(s), e.composing) return;
    const o = (u || e.type === "number") && !/^0\d/.test(e.value) ? mr(e.value) : e.value, c = t ?? "";
    o !== c && (document.activeElement === e && e.type !== "range" && (a && t === r || l && e.value.trim() === c) || (e.value = c));
  }
}, xu = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: r } }, a) {
    const l = Cr(t);
    Vt(e, "change", () => {
      const u = Array.prototype.filter.call(e.options, (s) => s.selected).map(
        (s) => r ? mr(Sr(s)) : Sr(s)
      );
      e[is](
        e.multiple ? l ? new Set(u) : u : u[0]
      ), e._assigning = !0, Dn(() => {
        e._assigning = !1;
      });
    }), e[is] = qr(a);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    xi(e, t);
  },
  beforeUpdate(e, t, r) {
    e[is] = qr(r);
  },
  updated(e, { value: t }) {
    e._assigning || xi(e, t);
  }
};
function xi(e, t) {
  const r = e.multiple, a = H(t);
  if (!(r && !a && !Cr(t))) {
    for (let l = 0, u = e.options.length; l < u; l++) {
      const s = e.options[l], o = Sr(s);
      if (r)
        if (a) {
          const c = typeof o;
          c === "string" || c === "number" ? s.selected = t.some((n) => String(n) === String(o)) : s.selected = va(t, o) > -1;
        } else
          s.selected = t.has(o);
      else if (Dr(Sr(s), t)) {
        e.selectedIndex !== l && (e.selectedIndex = l);
        return;
      }
    }
    !r && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function Sr(e) {
  return "_value" in e ? e._value : e.value;
}
const Au = ["ctrl", "shift", "alt", "meta"], ju = {
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
  exact: (e, t) => Au.some((r) => e[`${r}Key`] && !t.includes(r))
}, xr = (e, t) => {
  const r = e._withMods || (e._withMods = {}), a = t.join(".");
  return r[a] || (r[a] = ((l, ...u) => {
    for (let s = 0; s < t.length; s++) {
      const o = ju[t[s]];
      if (o && o(l, t)) return;
    }
    return e(l, ...u);
  }));
}, Eu = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Ou = (e, t) => {
  const r = e._withKeys || (e._withKeys = {}), a = t.join(".");
  return r[a] || (r[a] = ((l) => {
    if (!("key" in l))
      return;
    const u = Ct(l.key);
    if (t.some(
      (s) => s === u || Eu[s] === u
    ))
      return e(l);
  }));
}, Tu = /* @__PURE__ */ Me({ patchProp: $u }, uu);
let Ai;
function _u() {
  return Ai || (Ai = Ol(Tu));
}
const Cu = ((...e) => {
  const t = _u().createApp(...e), { mount: r } = t;
  return t.mount = (a) => {
    const l = Nu(a);
    if (!l) return;
    const u = t._component;
    !B(u) && !u.render && !u.template && (u.template = l.innerHTML), l.nodeType === 1 && (l.textContent = "");
    const s = r(l, !1, Mu(l));
    return l instanceof Element && (l.removeAttribute("v-cloak"), l.setAttribute("data-v-app", "")), s;
  }, t;
});
function Mu(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Nu(e) {
  return ge(e) ? document.querySelector(e) : e;
}
const Lu = { class: "tree-node" }, Du = ["title"], zu = {
  key: 0,
  class: "tree-children"
}, Ru = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
  __name: "FileTreeNode",
  props: {
    node: { type: Object, required: !0 },
    selectedPath: { type: String, default: "" }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const r = t, a = K(!0);
    function l(s) {
      if (s.kind === "directory") return "▰";
      const o = s.name.split(".").pop()?.toLowerCase();
      return { html: "<>", css: "#", js: "JS", json: "{}", svg: "◇" }[o] || "·";
    }
    function u(s) {
      return s.kind === "directory" ? "directory" : `file-${s.name.split(".").pop()?.toLowerCase() || "text"}`;
    }
    return (s, o) => {
      const c = fl("FileTreeNode", !0);
      return O(), _("div", Lu, [
        f("div", {
          class: ue(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: o[1] || (o[1] = (n) => r("select", e.node)),
          onDblclick: o[2] || (o[2] = (n) => e.node.kind === "directory" && (a.value = !a.value))
        }, [
          f("span", {
            class: "tree-toggle",
            onClick: o[0] || (o[0] = xr((n) => e.node.kind === "directory" && (a.value = !a.value), ["stop"]))
          }, N(e.node.kind === "directory" ? a.value ? "⌄" : "›" : ""), 1),
          f("span", {
            class: ue(["tree-icon", u(e.node)])
          }, N(l(e.node)), 3),
          f("span", null, N(e.node.name), 1)
        ], 42, Du),
        e.node.kind === "directory" && a.value ? (O(), _("div", zu, [
          (O(!0), _(se, null, Je(e.node.children, (n) => (O(), Pr(c, {
            key: n.path,
            node: n,
            "selected-path": e.selectedPath,
            onSelect: o[3] || (o[3] = (i) => r("select", i))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : le("", !0)
      ]);
    };
  }
}), Wu = (e, t) => {
  const r = e.__vccOpts || e;
  for (const [a, l] of t)
    r[a] = l;
  return r;
}, Fu = ["width", "height"], Vu = {
  key: 0,
  d: "M6 2.75h7l5 5V21.25H6zM13 3v5h5M12 11v7m-3.5-3.5h7"
}, Hu = {
  key: 1,
  d: "M3 6.25h7l2 2h9v11H3zM12 11v6m-3-3h6"
}, Bu = {
  key: 2,
  d: "m4 17.5 1-4L15.75 2.75l3.5 3.5L8.5 17zM13.75 4.75l3.5 3.5M3.5 21h17"
}, Uu = {
  key: 3,
  d: "M4 6.5h16M9 6.5V3.25h6V6.5m3 0-1 14.25H7L6 6.5m4 4v6.5m4-6.5V17"
}, Ku = {
  key: 4,
  d: "M3.5 4h17v16h-17zM9 4v16M5.5 8h1M5.5 12h1"
}, Zu = {
  key: 5,
  d: "M3.5 4h17v16h-17zM3.5 14.5h17"
}, Ju = {
  key: 6,
  d: "M3.5 4h17v16h-17zM15 4v16M17.5 8h1"
}, Gu = {
  key: 7,
  d: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
}, Xu = {
  key: 8,
  d: "M19.5 15.5A8 8 0 0 1 8.5 4.5a8 8 0 1 0 11 11Z"
}, Yu = {
  key: 9,
  d: "M5 12h.01M12 12h.01M19 12h.01"
}, Qu = {
  __name: "StudioIcon",
  props: {
    name: { type: String, required: !0 },
    size: { type: Number, default: 16 }
  },
  setup(e) {
    return (t, r) => (O(), _("svg", {
      class: "studio-icon",
      width: e.size,
      height: e.size,
      viewBox: "0 0 24 24",
      "aria-hidden": "true"
    }, [
      e.name === "file-add" ? (O(), _("path", Vu)) : e.name === "folder-add" ? (O(), _("path", Hu)) : e.name === "rename" ? (O(), _("path", Bu)) : e.name === "delete" ? (O(), _("path", Uu)) : e.name === "explorer" ? (O(), _("path", Ku)) : e.name === "panel" ? (O(), _("path", Zu)) : e.name === "inspector" ? (O(), _("path", Ju)) : e.name === "sun" ? (O(), _("path", Gu)) : e.name === "moon" ? (O(), _("path", Xu)) : e.name === "more" ? (O(), _("path", Yu)) : le("", !0)
    ], 8, Fu));
  }
}, zt = /* @__PURE__ */ Wu(Qu, [["__scopeId", "data-v-6aaa9340"]]), ec = { class: "monaco-editor-shell" }, tc = {
  key: 0,
  class: "editor-loading"
}, sc = {
  __name: "MonacoEditor",
  props: {
    projectId: { type: String, required: !0 },
    path: { type: String, required: !0 },
    language: { type: String, default: "plaintext" },
    theme: { type: String, default: "light" },
    value: { type: String, default: "" },
    markers: { type: Array, default: () => [] }
  },
  emits: ["update:value", "save", "ready", "error"],
  setup(e, { emit: t }) {
    const r = e, a = t, l = K(null), u = K(!0);
    let s, o, c, n, i = !1, d;
    Wn(async () => {
      try {
        const w = await import("./monaco-runtime-D4730T7L.js").then(($) => $.jz);
        ({ monaco: c } = await w.configureStudioMonaco()), d = w.configureManifestSchemaForText, o = y(), h(o.getValue()), s = c.editor.create(l.value, {
          model: o,
          theme: r.theme === "dark" ? "webwindows-studio-dark" : "webwindows-studio-light",
          automaticLayout: !0,
          minimap: { enabled: !1 },
          fontFamily: "Cascadia Code, Cascadia Mono, Consolas, ui-monospace, monospace",
          fontLigatures: !0,
          fontSize: 13.5,
          lineHeight: 21,
          tabSize: 2,
          insertSpaces: !0,
          folding: !0,
          foldingHighlight: !0,
          glyphMargin: !0,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: !1,
          wordWrap: "off",
          renderWhitespace: "selection",
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: !0, independentColorPoolPerBracketType: !0 },
          guides: { bracketPairs: !0, indentation: !0, highlightActiveIndentation: !0 },
          stickyScroll: { enabled: !0, maxLineCount: 4 },
          smoothScrolling: !0,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 8, bottom: 12 },
          suggest: { showStatusBar: !0, preview: !0 },
          quickSuggestions: { other: !0, comments: !1, strings: !1 },
          parameterHints: { enabled: !0 },
          formatOnPaste: !0,
          accessibilityPageSize: 20
        }), n = s.onDidChangeModelContent(() => {
          const $ = o.getValue();
          h($), i || a("update:value", $);
        }), s.addCommand(c.KeyMod.CtrlCmd | c.KeyCode.KeyS, () => a("save")), u.value = !1, p(), s.focus(), a("ready");
      } catch (w) {
        u.value = !1, a("error", w);
      }
    }), ns(() => r.value, (w) => {
      !o || o.getValue() === w || (i = !0, o.setValue(w), h(w), i = !1);
    }), ns(() => r.markers, p, { deep: !0 }), ns(() => r.theme, (w) => {
      c && c.editor.setTheme(w === "dark" ? "webwindows-studio-dark" : "webwindows-studio-light");
    }), Fn(() => {
      n?.dispose(), s?.dispose();
    });
    function y() {
      const w = c.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(r.projectId)}/${r.path}`), $ = c.editor.getModel(w);
      return $ ? (c.editor.setModelLanguage($, r.language), $.getValue() !== r.value && $.setValue(r.value), $) : c.editor.createModel(r.value, r.language, w);
    }
    function p() {
      !c || !o || c.editor.setModelMarkers(o, "webwindows-manifest", r.markers.map((w) => ({
        severity: w.severity === "warning" ? c.MarkerSeverity.Warning : c.MarkerSeverity.Error,
        message: `${w.path}: ${w.message}`,
        startLineNumber: w.line || 1,
        startColumn: w.column || 1,
        endLineNumber: w.endLine || w.line || 1,
        endColumn: w.endColumn || Math.max(2, (w.column || 1) + 1)
      })));
    }
    function h(w) {
      r.path === "manifest.json" && d?.(w);
    }
    return (w, $) => (O(), _("div", ec, [
      f("div", {
        ref_key: "host",
        ref: l,
        class: "monaco-editor-host"
      }, null, 512),
      u.value ? (O(), _("div", tc, "正在载入本地编辑器…")) : le("", !0)
    ]));
  }
}, rc = 1, ji = 2;
function _t(e) {
  return !e || typeof e != "object" || Array.isArray(e) ? null : Object.prototype.hasOwnProperty.call(e, "manifestVersion") ? e.manifestVersion === ji ? ji : null : rc;
}
const nc = { class: "manifest-inspector" }, ic = { class: "inspector-mode-tabs" }, oc = {
  key: 0,
  class: "inspector-note"
}, ac = {
  key: 1,
  class: "inspector-note error"
}, lc = ["value"], uc = { key: 0 }, cc = ["value"], dc = ["value"], pc = ["value"], fc = ["value"], hc = ["value"], mc = ["value"], yc = ["value"], gc = ["value"], wc = ["value"], vc = ["value"], bc = { class: "check" }, kc = ["checked"], Pc = { class: "check" }, $c = ["checked"], Ic = { class: "check" }, qc = ["checked"], Sc = { class: "check" }, xc = ["checked"], Ac = { class: "check" }, jc = ["checked"], Ec = {
  key: 1,
  class: "permission-fieldset"
}, Oc = { class: "permission-heading" }, Tc = ["checked", "onChange"], _c = { class: "permission-meta" }, Cc = { key: 0 }, Mc = {
  key: 2,
  class: "inspector-note"
}, Nc = { class: "inspector-summary" }, Lc = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] },
    language: { type: String, default: "zh" },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const r = e, a = t, l = K("form"), u = _e(() => r.manifest && typeof r.manifest == "object" && !Array.isArray(r.manifest)), s = _e(() => {
      if (!u.value) return "—";
      const y = _t(r.manifest);
      return y === 1 ? {
        en: "1 (legacy implicit)",
        tw: "1（相容隱含版本）",
        jp: "1（互換の暗黙バージョン）"
      }[r.language] || "1（兼容隐式版本）" : y === 2 ? "2" : `不支持（${String(r.manifest.manifestVersion)}）`;
    }), o = _e(() => _t(r.manifest) === 2), c = _e(() => {
      const y = new Set(r.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
      return (r.permissionRegistry?.permissions || []).filter((p) => p.sourceDeclarable === !0 && y.has(p.id));
    });
    function n(y) {
      const p = (r.brokerMethods?.methods || []).filter((h) => h.requiredPermission === y.id);
      return {
        description: y.description || y.publicApiTargets?.join(", ") || "未登记公共 API 目标",
        consent: p[0]?.consent || y.prompt || "未指定",
        pilot: p.some((h) => h.currentStatus === "enabled") ? "预览试点已启用" : "仅有试点契约",
        methods: p.map((h) => h.id)
      };
    }
    function i(y, p) {
      const h = new Set(Array.isArray(r.manifest.permissions) ? r.manifest.permissions : []);
      p ? h.add(y) : h.delete(y);
      const w = c.value.map(($) => $.id);
      d(["permissions"], w.filter(($) => h.has($)));
    }
    function d(y, p) {
      if (!u.value) return;
      const h = JSON.parse(JSON.stringify(r.manifest));
      let w = h;
      y.slice(0, -1).forEach(($) => {
        (!w[$] || typeof w[$] != "object") && (w[$] = {}), w = w[$];
      }), w[y.at(-1)] = p, a("update:manifest", h);
    }
    return (y, p) => (O(), _("div", nc, [
      f("div", ic, [
        f("button", {
          type: "button",
          class: ue({ active: l.value === "form" }),
          onClick: p[0] || (p[0] = (h) => l.value = "form")
        }, "表单", 2),
        f("button", {
          type: "button",
          class: ue({ active: l.value === "json" }),
          onClick: p[1] || (p[1] = (h) => {
            l.value = "json", a("open-json");
          })
        }, "JSON", 2)
      ]),
      l.value === "json" ? (O(), _("div", oc, [
        p[18] || (p[18] = pe(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        f("button", {
          type: "button",
          onClick: p[2] || (p[2] = (h) => a("open-json"))
        }, "打开 manifest.json")
      ])) : u.value ? (O(), _("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: p[17] || (p[17] = xr(() => {
        }, ["prevent"]))
      }, [
        f("label", null, [
          p[19] || (p[19] = pe("Manifest 版本", -1)),
          f("input", {
            value: s.value,
            readonly: ""
          }, null, 8, lc)
        ]),
        o.value ? (O(), _("label", uc, [
          p[20] || (p[20] = pe("SDK API 版本", -1)),
          f("input", {
            value: e.manifest.sdk?.apiVersion,
            readonly: ""
          }, null, 8, cc)
        ])) : le("", !0),
        f("label", null, [
          p[21] || (p[21] = pe("ID", -1)),
          f("input", {
            value: e.manifest.id,
            onInput: p[3] || (p[3] = (h) => d(["id"], h.target.value))
          }, null, 40, dc)
        ]),
        f("label", null, [
          p[22] || (p[22] = pe("名称", -1)),
          f("input", {
            value: e.manifest.name,
            onInput: p[4] || (p[4] = (h) => d(["name"], h.target.value))
          }, null, 40, pc)
        ]),
        f("label", null, [
          p[23] || (p[23] = pe("版本", -1)),
          f("input", {
            value: e.manifest.version,
            onInput: p[5] || (p[5] = (h) => d(["version"], h.target.value))
          }, null, 40, fc)
        ]),
        f("label", null, [
          p[24] || (p[24] = pe("描述", -1)),
          f("textarea", {
            value: e.manifest.description,
            onInput: p[6] || (p[6] = (h) => d(["description"], h.target.value))
          }, null, 40, hc)
        ]),
        f("label", null, [
          p[25] || (p[25] = pe("分类", -1)),
          f("input", {
            value: e.manifest.category,
            onInput: p[7] || (p[7] = (h) => d(["category"], h.target.value))
          }, null, 40, mc)
        ]),
        f("label", null, [
          p[26] || (p[26] = pe("入口", -1)),
          f("input", {
            value: e.manifest.entry,
            onInput: p[8] || (p[8] = (h) => d(["entry"], h.target.value))
          }, null, 40, yc)
        ]),
        f("label", null, [
          p[27] || (p[27] = pe("图标", -1)),
          f("input", {
            value: e.manifest.icon,
            onInput: p[9] || (p[9] = (h) => d(["icon"], h.target.value))
          }, null, 40, gc)
        ]),
        f("fieldset", null, [
          p[31] || (p[31] = f("legend", null, "窗口", -1)),
          f("label", null, [
            p[28] || (p[28] = pe("宽度", -1)),
            f("input", {
              value: e.manifest.window?.width,
              onInput: p[10] || (p[10] = (h) => d(["window", "width"], h.target.value))
            }, null, 40, wc)
          ]),
          f("label", null, [
            p[29] || (p[29] = pe("高度", -1)),
            f("input", {
              value: e.manifest.window?.height,
              onInput: p[11] || (p[11] = (h) => d(["window", "height"], h.target.value))
            }, null, 40, vc)
          ]),
          f("label", bc, [
            f("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: p[12] || (p[12] = (h) => d(["window", "singleton"], h.target.checked))
            }, null, 40, kc),
            p[30] || (p[30] = pe(" 单实例", -1))
          ])
        ]),
        f("fieldset", null, [
          p[36] || (p[36] = f("legend", null, "显示位置", -1)),
          f("label", Pc, [
            f("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: p[13] || (p[13] = (h) => d(["placement", "startMenu"], h.target.checked))
            }, null, 40, $c),
            p[32] || (p[32] = pe(" 开始菜单", -1))
          ]),
          f("label", Ic, [
            f("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: p[14] || (p[14] = (h) => d(["placement", "allFunctions"], h.target.checked))
            }, null, 40, qc),
            p[33] || (p[33] = pe(" 全部功能", -1))
          ]),
          f("label", Sc, [
            f("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: p[15] || (p[15] = (h) => d(["placement", "desktop"], h.target.checked))
            }, null, 40, xc),
            p[34] || (p[34] = pe(" 桌面", -1))
          ]),
          f("label", Ac, [
            f("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: p[16] || (p[16] = (h) => d(["placement", "taskbar"], h.target.checked))
            }, null, 40, jc),
            p[35] || (p[35] = pe(" 任务栏", -1))
          ])
        ]),
        o.value ? (O(), _("fieldset", Ec, [
          p[37] || (p[37] = f("legend", null, "请求的权限", -1)),
          p[38] || (p[38] = f("p", { class: "inspector-note" }, "声明仅表示请求授权，不表示 policy allowed、grant 或 Runtime capability。", -1)),
          (O(!0), _(se, null, Je(c.value, (h) => (O(), _("label", {
            key: h.id,
            class: "permission-option"
          }, [
            f("span", Oc, [
              f("input", {
                type: "checkbox",
                checked: e.manifest.permissions?.includes(h.id),
                onChange: (w) => i(h.id, w.target.checked)
              }, null, 40, Tc),
              f("code", null, N(h.displayName || h.id) + " · " + N(h.id), 1)
            ]),
            f("small", null, N(n(h).description), 1),
            f("span", _c, [
              f("b", null, N(h.risk), 1),
              f("span", null, N(n(h).consent), 1),
              f("span", null, N(n(h).pilot), 1)
            ]),
            n(h).methods.length ? (O(), _("small", Cc, N(n(h).methods.join(", ")), 1)) : le("", !0)
          ]))), 128))
        ])) : (O(), _("p", Mc, "Manifest v1 不承载权限。升级到 v2 必须由开发者显式确认权限，Studio 不会从源码自动推断。")),
        p[39] || (p[39] = f("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (O(), _("div", ac, "修复 JSON 错误后才能使用可视化表单。")),
      f("div", Nc, N(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
}, Dc = { class: "permission-inspector" }, zc = {
  key: 0,
  class: "problems-empty"
}, Rc = {
  __name: "PermissionInspector",
  props: {
    manifest: { type: Object, default: null },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null },
    runtimeCompatibility: { type: Object, default: null },
    decisions: { type: Array, default: () => [] }
  },
  setup(e) {
    const t = e, r = _e(() => {
      const a = new Set(t.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
      return (t.permissionRegistry?.permissions || []).filter((l) => l.sourceDeclarable === !0 && a.has(l.id)).map((l) => {
        const u = (t.brokerMethods?.methods || []).filter((n) => n.requiredPermission === l.id), s = [...t.decisions].reverse().find((n) => n.permission === l.id), o = u[0]?.requiredRuntimeCapability, c = (t.runtimeCompatibility?.hostRuntimes || []).filter((n) => n.capabilities?.[o]).map((n) => `${n.id}: ${n.capabilities[o].status}`);
        return {
          ...l,
          methods: u,
          latest: s,
          declared: Array.isArray(t.manifest?.permissions) && t.manifest.permissions.includes(l.id),
          consent: u[0]?.consent || l.prompt || "未指定",
          capability: s?.capabilityState || (c.length ? c.join(" · ") : "未指定")
        };
      });
    });
    return (a, l) => (O(), _("div", Dc, [
      l[9] || (l[9] = f("p", { class: "inspector-note" }, "Declaration、review policy、Host grant 与 Runtime capability 是独立事实。", -1)),
      (O(!0), _(se, null, Je(r.value, (u) => (O(), _("article", {
        key: u.id,
        class: "permission-card"
      }, [
        f("h3", null, N(u.displayName || u.id), 1),
        f("code", null, N(u.id), 1),
        f("p", null, N(u.description), 1),
        f("dl", null, [
          f("div", null, [
            l[0] || (l[0] = f("dt", null, "风险", -1)),
            f("dd", null, N(u.risk), 1)
          ]),
          f("div", null, [
            l[1] || (l[1] = f("dt", null, "同意方式", -1)),
            f("dd", null, N(u.consent), 1)
          ]),
          f("div", null, [
            l[2] || (l[2] = f("dt", null, "已声明", -1)),
            f("dd", null, N(u.declared ? "是" : "否"), 1)
          ]),
          f("div", null, [
            l[3] || (l[3] = f("dt", null, "策略", -1)),
            f("dd", null, N(u.latest?.policyDecision || "未评估"), 1)
          ]),
          f("div", null, [
            l[4] || (l[4] = f("dt", null, "授权", -1)),
            f("dd", null, N(u.latest?.grantState || "未评估"), 1)
          ]),
          f("div", null, [
            l[5] || (l[5] = f("dt", null, "运行时能力", -1)),
            f("dd", null, N(u.capability), 1)
          ]),
          f("div", null, [
            l[6] || (l[6] = f("dt", null, "生效结果", -1)),
            f("dd", null, N(u.latest ? u.latest.finalDecision : "未评估"), 1)
          ]),
          f("div", null, [
            l[7] || (l[7] = f("dt", null, "策略版本", -1)),
            f("dd", null, N(u.latest?.policyVersion || "—"), 1)
          ])
        ]),
        l[8] || (l[8] = f("h4", null, "Broker 方法", -1)),
        (O(!0), _(se, null, Je(u.methods, (s) => (O(), _("code", {
          key: s.id,
          class: "permission-method"
        }, N(s.id), 1))), 128))
      ]))), 128)),
      r.value.length ? le("", !0) : (O(), _("div", zc, "当前权限注册表没有可声明的预览权限。"))
    ]));
  }
};
function Wc(e) {
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
const Fc = { properties: { type: { enum: ["application", "system"] } } }, Ei = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, Vc = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, Hc = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, Bc = { properties: { status: { enum: ["published", "disabled"] } } }, He = Wc, Uc = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), Kc = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), Jo = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), Zc = new RegExp("^\\.[a-z0-9]+$", "u"), Jc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), Gc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function vt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = vt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (He(e) > 240) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (He(e) < 1) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (!Jo.test(e)) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [n] : s.push(n), o++;
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [n] : s.push(n), o++;
  }
  if (typeof e == "string" && !Gc.test(e)) {
    const n = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [n] : s.push(n), o++;
  }
  return vt.errors = s, o === 0;
}
vt.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const Xc = new RegExp("^[a-f0-9]{64}$", "u"), Yc = new RegExp("^/api/function-package\\.asp\\?", "u");
function os(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = os.evaluated;
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
        if (!Xc.test(n)) {
          const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (vt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? vt.errors : s.concat(vt.errors), o = s.length)), e.downloadUrl !== void 0) {
      let n = e.downloadUrl;
      if (typeof n == "string") {
        if (!Yc.test(n)) {
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
  return os.errors = s, o === 0;
}
os.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function as(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = as.evaluated;
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
        if (He(n) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Uc.test(n)) {
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
          let h = n[p];
          if (typeof h == "string") {
            if (He(h) < 1) {
              const w = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [w] : s.push(w), o++;
            }
          } else {
            const w = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [w] : s.push(w), o++;
          }
        }
        let d = n.length, y;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let h = n[d];
            if (typeof h == "string") {
              if (typeof p[h] == "number") {
                y = p[h];
                const w = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: y }, message: "must NOT have duplicate items (items ## " + y + " and " + d + " are identical)" };
                s === null ? s = [w] : s.push(w), o++;
                break;
              }
              p[h] = d;
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
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: Fc.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let n = e.name;
      if (typeof n == "string") {
        if (He(n) < 1) {
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
        if (He(n) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Kc.test(n)) {
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
        if (He(n) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (He(n) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Jo.test(n)) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (vt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? vt.errors : s.concat(vt.errors), o = s.length)), e.install !== void 0) {
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
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: Ei.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.source !== void 0) {
          let i = n.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: Ei.properties.source.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: Vc.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: Hc.properties.mode.enum }, message: "must be equal to one of the allowed values" };
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
            if (He(i) < 1) {
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
            if (He(i) < 1) {
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
          let y = n[d];
          if (y && typeof y == "object" && !Array.isArray(y)) {
            if (y.action === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              s === null ? s = [p] : s.push(p), o++;
            }
            if (y.adapter === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              s === null ? s = [p] : s.push(p), o++;
            }
            if (y.action !== void 0) {
              let p = y.action;
              if (typeof p == "string") {
                if (He(p) < 1) {
                  const h = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [h] : s.push(h), o++;
                }
              } else {
                const h = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [h] : s.push(h), o++;
              }
            }
            if (y.adapter !== void 0) {
              let p = y.adapter;
              if (typeof p == "string") {
                if (He(p) < 1) {
                  const h = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [h] : s.push(h), o++;
                }
              } else {
                const h = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [h] : s.push(h), o++;
              }
            }
            if (y.extensions !== void 0) {
              let p = y.extensions;
              if (Array.isArray(p)) {
                const h = p.length;
                for (let I = 0; I < h; I++) {
                  let M = p[I];
                  if (typeof M == "string") {
                    if (!Zc.test(M)) {
                      const L = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + I, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [L] : s.push(L), o++;
                    }
                  } else {
                    const L = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + I, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [L] : s.push(L), o++;
                  }
                }
                let w = p.length, $;
                if (w > 1) {
                  const I = {};
                  for (; w--; ) {
                    let M = p[w];
                    if (typeof M == "string") {
                      if (typeof I[M] == "number") {
                        $ = I[M];
                        const L = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: w, j: $ }, message: "must NOT have duplicate items (items ## " + $ + " and " + w + " are identical)" };
                        s === null ? s = [L] : s.push(L), o++;
                        break;
                      }
                      I[M] = w;
                    }
                  }
                }
              } else {
                const h = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [h] : s.push(h), o++;
              }
            }
            if (y.mimeTypes !== void 0) {
              let p = y.mimeTypes;
              if (Array.isArray(p)) {
                const h = p.length;
                for (let I = 0; I < h; I++) {
                  let M = p[I];
                  if (typeof M == "string") {
                    if (!Jc.test(M)) {
                      const L = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + I, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [L] : s.push(L), o++;
                    }
                  } else {
                    const L = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + I, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [L] : s.push(L), o++;
                  }
                }
                let w = p.length, $;
                if (w > 1) {
                  const I = {};
                  for (; w--; ) {
                    let M = p[w];
                    if (typeof M == "string") {
                      if (typeof I[M] == "number") {
                        $ = I[M];
                        const L = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: w, j: $ }, message: "must NOT have duplicate items (items ## " + $ + " and " + w + " are identical)" };
                        s === null ? s = [L] : s.push(L), o++;
                        break;
                      }
                      I[M] = w;
                    }
                  }
                }
              } else {
                const h = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [h] : s.push(h), o++;
              }
            }
            if (y.priority !== void 0 && typeof y.priority != "number") {
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
            if (He(i) < 1) {
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
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: Bc.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (os(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? os.errors : s.concat(os.errors), o = s.length)), e.runtime !== void 0) {
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
  return as.errors = s, o === 0;
}
as.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Fs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Fs.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), as(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? as.errors : s.concat(as.errors), o = s.length), Fs.errors = s, o === 0;
}
Fs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Qc(e) {
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
function ed(e, t) {
  return e === t;
}
const td = { properties: { type: { enum: ["application", "system"] } } }, Oi = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, sd = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, rd = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, nd = { properties: { status: { enum: ["published", "disabled"] } } }, id = { enum: ["device.battery-status.read"] }, od = ed;
function ls(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ls.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Array.isArray(e)) {
    const n = e.length;
    for (let y = 0; y < n; y++) {
      let p = e[y];
      if (typeof p != "string") {
        const h = { instancePath: t + "/" + y, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [h] : s.push(h), o++;
      }
      if (p !== "device.battery-status.read") {
        const h = { instancePath: t + "/" + y, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/enum", keyword: "enum", params: { allowedValues: id.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [h] : s.push(h), o++;
      }
    }
    let i = e.length, d;
    if (i > 1) {
      e: for (; i--; )
        for (d = i; d--; )
          if (od(e[i], e[d])) {
            const y = { instancePath: t, schemaPath: "#/uniqueItems", keyword: "uniqueItems", params: { i, j: d }, message: "must NOT have duplicate items (items ## " + d + " and " + i + " are identical)" };
            s === null ? s = [y] : s.push(y), o++;
            break e;
          }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "array" }, message: "must be array" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return ls.errors = s, o === 0;
}
ls.evaluated = { items: !0, dynamicProps: !1, dynamicItems: !1 };
const Be = Qc, Go = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), ad = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function bt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = bt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Be(e) > 240) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (Be(e) < 1) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (!Go.test(e)) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [n] : s.push(n), o++;
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [n] : s.push(n), o++;
  }
  if (typeof e == "string" && !ad.test(e)) {
    const n = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [n] : s.push(n), o++;
  }
  return bt.errors = s, o === 0;
}
bt.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const ld = new RegExp("^[a-f0-9]{64}$", "u"), ud = new RegExp("^/api/function-package\\.asp\\?", "u");
function us(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = us.evaluated;
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
        if (!ld.test(n)) {
          const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (bt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? bt.errors : s.concat(bt.errors), o = s.length)), e.downloadUrl !== void 0) {
      let n = e.downloadUrl;
      if (typeof n == "string") {
        if (!ud.test(n)) {
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
  return us.errors = s, o === 0;
}
us.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const cd = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), dd = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), pd = new RegExp("^\\.[a-z0-9]+$", "u"), fd = new RegExp("^[^/\\s]+/[^/\\s]+$", "u");
function cs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = cs.evaluated;
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
    if (e.permissions !== void 0 && (ls(e.permissions, { instancePath: t + "/permissions", parentData: e, parentDataProperty: "permissions", rootData: l, dynamicAnchors: u }) || (s = s === null ? ls.errors : s.concat(ls.errors), o = s.length)), e.id !== void 0) {
      let n = e.id;
      if (typeof n == "string") {
        if (Be(n) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!cd.test(n)) {
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
          let h = n[p];
          if (typeof h == "string") {
            if (Be(h) < 1) {
              const w = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [w] : s.push(w), o++;
            }
          } else {
            const w = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [w] : s.push(w), o++;
          }
        }
        let d = n.length, y;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let h = n[d];
            if (typeof h == "string") {
              if (typeof p[h] == "number") {
                y = p[h];
                const w = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: y }, message: "must NOT have duplicate items (items ## " + y + " and " + d + " are identical)" };
                s === null ? s = [w] : s.push(w), o++;
                break;
              }
              p[h] = d;
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
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: td.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let n = e.name;
      if (typeof n == "string") {
        if (Be(n) < 1) {
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
        if (Be(n) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!dd.test(n)) {
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
        if (Be(n) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (Be(n) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Go.test(n)) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (bt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? bt.errors : s.concat(bt.errors), o = s.length)), e.install !== void 0) {
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
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: Oi.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.source !== void 0) {
          let i = n.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: Oi.properties.source.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: sd.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: rd.properties.mode.enum }, message: "must be equal to one of the allowed values" };
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
            if (Be(i) < 1) {
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
            if (Be(i) < 1) {
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
          let y = n[d];
          if (y && typeof y == "object" && !Array.isArray(y)) {
            if (y.action === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              s === null ? s = [p] : s.push(p), o++;
            }
            if (y.adapter === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              s === null ? s = [p] : s.push(p), o++;
            }
            if (y.action !== void 0) {
              let p = y.action;
              if (typeof p == "string") {
                if (Be(p) < 1) {
                  const h = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [h] : s.push(h), o++;
                }
              } else {
                const h = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [h] : s.push(h), o++;
              }
            }
            if (y.adapter !== void 0) {
              let p = y.adapter;
              if (typeof p == "string") {
                if (Be(p) < 1) {
                  const h = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [h] : s.push(h), o++;
                }
              } else {
                const h = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [h] : s.push(h), o++;
              }
            }
            if (y.extensions !== void 0) {
              let p = y.extensions;
              if (Array.isArray(p)) {
                const h = p.length;
                for (let I = 0; I < h; I++) {
                  let M = p[I];
                  if (typeof M == "string") {
                    if (!pd.test(M)) {
                      const L = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + I, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [L] : s.push(L), o++;
                    }
                  } else {
                    const L = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + I, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [L] : s.push(L), o++;
                  }
                }
                let w = p.length, $;
                if (w > 1) {
                  const I = {};
                  for (; w--; ) {
                    let M = p[w];
                    if (typeof M == "string") {
                      if (typeof I[M] == "number") {
                        $ = I[M];
                        const L = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: w, j: $ }, message: "must NOT have duplicate items (items ## " + $ + " and " + w + " are identical)" };
                        s === null ? s = [L] : s.push(L), o++;
                        break;
                      }
                      I[M] = w;
                    }
                  }
                }
              } else {
                const h = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [h] : s.push(h), o++;
              }
            }
            if (y.mimeTypes !== void 0) {
              let p = y.mimeTypes;
              if (Array.isArray(p)) {
                const h = p.length;
                for (let I = 0; I < h; I++) {
                  let M = p[I];
                  if (typeof M == "string") {
                    if (!fd.test(M)) {
                      const L = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + I, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [L] : s.push(L), o++;
                    }
                  } else {
                    const L = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + I, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [L] : s.push(L), o++;
                  }
                }
                let w = p.length, $;
                if (w > 1) {
                  const I = {};
                  for (; w--; ) {
                    let M = p[w];
                    if (typeof M == "string") {
                      if (typeof I[M] == "number") {
                        $ = I[M];
                        const L = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: w, j: $ }, message: "must NOT have duplicate items (items ## " + $ + " and " + w + " are identical)" };
                        s === null ? s = [L] : s.push(L), o++;
                        break;
                      }
                      I[M] = w;
                    }
                  }
                }
              } else {
                const h = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [h] : s.push(h), o++;
              }
            }
            if (y.priority !== void 0 && typeof y.priority != "number") {
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
            if (Be(i) < 1) {
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
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: nd.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (us(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? us.errors : s.concat(us.errors), o = s.length)), e.runtime !== void 0) {
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
  return cs.errors = s, o === 0;
}
cs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Vs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Vs.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), cs(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? cs.errors : s.concat(cs.errors), o = s.length), Vs.errors = s, o === 0;
}
Vs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let an;
async function hd() {
  return an || (an = md()), an;
}
async function md() {
  const e = await Promise.all([
    fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v2.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/permissions-v1.json", { credentials: "same-origin" })
  ]);
  if (e.some((l) => !l.ok)) throw new Error("无法载入 Manifest 平台契约。");
  const [t, r, a] = await Promise.all(e.map((l) => l.json()));
  return {
    schemas: { 1: t, 2: r },
    validators: { 1: Fs, 2: Vs },
    permissionRegistry: a,
    permissionIds: new Set(a.permissions.map((l) => l.id)),
    sourceDeclarableIds: new Set(a.sourceDeclaration?.declarablePermissionIds || [])
  };
}
async function yd(e) {
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
        ...kd(e, n.message)
      }]
    };
  }
  const r = _t(t);
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
  const a = await hd(), l = a.schemas[r], u = a.validators[r];
  u(t);
  const s = (u.errors || []).filter((n) => !vd(r, n)).map((n) => ({
    ruleId: "WWM002",
    severity: "error",
    path: bd(n.instancePath || n.params?.missingProperty || ""),
    message: n.message || n.keyword
  }));
  gd(t, r, a.permissionIds, a.sourceDeclarableIds, s), r === 2 && t.sdk?.apiVersion !== void 0 && t.sdk.apiVersion !== "1" && s.push({
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
function gd(e, t, r, a, l) {
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
    u.has(s) && l.push({ ruleId: "WWM007", severity: "error", path: c, message: `重复权限：${s}` }), u.add(s), wd(s) ? l.push({ ruleId: "WWM008", severity: "error", path: c, message: `禁止声明超级或私有权限：${s}` }) : r.has(s) ? a.has(s) || l.push({ ruleId: "WWM008", severity: "error", path: c, message: `权限尚未开放 Source Manifest 声明：${s}` }) : l.push({ ruleId: "WWM006", severity: "error", path: c, message: `未知权限：${s}` });
  });
}
function wd(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function vd(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function bd(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const r = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(r) ? `[${r}]` : `.${r}`;
  }).join("")}` : `$.${e}` : "$";
}
function kd(e, t) {
  const r = /position\s+(\d+)/i.exec(t);
  if (!r) return { line: 1, column: 1 };
  const a = Math.min(Number(r[1]), e.length), l = e.slice(0, a).split(`
`);
  return { line: l.length, column: l.at(-1).length + 1 };
}
const Pd = {
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
function $d() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(Pd, null, 2)}
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

button.addEventListener("click", async () => {
  if (!window.WebWindows?.dialog) {
    status.textContent = "当前预览环境未提供系统对话框 API。";
    return;
  }
  const confirmed = await window.WebWindows.dialog.confirm("开始体验这个 WebWindows 功能吗？", {
    title: "Hello WebWindows",
    confirmLabel: "开始",
    cancelLabel: "稍后"
  });
  status.textContent = confirmed ? "Hello from WebWindows." : "已取消。";
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
const Ti = 240;
function me(e, t = {}) {
  const r = String(e ?? "");
  if (r.includes("\0")) throw Ft("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(r)) throw Ft("项目路径不能使用盘符。", e);
  const a = r.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!a) {
    if (t.allowRoot === !0) return "";
    throw Ft("项目路径不能为空。", e);
  }
  if (a.startsWith("/")) throw Ft("项目路径必须是相对路径。", e);
  if (a.length > Ti)
    throw Ft(`项目路径不能超过 ${Ti} 个字符。`, e);
  const l = a.split("/");
  if (l.some((u) => !u || u === "." || u === ".."))
    throw Ft("项目路径包含不安全的路径段。", e);
  return l.join("/");
}
function Hs(e) {
  const t = me(e), r = t.lastIndexOf("/");
  return r < 0 ? "" : t.slice(0, r);
}
function kn(e) {
  const t = me(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function Id(e, t) {
  const r = me(e, { allowRoot: !0 }), a = String(t ?? "");
  if (!a || a.includes("/") || a.includes("\\"))
    throw Ft("文件或目录名称必须是单个安全路径段。", t);
  return me(r ? `${r}/${a}` : a);
}
function Ft(e, t) {
  const r = new TypeError(e);
  return r.code = "invalid-project-path", r.value = t, r;
}
const Xo = 1;
class qd {
  constructor(t, r) {
    this.storage = t, this.key = r, this.onversionchange = null;
  }
  transaction(t, r = "readonly") {
    return new Sd(this, t, r);
  }
  close() {
  }
  readDocument() {
    const t = this.storage.getItem(this.key);
    if (!t) return Ad();
    const r = JSON.parse(t);
    if (r?.schemaVersion !== Xo || !Array.isArray(r.projects) || !Array.isArray(r.files))
      throw new DOMException("Developer Studio fallback storage is invalid.", "DataError");
    return structuredClone(r);
  }
  writeDocument(t) {
    this.storage.setItem(this.key, JSON.stringify(t));
  }
}
class Sd {
  constructor(t, r, a) {
    this.database = t, this.storeNames = new Set(Array.isArray(r) ? r : [r]), this.mode = a, this.document = t.readDocument(), this.error = null, this.oncomplete = null, this.onerror = null, this.onabort = null, this.pending = 0, this.failed = !1, this.completionTimer = 0;
  }
  objectStore(t) {
    if (!this.storeNames.has(t)) throw new DOMException(`Store ${t} is not in this transaction.`, "NotFoundError");
    return new xd(this, t);
  }
  request(t) {
    const r = { result: void 0, error: null, onsuccess: null, onerror: null };
    return this.pending += 1, clearTimeout(this.completionTimer), queueMicrotask(() => {
      try {
        if (this.failed) throw this.error;
        r.result = t(), r.onsuccess?.({ target: r });
      } catch (a) {
        r.error = a, this.error = a, this.failed = !0, r.onerror?.({ target: r }), this.onerror?.({ target: this }), this.onabort?.({ target: this });
      } finally {
        this.pending -= 1, this.scheduleCompletion();
      }
    }), r;
  }
  scheduleCompletion() {
    this.failed || this.pending > 0 || (clearTimeout(this.completionTimer), this.completionTimer = setTimeout(() => {
      if (!(this.failed || this.pending > 0))
        try {
          this.mode === "readwrite" && this.database.writeDocument(this.document), this.oncomplete?.({ target: this });
        } catch (t) {
          this.error = t, this.failed = !0, this.onerror?.({ target: this }), this.onabort?.({ target: this });
        }
    }, 0));
  }
}
class xd {
  constructor(t, r) {
    this.transaction = t, this.name = r;
  }
  get(t) {
    return this.transaction.request(() => Xt(this.records().find((r) => ar(this.name, r, t))));
  }
  getAll() {
    return this.transaction.request(() => this.records().map(Xt));
  }
  add(t) {
    return this.transaction.request(() => {
      if (this.requireWritable(), this.records().some((r) => ar(this.name, r, ln(this.name, t))))
        throw new DOMException("The key already exists.", "ConstraintError");
      return this.records().push(Xt(t)), ln(this.name, t);
    });
  }
  put(t) {
    return this.transaction.request(() => {
      this.requireWritable();
      const r = ln(this.name, t), a = this.records().findIndex((l) => ar(this.name, l, r));
      return a >= 0 ? this.records()[a] = Xt(t) : this.records().push(Xt(t)), r;
    });
  }
  delete(t) {
    return this.transaction.request(() => {
      this.requireWritable();
      const r = this.records().findIndex((a) => ar(this.name, a, t));
      r >= 0 && this.records().splice(r, 1);
    });
  }
  index(t) {
    if (this.name !== "files" || t !== "projectId")
      throw new DOMException(`Index ${t} does not exist.`, "NotFoundError");
    return {
      getAll: (r) => this.transaction.request(() => this.records().filter((a) => a.projectId === r).map(Xt))
    };
  }
  records() {
    return this.name === "projects" ? this.transaction.document.projects : this.transaction.document.files;
  }
  requireWritable() {
    if (this.transaction.mode !== "readwrite")
      throw new DOMException("The transaction is read-only.", "ReadOnlyError");
  }
}
function Ad() {
  return { schemaVersion: Xo, projects: [], files: [] };
}
function ln(e, t) {
  return e === "projects" ? t.uuid : [t.projectId, t.path];
}
function ar(e, t, r) {
  return e === "projects" ? t.uuid === r : Array.isArray(r) && t.projectId === r[0] && t.path === r[1];
}
function Xt(e) {
  return e === void 0 ? void 0 : structuredClone(e);
}
const jd = "webwindows-developer-studio-v1", _i = 1, Ed = 1, Od = "localstorage-fallback-v1", ae = "projects", he = "files", Rt = "projectId", Td = Object.freeze({
  open: "打开",
  "open-blocked": "升级",
  "create-project": "写入",
  reset: "重建",
  "reset-blocked": "重建"
});
class _d extends Error {
  constructor(t, r, a) {
    const l = String(r?.name || "StorageError"), u = String(r?.message || a || "未知错误"), s = Td[t] || "访问";
    super(a || `Developer Studio 项目存储${s}失败（${l}: ${u}）。`), this.name = "StudioStorageError", this.code = "studio-storage-failure", this.stage = t, this.causeName = l, this.causeMessage = u, this.recoverable = t !== "open-blocked" && t !== "reset-blocked", this.cause = r;
  }
}
function Un(e) {
  return e?.code === "studio-storage-failure";
}
class Cd {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.localStorage = t.localStorage || globalThis.localStorage, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || jd, this.fallbackStorageKey = `${this.databaseName}:${Od}`, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, this.storageMode = "indexeddb", this.storageModeCause = null, !this.indexedDB && !this.localStorage)
      throw new Error("IndexedDB or localStorage is required by Developer Studio.");
  }
  getStorageStatus() {
    return Object.freeze({
      mode: this.storageMode,
      degraded: this.storageMode !== "indexeddb",
      causeName: this.storageModeCause?.causeName || this.storageModeCause?.name || null,
      causeMessage: this.storageModeCause?.causeMessage || this.storageModeCause?.message || null
    });
  }
  async listProjects() {
    const t = await this.open();
    return (await De(
      t.transaction(ae, "readonly").objectStore(ae).getAll()
    )).sort((a, l) => String(l.updatedAt).localeCompare(String(a.updatedAt))).map(ft);
  }
  async createProject(t = {}) {
    return this.runStorageOperation("create-project", () => this.createProjectAttempt(t), { retry: !0 });
  }
  async createProjectAttempt(t = {}) {
    const r = Nd(this.crypto), a = this.now(), l = {
      uuid: r,
      displayName: Mi(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: Ed,
      storageVersion: _i,
      createdAt: a,
      updatedAt: a,
      editorState: Ar(t.editorState)
    }, u = Md(t.files || [], r, a), o = (await this.open()).transaction([ae, he], "readwrite");
    o.objectStore(ae).add(l);
    const c = o.objectStore(he);
    return u.forEach((n) => c.add(n)), await xt(o), ft(l);
  }
  async getProject(t) {
    const r = await this.open(), a = await De(
      r.transaction(ae, "readonly").objectStore(ae).get(t)
    );
    if (!a) throw be("project-not-found", "找不到项目。");
    return ft(a);
  }
  async renameProject(t, r) {
    return this.updateProject(t, (a) => {
      a.displayName = Mi(r);
    });
  }
  async saveEditorState(t, r) {
    return this.updateProject(t, (a) => {
      a.editorState = Ar(r);
    });
  }
  async deleteProject(t) {
    const a = (await this.open()).transaction([ae, he], "readwrite"), l = a.objectStore(ae);
    if (!await De(l.get(t))) throw be("project-not-found", "找不到项目。");
    const s = a.objectStore(he);
    (await De(s.index(Rt).getAll(t))).forEach((c) => s.delete([t, c.path])), l.delete(t), await xt(a);
  }
  async listEntries(t) {
    await this.getProject(t);
    const r = await this.open();
    return (await De(
      r.transaction(he, "readonly").objectStore(he).index(Rt).getAll(t)
    )).sort(Ni).map(ft);
  }
  async readProjectState(t) {
    const a = (await this.open()).transaction([ae, he], "readonly"), l = await De(a.objectStore(ae).get(t));
    if (!l) throw be("project-not-found", "找不到项目。");
    const u = await De(
      a.objectStore(he).index(Rt).getAll(t)
    );
    return await xt(a), {
      project: ft(l),
      entries: u.sort(Ni).map(ft)
    };
  }
  async readTextFile(t, r) {
    const a = await this.getEntry(t, r);
    if (a.kind !== "file") throw be("not-a-file", "目标不是文本文件。");
    return a.content;
  }
  async writeTextFile(t, r, a) {
    const l = me(r), s = (await this.open()).transaction([ae, he], "readwrite"), o = await lr(s, t), c = s.objectStore(he), n = await De(c.get([t, l]));
    if (!n) throw be("file-not-found", "找不到文件。");
    if (n.kind !== "file") throw be("not-a-file", "目标不是文本文件。");
    const i = this.now();
    c.put({ ...n, content: String(a), updatedAt: i }), o.updatedAt = i, s.objectStore(ae).put(o), await xt(s);
  }
  async createFile(t, r, a = "") {
    return this.createEntry(t, r, "file", String(a));
  }
  async createDirectory(t, r) {
    return this.createEntry(t, r, "directory", void 0);
  }
  async renameEntry(t, r, a) {
    const l = me(r), u = me(a);
    if (l === u) return this.getEntry(t, l);
    if (u.startsWith(`${l}/`))
      throw be("invalid-project-path", "目录不能移动到自身内部。");
    const o = (await this.open()).transaction([ae, he], "readwrite"), c = await lr(o, t), n = o.objectStore(he), i = await De(n.index(Rt).getAll(t)), d = i.filter((w) => w.path === l || w.path.startsWith(`${l}/`));
    if (!d.length) throw be("entry-not-found", "找不到文件或目录。");
    await Ci(i, u);
    const y = new Set(d.map((w) => w.path)), p = new Set(d.map((w) => w.path === l ? u : `${u}${w.path.slice(l.length)}`));
    if (i.some((w) => !y.has(w.path) && p.has(w.path)))
      throw be("entry-exists", "目标路径已经存在。");
    const h = this.now();
    return d.forEach((w) => {
      const $ = w.path === l ? u : `${u}${w.path.slice(l.length)}`;
      n.delete([t, w.path]), n.add({ ...w, path: $, updatedAt: h });
    }), c.editorState = Ld(c.editorState, l, u), c.updatedAt = h, o.objectStore(ae).put(c), await xt(o), this.getEntry(t, u);
  }
  async deleteEntry(t, r) {
    const a = me(r), u = (await this.open()).transaction([ae, he], "readwrite"), s = await lr(u, t), o = u.objectStore(he), n = (await De(o.index(Rt).getAll(t))).filter((d) => d.path === a || d.path.startsWith(`${a}/`));
    if (!n.length) throw be("entry-not-found", "找不到文件或目录。");
    n.forEach((d) => o.delete([t, d.path]));
    const i = this.now();
    s.editorState = Dd(s.editorState, a), s.updatedAt = i, u.objectStore(ae).put(s), await xt(u);
  }
  async getEntry(t, r) {
    const a = me(r);
    await this.getProject(t);
    const l = await this.open(), u = await De(
      l.transaction(he, "readonly").objectStore(he).get([t, a])
    );
    if (!u) throw be("entry-not-found", "找不到文件或目录。");
    return ft(u);
  }
  async close() {
    if (!this.databasePromise) return;
    (await this.databasePromise).close(), this.databasePromise = null;
  }
  async resetStorage() {
    if (await this.close(), this.storageMode === "localstorage-fallback")
      try {
        this.localStorage.removeItem(this.fallbackStorageKey);
        return;
      } catch (t) {
        throw ht("reset", t, "Developer Studio 浏览器降级存储重建失败。");
      }
    await new Promise((t, r) => {
      const a = this.indexedDB.deleteDatabase(this.databaseName);
      a.onsuccess = () => t(), a.onerror = () => r(ht("reset", a.error)), a.onblocked = () => r(ht(
        "reset-blocked",
        null,
        "Developer Studio 项目存储正在被其他窗口使用。请关闭其他 Developer Studio 窗口后重试。"
      ));
    });
  }
  async open() {
    if (this.databasePromise) return this.databasePromise;
    if (this.storageMode === "localstorage-fallback") return this.openFallback(this.storageModeCause);
    if (!this.indexedDB)
      return this.openFallback(ht("open", null, "当前浏览器不支持 IndexedDB。"));
    this.databasePromise = new Promise((t, r) => {
      const a = this.indexedDB.open(this.databaseName, _i);
      a.onupgradeneeded = () => {
        const l = a.result;
        l.objectStoreNames.contains(ae) || l.createObjectStore(ae, { keyPath: "uuid" }), l.objectStoreNames.contains(he) || l.createObjectStore(he, { keyPath: ["projectId", "path"] }).createIndex(Rt, "projectId", { unique: !1 });
      }, a.onsuccess = () => t(a.result), a.onerror = () => r(ht("open", a.error)), a.onblocked = () => r(ht(
        "open-blocked",
        null,
        "Developer Studio 项目存储升级被其他窗口阻止。请关闭其他 Developer Studio 窗口后重试。"
      ));
    });
    try {
      const t = await this.databasePromise;
      return t.onversionchange = () => t.close(), t;
    } catch (t) {
      if (this.databasePromise = null, Rd(t, this.localStorage)) return this.openFallback(t);
      throw t;
    }
  }
  async openFallback(t) {
    if (!this.localStorage) throw t;
    try {
      const r = this.storageMode !== "localstorage-fallback", a = new qd(this.localStorage, this.fallbackStorageKey);
      return a.readDocument(), this.storageMode = "localstorage-fallback", this.storageModeCause = t, this.databasePromise = Promise.resolve(a), r && console.warn("[DeveloperStudio] IndexedDB 不可用，启用受限的 localStorage 项目工作区。", t), a;
    } catch (r) {
      throw this.databasePromise = null, ht("open", r, "Developer Studio 的 IndexedDB 与浏览器降级存储均不可用。");
    }
  }
  async runStorageOperation(t, r, a = {}) {
    const l = a.retry ? 2 : 1;
    for (let u = 0; u < l; u += 1)
      try {
        return await r();
      } catch (s) {
        if (!Yo(s)) throw s;
        const o = Un(s) ? s : ht(t, s);
        if (u + 1 >= l || !zd(o)) throw o;
        await this.close();
      }
    throw ht(t, null);
  }
  async updateProject(t, r) {
    const l = (await this.open()).transaction(ae, "readwrite"), u = l.objectStore(ae), s = await De(u.get(t));
    if (!s) throw be("project-not-found", "找不到项目。");
    return r(s), s.updatedAt = this.now(), u.put(s), await xt(l), ft(s);
  }
  async createEntry(t, r, a, l) {
    const u = me(r), o = (await this.open()).transaction([ae, he], "readwrite"), c = await lr(o, t), n = o.objectStore(he), i = await De(n.index(Rt).getAll(t));
    if (i.some((p) => p.path === u))
      throw be("entry-exists", "目标路径已经存在。");
    await Ci(i, u);
    const d = this.now(), y = {
      projectId: t,
      path: u,
      kind: a,
      ...a === "file" ? { content: String(l ?? "") } : {},
      createdAt: d,
      updatedAt: d
    };
    return n.add(y), c.updatedAt = d, o.objectStore(ae).put(c), await xt(o), ft(y);
  }
}
function Md(e, t, r) {
  const a = /* @__PURE__ */ new Set(), l = e.map((u) => {
    const s = me(u.path);
    if (a.has(s)) throw be("entry-exists", `模板包含重复路径：${s}`);
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
    const s = Hs(u.path);
    if (!s) return;
    const o = l.find((c) => c.path === s);
    if (!o || o.kind !== "directory")
      throw be("parent-directory-not-found", `模板缺少父目录：${s}`);
  }), l;
}
async function lr(e, t) {
  const r = await De(e.objectStore(ae).get(t));
  if (!r) throw be("project-not-found", "找不到项目。");
  return r;
}
async function Ci(e, t) {
  const r = Hs(t);
  if (!r) return;
  const a = e.find((l) => l.path === r);
  if (!a || a.kind !== "directory")
    throw be("parent-directory-not-found", "父目录不存在。");
}
function Nd(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const r = [...t].map((a) => a.toString(16).padStart(2, "0"));
  return `${r.slice(0, 4).join("")}-${r.slice(4, 6).join("")}-${r.slice(6, 8).join("")}-${r.slice(8, 10).join("")}-${r.slice(10).join("")}`;
}
function Mi(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw be("invalid-project-name", "项目名称不能为空。");
  return t;
}
function Ar(e) {
  const t = e && typeof e == "object" ? e : {}, r = (u) => [...new Set((Array.isArray(u) ? u : []).map((s) => {
    try {
      return me(s);
    } catch {
      return null;
    }
  }).filter(Boolean))], a = r(t.openFiles), l = t.activeFile ? me(t.activeFile) : a[0] || null;
  return {
    openFiles: a,
    activeFile: l,
    recentFiles: r(t.recentFiles).slice(0, 20)
  };
}
function Ld(e, t, r) {
  const a = (l) => l === t || l?.startsWith(`${t}/`) ? `${r}${l.slice(t.length)}` : l;
  return Ar({
    openFiles: e?.openFiles?.map(a),
    activeFile: a(e?.activeFile),
    recentFiles: e?.recentFiles?.map(a)
  });
}
function Dd(e, t) {
  const r = (l) => l !== t && !l.startsWith(`${t}/`), a = (e?.openFiles || []).filter(r);
  return Ar({
    openFiles: a,
    activeFile: e?.activeFile && r(e.activeFile) ? e.activeFile : a[0] || null,
    recentFiles: (e?.recentFiles || []).filter(r)
  });
}
function Ni(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function ft(e) {
  return structuredClone(e);
}
function De(e) {
  return new Promise((t, r) => {
    e.onsuccess = () => t(e.result), e.onerror = () => r(e.error || new Error("IndexedDB request failed."));
  });
}
function xt(e) {
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
function ht(e, t, r) {
  return new _d(e, t, r);
}
function Yo(e) {
  return Un(e) ? !0 : ["UnknownError", "InvalidStateError", "AbortError", "QuotaExceededError", "SecurityError"].includes(String(e?.name || "")) || /internal error/i.test(String(e?.message || ""));
}
function zd(e) {
  return ["UnknownError", "InvalidStateError", "AbortError"].includes(String(e?.causeName || e?.name || "")) || /internal error/i.test(String(e?.causeMessage || e?.message || ""));
}
function Rd(e, t) {
  if (!t || !Yo(e)) return !1;
  const r = String(e?.causeName || e?.name || "");
  return ["UnknownError", "InvalidStateError", "SecurityError"].includes(r) || /internal error/i.test(String(e?.causeMessage || e?.message || ""));
}
function be(e, t) {
  const r = new Error(t);
  return r.code = e, r;
}
function Li(e, t) {
  return Id(e, t);
}
function Wd(e) {
  const t = [], r = /* @__PURE__ */ new Map();
  e.forEach((l) => r.set(l.path, {
    ...l,
    name: kn(l.path),
    children: []
  })), r.forEach((l) => {
    const u = Hs(l.path);
    u ? r.get(u)?.children.push(l) : t.push(l);
  });
  const a = (l) => l.sort((u, s) => u.kind !== s.kind ? u.kind === "directory" ? -1 : 1 : u.name.localeCompare(s.name)).forEach((u) => a(u.children));
  return a(t), t;
}
function Fd(e) {
  const t = String(e).toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";
  return {
    html: "html",
    htm: "html",
    css: "css",
    js: "javascript",
    json: "json",
    // Monaco's bundled HTML language service tokenizes SVG markup and keeps
    // its worker local; the standalone XML language is not part of this build.
    svg: "html",
    md: "markdown",
    txt: "plaintext"
  }[t] || "plaintext";
}
const Qo = "webwindows-project-snapshot-v1";
async function Vd(e, t, r = {}) {
  if (!e || typeof e.readProjectState != "function")
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  const a = await e.readProjectState(t), l = a.entries.filter((n) => n.kind === "file").map((n) => Object.freeze({
    path: me(n.path),
    content: String(n.content ?? ""),
    byteLength: ds(n.content ?? "").byteLength
  })).sort((n, i) => Ud(n.path, i.path)), u = /* @__PURE__ */ new Set();
  for (const n of l) {
    if (u.has(n.path)) throw new Error(`Snapshot contains duplicate path: ${n.path}`);
    u.add(n.path);
  }
  const s = l.reduce((n, i) => n + i.byteLength, 0), o = await Hd(Bd(a.project.uuid, l)), c = {
    contract: Qo,
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
function jr(e, t) {
  const r = me(t);
  return e.files.find((a) => a.path === r) || null;
}
async function Hd(e) {
  const t = globalThis.crypto;
  if (!t?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const r = await t.subtle.digest("SHA-256", e);
  return [...new Uint8Array(r)].map((a) => a.toString(16).padStart(2, "0")).join("");
}
function Bd(e, t) {
  const r = [ds(`${Qo}\0${e}\0`)];
  for (const s of t) {
    const o = ds(s.path), c = ds(s.content);
    r.push(Di(o.byteLength), o, Di(c.byteLength), c);
  }
  const a = r.reduce((s, o) => s + o.byteLength, 0), l = new Uint8Array(a);
  let u = 0;
  for (const s of r)
    l.set(s, u), u += s.byteLength;
  return l;
}
function Di(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e, !1), t;
}
function ds(e) {
  return new TextEncoder().encode(String(e));
}
function Ud(e, t) {
  const r = ds(e), a = ds(t), l = Math.min(r.length, a.length);
  for (let u = 0; u < l; u += 1)
    if (r[u] !== a[u]) return r[u] - a[u];
  return r.length - a.length;
}
let un;
async function As() {
  return un || (un = Kd()), un;
}
async function Kd() {
  const e = await Promise.all([
    Qe("/data/sdk/manifest-v1.schema.json"),
    Qe("/data/sdk/manifest-v2.schema.json"),
    Qe("/data/sdk/permissions-v1.json"),
    Qe("/data/sdk/capability-broker-v1.schema.json"),
    Qe("/data/sdk/capability-broker-methods-v1.json"),
    Qe("/data/sdk/capability-broker-errors-v1.json"),
    Qe("/data/sdk/capability-broker-policy-v1.json"),
    Qe("/data/sdk/permission-decision-v1.json"),
    Qe("/data/sdk/package-runtime-policy-v1.json"),
    Qe("/data/sdk/runtime-compatibility-v1.json"),
    Qe("/data/sdk/studio-validator-rules-v1.json"),
    Zd("/data/sdk/webwindows-public-api-v1.d.ts")
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
async function Qe(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.json();
}
async function Zd(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.text();
}
function Jd(e) {
  if (typeof e != "string" || e.charCodeAt(0) === 65279) throw Se("JSON BOM is forbidden");
  let t = 0;
  const r = () => {
    for (; /[\u0009\u000a\u000d\u0020]/.test(e[t] || ""); ) t += 1;
  }, a = () => {
    if (e[t++] !== '"') throw Se("Expected JSON string");
    let u = "";
    for (; t < e.length; ) {
      const s = e[t++];
      if (s === '"')
        return Gd(u), u;
      if (s.charCodeAt(0) < 32) throw Se("Control character in JSON string");
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
      if (o !== "u") throw Se("Invalid JSON escape");
      const n = e.slice(t, t + 4);
      if (!/^[0-9a-fA-F]{4}$/.test(n)) throw Se("Invalid JSON Unicode escape");
      u += String.fromCharCode(Number.parseInt(n, 16)), t += 4;
    }
    throw Se("Unterminated JSON string");
  }, l = (u = 0) => {
    if (u > 100) throw Se("JSON nesting limit exceeded");
    if (r(), e[t] === "{") {
      t += 1, r();
      const o = /* @__PURE__ */ new Set();
      if (e[t] === "}") {
        t += 1;
        return;
      }
      for (; ; ) {
        const c = a();
        if (o.has(c)) throw Se(`Duplicate JSON property: ${c}`);
        if (o.add(c), r(), e[t++] !== ":") throw Se("Expected JSON colon");
        if (l(u + 1), r(), e[t] === "}") {
          t += 1;
          return;
        }
        if (e[t++] !== ",") throw Se("Expected JSON comma");
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
        if (e[t++] !== ",") throw Se("Expected JSON comma");
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
    if (!s) throw Se("Invalid JSON value");
    if (!Number.isFinite(Number(s[0]))) throw Se("Non-finite JSON number");
    t += s[0].length;
  };
  if (r(), l(), r(), t !== e.length) throw Se("Trailing JSON data is forbidden");
}
function Gd(e) {
  for (let t = 0; t < e.length; t += 1) {
    const r = e.charCodeAt(t);
    if (r >= 55296 && r <= 56319) {
      const a = e.charCodeAt(t + 1);
      if (!(a >= 56320 && a <= 57343)) throw Se("Unpaired JSON surrogate");
      t += 1;
    } else if (r >= 56320 && r <= 57343) throw Se("Unpaired JSON surrogate");
  }
}
function Se(e) {
  const t = new SyntaxError(e);
  return t.code = "ambiguous-json", t;
}
const Xd = "webwindows-studio-validation-report-v1";
async function Pn(e, t = {}) {
  const r = t.contracts || await As(), a = up(r.ruleCatalog), l = [], u = (y, p = {}) => l.push(cp(a, y, p));
  Yd(r, u), Qd(e, r.packagePolicy, u);
  const s = e.files.find((y) => y.path === "manifest.json");
  let o = null;
  if (!s)
    u("WWP001", { path: "manifest.json", message: "ZIP root 必须包含 manifest.json。" });
  else
    try {
      Jd(s.content), o = JSON.parse(s.content);
    } catch (y) {
      u("WWM001", {
        path: "manifest.json",
        location: mp(s.content, y.message),
        message: y.message
      });
    }
  o && (ep(o, r, u), np(e, o, r.packagePolicy, u)), ip(e, o, r, u);
  const c = [...new Map(l.map((y) => [vp(y), y])).values()].sort(wp), n = c.filter((y) => y.severity === "error").length, i = c.filter((y) => y.severity === "warning").length, d = typeof o?.entry == "string" ? o.entry : null;
  return {
    contract: Xd,
    schemaVersion: 1,
    validatorVersion: r.ruleCatalog.validatorVersion,
    snapshotId: e.snapshotId,
    projectUuid: e.projectUuid,
    manifestIdentity: gp(o),
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
function Yd(e, t) {
  const r = e.runtimeCompatibility.packageRuntime;
  (r?.status !== "supported" || r?.model !== e.packagePolicy.runtimeModel) && t("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
}
function Qd(e, t, r) {
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
      const s = me(l.path);
      if (s !== l.path || s.length > t.limits.maxPathCharacters)
        throw new Error("not canonical");
    } catch {
      r("WWP002", { path: l.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const u = Kn(l.path);
    a.has(u) || r("WWP005", {
      path: l.path,
      message: `Package Runtime 不允许文件类型 ${u || "(none)"}。`,
      metadata: { extension: u }
    });
  }
}
function ep(e, t, r) {
  const a = _t(e);
  if (a == null) {
    r("WWM005", {
      path: "manifest.json$.manifestVersion",
      message: "不支持的 Manifest 版本；legacy v1 省略 manifestVersion，v2 显式使用数字 2。"
    });
    return;
  }
  const l = t.manifestSchemas?.[a] || t.manifestSchema, u = a === 2 ? Vs : Fs;
  if (!u(e))
    for (const c of u.errors || [])
      rp(a, c) || r("WWM002", {
        path: `manifest.json${yp(c.instancePath, c.params?.missingProperty)}`,
        message: c.message || c.keyword,
        metadata: { keyword: c.keyword, schemaPath: c.schemaPath }
      });
  tp(e, a, t.permissionRegistry, r), a === 2 && e.sdk?.apiVersion !== void 0 && e.sdk.apiVersion !== "1" && r("WWM009", {
    path: "manifest.json$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。",
    metadata: { actual: e.sdk.apiVersion }
  });
  const s = l.$defs?.sourceManifest?.properties || {};
  for (const [c, n] of Object.entries(s)) {
    if (!Object.prototype.hasOwnProperty.call(e, c)) continue;
    const i = pp(l, n), d = `${n.description || ""} ${i.description || ""}`;
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
function tp(e, t, r, a) {
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
    s.has(o) && a("WWM007", { path: n, message: `重复权限：${o}`, metadata: { permission: o } }), s.add(o), sp(o) ? a("WWM008", { path: n, message: `禁止声明超级或私有权限：${o}`, metadata: { permission: o } }) : l.has(o) ? u.has(o) || a("WWM008", { path: n, message: `权限尚未开放 Source Manifest 声明：${o}`, metadata: { permission: o } }) : a("WWM006", { path: n, message: `未知权限：${o}`, metadata: { permission: o } });
  });
}
function sp(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function rp(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function np(e, t, r, a) {
  if (typeof t.entry != "string") return;
  let l;
  try {
    l = me(t.entry);
  } catch {
    a("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  (!r.entryExtensions.includes(Kn(l)) || !jr(e, l)) && a("WWP006", {
    path: "manifest.json$.entry",
    message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
    metadata: { entry: l }
  });
}
function ip(e, t, r, a) {
  const l = dp(r.publicApiText), u = new Set(e.files.map((s) => s.path));
  for (const s of e.files) {
    const o = Kn(s.path);
    o === ".js" && op(s, l, t, a), (o === ".html" || o === ".htm") && ap(s, u, a), o === ".css" && lp(s, a);
  }
  (r.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported" || r.runtimeCompatibility.packageRuntime.execution.network !== "none") && a("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
}
function op(e, t, r, a) {
  const l = hp(e.content);
  wt(l, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (s, o) => {
    a("WWS001", { path: e.path, location: et(e.content, o), message: "Package Runtime 仅支持 classic JavaScript。" });
  }), wt(l, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (s, o) => {
    a("WWS003", { path: e.path, location: et(e.content, o), message: "功能代码不能引用私有 Native API。" });
  }), wt(l, /\bparent\s*\.\s*WebWindows\b/g, (s, o) => {
    a("WWS004", { path: e.path, location: et(e.content, o), message: "功能代码不能访问 parent.WebWindows。" });
  }), wt(l, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (s, o) => {
    const c = s[1];
    t.has(c) || a("WWS004", {
      path: e.path,
      location: et(e.content, o),
      message: `WebWindows.${c} 不属于 Public API v1。`,
      metadata: { namespace: c }
    });
  }), wt(l, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (s, o) => {
    a("WWS005", {
      path: e.path,
      location: et(e.content, o),
      message: `${s[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
  const u = /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*device\s*\.\s*battery\s*\.\s*(?:getState|refresh)\s*\(/g.exec(l);
  u && (_t(r) !== 2 || !r.permissions?.includes("device.battery-status.read")) && a("WWM010", {
    path: e.path,
    location: et(e.content, u.index),
    message: "Battery Broker API 需要 Manifest v2 声明 device.battery-status.read；静态提示不会自动授予权限。",
    metadata: { requiredPermission: "device.battery-status.read" }
  });
}
function ap(e, t, r) {
  wt(e.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (a, l) => {
    r("WWS001", { path: e.path, location: et(e.content, l), message: "Package Runtime 不支持 script type=module。" });
  }), wt(e.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (a, l) => {
    const u = a[2], s = fp(e.path, u);
    (!s || !t.has(s)) && r("WWS002", {
      path: e.path,
      location: et(e.content, l),
      message: `脚本或样式依赖必须包含在功能包内：${u}`,
      metadata: { reference: u }
    });
  }), wt(e.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (a, l) => {
    r("WWS002", {
      path: e.path,
      location: et(e.content, l),
      message: `外部资源在无网络 Runtime 中不可用：${a[1]}`,
      metadata: { reference: a[1] }
    });
  });
}
function lp(e, t) {
  wt(e.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (r, a) => {
    t("WWS002", {
      path: e.path,
      location: et(e.content, a),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${r[1]}`,
      metadata: { reference: r[1] }
    });
  });
}
function up(e) {
  return new Map(e.rules.map((t) => [t.ruleId, t]));
}
function cp(e, t, r) {
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
function dp(e) {
  const t = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(e)?.[1] || "";
  return new Set([...t.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((r) => r[1]));
}
function pp(e, t) {
  return t?.$ref?.startsWith("#/$defs/") ? e.$defs?.[t.$ref.slice(8)] || t : t || {};
}
function fp(e, t) {
  const r = String(t || "").split(/[?#]/, 1)[0];
  if (!r || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(r)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of r.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  return a.join("/");
}
function hp(e) {
  return e.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (t) => t.replace(/[^\n]/g, " ")
  );
}
function wt(e, t, r) {
  for (const a of e.matchAll(t)) r(a, a.index || 0);
}
function et(e, t) {
  const r = e.slice(0, t).split(`
`);
  return { line: r.length, column: r.at(-1).length + 1 };
}
function mp(e, t) {
  const r = /position\s+(\d+)/i.exec(t);
  return et(e, r ? Number(r[1]) : 0);
}
function yp(e, t) {
  return `$${(e || (t ? `/${t}` : "")).split("/").slice(1).map((a) => /^\d+$/.test(a) ? `[${a}]` : `.${a.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}
function gp(e) {
  return !e || typeof e.id != "string" || typeof e.version != "string" ? null : {
    id: e.id,
    version: e.version,
    name: typeof e.name == "string" ? e.name : null,
    manifestVersion: _t(e),
    sdkApiVersion: typeof e.sdk?.apiVersion == "string" ? e.sdk.apiVersion : null
  };
}
function Kn(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function wp(e, t) {
  return e.ruleId.localeCompare(t.ruleId) || String(e.path || "").localeCompare(String(t.path || "")) || (e.location?.line || 0) - (t.location?.line || 0) || e.message.localeCompare(t.message);
}
function vp(e) {
  return [
    e.ruleId,
    e.severity,
    e.path || "",
    e.location?.line || 0,
    e.location?.column || 0,
    e.message
  ].join("\0");
}
const ur = "webwindows-studio-preview-control-v1", bp = "webwindows-studio-preview-console-v1", kp = "webwindows-studio-preview-console-init-v1", Pp = "webwindows-studio-preview-sdk-init-v1", $p = "webwindows-studio-preview-session-v1", Ip = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'", qp = 30 * 1024 * 1024;
function Bs(e = "preview") {
  const t = globalThis.crypto;
  if (!t?.getRandomValues) throw new Error("Web Crypto is required for Preview sessions.");
  const r = new Uint8Array(24);
  t.getRandomValues(r);
  const a = [...r].map((l) => l.toString(16).padStart(2, "0")).join("");
  return `${e}-${a}`;
}
function ea(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class Sp {
  constructor({ onConsole: t, onState: r, onBroker: a } = {}) {
    this.onConsole = t || (() => {
    }), this.onState = r || (() => {
    }), this.onBroker = a || null, this.port = null, this.hostNonce = null, this.requests = /* @__PURE__ */ new Map();
  }
  async connect(t) {
    if (this.disconnect(), !t?.contentWindow) throw new Error("Developer Preview Host 尚未加载。");
    this.hostNonce = Bs("host");
    const r = new MessageChannel();
    this.port = r.port1, this.port.onmessage = (a) => this.#n(a.data), this.port.start(), t.contentWindow.postMessage({
      protocol: ur,
      version: 1,
      type: "host.connect",
      hostNonce: this.hostNonce
    }, location.origin, [r.port2]), await this.#t("host.ping", {}, 5e3);
  }
  async start(t, r, a = { facadeEnabled: !1 }) {
    const l = new TextEncoder().encode(r).byteLength;
    if (l > qp) throw new Error("Preview document 超过 30 MB 上限。");
    return this.#t("preview.start", {
      session: xp(t),
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
    const l = Bs("request");
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
        protocol: ur,
        version: 1,
        type: t,
        hostNonce: this.hostNonce,
        requestId: l,
        payload: r
      });
    });
  }
  #n(t) {
    if (!ea(t) || t.protocol !== ur || t.version !== 1 || t.hostNonce !== this.hostNonce || typeof t.type != "string") return;
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
          protocol: ur,
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
function xp(e) {
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
function Ap({ sessionId: e, snapshotId: t, token: r }) {
  const a = JSON.stringify({
    initProtocol: kp,
    protocol: bp,
    sessionId: e,
    snapshotId: t,
    token: r
  }).replace(/</g, "\\u003c");
  return `;(${jp.toString()})(${a});`;
}
function jp(e) {
  let u = null, s = 0;
  const o = [];
  function c(y) {
    const p = String(y);
    return p.length <= 4096 ? p : `${p.slice(0, 4096)}…[truncated]`;
  }
  function n(y, p, h) {
    if (y == null || typeof y == "boolean") return y;
    if (typeof y == "string" || typeof y == "number") return c(y);
    if (typeof y == "bigint") return `${y}n`;
    if (typeof y > "u") return "[undefined]";
    if (typeof y == "function") return `[Function${y.name ? ` ${y.name}` : ""}]`;
    if (typeof y == "symbol") return c(y.toString());
    if (y === globalThis || y === globalThis.window) return "[Window]";
    if (p >= 4) return "[Max depth]";
    if (h.has(y)) return "[Circular]";
    h.add(y);
    try {
      if (typeof Error < "u" && y instanceof Error)
        return { name: c(y.name), message: c(y.message), stack: c(y.stack || "") };
      if (typeof Node < "u" && y instanceof Node)
        return `[DOM ${y.nodeName || "Node"}]`;
      if (Array.isArray(y)) {
        const I = y.slice(0, 40).map((M) => n(M, p + 1, h));
        return y.length > 40 && I.push(`[${y.length - 40} more items]`), I;
      }
      const w = {}, $ = Object.keys(y).slice(0, 40);
      for (const I of $)
        try {
          w[c(I)] = n(y[I], p + 1, h);
        } catch (M) {
          w[c(I)] = `[Unreadable: ${c(M?.message || M)}]`;
        }
      return Object.keys(y).length > 40 && (w["…"] = "[truncated properties]"), w;
    } catch (w) {
      return `[Unserializable: ${c(w?.message || w)}]`;
    } finally {
      h.delete(y);
    }
  }
  function i(y, p) {
    return {
      protocol: e.protocol,
      version: 1,
      type: "console.event",
      sessionId: e.sessionId,
      snapshotId: e.snapshotId,
      token: e.token,
      sequence: s++,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: y,
      arguments: Array.from(p).map((h) => n(h, 0, /* @__PURE__ */ new Set()))
    };
  }
  function d(y, p) {
    const h = i(y, p);
    if (u)
      try {
        u.postMessage(h);
      } catch {
      }
    else o.length < 200 && o.push(h);
  }
  for (const y of ["log", "info", "warn", "error", "debug"]) {
    const p = console[y]?.bind(console) || console.log.bind(console);
    console[y] = function(...h) {
      d(y, h), p(...h);
    };
  }
  addEventListener("error", (y) => d("error", [{
    name: "UncaughtError",
    message: y.message || "Uncaught error",
    file: y.filename || null,
    line: y.lineno || null,
    column: y.colno || null,
    error: y.error || null
  }])), addEventListener("unhandledrejection", (y) => d("error", [{
    name: "UnhandledRejection",
    reason: y.reason
  }])), addEventListener("message", function(p) {
    const h = p.data;
    if (!(!h || h.protocol !== e.initProtocol || h.version !== 1 || h.sessionId !== e.sessionId || h.snapshotId !== e.snapshotId || h.token !== e.token || p.ports.length !== 1 || u))
      for (u = p.ports[0], u.start?.(); o.length; ) u.postMessage(o.shift());
  });
}
function Ep(e, t, r) {
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
  return `;(${Op.toString()})(${a});`;
}
function Op(e) {
  let t = null, r = 0, a = e.handshake?.ok === !0 ? o(e.handshake.result) : null;
  const l = e.handshake?.ok === !1 ? e.handshake.error : null, u = /* @__PURE__ */ new Map(), s = [];
  function o(h) {
    return { supported: h.supported, present: h.present, level: h.level, charging: h.charging, connected: h.connected, source: h.source };
  }
  function c(h) {
    const w = new Error(h?.message || "The WebWindows capability request failed.");
    return w.name = "WebWindowsCapabilityError", w.code = h?.code || "broker-unavailable", w.retryable = h?.retryable === !0, w;
  }
  function n() {
    const h = new Uint8Array(16);
    return crypto.getRandomValues(h), `sdk-${r++}-${Array.from(h, (w) => w.toString(16).padStart(2, "0")).join("")}`;
  }
  function i(h) {
    t ? t.postMessage(h) : s.push(h);
  }
  function d() {
    const h = n(), w = {
      protocol: e.protocol,
      version: e.version,
      type: "request",
      sessionId: e.sessionId,
      snapshotId: e.snapshotId,
      channelId: e.channelId,
      requestId: h,
      method: "device.battery.refresh",
      params: {}
    };
    return new Promise(($, I) => {
      const M = setTimeout(() => {
        if (!u.delete(h)) return;
        const { params: L, ...D } = w;
        i({ ...D, type: "cancel" }), I(c(e.clientErrors?.["request-timeout"]));
      }, e.refreshTimeoutMs);
      u.set(h, { resolve: $, reject: I, timer: M }), i(w);
    });
  }
  function y(h) {
    if (!h || h.protocol !== e.protocol || h.version !== e.version || h.type !== "response" || h.sessionId !== e.sessionId || h.snapshotId !== e.snapshotId || h.channelId !== e.channelId || h.method !== "device.battery.refresh" || typeof h.requestId != "string") return;
    const w = u.get(h.requestId);
    w && (u.delete(h.requestId), clearTimeout(w.timer), h.ok === !0 ? (a = o(h.result), w.resolve(o(a))) : w.reject(c(h.error)));
  }
  const p = Object.freeze({ getState() {
    if (!a) throw c(l || e.clientErrors?.["broker-unavailable"]);
    return o(a);
  }, refresh: d });
  Object.defineProperty(globalThis, "WebWindows", { value: Object.freeze({ device: Object.freeze({ battery: p }) }), configurable: !1, enumerable: !0, writable: !1 }), addEventListener("message", function(w) {
    const $ = w.data;
    if (!(!$ || $.protocol !== e.initProtocol || $.version !== 1 || $.sessionId !== e.sessionId || $.snapshotId !== e.snapshotId || $.channelId !== e.channelId || w.ports.length !== 1 || t))
      for (t = w.ports[0], t.onmessage = (I) => y(I.data), t.start?.(); s.length; ) t.postMessage(s.shift());
  });
}
function Tp({ sessionId: e, snapshotId: t }, r) {
  return Ep({ sessionId: e, snapshotId: t }, r, Pp);
}
const $n = Object.freeze({
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8",
  ".svg": "image/svg+xml;charset=utf-8"
}), _p = /* @__PURE__ */ new Set([".html", ".htm", ...Object.keys($n)]);
function Cp(e, t, r = {}) {
  const a = jr(e, "manifest.json");
  if (!a) throw new Error("Preview Snapshot 缺少 manifest.json。");
  const l = JSON.parse(a.content), u = me(l.entry), s = jr(e, u);
  if (!s || ![".html", ".htm"].includes(qs(u)))
    throw new Error("Preview Snapshot 的 HTML entry 不存在。");
  const c = (r.domParser || new DOMParser()).parseFromString(s.content, "text/html");
  if (c.querySelector('script[type="module"]')) throw new Error("Developer Preview 不支持 ES Module。");
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const h of e.files) {
    const w = qs(h.path);
    _p.has(w) && Object.prototype.hasOwnProperty.call($n, w) && ![".css", ".js"].includes(w) && n.set(h.path, Mp(h.content, $n[w]));
  }
  for (const h of e.files) {
    const w = qs(h.path);
    w === ".js" && i.set(h.path, h.content), w === ".css" && i.set(h.path, zi(h.content, h.path, n));
  }
  const d = c.createElement("meta");
  d.httpEquiv = "Content-Security-Policy", d.content = Ip, c.head.prepend(d);
  const y = c.createElement("script");
  y.setAttribute("data-webwindows-preview-bootstrap", "v1"), y.textContent = Ap(t), c.head.insertBefore(y, d.nextSibling);
  const p = Tp(t, r.sdkLaunch);
  if (p) {
    const h = c.createElement("script");
    h.setAttribute("data-webwindows-preview-sdk", "v1"), h.textContent = p, c.head.insertBefore(h, y.nextSibling);
  }
  return c.querySelectorAll("script[src]").forEach((h) => {
    const w = h.getAttribute("src"), $ = js(u, w);
    if (!$ || qs($) !== ".js" || !i.has($))
      throw new Error(`Preview 脚本必须来自 Snapshot：${w}`);
    h.removeAttribute("src"), h.textContent = i.get($);
  }), c.querySelectorAll('link[rel~="stylesheet"][href]').forEach((h) => {
    const w = h.getAttribute("href"), $ = js(u, w);
    if (!$ || qs($) !== ".css" || !i.has($))
      throw new Error(`Preview 样式必须来自 Snapshot：${w}`);
    const I = c.createElement("style");
    I.textContent = i.get($), h.replaceWith(I);
  }), c.querySelectorAll("style").forEach((h) => {
    h.textContent = zi(h.textContent, u, n);
  }), c.querySelectorAll("[src],[href],[poster]").forEach((h) => {
    for (const w of ["src", "href", "poster"]) {
      if (!h.hasAttribute(w)) continue;
      const $ = js(u, h.getAttribute(w));
      $ && n.has($) && h.setAttribute(w, n.get($));
    }
  }), c.querySelectorAll("[srcset]").forEach((h) => {
    const w = h.getAttribute("srcset").split(",").map(($) => {
      const I = $.trim().split(/\s+/), M = js(u, I[0]);
      return M && n.has(M) && (I[0] = n.get(M)), I.join(" ");
    });
    h.setAttribute("srcset", w.join(", "));
  }), `<!DOCTYPE html>
` + c.documentElement.outerHTML;
}
function js(e, t) {
  const r = String(t || "").split(/[?#]/, 1)[0];
  if (!r || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(r)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of r.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  try {
    return me(a.join("/"));
  } catch {
    return null;
  }
}
function zi(e, t, r) {
  return String(e).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (a, l, u) => {
    const s = js(t, u);
    return s && r.has(s) ? `url("${r.get(s)}")` : a;
  });
}
function Mp(e, t) {
  const r = new TextEncoder().encode(String(e));
  let a = "";
  for (let l = 0; l < r.length; l += 32768)
    a += String.fromCharCode(...r.subarray(l, l + 32768));
  return `data:${t};base64,${btoa(a)}`;
}
function qs(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function Np(e) {
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
const Ri = Er, Lp = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "request" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, params: { type: "object", maxProperties: 64 } } }, Br = Object.prototype.hasOwnProperty, W = Np, ye = new RegExp("^[A-Za-z0-9._:-]+$", "u"), Js = new RegExp("^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$", "u");
function ps(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ps.evaluated;
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
      if (!Br.call(Lp.properties, n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!Js.test(n)) {
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
  return ps.errors = s, o === 0;
}
ps.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Dp = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !0 }, result: {} } };
function fs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = fs.evaluated;
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
      if (!Br.call(Dp.properties, n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!Js.test(n)) {
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
  return fs.errors = s, o === 0;
}
fs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const zp = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !1 }, error: { $ref: "#/$defs/publicError" } } }, Rp = new RegExp("^[a-z]+(?:-[a-z]+)*$", "u");
function hs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = hs.evaluated;
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
      if (!Br.call(zp.properties, n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!Js.test(n)) {
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
            if (!Rp.test(i)) {
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
  return hs.errors = s, o === 0;
}
hs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ht(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Ht.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const n = o;
  let i = !1, d = null;
  const y = o;
  fs(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? fs.errors : s.concat(fs.errors), o = s.length);
  var w = y === o;
  if (w) {
    i = !0, d = 0;
    var p = !0;
  }
  const h = o;
  hs(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? hs.errors : s.concat(hs.errors), o = s.length);
  var w = h === o;
  if (w && i ? (i = !1, d = [d, 1]) : w && (i = !0, d = 1, p !== !0 && (p = !0)), i)
    o = n, s !== null && (n ? s.length = n : s = null);
  else {
    const $ = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [$] : s.push($), o++;
  }
  return Ht.errors = s, c.props = p, o === 0;
}
Ht.evaluated = { dynamicProps: !0, dynamicItems: !1 };
function ms(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ms.evaluated;
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!Js.test(n)) {
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
  return ms.errors = s, o === 0;
}
ms.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Wi = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "event" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, event: { enum: ["snapshot.update", "capability.change"] }, detail: { type: "object", maxProperties: 64 } } };
function ys(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ys.evaluated;
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
      if (!Br.call(Wi.properties, n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!ye.test(n)) {
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
        if (!Js.test(n)) {
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
        const i = { instancePath: t + "/event", schemaPath: "#/properties/event/enum", keyword: "enum", params: { allowedValues: Wi.properties.event.enum }, message: "must be equal to one of the allowed values" };
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
  return ys.errors = s, o === 0;
}
ys.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Er(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Er.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const n = o;
  let i = !1, d = null;
  const y = o;
  ps(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ps.errors : s.concat(ps.errors), o = s.length);
  var $ = y === o;
  if ($) {
    i = !0, d = 0;
    var p = !0;
  }
  const h = o;
  if (!Ht(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }))
    s = s === null ? Ht.errors : s.concat(Ht.errors), o = s.length;
  else
    var w = Ht.evaluated.props;
  var $ = h === o;
  if ($ && i)
    i = !1, d = [d, 1];
  else {
    $ && (i = !0, d = 1, p !== !0 && w !== void 0 && (w === !0 ? p = !0 : (p = p || {}, Object.assign(p, w))));
    const I = o;
    ms(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ms.errors : s.concat(ms.errors), o = s.length);
    var $ = I === o;
    if ($ && i)
      i = !1, d = [d, 2];
    else {
      $ && (i = !0, d = 2, p !== !0 && (p = !0));
      const L = o;
      ys(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ys.errors : s.concat(ys.errors), o = s.length);
      var $ = L === o;
      $ && i ? (i = !1, d = [d, 3]) : $ && (i = !0, d = 3, p !== !0 && (p = !0));
    }
  }
  if (i)
    o = n, s !== null && (n ? s.length = n : s = null);
  else {
    const I = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [I] : s.push(I), o++;
  }
  return Er.errors = s, c.props = p, o === 0;
}
Er.evaluated = { dynamicProps: !0, dynamicItems: !1 };
const Wp = Or;
function Or(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Or.evaluated;
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
  return Or.errors = s, o === 0;
}
Or.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Fp = Tr, Ss = { properties: { present: { type: ["boolean", "null"] }, level: { type: ["number", "null"] }, charging: { type: ["boolean", "null"] }, connected: { type: ["boolean", "null"] }, source: { enum: ["browser", "runtime", "unsupported"] } } };
function Tr(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Tr.evaluated;
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
        const i = { instancePath: t + "/present", schemaPath: "#/$defs/sanitizedBatteryState/properties/present/type", keyword: "type", params: { type: Ss.properties.present.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.level !== void 0) {
      let n = e.level;
      if (typeof n != "number" && n !== null) {
        const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/type", keyword: "type", params: { type: Ss.properties.level.type }, message: "must be number,null" };
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
        const i = { instancePath: t + "/charging", schemaPath: "#/$defs/sanitizedBatteryState/properties/charging/type", keyword: "type", params: { type: Ss.properties.charging.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.connected !== void 0) {
      let n = e.connected;
      if (typeof n != "boolean" && n !== null) {
        const i = { instancePath: t + "/connected", schemaPath: "#/$defs/sanitizedBatteryState/properties/connected/type", keyword: "type", params: { type: Ss.properties.connected.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.source !== void 0) {
      let n = e.source;
      if (!(n === "browser" || n === "runtime" || n === "unsupported")) {
        const i = { instancePath: t + "/source", schemaPath: "#/$defs/sanitizedBatteryState/properties/source/enum", keyword: "enum", params: { allowedValues: Ss.properties.source.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return Tr.errors = s, o === 0;
}
Tr.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Vp({
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
  let i = "not-evaluated", d = "denied", y = "not-evaluated", p = null;
  if (!c)
    p = "not-declared";
  else if (i = (typeof a == "function" ? a() : a) === !0 ? "allowed" : "denied", i === "denied")
    p = "policy-denied";
  else {
    const $ = typeof l == "function" ? l() : l;
    d = Hp(t?.consent, $), d === "denied" ? p = "grant-denied" : (y = (typeof u == "function" ? u() : u) === !0 ? "supported" : "unsupported", y === "unsupported" ? p = "capability-unsupported" : n !== "enabled" && (p = "method-disabled"));
  }
  const h = p ? r.stableDenialReasons[p] || "permission-denied" : null;
  return Object.freeze({
    contract: r.contract,
    permissionId: s,
    methodId: o,
    declared: c,
    policy: i,
    consentMode: t?.consent || "unspecified",
    grantState: d,
    capability: y,
    methodPolicy: n,
    effective: p === null,
    denialReason: p,
    publicErrorCode: h,
    policyVersion: r.policyVersion
  });
}
function Hp(e, t) {
  if (t === !1 || t?.allowed === !1 || t?.state === "denied") return "denied";
  if (e === "no-consent") return "not-required";
  const r = t?.state;
  return t?.allowed === !0 && [
    "session-grant",
    "persistent-user-grant",
    "resource-scoped-grant"
  ].includes(r) ? r : "denied";
}
function Fi(e) {
  return e?.effective ? null : e?.publicErrorCode || "permission-denied";
}
function Bp(e, t) {
  if (In(e) > t.maximumResponseBytes) throw cr("response-too-large");
  if (!Kp(e)) throw cr("internal-error");
  const r = {
    supported: e.supported,
    present: e.present,
    level: e.level,
    charging: e.charging,
    connected: e.connected,
    source: Up(e.supported, e.source)
  };
  if (!Fp(r)) throw cr("internal-error");
  if (In(r) > t.maximumResponseBytes) throw cr("response-too-large");
  return Object.freeze(r);
}
function In(e) {
  try {
    return new TextEncoder().encode(JSON.stringify(e)).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
function cr(e) {
  const t = new Error(e);
  return t.code = e, t;
}
function Up(e, t) {
  return !e || t === "unsupported" ? "unsupported" : t === "battery-status-api" || t === "browser" ? "browser" : "runtime";
}
function Kp(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class Zp {
  constructor(t) {
    this.session = t.session, this.manifest = t.manifest, this.contracts = t.contracts, this.publicApi = t.publicApi || null, this.platformPolicyPermits = t.platformPolicyPermits ?? !0, this.grantResolver = t.grantResolver || Jp, this.now = t.now || (() => Date.now()), this.setTimer = t.setTimer || ((r, a) => setTimeout(r, a)), this.clearTimer = t.clearTimer || ((r) => clearTimeout(r)), this.onDiagnostic = typeof t.onDiagnostic == "function" ? t.onDiagnostic : null, this.channelId = t.channelId || Bs("broker"), this.methods = new Map(this.contracts.brokerMethods.methods.map((r) => [r.id, r])), this.errors = new Map(this.contracts.brokerErrors.errors.map((r) => [r.code, r])), this.seen = /* @__PURE__ */ new Set(), this.pending = /* @__PURE__ */ new Map(), this.requestTimes = [], this.audit = [], this.diagnostics = [], this.closed = !1;
  }
  async createLaunchDescriptor() {
    if (_t(this.manifest) !== 2 || this.manifest.sdk?.apiVersion !== "1")
      return Object.freeze({ facadeEnabled: !1 });
    const t = this.methods.get("device.battery.getState"), r = this.#t(t), a = Fi(r);
    let l;
    if (a)
      l = { ok: !1, error: this.#a(a) }, this.#s("handshake", t, "deny", a, 0, r);
    else {
      const o = this.now();
      try {
        const c = this.#i().getState();
        l = { ok: !0, result: this.#l(c, t) }, this.#s("handshake", t, "allow", "success", this.now() - o, r);
      } catch (c) {
        const n = Vi(c);
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
    if (this.seen.add(t.requestId), In(t) > this.contracts.brokerPolicy.limits.maximumRequestBytes)
      return Promise.resolve(this.#e(t, "request-too-large"));
    const r = this.methods.get(t.method);
    if (!r || r.invocation !== "request-response" || r.previewAvailability !== "enabled")
      return Promise.resolve(this.#e(t, "method-not-allowed", r));
    const a = this.#t(r), l = Fi(a);
    if (l) return Promise.resolve(this.#e(t, l, r, !0, a));
    if (!Ri(t) || !Wp(t.params))
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
    return Vp({
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
    if (!t) throw Xp("capability-unsupported");
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
            this.#r(n, this.#e(t, Vi(d), r, !1));
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
    if (!Ri(t)) return null;
    const r = this.pending.get(t.requestId);
    return !r || r.message.method !== t.method || this.#r(r, this.#e(r.message, "request-cancelled", r.method, !1)), null;
  }
  #r(t, r) {
    if (t.settled) return;
    t.settled = !0, this.clearTimer(t.timer), this.pending.delete(t.message.requestId);
    const a = r.ok ? "success" : r.error.code;
    this.#s(t.message.requestId, t.method, r.ok ? "allow" : Yp(a), a, this.now() - t.startedAt, t.permissionDecision), t.resolve(r);
  }
  #l(t, r) {
    return Bp(t, r);
  }
  #c(t) {
    return ea(t) && t.sessionId === this.session.sessionId && t.snapshotId === this.session.snapshotId && t.channelId === this.channelId;
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
    const c = s?.denialReason || Gp(l), n = Object.freeze({
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
function Jp(e) {
  return e.consent === "no-consent";
}
function Gp(e) {
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
function Xp(e) {
  const t = new Error(e);
  return t.code = e, t;
}
function Vi(e) {
  return ["response-too-large", "capability-unsupported"].includes(e?.code) ? e.code : "internal-error";
}
function Yp(e) {
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
const Qp = 1800 * 1e3;
class ef {
  constructor({
    hostClient: t,
    ttlMs: r = Qp,
    now: a = () => Date.now(),
    publicApiProvider: l = tf,
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
    const l = await Pn(t, { contracts: r });
    if (!l.passed) return { started: !1, validationReport: l, session: null };
    this.activeSession && await this.stop(this.activeSession.sessionId);
    const u = this.#t(t);
    this.sessions.set(u.sessionId, u), this.activeSessionId = u.sessionId;
    try {
      const s = JSON.parse(jr(t, "manifest.json").content);
      u.broker = new Zp({
        session: u,
        manifest: s,
        contracts: r,
        publicApi: this.publicApiProvider(),
        platformPolicyPermits: this.platformPolicyPermits,
        grantResolver: this.grantResolver,
        onDiagnostic: this.onBrokerDiagnostic,
        now: this.now
      }), u.brokerLaunch = await u.broker.createLaunchDescriptor();
      const o = Cp(t, u, { domParser: a, sdkLaunch: u.brokerLaunch });
      return await this.hostClient.start(u, o, u.brokerLaunch), u.state = "running", u.expiryTimer = setTimeout(() => this.#i(u.sessionId).catch(() => {
      }), this.ttlMs), { started: !0, validationReport: l, session: cn(u) };
    } catch (s) {
      throw u.state = "failed", u.failure = s?.message || String(s), this.#o(u), s;
    }
  }
  async reload(t, r = {}) {
    const a = this.activeSession;
    a && (a.state = "reloading");
    const l = await Pn(t, { contracts: r.contracts });
    return l.passed ? (a && await this.stop(a.sessionId), this.run(t, r)) : (a && (a.state = "running"), { started: !1, validationReport: l, session: a ? cn(a) : null });
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
    return cn(r);
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
      contract: $p,
      sessionId: Bs("session"),
      projectUuid: t.projectUuid,
      snapshotId: t.snapshotId,
      token: Bs("token"),
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
function cn(e) {
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
function tf() {
  return globalThis.top?.WebWindows || globalThis.WebWindows || null;
}
const sf = { class: "studio-toolbar" }, rf = { class: "toolbar-group project-actions" }, nf = ["value"], of = ["value"], af = ["disabled"], lf = ["disabled"], uf = { class: "toolbar-group run-actions" }, cf = ["disabled"], df = ["disabled"], pf = ["disabled"], ff = ["disabled"], hf = ["disabled"], mf = {
  class: "toolbar-group panel-toolbar",
  "aria-label": "面板管理"
}, yf = {
  class: "studio-menubar",
  "aria-label": "Developer Studio 菜单栏"
}, gf = { class: "studio-menu" }, wf = {
  key: 0,
  class: "studio-menu-popup"
}, vf = ["disabled"], bf = ["disabled"], kf = { class: "studio-menu" }, Pf = {
  key: 0,
  class: "studio-menu-popup"
}, $f = ["disabled"], If = ["disabled"], qf = ["disabled"], Sf = { class: "studio-menu" }, xf = {
  key: 0,
  class: "studio-menu-popup"
}, Af = { class: "studio-menu" }, jf = {
  key: 0,
  class: "studio-menu-popup"
}, Ef = ["disabled"], Of = ["disabled"], Tf = { class: "studio-menu" }, _f = {
  key: 0,
  class: "studio-menu-popup"
}, Cf = ["disabled"], Mf = ["disabled"], Nf = { class: "studio-menu" }, Lf = {
  key: 0,
  class: "studio-menu-popup"
}, Df = ["onClick"], zf = { class: "explorer-panel" }, Rf = { class: "panel-heading" }, Wf = { class: "panel-actions" }, Ff = ["disabled"], Vf = ["disabled"], Hf = { class: "file-tree" }, Bf = { class: "editor-workbench" }, Uf = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, Kf = ["onClick"], Zf = {
  key: 0,
  class: "dirty-dot"
}, Jf = { class: "editor-host" }, Gf = {
  key: 1,
  class: "empty-editor"
}, Xf = { class: "editor-statusbar" }, Yf = { class: "status-path" }, Qf = { class: "inspector-panel" }, eh = { class: "panel-heading" }, th = { class: "panel-switcher" }, sh = { class: "inspector-content" }, rh = { class: "project-uuid" }, nh = { class: "build-inspector" }, ih = { key: 0 }, oh = { key: 1 }, ah = {
  key: 0,
  class: "build-blocked"
}, lh = { key: 1 }, uh = { class: "hash-row" }, ch = ["disabled"], dh = { class: "inspector-content" }, ph = { class: "preview-inspector" }, fh = { class: "preview-session-banner" }, hh = { key: 0 }, mh = { key: 1 }, yh = {
  key: 1,
  class: "empty-workspace studio-main"
}, gh = {
  key: 2,
  class: "storage-recovery",
  role: "alert"
}, wh = { class: "problems-panel" }, vh = { class: "bottom-tabs" }, bh = {
  key: 0,
  class: "storage-mode-badge",
  title: "IndexedDB 不可用；项目正在使用容量受限的隔离 localStorage 工作区。"
}, kh = ["value"], Ph = {
  key: 0,
  class: "problems-empty"
}, $h = ["onClick"], Ih = {
  key: 0,
  class: "problems-empty"
}, qh = {
  key: 0,
  class: "problems-empty"
}, Sh = { class: "studio-dialog-actions" }, xh = {
  class: "primary",
  type: "submit"
}, Ah = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new Cd(), r = K([]), a = K(null), l = K([]), u = K(""), s = K([]), o = K(""), c = K(""), n = K(/* @__PURE__ */ new Set()), i = K(null), d = K([]), y = K(null), p = K(null), h = K(null), w = K(null), $ = K(null), I = K(!1), M = K(null), L = K(!1), D = K(null), ee = K([]), ve = K([]), ce = K("problems"), we = K("manifest"), ut = K("all"), Ne = K(""), ct = K(""), It = K(!1), Mt = K(t.getStorageStatus()), Pe = K(null), Ye = K(!0), ie = K(!0), Z = K(!0), F = K(""), Le = K("light"), st = K("zh");
    let Re = null, Ie = 0, ws = 0, vs = null, Ze = null;
    const Nt = _e(() => Wd(l.value)), Ut = _e(() => l.value.find((b) => b.path === o.value)), Kt = _e(() => Fd(o.value)), Gs = _e(() => o.value === "manifest.json" ? d.value : []), qt = _e(() => _t(i.value)), Xs = _e(() => w.value?.diagnostics || d.value.map((b) => ({
      ruleId: "Manifest",
      severity: b.severity,
      path: b.path,
      message: b.message
    }))), g = _e(() => ut.value === "all" ? ee.value : ee.value.filter((b) => b.level === ut.value)), v = _e(() => ({
      "explorer-hidden": !Ye.value,
      "inspector-hidden": !ie.value
    })), P = _e(() => ({
      "theme-dark": Le.value === "dark",
      "bottom-panel-hidden": !Z.value
    }));
    Wn(async () => {
      A(), window.addEventListener("keydown", C), window.addEventListener("webwindows:language-changed", j), document.addEventListener("pointerdown", R);
      try {
        const b = await As();
        y.value = b.permissionRegistry, p.value = b.brokerMethods, h.value = b.runtimeCompatibility, await z(), r.value.length && await U(r.value[0].uuid);
      } catch (b) {
        re(b);
      }
    }), Fn(() => {
      clearTimeout(Ie), window.removeEventListener("keydown", C), window.removeEventListener("webwindows:language-changed", j), document.removeEventListener("pointerdown", R), Ze?.dispose().catch(() => {
      }), t.close();
    });
    function A() {
      st.value = localStorage.getItem("lang") || "zh";
      const b = localStorage.getItem("webwindows-developer-studio-theme");
      Le.value = b === "dark" || b === "light" ? b : window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      try {
        const m = JSON.parse(localStorage.getItem("webwindows-developer-studio-layout") || "{}");
        typeof m.explorer == "boolean" && (Ye.value = m.explorer), typeof m.inspector == "boolean" && (ie.value = m.inspector), typeof m.bottom == "boolean" && (Z.value = m.bottom);
      } catch {
      }
    }
    function S() {
      localStorage.setItem("webwindows-developer-studio-layout", JSON.stringify({
        explorer: Ye.value,
        inspector: ie.value,
        bottom: Z.value
      }));
    }
    function q(b) {
      b === "explorer" && (Ye.value = !Ye.value), b === "inspector" && (ie.value = !ie.value), b === "bottom" && (Z.value = !Z.value), S(), F.value = "";
    }
    function T(b) {
      Le.value = b, localStorage.setItem("webwindows-developer-studio-theme", b), F.value = "";
    }
    function E(b) {
      st.value = b, window.WebWindowsI18n?.setLanguage(b), F.value = "";
    }
    function j(b) {
      st.value = b.detail?.language || localStorage.getItem("lang") || "zh";
    }
    function x(b) {
      F.value = F.value === b ? "" : b;
    }
    function R(b) {
      b.target.closest?.(".studio-menu") || (F.value = "");
    }
    function C(b) {
      const m = b.ctrlKey || b.metaKey;
      m && !b.altKey && b.key.toLowerCase() === "n" ? (b.preventDefault(), V()) : m && !b.altKey && b.key.toLowerCase() === "s" ? (b.preventDefault(), fe().then(() => Fe("已保存。")).catch(re)) : m && b.shiftKey && b.key.toLowerCase() === "b" ? (b.preventDefault(), Kr()) : m && !b.shiftKey && !b.altKey && b.key.toLowerCase() === "b" ? (b.preventDefault(), q("explorer")) : m && !b.altKey && b.key.toLowerCase() === "j" ? (b.preventDefault(), q("bottom")) : m && b.altKey && b.key.toLowerCase() === "i" ? (b.preventDefault(), q("inspector")) : b.key === "F5" ? (b.preventDefault(), b.shiftKey ? sr() : tr()) : b.key === "Escape" && (F.value = "");
    }
    async function z() {
      r.value = await t.listProjects(), Mt.value = t.getStorageStatus();
    }
    async function V() {
      try {
        await fe();
        const b = $d(), m = await rr("新建 WebWindows 功能", "项目名称", b.displayName);
        if (m == null) return;
        const k = await t.createProject({ ...b, displayName: m });
        await z(), await U(k.uuid), Fe("Hello WebWindows 项目已创建。");
      } catch (b) {
        re(b);
      }
    }
    async function U(b) {
      if (!b) return;
      D.value && await sr(), await fe(), a.value = await t.getProject(b), l.value = await t.listEntries(b);
      const m = a.value.editorState || {};
      s.value = (m.openFiles || []).filter((k) => l.value.some((oe) => oe.path === k && oe.kind === "file")), o.value = l.value.some((k) => k.path === m.activeFile && k.kind === "file") ? m.activeFile : s.value[0] || "", u.value = o.value, n.value = /* @__PURE__ */ new Set(), Zt(), await Ee(), await Ys(), await bs();
    }
    async function Y() {
      if (!a.value) return;
      const b = await rr("重命名项目", "新的项目名称", a.value.displayName);
      if (b != null)
        try {
          a.value = await t.renameProject(a.value.uuid, b), await z(), Fe("项目已重命名。");
        } catch (m) {
          re(m);
        }
    }
    async function J() {
      if (a.value && await Zr("删除项目", `永久删除项目“${a.value.displayName}”及其全部文件吗？`))
        try {
          const b = a.value.uuid;
          await t.deleteProject(b), a.value = null, l.value = [], s.value = [], o.value = "", u.value = "", c.value = "", Zt(), await z(), r.value.length && await U(r.value[0].uuid), Fe("项目已删除。");
        } catch (b) {
          re(b);
        }
    }
    async function qe(b) {
      u.value = b.path, b.kind === "file" && await de(b.path);
    }
    async function de(b) {
      if (!a.value) return;
      await fe();
      const m = me(b);
      s.value.includes(m) || s.value.push(m), o.value = m, u.value = m, await Ee(), await bs();
    }
    async function Ee() {
      if (!a.value || !o.value) {
        c.value = "";
        return;
      }
      c.value = await t.readTextFile(a.value.uuid, o.value), o.value === "manifest.json" && await dt(c.value), await Dn();
    }
    function We(b) {
      c.value = b, o.value && (n.value = new Set(n.value).add(o.value), Zt(), o.value === "manifest.json" && dt(b).catch(re), clearTimeout(Ie), Ie = window.setTimeout(() => fe().catch(re), 700));
    }
    async function dt(b) {
      const m = ++ws, k = await yd(b);
      m === ws && (i.value = k.manifest, d.value = k.diagnostics);
    }
    async function Ys() {
      if (!a.value || !l.value.some((m) => m.path === "manifest.json" && m.kind === "file")) {
        i.value = null, d.value = [];
        return;
      }
      const b = o.value === "manifest.json" ? c.value : await t.readTextFile(a.value.uuid, "manifest.json");
      await dt(b);
    }
    async function Oe(b) {
      o.value !== "manifest.json" && await de("manifest.json"), We(`${JSON.stringify(b, null, 2)}
`);
    }
    async function fe() {
      if (clearTimeout(Ie), Ie = 0, !a.value || !o.value || !n.value.has(o.value)) return;
      const b = o.value;
      await t.writeTextFile(a.value.uuid, b, c.value);
      const m = new Set(n.value);
      m.delete(b), n.value = m, a.value = await t.getProject(a.value.uuid);
    }
    async function bs() {
      if (!a.value) return;
      const b = [o.value, ...a.value.editorState?.recentFiles || []].filter(Boolean);
      a.value = await t.saveEditorState(a.value.uuid, {
        openFiles: s.value,
        activeFile: o.value || null,
        recentFiles: [...new Set(b)].slice(0, 20)
      });
    }
    function Qs() {
      const b = l.value.find((m) => m.path === u.value);
      return b?.kind === "directory" ? b.path : b?.path ? Hs(b.path) : "";
    }
    async function er(b) {
      if (!a.value) return;
      const k = await rr(b === "directory" ? "新建目录" : "新建文件", b === "directory" ? "目录名称" : "文件名称", b === "directory" ? "new-folder" : "new-file.js");
      if (k != null)
        try {
          const oe = Li(Qs(), k);
          b === "directory" ? await t.createDirectory(a.value.uuid, oe) : await t.createFile(a.value.uuid, oe, ""), Zt(), l.value = await t.listEntries(a.value.uuid), u.value = oe, b === "file" && await de(oe);
        } catch (oe) {
          re(oe);
        }
    }
    async function Zn() {
      const b = l.value.find((k) => k.path === u.value);
      if (!b || !a.value) return;
      const m = await rr("重命名", "新的名称", kn(b.path));
      if (m != null)
        try {
          await fe();
          const k = Li(Hs(b.path), m);
          await t.renameEntry(a.value.uuid, b.path, k), Zt(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = k, await Ee();
        } catch (k) {
          re(k);
        }
    }
    async function ta() {
      const b = l.value.find((m) => m.path === u.value);
      if (!(!b || !a.value) && await Zr("删除文件或目录", `删除“${b.path}”${b.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(a.value.uuid, b.path), Zt(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = o.value, await Ee();
        } catch (m) {
          re(m);
        }
    }
    function Fe(b) {
      Ne.value = b, ct.value = "", window.setTimeout(() => {
        Ne.value === b && (Ne.value = "");
      }, 2400);
    }
    function re(b) {
      console.error("[DeveloperStudio]", b), It.value = Un(b) && b.recoverable !== !1, Ne.value = b?.message || "操作失败。", ct.value = "error";
    }
    async function sa() {
      if (await Zr(
        "修复 Developer Studio 项目存储",
        "这将永久删除当前浏览器中的所有 Developer Studio 项目和文件，并重新创建独立工作区。不会删除其他 WebWindows 数据。继续吗？"
      ))
        try {
          await t.resetStorage(), a.value = null, r.value = [], l.value = [], s.value = [], o.value = "", u.value = "", c.value = "", It.value = !1, await z(), Fe("Developer Studio 项目存储已重建，可以重新创建功能。");
        } catch (m) {
          re(m);
        }
    }
    async function Ur() {
      if (!a.value) throw new Error("请先打开项目。");
      return await fe(), Vd(t, a.value.uuid);
    }
    async function Jn() {
      if (!I.value) {
        I.value = !0;
        try {
          const b = await Ur(), m = await As();
          w.value = await Pn(b, { contracts: m }), $.value = null, Fe(w.value.passed ? "项目验证通过。" : `验证发现 ${w.value.errorCount} 个错误。`);
        } catch (b) {
          re(b);
        } finally {
          I.value = !1;
        }
      }
    }
    async function Kr() {
      if (!I.value) {
        I.value = !0;
        try {
          const b = await Ur(), m = await As(), { buildProjectPackage: k } = await import("./deterministic-builder-D5B_uga0.js");
          $.value = await k(b, { contracts: m }), w.value = $.value.validationReport, Fe($.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
        } catch (b) {
          re(b);
        } finally {
          I.value = !1;
        }
      }
    }
    async function Gn() {
      if (!$.value?.artifactReady || !$.value.zipBytes) return;
      const b = $.value.manifestIdentity, m = `${b?.id || "webwindows-function"}-${b?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-"), k = new Blob([$.value.zipBytes], { type: "application/zip" }), oe = window.WebWindows?.fileDialog;
      if (typeof oe?.saveBlob != "function")
        throw new Error("当前 WebWindows 环境不支持保存到云资料。");
      try {
        const ks = await oe.saveBlob({
          title: "将 WebWindows 功能包保存到云资料",
          suggestedName: `${m}.zip`,
          extensions: ["zip"],
          purpose: "developer-studio-build-export",
          location: "private"
        }, k);
        ks && Fe(`功能包已保存到云资料：${ks.path}`);
      } catch (ks) {
        re(ks);
      }
    }
    function Zt() {
      w.value = null, $.value = null;
    }
    async function ra() {
      L.value = !1, Ze?.dispose().catch(() => {
      }), vs = new Sp({
        onConsole: (b) => {
          const m = D.value || Ze?.activeSession;
          !m || b?.sessionId !== m.sessionId || b?.snapshotId !== m.snapshotId || (ee.value = [...ee.value, b].slice(-1e3));
        },
        onState: (b) => {
          !D.value || b?.sessionId !== D.value.sessionId || (D.value = { ...D.value, state: b.state });
        }
      }), Ze = new ef({
        hostClient: vs,
        onBrokerDiagnostic: (b) => {
          ve.value = [...ve.value, b].slice(-500);
        }
      });
      try {
        await vs.connect(M.value), L.value = !0;
      } catch (b) {
        re(b);
      }
    }
    async function tr({ reload: b = !1 } = {}) {
      if (!(I.value || !Ze || !L.value)) {
        I.value = !0;
        try {
          ve.value = [];
          const m = await Ur(), k = await As(), oe = b && D.value ? await Ze.reload(m, { contracts: k }) : await Ze.run(m, { contracts: k });
          if (w.value = oe.validationReport, $.value = null, ce.value = oe.started ? "console" : "problems", we.value = "preview", !oe.started) {
            Fe(`Developer Preview 被 ${oe.validationReport.errorCount} 个验证错误阻止。`);
            return;
          }
          D.value = oe.session, Fe(b ? "Developer Preview 已从新 Snapshot 重新加载。" : "Developer Preview 已启动。");
        } catch (m) {
          re(m);
        } finally {
          I.value = !1;
        }
      }
    }
    async function sr() {
      if (!(!Ze || !D.value))
        try {
          await Ze.stop(D.value.sessionId), D.value = null, ve.value = [], Fe("Developer Preview 已停止，会话凭据已撤销。");
        } catch (b) {
          re(b);
        }
    }
    function na() {
      ee.value = [];
    }
    function ia() {
      Ze?.clearBrokerDiagnostics(), ve.value = [];
    }
    function oa(b) {
      return b.arguments.map((m) => typeof m == "string" ? m : JSON.stringify(m)).join(" ");
    }
    function aa(b) {
      const m = l.value.find((k) => k.kind === "file" && (b.path === k.path || b.path?.startsWith(`${k.path}$`)));
      m && de(m.path).catch(re);
    }
    function rr(b, m, k) {
      return Xn({ kind: "text", title: b, message: m, value: k });
    }
    function Zr(b, m) {
      return Xn({ kind: "confirm", title: b, message: m, value: "" });
    }
    function Xn(b) {
      return Re && Re(null), Pe.value = { ...b }, new Promise((m) => {
        Re = m;
      });
    }
    function Jr(b) {
      const m = Re;
      Re = null, Pe.value = null, m?.(b);
    }
    return (b, m) => (O(), _("main", {
      class: ue(["developer-studio", P.value]),
      onClick: m[43] || (m[43] = xr((k) => F.value = "", ["self"]))
    }, [
      f("header", sf, [
        m[45] || (m[45] = f("div", { class: "studio-brand" }, [
          f("strong", null, "Developer Studio"),
          f("span", null, "WebWindows Function IDE")
        ], -1)),
        f("div", rf, [
          f("button", {
            class: "primary",
            type: "button",
            onClick: V
          }, "＋ 新建功能"),
          f("select", {
            "aria-label": "打开项目",
            value: a.value?.uuid || "",
            onChange: m[0] || (m[0] = (k) => U(k.target.value).catch(re))
          }, [
            m[44] || (m[44] = f("option", {
              value: "",
              disabled: ""
            }, "打开项目…", -1)),
            (O(!0), _(se, null, Je(r.value, (k) => (O(), _("option", {
              key: k.uuid,
              value: k.uuid
            }, N(k.displayName), 9, of))), 128))
          ], 40, nf),
          f("button", {
            type: "button",
            disabled: !a.value,
            onClick: Y
          }, "重命名", 8, af),
          f("button", {
            type: "button",
            disabled: !a.value,
            onClick: J
          }, "删除", 8, lf)
        ]),
        m[46] || (m[46] = f("span", { class: "toolbar-spacer" }, null, -1)),
        f("div", uf, [
          f("button", {
            type: "button",
            disabled: !a.value || I.value,
            onClick: Jn
          }, "✓ 验证", 8, cf),
          f("button", {
            class: "build-button",
            type: "button",
            disabled: !a.value || I.value,
            onClick: Kr
          }, "构建", 8, df),
          f("button", {
            class: "run-button",
            type: "button",
            disabled: !a.value || I.value || !L.value,
            onClick: m[1] || (m[1] = (k) => tr())
          }, "▶ 运行", 8, pf),
          f("button", {
            type: "button",
            title: "重新运行 (F5)",
            disabled: !D.value || I.value,
            onClick: m[2] || (m[2] = (k) => tr({ reload: !0 }))
          }, "↻", 8, ff),
          f("button", {
            type: "button",
            title: "停止 (Shift+F5)",
            disabled: !D.value,
            onClick: sr
          }, "■", 8, hf)
        ]),
        f("div", mf, [
          f("button", {
            type: "button",
            class: ue({ active: Ye.value }),
            title: "显示/隐藏项目资源管理器 (Ctrl+B)",
            onClick: m[3] || (m[3] = (k) => q("explorer"))
          }, [
            ke(zt, { name: "explorer" })
          ], 2),
          f("button", {
            type: "button",
            class: ue({ active: Z.value }),
            title: "显示/隐藏底部面板 (Ctrl+J)",
            onClick: m[4] || (m[4] = (k) => q("bottom"))
          }, [
            ke(zt, { name: "panel" })
          ], 2),
          f("button", {
            type: "button",
            class: ue({ active: ie.value }),
            title: "显示/隐藏检查器 (Ctrl+Alt+I)",
            onClick: m[5] || (m[5] = (k) => q("inspector"))
          }, [
            ke(zt, { name: "inspector" })
          ], 2)
        ])
      ]),
      f("nav", yf, [
        f("div", gf, [
          f("button", {
            type: "button",
            onClick: m[6] || (m[6] = (k) => x("file"))
          }, "文件"),
          F.value === "file" ? (O(), _("div", wf, [
            f("button", {
              type: "button",
              onClick: m[7] || (m[7] = (k) => {
                F.value = "", V();
              })
            }, [...m[47] || (m[47] = [
              f("span", null, "新建功能", -1),
              f("kbd", null, "Ctrl+N", -1)
            ])]),
            f("button", {
              type: "button",
              disabled: !a.value,
              onClick: m[8] || (m[8] = (k) => {
                F.value = "", fe().then(() => Fe("已保存。")).catch(re);
              })
            }, [...m[48] || (m[48] = [
              f("span", null, "保存", -1),
              f("kbd", null, "Ctrl+S", -1)
            ])], 8, vf),
            f("button", {
              type: "button",
              disabled: !$.value?.artifactReady,
              onClick: m[9] || (m[9] = (k) => {
                F.value = "", Gn();
              })
            }, [...m[49] || (m[49] = [
              f("span", null, "导出到云资料", -1)
            ])], 8, bf)
          ])) : le("", !0)
        ]),
        f("div", kf, [
          f("button", {
            type: "button",
            onClick: m[10] || (m[10] = (k) => x("edit"))
          }, "编辑"),
          F.value === "edit" ? (O(), _("div", Pf, [
            f("button", {
              type: "button",
              disabled: !a.value,
              onClick: m[11] || (m[11] = (k) => {
                F.value = "", er("file");
              })
            }, [...m[50] || (m[50] = [
              f("span", null, "新建文件", -1)
            ])], 8, $f),
            f("button", {
              type: "button",
              disabled: !a.value,
              onClick: m[12] || (m[12] = (k) => {
                F.value = "", er("directory");
              })
            }, [...m[51] || (m[51] = [
              f("span", null, "新建目录", -1)
            ])], 8, If),
            f("button", {
              type: "button",
              disabled: !u.value,
              onClick: m[13] || (m[13] = (k) => {
                F.value = "", Zn();
              })
            }, [...m[52] || (m[52] = [
              f("span", null, "重命名所选项", -1)
            ])], 8, qf)
          ])) : le("", !0)
        ]),
        f("div", Sf, [
          f("button", {
            type: "button",
            onClick: m[14] || (m[14] = (k) => x("view"))
          }, "视图"),
          F.value === "view" ? (O(), _("div", xf, [
            f("button", {
              type: "button",
              onClick: m[15] || (m[15] = (k) => q("explorer"))
            }, [
              f("span", null, N(Ye.value ? "隐藏" : "显示") + "项目资源管理器", 1),
              m[53] || (m[53] = f("kbd", null, "Ctrl+B", -1))
            ]),
            f("button", {
              type: "button",
              onClick: m[16] || (m[16] = (k) => q("bottom"))
            }, [
              f("span", null, N(Z.value ? "隐藏" : "显示") + "底部面板", 1),
              m[54] || (m[54] = f("kbd", null, "Ctrl+J", -1))
            ]),
            f("button", {
              type: "button",
              onClick: m[17] || (m[17] = (k) => q("inspector"))
            }, [
              f("span", null, N(ie.value ? "隐藏" : "显示") + "检查器", 1),
              m[55] || (m[55] = f("kbd", null, "Ctrl+Alt+I", -1))
            ]),
            m[58] || (m[58] = f("div", { class: "menu-separator" }, null, -1)),
            f("button", {
              type: "button",
              onClick: m[18] || (m[18] = (k) => T("light"))
            }, [
              m[56] || (m[56] = f("span", null, "浅色主题", -1)),
              f("span", null, N(Le.value === "light" ? "✓" : ""), 1)
            ]),
            f("button", {
              type: "button",
              onClick: m[19] || (m[19] = (k) => T("dark"))
            }, [
              m[57] || (m[57] = f("span", null, "深色主题", -1)),
              f("span", null, N(Le.value === "dark" ? "✓" : ""), 1)
            ])
          ])) : le("", !0)
        ]),
        f("div", Af, [
          f("button", {
            type: "button",
            onClick: m[20] || (m[20] = (k) => x("build"))
          }, "构建"),
          F.value === "build" ? (O(), _("div", jf, [
            f("button", {
              type: "button",
              disabled: !a.value || I.value,
              onClick: m[21] || (m[21] = (k) => {
                F.value = "", Jn();
              })
            }, [...m[59] || (m[59] = [
              f("span", null, "验证项目", -1)
            ])], 8, Ef),
            f("button", {
              type: "button",
              disabled: !a.value || I.value,
              onClick: m[22] || (m[22] = (k) => {
                F.value = "", Kr();
              })
            }, [...m[60] || (m[60] = [
              f("span", null, "构建功能包", -1),
              f("kbd", null, "Ctrl+Shift+B", -1)
            ])], 8, Of)
          ])) : le("", !0)
        ]),
        f("div", Tf, [
          f("button", {
            type: "button",
            onClick: m[23] || (m[23] = (k) => x("run"))
          }, "运行"),
          F.value === "run" ? (O(), _("div", _f, [
            f("button", {
              type: "button",
              disabled: !a.value || I.value || !L.value,
              onClick: m[24] || (m[24] = (k) => {
                F.value = "", tr();
              })
            }, [...m[61] || (m[61] = [
              f("span", null, "运行预览", -1),
              f("kbd", null, "F5", -1)
            ])], 8, Cf),
            f("button", {
              type: "button",
              disabled: !D.value,
              onClick: m[25] || (m[25] = (k) => {
                F.value = "", sr();
              })
            }, [...m[62] || (m[62] = [
              f("span", null, "停止预览", -1),
              f("kbd", null, "Shift+F5", -1)
            ])], 8, Mf)
          ])) : le("", !0)
        ]),
        f("div", Nf, [
          f("button", {
            type: "button",
            onClick: m[26] || (m[26] = (k) => x("language"))
          }, "语言"),
          F.value === "language" ? (O(), _("div", Lf, [
            (O(), _(se, null, Je([{ id: "zh", name: "简体中文" }, { id: "tw", name: "繁體中文" }, { id: "en", name: "English" }, { id: "jp", name: "日本語" }], (k) => f("button", {
              key: k.id,
              type: "button",
              onClick: (oe) => E(k.id)
            }, [
              f("span", null, N(k.name), 1),
              f("span", null, N(st.value === k.id ? "✓" : ""), 1)
            ], 8, Df)), 64))
          ])) : le("", !0)
        ]),
        m[63] || (m[63] = f("span", { class: "menubar-spacer" }, null, -1)),
        m[64] || (m[64] = f("span", { class: "menubar-hint" }, "WebWindows 专用开发环境", -1))
      ]),
      a.value ? (O(), _("section", {
        key: 0,
        class: ue(["studio-main", v.value])
      }, [
        St(f("aside", zf, [
          f("div", Rf, [
            f("span", null, "项目 · " + N(a.value.displayName), 1),
            f("div", Wf, [
              f("button", {
                type: "button",
                title: "新建文件",
                "aria-label": "新建文件",
                onClick: m[27] || (m[27] = (k) => er("file"))
              }, [
                ke(zt, { name: "file-add" })
              ]),
              f("button", {
                type: "button",
                title: "新建目录",
                "aria-label": "新建目录",
                onClick: m[28] || (m[28] = (k) => er("directory"))
              }, [
                ke(zt, { name: "folder-add" })
              ]),
              f("button", {
                type: "button",
                title: "重命名",
                "aria-label": "重命名",
                disabled: !u.value,
                onClick: Zn
              }, [
                ke(zt, { name: "rename" })
              ], 8, Ff),
              f("button", {
                type: "button",
                title: "删除",
                "aria-label": "删除",
                disabled: !u.value,
                onClick: ta
              }, [
                ke(zt, { name: "delete" })
              ], 8, Vf)
            ])
          ]),
          f("div", Hf, [
            (O(!0), _(se, null, Je(Nt.value, (k) => (O(), Pr(Ru, {
              key: k.path,
              node: k,
              "selected-path": u.value,
              onSelect: qe
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ], 512), [
          [Gt, Ye.value]
        ]),
        f("section", Bf, [
          f("nav", Uf, [
            (O(!0), _(se, null, Je(s.value, (k) => (O(), _("button", {
              key: k,
              type: "button",
              class: ue(["editor-tab", { active: k === o.value }]),
              onClick: (oe) => de(k).catch(re)
            }, [
              f("span", null, N(ho(kn)(k)), 1),
              n.value.has(k) ? (O(), _("span", Zf, "•")) : le("", !0)
            ], 10, Kf))), 128))
          ]),
          f("div", Jf, [
            Ut.value?.kind === "file" ? (O(), Pr(sc, {
              key: `${a.value.uuid}:${o.value}`,
              "project-id": a.value.uuid,
              path: o.value,
              language: Kt.value,
              value: c.value,
              markers: Gs.value,
              theme: Le.value,
              "onUpdate:value": We,
              onSave: m[29] || (m[29] = (k) => fe().then(() => Fe("已保存。")).catch(re)),
              onError: re
            }, null, 8, ["project-id", "path", "language", "value", "markers", "theme"])) : (O(), _("div", Gf, [...m[65] || (m[65] = [
              f("h2", null, "选择文件开始编辑", -1),
              f("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ]),
          f("footer", Xf, [
            f("span", Yf, N(o.value || "未选择文件"), 1),
            m[66] || (m[66] = f("span", { class: "status-spacer" }, null, -1)),
            m[67] || (m[67] = f("span", null, "Spaces: 2", -1)),
            m[68] || (m[68] = f("span", null, "UTF-8", -1)),
            f("span", null, N(Kt.value), 1)
          ])
        ]),
        St(f("aside", Qf, [
          f("div", eh, [
            m[69] || (m[69] = f("span", null, "检查器", -1)),
            f("div", th, [
              f("button", {
                type: "button",
                class: ue({ active: we.value === "manifest" }),
                onClick: m[30] || (m[30] = (k) => we.value = "manifest")
              }, "清单", 2),
              f("button", {
                type: "button",
                class: ue({ active: we.value === "permissions" }),
                onClick: m[31] || (m[31] = (k) => we.value = "permissions")
              }, "权限", 2),
              f("button", {
                type: "button",
                class: ue({ active: we.value === "preview" }),
                onClick: m[32] || (m[32] = (k) => we.value = "preview")
              }, "预览", 2)
            ])
          ]),
          St(f("div", sh, [
            f("h2", null, "Manifest " + N(qt.value === 2 ? "v2" : qt.value === 1 ? "v1" : "unsupported"), 1),
            f("p", rh, "项目 UUID：" + N(a.value.uuid), 1),
            ke(Lc, {
              manifest: i.value,
              diagnostics: d.value,
              language: st.value,
              "permission-registry": y.value,
              "broker-methods": p.value,
              "onUpdate:manifest": m[33] || (m[33] = (k) => Oe(k).catch(re)),
              onOpenJson: m[34] || (m[34] = (k) => de("manifest.json").catch(re))
            }, null, 8, ["manifest", "diagnostics", "language", "permission-registry", "broker-methods"]),
            f("section", nh, [
              m[79] || (m[79] = f("h3", null, "验证结果", -1)),
              w.value ? (O(), _("dl", oh, [
                f("div", null, [
                  m[70] || (m[70] = f("dt", null, "结果", -1)),
                  f("dd", null, N(w.value.passed ? "通过" : "阻止"), 1)
                ]),
                f("div", null, [
                  m[71] || (m[71] = f("dt", null, "错误", -1)),
                  f("dd", null, N(w.value.errorCount), 1)
                ]),
                f("div", null, [
                  m[72] || (m[72] = f("dt", null, "警告", -1)),
                  f("dd", null, N(w.value.warningCount), 1)
                ]),
                f("div", null, [
                  m[73] || (m[73] = f("dt", null, "文件", -1)),
                  f("dd", null, N(w.value.packageFacts.fileCount), 1)
                ]),
                f("div", null, [
                  m[74] || (m[74] = f("dt", null, "字节", -1)),
                  f("dd", null, N(w.value.packageFacts.unpackedBytes), 1)
                ])
              ])) : (O(), _("p", ih, "尚未创建 Snapshot 验证。")),
              $.value ? (O(), _(se, { key: 2 }, [
                m[78] || (m[78] = f("h3", null, "构建结果", -1)),
                $.value.artifactReady ? (O(), _("dl", lh, [
                  f("div", null, [
                    m[75] || (m[75] = f("dt", null, "大小", -1)),
                    f("dd", null, N($.value.zipSize) + " 字节", 1)
                  ]),
                  f("div", null, [
                    m[76] || (m[76] = f("dt", null, "文件", -1)),
                    f("dd", null, N($.value.fileCount), 1)
                  ]),
                  f("div", uh, [
                    m[77] || (m[77] = f("dt", null, "SHA-256", -1)),
                    f("dd", null, N($.value.sha256), 1)
                  ])
                ])) : (O(), _("p", ah, "验证未通过，没有生成可发布 ZIP。")),
                f("button", {
                  type: "button",
                  disabled: !$.value.artifactReady,
                  onClick: Gn
                }, "保存 ZIP 到云资料", 8, ch)
              ], 64)) : le("", !0)
            ])
          ], 512), [
            [Gt, we.value === "manifest"]
          ]),
          St(f("div", dh, [
            m[80] || (m[80] = f("h2", null, "权限检查器", -1)),
            ke(Rc, {
              manifest: i.value,
              "permission-registry": y.value,
              "broker-methods": p.value,
              "runtime-compatibility": h.value,
              decisions: ve.value
            }, null, 8, ["manifest", "permission-registry", "broker-methods", "runtime-compatibility", "decisions"])
          ], 512), [
            [Gt, we.value === "permissions"]
          ]),
          St(f("div", ph, [
            f("div", fh, [
              m[81] || (m[81] = f("strong", null, "开发者预览", -1)),
              D.value ? (O(), _("span", hh, N(D.value.state) + " · " + N(D.value.snapshotId), 1)) : (O(), _("span", mh, "无活动会话"))
            ]),
            f("iframe", {
              ref_key: "previewHostFrame",
              ref: M,
              class: "preview-host-frame",
              src: "developer-preview-host.html?v=20260829-1",
              title: "Trusted Developer Preview Host",
              referrerpolicy: "no-referrer",
              onLoad: ra
            }, null, 544)
          ], 512), [
            [Gt, we.value === "preview"]
          ])
        ], 512), [
          [Gt, ie.value]
        ])
      ], 2)) : (O(), _("section", yh, [
        m[82] || (m[82] = f("h2", null, "创建第一个 WebWindows 功能", -1)),
        m[83] || (m[83] = f("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        f("button", {
          class: "primary",
          type: "button",
          onClick: V
        }, "新建 Hello WebWindows")
      ])),
      It.value ? (O(), _("section", gh, [
        m[84] || (m[84] = f("div", null, [
          f("strong", null, "项目存储需要修复"),
          f("span", null, "仅在错误持续出现时使用；修复会删除此浏览器中的 Developer Studio 项目。")
        ], -1)),
        f("button", {
          type: "button",
          onClick: sa
        }, "修复项目存储")
      ])) : le("", !0),
      St(f("section", wh, [
        f("div", vh, [
          f("button", {
            type: "button",
            class: ue({ active: ce.value === "problems" }),
            onClick: m[35] || (m[35] = (k) => ce.value = "problems")
          }, [
            m[85] || (m[85] = pe("问题 ", -1)),
            f("span", null, N(Xs.value.length), 1)
          ], 2),
          f("button", {
            type: "button",
            class: ue({ active: ce.value === "console" }),
            onClick: m[36] || (m[36] = (k) => ce.value = "console")
          }, [
            m[86] || (m[86] = pe("控制台 ", -1)),
            f("span", null, N(ee.value.length), 1)
          ], 2),
          f("button", {
            type: "button",
            class: ue({ active: ce.value === "broker" }),
            onClick: m[37] || (m[37] = (k) => ce.value = "broker")
          }, [
            m[87] || (m[87] = pe("权限诊断 ", -1)),
            f("span", null, N(ve.value.length), 1)
          ], 2),
          m[89] || (m[89] = f("span", { class: "bottom-spacer" }, null, -1)),
          Mt.value.degraded ? (O(), _("span", bh, "⚠ 本地兼容存储")) : le("", !0),
          ce.value === "console" ? (O(), _(se, { key: 1 }, [
            St(f("select", {
              "onUpdate:modelValue": m[38] || (m[38] = (k) => ut.value = k),
              "aria-label": "控制台级别"
            }, [
              m[88] || (m[88] = f("option", { value: "all" }, "全部级别", -1)),
              (O(), _(se, null, Je(["log", "info", "warn", "error", "debug"], (k) => f("option", {
                key: k,
                value: k
              }, N(k), 9, kh)), 64))
            ], 512), [
              [xu, ut.value]
            ]),
            f("button", {
              type: "button",
              onClick: na
            }, "清除")
          ], 64)) : ce.value === "broker" ? (O(), _("button", {
            key: 2,
            type: "button",
            onClick: ia
          }, "清除")) : le("", !0)
        ]),
        ce.value === "problems" ? (O(), _(se, { key: 0 }, [
          Xs.value.length ? le("", !0) : (O(), _("div", Ph, "当前 Snapshot 未发现问题。")),
          (O(!0), _(se, null, Je(Xs.value, (k, oe) => (O(), _("button", {
            key: `${k.ruleId}:${k.path}:${oe}`,
            type: "button",
            class: "problem-row",
            onClick: (ks) => aa(k)
          }, [
            f("span", {
              class: ue(["problem-severity", k.severity])
            }, N(k.ruleId), 3),
            f("code", null, N(k.path), 1),
            f("span", null, N(k.message), 1)
          ], 8, $h))), 128))
        ], 64)) : ce.value === "console" ? (O(), _(se, { key: 1 }, [
          g.value.length ? le("", !0) : (O(), _("div", Ih, "当前开发者预览尚无控制台输出。")),
          (O(!0), _(se, null, Je(g.value, (k) => (O(), _("div", {
            key: `${k.sessionId}:${k.sequence}`,
            class: ue(["console-row", k.level])
          }, [
            f("time", null, N(k.timestamp), 1),
            f("strong", null, N(k.level), 1),
            f("span", null, N(oa(k)), 1),
            f("code", null, N(k.snapshotId), 1)
          ], 2))), 128))
        ], 64)) : (O(), _(se, { key: 2 }, [
          ve.value.length ? le("", !0) : (O(), _("div", qh, "当前预览尚无 Broker 权限诊断。")),
          (O(!0), _(se, null, Je(ve.value, (k, oe) => (O(), _("div", {
            key: `${k.sessionId}:${k.requestId}:${oe}`,
            class: "broker-row"
          }, [
            f("time", null, N(k.timestamp), 1),
            f("code", null, N(k.method || "protocol"), 1),
            f("span", null, N(k.permission || "—"), 1),
            f("span", null, "已声明：" + N(k.declared == null ? "不适用" : k.declared ? "是" : "否"), 1),
            f("span", null, "策略：" + N(k.policyDecision), 1),
            f("span", null, "授权：" + N(k.grantState || "不适用"), 1),
            f("span", null, "能力：" + N(k.capabilityState), 1),
            f("strong", {
              class: ue(k.finalDecision)
            }, N(k.denialReason || k.resultCategory), 3)
          ]))), 128))
        ], 64))
      ], 512), [
        [Gt, Z.value]
      ]),
      Ne.value ? (O(), _("div", {
        key: 3,
        class: ue(["studio-status", ct.value]),
        role: "status"
      }, N(Ne.value), 3)) : le("", !0),
      Pe.value ? (O(), _("div", {
        key: 4,
        class: "studio-dialog-backdrop",
        onKeydown: m[42] || (m[42] = Ou((k) => Jr(Pe.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        f("form", {
          class: "studio-dialog",
          onSubmit: m[41] || (m[41] = xr((k) => Jr(Pe.value.kind === "confirm" ? !0 : Pe.value.value), ["prevent"]))
        }, [
          f("h2", null, N(Pe.value.title), 1),
          f("p", null, N(Pe.value.message), 1),
          Pe.value.kind === "text" ? St((O(), _("input", {
            key: 0,
            "onUpdate:modelValue": m[39] || (m[39] = (k) => Pe.value.value = k),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [Su, Pe.value.value]
          ]) : le("", !0),
          f("div", Sh, [
            f("button", {
              type: "button",
              onClick: m[40] || (m[40] = (k) => Jr(Pe.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            f("button", xh, N(Pe.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : le("", !0)
    ], 2));
  }
};
Cu(Ah).mount("#developer-studio-app");
export {
  _t as a,
  jr as g,
  Hd as s,
  Pn as v
};
