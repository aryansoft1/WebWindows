/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function In(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const Z = {}, Mt = [], Ke = () => {
}, Ur = () => !1, Us = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), On = (e) => e.startsWith("onUpdate:"), xe = Object.assign, Mn = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, Gi = Object.prototype.hasOwnProperty, J = (e, t) => Gi.call(e, t), q = Array.isArray, Rt = (e) => ds(e) === "[object Map]", Vs = (e) => ds(e) === "[object Set]", sr = (e) => ds(e) === "[object Date]", W = (e) => typeof e == "function", le = (e) => typeof e == "string", Ge = (e) => typeof e == "symbol", ee = (e) => e !== null && typeof e == "object", Vr = (e) => (ee(e) || W(e)) && W(e.then) && W(e.catch), zr = Object.prototype.toString, ds = (e) => zr.call(e), Xi = (e) => ds(e).slice(8, -1), Br = (e) => ds(e) === "[object Object]", Rn = (e) => le(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Yt = /* @__PURE__ */ In(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), zs = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((s) => t[s] || (t[s] = e(s)));
}, Zi = /-\w/g, Fe = zs(
  (e) => e.replace(Zi, (t) => t.slice(1).toUpperCase())
), Yi = /\B([A-Z])/g, wt = zs(
  (e) => e.replace(Yi, "-$1").toLowerCase()
), Bs = zs((e) => e.charAt(0).toUpperCase() + e.slice(1)), nn = zs(
  (e) => e ? `on${Bs(e)}` : ""
), gt = (e, t) => !Object.is(e, t), _s = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, Kr = (e, t, s, n = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: n,
    value: s
  });
}, Cs = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let nr;
const Ks = () => nr || (nr = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Nn(e) {
  if (q(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const n = e[s], i = le(n) ? so(n) : Nn(n);
      if (i)
        for (const o in i)
          t[o] = i[o];
    }
    return t;
  } else if (le(e) || ee(e))
    return e;
}
const Qi = /;(?![^(]*\))/g, eo = /:([^]+)/, to = /\/\*[^]*?\*\//g;
function so(e) {
  const t = {};
  return e.replace(to, "").split(Qi).forEach((s) => {
    if (s) {
      const n = s.split(eo);
      n.length > 1 && (t[n[0].trim()] = n[1].trim());
    }
  }), t;
}
function je(e) {
  let t = "";
  if (le(e))
    t = e;
  else if (q(e))
    for (let s = 0; s < e.length; s++) {
      const n = je(e[s]);
      n && (t += n + " ");
    }
  else if (ee(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const no = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", ro = /* @__PURE__ */ In(no);
function Jr(e) {
  return !!e || e === "";
}
function io(e, t) {
  if (e.length !== t.length) return !1;
  let s = !0;
  for (let n = 0; s && n < e.length; n++)
    s = Js(e[n], t[n]);
  return s;
}
function Js(e, t) {
  if (e === t) return !0;
  let s = sr(e), n = sr(t);
  if (s || n)
    return s && n ? e.getTime() === t.getTime() : !1;
  if (s = Ge(e), n = Ge(t), s || n)
    return e === t;
  if (s = q(e), n = q(t), s || n)
    return s && n ? io(e, t) : !1;
  if (s = ee(e), n = ee(t), s || n) {
    if (!s || !n)
      return !1;
    const i = Object.keys(e).length, o = Object.keys(t).length;
    if (i !== o)
      return !1;
    for (const r in e) {
      const a = e.hasOwnProperty(r), u = t.hasOwnProperty(r);
      if (a && !u || !a && u || !Js(e[r], t[r]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function oo(e, t) {
  return e.findIndex((s) => Js(s, t));
}
const Gr = (e) => !!(e && e.__v_isRef === !0), V = (e) => le(e) ? e : e == null ? "" : q(e) || ee(e) && (e.toString === zr || !W(e.toString)) ? Gr(e) ? V(e.value) : JSON.stringify(e, Xr, 2) : String(e), Xr = (e, t) => Gr(t) ? Xr(e, t.value) : Rt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [n, i], o) => (s[rn(n, o) + " =>"] = i, s),
    {}
  )
} : Vs(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => rn(s))
} : Ge(t) ? rn(t) : ee(t) && !q(t) && !Br(t) ? String(t) : t, rn = (e, t = "") => {
  var s;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Ge(e) ? `Symbol(${(s = e.description) != null ? s : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ee;
class ao {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Ee, !t && Ee && (this.index = (Ee.scopes || (Ee.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].pause();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].resume();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const s = Ee;
      try {
        return Ee = this, t();
      } finally {
        Ee = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Ee, Ee = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Ee = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let s, n;
      for (s = 0, n = this.effects.length; s < n; s++)
        this.effects[s].stop();
      for (this.effects.length = 0, s = 0, n = this.cleanups.length; s < n; s++)
        this.cleanups[s]();
      if (this.cleanups.length = 0, this.scopes) {
        for (s = 0, n = this.scopes.length; s < n; s++)
          this.scopes[s].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const i = this.parent.scopes.pop();
        i && i !== this && (this.parent.scopes[this.index] = i, i.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function lo() {
  return Ee;
}
let Y;
const on = /* @__PURE__ */ new WeakSet();
class Zr {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Ee && Ee.active && Ee.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, on.has(this) && (on.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Qr(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, rr(this), ei(this);
    const t = Y, s = qe;
    Y = this, qe = !0;
    try {
      return this.fn();
    } finally {
      ti(this), Y = t, qe = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Dn(t);
      this.deps = this.depsTail = void 0, rr(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? on.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    vn(this) && this.run();
  }
  get dirty() {
    return vn(this);
  }
}
let Yr = 0, Qt, es;
function Qr(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = es, es = e;
    return;
  }
  e.next = Qt, Qt = e;
}
function Fn() {
  Yr++;
}
function qn() {
  if (--Yr > 0)
    return;
  if (es) {
    let t = es;
    for (es = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; Qt; ) {
    let t = Qt;
    for (Qt = void 0; t; ) {
      const s = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (n) {
          e || (e = n);
        }
      t = s;
    }
  }
  if (e) throw e;
}
function ei(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function ti(e) {
  let t, s = e.depsTail, n = s;
  for (; n; ) {
    const i = n.prevDep;
    n.version === -1 ? (n === s && (s = i), Dn(n), co(n)) : t = n, n.dep.activeLink = n.prevActiveLink, n.prevActiveLink = void 0, n = i;
  }
  e.deps = t, e.depsTail = s;
}
function vn(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (si(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function si(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === os) || (e.globalVersion = os, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !vn(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = Y, n = qe;
  Y = e, qe = !0;
  try {
    ei(e);
    const i = e.fn(e._value);
    (t.version === 0 || gt(i, e._value)) && (e.flags |= 128, e._value = i, t.version++);
  } catch (i) {
    throw t.version++, i;
  } finally {
    Y = s, qe = n, ti(e), e.flags &= -3;
  }
}
function Dn(e, t = !1) {
  const { dep: s, prevSub: n, nextSub: i } = e;
  if (n && (n.nextSub = i, e.prevSub = void 0), i && (i.prevSub = n, e.nextSub = void 0), s.subs === e && (s.subs = n, !n && s.computed)) {
    s.computed.flags &= -5;
    for (let o = s.computed.deps; o; o = o.nextDep)
      Dn(o, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function co(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let qe = !0;
const ni = [];
function ot() {
  ni.push(qe), qe = !1;
}
function at() {
  const e = ni.pop();
  qe = e === void 0 ? !0 : e;
}
function rr(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const s = Y;
    Y = void 0;
    try {
      t();
    } finally {
      Y = s;
    }
  }
}
let os = 0;
class uo {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Wn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!Y || !qe || Y === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== Y)
      s = this.activeLink = new uo(Y, this), Y.deps ? (s.prevDep = Y.depsTail, Y.depsTail.nextDep = s, Y.depsTail = s) : Y.deps = Y.depsTail = s, ri(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const n = s.nextDep;
      n.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = n), s.prevDep = Y.depsTail, s.nextDep = void 0, Y.depsTail.nextDep = s, Y.depsTail = s, Y.deps === s && (Y.deps = n);
    }
    return s;
  }
  trigger(t) {
    this.version++, os++, this.notify(t);
  }
  notify(t) {
    Fn();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      qn();
    }
  }
}
function ri(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let n = t.deps; n; n = n.nextDep)
        ri(n);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const wn = /* @__PURE__ */ new WeakMap(), jt = Symbol(
  ""
), bn = Symbol(
  ""
), as = Symbol(
  ""
);
function me(e, t, s) {
  if (qe && Y) {
    let n = wn.get(e);
    n || wn.set(e, n = /* @__PURE__ */ new Map());
    let i = n.get(s);
    i || (n.set(s, i = new Wn()), i.map = n, i.key = s), i.track();
  }
}
function st(e, t, s, n, i, o) {
  const r = wn.get(e);
  if (!r) {
    os++;
    return;
  }
  const a = (u) => {
    u && u.trigger();
  };
  if (Fn(), t === "clear")
    r.forEach(a);
  else {
    const u = q(e), l = u && Rn(s);
    if (u && s === "length") {
      const c = Number(n);
      r.forEach((d, m) => {
        (m === "length" || m === as || !Ge(m) && m >= c) && a(d);
      });
    } else
      switch ((s !== void 0 || r.has(void 0)) && a(r.get(s)), l && a(r.get(as)), t) {
        case "add":
          u ? l && a(r.get("length")) : (a(r.get(jt)), Rt(e) && a(r.get(bn)));
          break;
        case "delete":
          u || (a(r.get(jt)), Rt(e) && a(r.get(bn)));
          break;
        case "set":
          Rt(e) && a(r.get(jt));
          break;
      }
  }
  qn();
}
function It(e) {
  const t = K(e);
  return t === e ? t : (me(t, "iterate", as), Ne(e) ? t : t.map(de));
}
function Gs(e) {
  return me(e = K(e), "iterate", as), e;
}
const fo = {
  __proto__: null,
  [Symbol.iterator]() {
    return an(this, Symbol.iterator, de);
  },
  concat(...e) {
    return It(this).concat(
      ...e.map((t) => q(t) ? It(t) : t)
    );
  },
  entries() {
    return an(this, "entries", (e) => (e[1] = de(e[1]), e));
  },
  every(e, t) {
    return Qe(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Qe(this, "filter", e, t, (s) => s.map(de), arguments);
  },
  find(e, t) {
    return Qe(this, "find", e, t, de, arguments);
  },
  findIndex(e, t) {
    return Qe(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Qe(this, "findLast", e, t, de, arguments);
  },
  findLastIndex(e, t) {
    return Qe(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Qe(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return ln(this, "includes", e);
  },
  indexOf(...e) {
    return ln(this, "indexOf", e);
  },
  join(e) {
    return It(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return ln(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Qe(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Bt(this, "pop");
  },
  push(...e) {
    return Bt(this, "push", e);
  },
  reduce(e, ...t) {
    return ir(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return ir(this, "reduceRight", e, t);
  },
  shift() {
    return Bt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Qe(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Bt(this, "splice", e);
  },
  toReversed() {
    return It(this).toReversed();
  },
  toSorted(e) {
    return It(this).toSorted(e);
  },
  toSpliced(...e) {
    return It(this).toSpliced(...e);
  },
  unshift(...e) {
    return Bt(this, "unshift", e);
  },
  values() {
    return an(this, "values", de);
  }
};
function an(e, t, s) {
  const n = Gs(e), i = n[t]();
  return n !== e && !Ne(e) && (i._next = i.next, i.next = () => {
    const o = i._next();
    return o.value && (o.value = s(o.value)), o;
  }), i;
}
const po = Array.prototype;
function Qe(e, t, s, n, i, o) {
  const r = Gs(e), a = r !== e && !Ne(e), u = r[t];
  if (u !== po[t]) {
    const d = u.apply(e, o);
    return a ? de(d) : d;
  }
  let l = s;
  r !== e && (a ? l = function(d, m) {
    return s.call(this, de(d), m, e);
  } : s.length > 2 && (l = function(d, m) {
    return s.call(this, d, m, e);
  }));
  const c = u.call(r, l, n);
  return a && i ? i(c) : c;
}
function ir(e, t, s, n) {
  const i = Gs(e);
  let o = s;
  return i !== e && (Ne(e) ? s.length > 3 && (o = function(r, a, u) {
    return s.call(this, r, a, u, e);
  }) : o = function(r, a, u) {
    return s.call(this, r, de(a), u, e);
  }), i[t](o, ...n);
}
function ln(e, t, s) {
  const n = K(e);
  me(n, "iterate", as);
  const i = n[t](...s);
  return (i === -1 || i === !1) && Vn(s[0]) ? (s[0] = K(s[0]), n[t](...s)) : i;
}
function Bt(e, t, s = []) {
  ot(), Fn();
  const n = K(e)[t].apply(e, s);
  return qn(), at(), n;
}
const ho = /* @__PURE__ */ In("__proto__,__v_isRef,__isVue"), ii = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Ge)
);
function mo(e) {
  Ge(e) || (e = String(e));
  const t = K(this);
  return me(t, "has", e), t.hasOwnProperty(e);
}
class oi {
  constructor(t = !1, s = !1) {
    this._isReadonly = t, this._isShallow = s;
  }
  get(t, s, n) {
    if (s === "__v_skip") return t.__v_skip;
    const i = this._isReadonly, o = this._isShallow;
    if (s === "__v_isReactive")
      return !i;
    if (s === "__v_isReadonly")
      return i;
    if (s === "__v_isShallow")
      return o;
    if (s === "__v_raw")
      return n === (i ? o ? ko : ui : o ? ci : li).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(n) ? t : void 0;
    const r = q(t);
    if (!i) {
      let u;
      if (r && (u = fo[s]))
        return u;
      if (s === "hasOwnProperty")
        return mo;
    }
    const a = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      ye(t) ? t : n
    );
    return (Ge(s) ? ii.has(s) : ho(s)) || (i || me(t, "get", s), o) ? a : ye(a) ? r && Rn(s) ? a : a.value : ee(a) ? i ? fi(a) : Ln(a) : a;
  }
}
class ai extends oi {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, n, i) {
    let o = t[s];
    if (!this._isShallow) {
      const u = yt(o);
      if (!Ne(n) && !yt(n) && (o = K(o), n = K(n)), !q(t) && ye(o) && !ye(n))
        return u || (o.value = n), !0;
    }
    const r = q(t) && Rn(s) ? Number(s) < t.length : J(t, s), a = Reflect.set(
      t,
      s,
      n,
      ye(t) ? t : i
    );
    return t === K(i) && (r ? gt(n, o) && st(t, "set", s, n) : st(t, "add", s, n)), a;
  }
  deleteProperty(t, s) {
    const n = J(t, s);
    t[s];
    const i = Reflect.deleteProperty(t, s);
    return i && n && st(t, "delete", s, void 0), i;
  }
  has(t, s) {
    const n = Reflect.has(t, s);
    return (!Ge(s) || !ii.has(s)) && me(t, "has", s), n;
  }
  ownKeys(t) {
    return me(
      t,
      "iterate",
      q(t) ? "length" : jt
    ), Reflect.ownKeys(t);
  }
}
class go extends oi {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, s) {
    return !0;
  }
  deleteProperty(t, s) {
    return !0;
  }
}
const yo = /* @__PURE__ */ new ai(), vo = /* @__PURE__ */ new go(), wo = /* @__PURE__ */ new ai(!0);
const Sn = (e) => e, vs = (e) => Reflect.getPrototypeOf(e);
function bo(e, t, s) {
  return function(...n) {
    const i = this.__v_raw, o = K(i), r = Rt(o), a = e === "entries" || e === Symbol.iterator && r, u = e === "keys" && r, l = i[e](...n), c = s ? Sn : t ? Ts : de;
    return !t && me(
      o,
      "iterate",
      u ? bn : jt
    ), {
      // iterator protocol
      next() {
        const { value: d, done: m } = l.next();
        return m ? { value: d, done: m } : {
          value: a ? [c(d[0]), c(d[1])] : c(d),
          done: m
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function ws(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function So(e, t) {
  const s = {
    get(i) {
      const o = this.__v_raw, r = K(o), a = K(i);
      e || (gt(i, a) && me(r, "get", i), me(r, "get", a));
      const { has: u } = vs(r), l = t ? Sn : e ? Ts : de;
      if (u.call(r, i))
        return l(o.get(i));
      if (u.call(r, a))
        return l(o.get(a));
      o !== r && o.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !e && me(K(i), "iterate", jt), i.size;
    },
    has(i) {
      const o = this.__v_raw, r = K(o), a = K(i);
      return e || (gt(i, a) && me(r, "has", i), me(r, "has", a)), i === a ? o.has(i) : o.has(i) || o.has(a);
    },
    forEach(i, o) {
      const r = this, a = r.__v_raw, u = K(a), l = t ? Sn : e ? Ts : de;
      return !e && me(u, "iterate", jt), a.forEach((c, d) => i.call(o, l(c), l(d), r));
    }
  };
  return xe(
    s,
    e ? {
      add: ws("add"),
      set: ws("set"),
      delete: ws("delete"),
      clear: ws("clear")
    } : {
      add(i) {
        !t && !Ne(i) && !yt(i) && (i = K(i));
        const o = K(this);
        return vs(o).has.call(o, i) || (o.add(i), st(o, "add", i, i)), this;
      },
      set(i, o) {
        !t && !Ne(o) && !yt(o) && (o = K(o));
        const r = K(this), { has: a, get: u } = vs(r);
        let l = a.call(r, i);
        l || (i = K(i), l = a.call(r, i));
        const c = u.call(r, i);
        return r.set(i, o), l ? gt(o, c) && st(r, "set", i, o) : st(r, "add", i, o), this;
      },
      delete(i) {
        const o = K(this), { has: r, get: a } = vs(o);
        let u = r.call(o, i);
        u || (i = K(i), u = r.call(o, i)), a && a.call(o, i);
        const l = o.delete(i);
        return u && st(o, "delete", i, void 0), l;
      },
      clear() {
        const i = K(this), o = i.size !== 0, r = i.clear();
        return o && st(
          i,
          "clear",
          void 0,
          void 0
        ), r;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((i) => {
    s[i] = bo(i, e, t);
  }), s;
}
function Hn(e, t) {
  const s = So(e, t);
  return (n, i, o) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? n : Reflect.get(
    J(s, i) && i in n ? s : n,
    i,
    o
  );
}
const Po = {
  get: /* @__PURE__ */ Hn(!1, !1)
}, xo = {
  get: /* @__PURE__ */ Hn(!1, !0)
}, _o = {
  get: /* @__PURE__ */ Hn(!0, !1)
};
const li = /* @__PURE__ */ new WeakMap(), ci = /* @__PURE__ */ new WeakMap(), ui = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap();
function $o(e) {
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
function Eo(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : $o(Xi(e));
}
function Ln(e) {
  return yt(e) ? e : Un(
    e,
    !1,
    yo,
    Po,
    li
  );
}
function jo(e) {
  return Un(
    e,
    !1,
    wo,
    xo,
    ci
  );
}
function fi(e) {
  return Un(
    e,
    !0,
    vo,
    _o,
    ui
  );
}
function Un(e, t, s, n, i) {
  if (!ee(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const o = Eo(e);
  if (o === 0)
    return e;
  const r = i.get(e);
  if (r)
    return r;
  const a = new Proxy(
    e,
    o === 2 ? n : s
  );
  return i.set(e, a), a;
}
function Nt(e) {
  return yt(e) ? Nt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function yt(e) {
  return !!(e && e.__v_isReadonly);
}
function Ne(e) {
  return !!(e && e.__v_isShallow);
}
function Vn(e) {
  return e ? !!e.__v_raw : !1;
}
function K(e) {
  const t = e && e.__v_raw;
  return t ? K(t) : e;
}
function Co(e) {
  return !J(e, "__v_skip") && Object.isExtensible(e) && Kr(e, "__v_skip", !0), e;
}
const de = (e) => ee(e) ? Ln(e) : e, Ts = (e) => ee(e) ? fi(e) : e;
function ye(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function X(e) {
  return To(e, !1);
}
function To(e, t) {
  return ye(e) ? e : new Ao(e, t);
}
class Ao {
  constructor(t, s) {
    this.dep = new Wn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : K(t), this._value = s ? t : de(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, n = this.__v_isShallow || Ne(t) || yt(t);
    t = n ? t : K(t), gt(t, s) && (this._rawValue = t, this._value = n ? t : de(t), this.dep.trigger());
  }
}
function di(e) {
  return ye(e) ? e.value : e;
}
const Io = {
  get: (e, t, s) => t === "__v_raw" ? e : di(Reflect.get(e, t, s)),
  set: (e, t, s, n) => {
    const i = e[t];
    return ye(i) && !ye(s) ? (i.value = s, !0) : Reflect.set(e, t, s, n);
  }
};
function pi(e) {
  return Nt(e) ? e : new Proxy(e, Io);
}
class Oo {
  constructor(t, s, n) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new Wn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = os - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = n;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Y !== this)
      return Qr(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return si(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Mo(e, t, s = !1) {
  let n, i;
  return W(e) ? n = e : (n = e.get, i = e.set), new Oo(n, i, s);
}
const bs = {}, As = /* @__PURE__ */ new WeakMap();
let _t;
function Ro(e, t = !1, s = _t) {
  if (s) {
    let n = As.get(s);
    n || As.set(s, n = []), n.push(e);
  }
}
function No(e, t, s = Z) {
  const { immediate: n, deep: i, once: o, scheduler: r, augmentJob: a, call: u } = s, l = (M) => i ? M : Ne(M) || i === !1 || i === 0 ? nt(M, 1) : nt(M);
  let c, d, m, p, v = !1, _ = !1;
  if (ye(e) ? (d = () => e.value, v = Ne(e)) : Nt(e) ? (d = () => l(e), v = !0) : q(e) ? (_ = !0, v = e.some((M) => Nt(M) || Ne(M)), d = () => e.map((M) => {
    if (ye(M))
      return M.value;
    if (Nt(M))
      return l(M);
    if (W(M))
      return u ? u(M, 2) : M();
  })) : W(e) ? t ? d = u ? () => u(e, 2) : e : d = () => {
    if (m) {
      ot();
      try {
        m();
      } finally {
        at();
      }
    }
    const M = _t;
    _t = c;
    try {
      return u ? u(e, 3, [p]) : e(p);
    } finally {
      _t = M;
    }
  } : d = Ke, t && i) {
    const M = d, te = i === !0 ? 1 / 0 : i;
    d = () => nt(M(), te);
  }
  const H = lo(), T = () => {
    c.stop(), H && H.active && Mn(H.effects, c);
  };
  if (o && t) {
    const M = t;
    t = (...te) => {
      M(...te), T();
    };
  }
  let O = _ ? new Array(e.length).fill(bs) : bs;
  const N = (M) => {
    if (!(!(c.flags & 1) || !c.dirty && !M))
      if (t) {
        const te = c.run();
        if (i || v || (_ ? te.some((ve, _e) => gt(ve, O[_e])) : gt(te, O))) {
          m && m();
          const ve = _t;
          _t = c;
          try {
            const _e = [
              te,
              // pass undefined as the old value when it's changed for the first time
              O === bs ? void 0 : _ && O[0] === bs ? [] : O,
              p
            ];
            O = te, u ? u(t, 3, _e) : (
              // @ts-expect-error
              t(..._e)
            );
          } finally {
            _t = ve;
          }
        }
      } else
        c.run();
  };
  return a && a(N), c = new Zr(d), c.scheduler = r ? () => r(N, !1) : N, p = (M) => Ro(M, !1, c), m = c.onStop = () => {
    const M = As.get(c);
    if (M) {
      if (u)
        u(M, 4);
      else
        for (const te of M) te();
      As.delete(c);
    }
  }, t ? n ? N(!0) : O = c.run() : r ? r(N.bind(null, !0), !0) : c.run(), T.pause = c.pause.bind(c), T.resume = c.resume.bind(c), T.stop = T, T;
}
function nt(e, t = 1 / 0, s) {
  if (t <= 0 || !ee(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, ye(e))
    nt(e.value, t, s);
  else if (q(e))
    for (let n = 0; n < e.length; n++)
      nt(e[n], t, s);
  else if (Vs(e) || Rt(e))
    e.forEach((n) => {
      nt(n, t, s);
    });
  else if (Br(e)) {
    for (const n in e)
      nt(e[n], t, s);
    for (const n of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, n) && nt(e[n], t, s);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function ps(e, t, s, n) {
  try {
    return n ? e(...n) : e();
  } catch (i) {
    Xs(i, t, s);
  }
}
function Xe(e, t, s, n) {
  if (W(e)) {
    const i = ps(e, t, s, n);
    return i && Vr(i) && i.catch((o) => {
      Xs(o, t, s);
    }), i;
  }
  if (q(e)) {
    const i = [];
    for (let o = 0; o < e.length; o++)
      i.push(Xe(e[o], t, s, n));
    return i;
  }
}
function Xs(e, t, s, n = !0) {
  const i = t ? t.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: r } = t && t.appContext.config || Z;
  if (t) {
    let a = t.parent;
    const u = t.proxy, l = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; a; ) {
      const c = a.ec;
      if (c) {
        for (let d = 0; d < c.length; d++)
          if (c[d](e, u, l) === !1)
            return;
      }
      a = a.parent;
    }
    if (o) {
      ot(), ps(o, null, 10, [
        e,
        u,
        l
      ]), at();
      return;
    }
  }
  Fo(e, s, i, n, r);
}
function Fo(e, t, s, n = !0, i = !1) {
  if (i)
    throw e;
  console.error(e);
}
const Pe = [];
let Ue = -1;
const Ft = [];
let pt = null, Ot = 0;
const hi = /* @__PURE__ */ Promise.resolve();
let Is = null;
function zn(e) {
  const t = Is || hi;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function qo(e) {
  let t = Ue + 1, s = Pe.length;
  for (; t < s; ) {
    const n = t + s >>> 1, i = Pe[n], o = ls(i);
    o < e || o === e && i.flags & 2 ? t = n + 1 : s = n;
  }
  return t;
}
function Bn(e) {
  if (!(e.flags & 1)) {
    const t = ls(e), s = Pe[Pe.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= ls(s) ? Pe.push(e) : Pe.splice(qo(t), 0, e), e.flags |= 1, mi();
  }
}
function mi() {
  Is || (Is = hi.then(yi));
}
function Do(e) {
  q(e) ? Ft.push(...e) : pt && e.id === -1 ? pt.splice(Ot + 1, 0, e) : e.flags & 1 || (Ft.push(e), e.flags |= 1), mi();
}
function or(e, t, s = Ue + 1) {
  for (; s < Pe.length; s++) {
    const n = Pe[s];
    if (n && n.flags & 2) {
      if (e && n.id !== e.uid)
        continue;
      Pe.splice(s, 1), s--, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
    }
  }
}
function gi(e) {
  if (Ft.length) {
    const t = [...new Set(Ft)].sort(
      (s, n) => ls(s) - ls(n)
    );
    if (Ft.length = 0, pt) {
      pt.push(...t);
      return;
    }
    for (pt = t, Ot = 0; Ot < pt.length; Ot++) {
      const s = pt[Ot];
      s.flags & 4 && (s.flags &= -2), s.flags & 8 || s(), s.flags &= -2;
    }
    pt = null, Ot = 0;
  }
}
const ls = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function yi(e) {
  try {
    for (Ue = 0; Ue < Pe.length; Ue++) {
      const t = Pe[Ue];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), ps(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ue < Pe.length; Ue++) {
      const t = Pe[Ue];
      t && (t.flags &= -2);
    }
    Ue = -1, Pe.length = 0, gi(), Is = null, (Pe.length || Ft.length) && yi();
  }
}
let Oe = null, vi = null;
function Os(e) {
  const t = Oe;
  return Oe = e, vi = e && e.type.__scopeId || null, t;
}
function Wo(e, t = Oe, s) {
  if (!t || e._n)
    return e;
  const n = (...i) => {
    n._d && yr(-1);
    const o = Os(t);
    let r;
    try {
      r = e(...i);
    } finally {
      Os(o), n._d && yr(1);
    }
    return r;
  };
  return n._n = !0, n._c = !0, n._d = !0, n;
}
function Ss(e, t) {
  if (Oe === null)
    return e;
  const s = en(Oe), n = e.dirs || (e.dirs = []);
  for (let i = 0; i < t.length; i++) {
    let [o, r, a, u = Z] = t[i];
    o && (W(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && nt(r), n.push({
      dir: o,
      instance: s,
      value: r,
      oldValue: void 0,
      arg: a,
      modifiers: u
    }));
  }
  return e;
}
function St(e, t, s, n) {
  const i = e.dirs, o = t && t.dirs;
  for (let r = 0; r < i.length; r++) {
    const a = i[r];
    o && (a.oldValue = o[r].value);
    let u = a.dir[n];
    u && (ot(), Xe(u, s, 8, [
      e.el,
      a,
      e,
      t
    ]), at());
  }
}
const Ho = Symbol("_vte"), Lo = (e) => e.__isTeleport, Uo = Symbol("_leaveCb");
function Kn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Kn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function wi(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const Ms = /* @__PURE__ */ new WeakMap();
function ts(e, t, s, n, i = !1) {
  if (q(e)) {
    e.forEach(
      (v, _) => ts(
        v,
        t && (q(t) ? t[_] : t),
        s,
        n,
        i
      )
    );
    return;
  }
  if (ss(n) && !i) {
    n.shapeFlag & 512 && n.type.__asyncResolved && n.component.subTree.component && ts(e, t, s, n.component.subTree);
    return;
  }
  const o = n.shapeFlag & 4 ? en(n.component) : n.el, r = i ? null : o, { i: a, r: u } = e, l = t && t.r, c = a.refs === Z ? a.refs = {} : a.refs, d = a.setupState, m = K(d), p = d === Z ? Ur : (v) => J(m, v);
  if (l != null && l !== u) {
    if (ar(t), le(l))
      c[l] = null, p(l) && (d[l] = null);
    else if (ye(l)) {
      l.value = null;
      const v = t;
      v.k && (c[v.k] = null);
    }
  }
  if (W(u))
    ps(u, a, 12, [r, c]);
  else {
    const v = le(u), _ = ye(u);
    if (v || _) {
      const H = () => {
        if (e.f) {
          const T = v ? p(u) ? d[u] : c[u] : u.value;
          if (i)
            q(T) && Mn(T, o);
          else if (q(T))
            T.includes(o) || T.push(o);
          else if (v)
            c[u] = [o], p(u) && (d[u] = c[u]);
          else {
            const O = [o];
            u.value = O, e.k && (c[e.k] = O);
          }
        } else v ? (c[u] = r, p(u) && (d[u] = r)) : _ && (u.value = r, e.k && (c[e.k] = r));
      };
      if (r) {
        const T = () => {
          H(), Ms.delete(e);
        };
        T.id = -1, Ms.set(e, T), Ae(T, s);
      } else
        ar(e), H();
    }
  }
}
function ar(e) {
  const t = Ms.get(e);
  t && (t.flags |= 8, Ms.delete(e));
}
Ks().requestIdleCallback;
Ks().cancelIdleCallback;
const ss = (e) => !!e.type.__asyncLoader, bi = (e) => e.type.__isKeepAlive;
function Vo(e, t) {
  Si(e, "a", t);
}
function zo(e, t) {
  Si(e, "da", t);
}
function Si(e, t, s = ge) {
  const n = e.__wdc || (e.__wdc = () => {
    let i = s;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return e();
  });
  if (Zs(t, n, s), s) {
    let i = s.parent;
    for (; i && i.parent; )
      bi(i.parent.vnode) && Bo(n, t, s, i), i = i.parent;
  }
}
function Bo(e, t, s, n) {
  const i = Zs(
    t,
    e,
    n,
    !0
    /* prepend */
  );
  Pi(() => {
    Mn(n[t], i);
  }, s);
}
function Zs(e, t, s = ge, n = !1) {
  if (s) {
    const i = s[e] || (s[e] = []), o = t.__weh || (t.__weh = (...r) => {
      ot();
      const a = hs(s), u = Xe(t, s, e, r);
      return a(), at(), u;
    });
    return n ? i.unshift(o) : i.push(o), o;
  }
}
const lt = (e) => (t, s = ge) => {
  (!us || e === "sp") && Zs(e, (...n) => t(...n), s);
}, Ko = lt("bm"), Jn = lt("m"), Jo = lt(
  "bu"
), Go = lt("u"), Gn = lt(
  "bum"
), Pi = lt("um"), Xo = lt(
  "sp"
), Zo = lt("rtg"), Yo = lt("rtc");
function Qo(e, t = ge) {
  Zs("ec", e, t);
}
const ea = "components";
function ta(e, t) {
  return na(ea, e, !0, t) || e;
}
const sa = Symbol.for("v-ndc");
function na(e, t, s = !0, n = !1) {
  const i = Oe || ge;
  if (i) {
    const o = i.type;
    {
      const a = Ba(
        o,
        !1
      );
      if (a && (a === t || a === Fe(t) || a === Bs(Fe(t))))
        return o;
    }
    const r = (
      // local registration
      // check instance[type] first which is resolved for options API
      lr(i[e] || o[e], t) || // global registration
      lr(i.appContext[e], t)
    );
    return !r && n ? o : r;
  }
}
function lr(e, t) {
  return e && (e[t] || e[Fe(t)] || e[Bs(Fe(t))]);
}
function kt(e, t, s, n) {
  let i;
  const o = s, r = q(e);
  if (r || le(e)) {
    const a = r && Nt(e);
    let u = !1, l = !1;
    a && (u = !Ne(e), l = yt(e), e = Gs(e)), i = new Array(e.length);
    for (let c = 0, d = e.length; c < d; c++)
      i[c] = t(
        u ? l ? Ts(de(e[c])) : de(e[c]) : e[c],
        c,
        void 0,
        o
      );
  } else if (typeof e == "number") {
    i = new Array(e);
    for (let a = 0; a < e; a++)
      i[a] = t(a + 1, a, void 0, o);
  } else if (ee(e))
    if (e[Symbol.iterator])
      i = Array.from(
        e,
        (a, u) => t(a, u, void 0, o)
      );
    else {
      const a = Object.keys(e);
      i = new Array(a.length);
      for (let u = 0, l = a.length; u < l; u++) {
        const c = a[u];
        i[u] = t(e[c], c, u, o);
      }
    }
  else
    i = [];
  return i;
}
const Pn = (e) => e ? Ui(e) ? en(e) : Pn(e.parent) : null, ns = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ xe(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Pn(e.parent),
    $root: (e) => Pn(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => _i(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Bn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = zn.bind(e.proxy)),
    $watch: (e) => ka.bind(e)
  })
), cn = (e, t) => e !== Z && !e.__isScriptSetup && J(e, t), ra = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: n, data: i, props: o, accessCache: r, type: a, appContext: u } = e;
    let l;
    if (t[0] !== "$") {
      const p = r[t];
      if (p !== void 0)
        switch (p) {
          case 1:
            return n[t];
          case 2:
            return i[t];
          case 4:
            return s[t];
          case 3:
            return o[t];
        }
      else {
        if (cn(n, t))
          return r[t] = 1, n[t];
        if (i !== Z && J(i, t))
          return r[t] = 2, i[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (l = e.propsOptions[0]) && J(l, t)
        )
          return r[t] = 3, o[t];
        if (s !== Z && J(s, t))
          return r[t] = 4, s[t];
        xn && (r[t] = 0);
      }
    }
    const c = ns[t];
    let d, m;
    if (c)
      return t === "$attrs" && me(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (d = a.__cssModules) && (d = d[t])
    )
      return d;
    if (s !== Z && J(s, t))
      return r[t] = 4, s[t];
    if (
      // global properties
      m = u.config.globalProperties, J(m, t)
    )
      return m[t];
  },
  set({ _: e }, t, s) {
    const { data: n, setupState: i, ctx: o } = e;
    return cn(i, t) ? (i[t] = s, !0) : n !== Z && J(n, t) ? (n[t] = s, !0) : J(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: n, appContext: i, propsOptions: o, type: r }
  }, a) {
    let u, l;
    return !!(s[a] || e !== Z && a[0] !== "$" && J(e, a) || cn(t, a) || (u = o[0]) && J(u, a) || J(n, a) || J(ns, a) || J(i.config.globalProperties, a) || (l = r.__cssModules) && l[a]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : J(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function cr(e) {
  return q(e) ? e.reduce(
    (t, s) => (t[s] = null, t),
    {}
  ) : e;
}
let xn = !0;
function ia(e) {
  const t = _i(e), s = e.proxy, n = e.ctx;
  xn = !1, t.beforeCreate && ur(t.beforeCreate, e, "bc");
  const {
    // state
    data: i,
    computed: o,
    methods: r,
    watch: a,
    provide: u,
    inject: l,
    // lifecycle
    created: c,
    beforeMount: d,
    mounted: m,
    beforeUpdate: p,
    updated: v,
    activated: _,
    deactivated: H,
    beforeDestroy: T,
    beforeUnmount: O,
    destroyed: N,
    unmounted: M,
    render: te,
    renderTracked: ve,
    renderTriggered: _e,
    errorCaptured: re,
    serverPrefetch: De,
    // public API
    expose: Ce,
    inheritAttrs: ct,
    // assets
    components: ut,
    directives: ke,
    filters: zt
  } = t;
  if (l && oa(l, n, null), r)
    for (const Q in r) {
      const B = r[Q];
      W(B) && (n[Q] = B.bind(s));
    }
  if (i) {
    const Q = i.call(s, s);
    ee(Q) && (e.data = Ln(Q));
  }
  if (xn = !0, o)
    for (const Q in o) {
      const B = o[Q], We = W(B) ? B.bind(s, s) : W(B.get) ? B.get.bind(s, s) : Ke, Ze = !W(B) && W(B.set) ? B.set.bind(s) : Ke, He = mt({
        get: We,
        set: Ze
      });
      Object.defineProperty(n, Q, {
        enumerable: !0,
        configurable: !0,
        get: () => He.value,
        set: (we) => He.value = we
      });
    }
  if (a)
    for (const Q in a)
      xi(a[Q], n, s, Q);
  if (u) {
    const Q = W(u) ? u.call(s) : u;
    Reflect.ownKeys(Q).forEach((B) => {
      da(B, Q[B]);
    });
  }
  c && ur(c, e, "c");
  function fe(Q, B) {
    q(B) ? B.forEach((We) => Q(We.bind(s))) : B && Q(B.bind(s));
  }
  if (fe(Ko, d), fe(Jn, m), fe(Jo, p), fe(Go, v), fe(Vo, _), fe(zo, H), fe(Qo, re), fe(Yo, ve), fe(Zo, _e), fe(Gn, O), fe(Pi, M), fe(Xo, De), q(Ce))
    if (Ce.length) {
      const Q = e.exposed || (e.exposed = {});
      Ce.forEach((B) => {
        Object.defineProperty(Q, B, {
          get: () => s[B],
          set: (We) => s[B] = We,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  te && e.render === Ke && (e.render = te), ct != null && (e.inheritAttrs = ct), ut && (e.components = ut), ke && (e.directives = ke), De && wi(e);
}
function oa(e, t, s = Ke) {
  q(e) && (e = _n(e));
  for (const n in e) {
    const i = e[n];
    let o;
    ee(i) ? "default" in i ? o = ks(
      i.from || n,
      i.default,
      !0
    ) : o = ks(i.from || n) : o = ks(i), ye(o) ? Object.defineProperty(t, n, {
      enumerable: !0,
      configurable: !0,
      get: () => o.value,
      set: (r) => o.value = r
    }) : t[n] = o;
  }
}
function ur(e, t, s) {
  Xe(
    q(e) ? e.map((n) => n.bind(t.proxy)) : e.bind(t.proxy),
    t,
    s
  );
}
function xi(e, t, s, n) {
  let i = n.includes(".") ? Fi(s, n) : () => s[n];
  if (le(e)) {
    const o = t[e];
    W(o) && rs(i, o);
  } else if (W(e))
    rs(i, e.bind(s));
  else if (ee(e))
    if (q(e))
      e.forEach((o) => xi(o, t, s, n));
    else {
      const o = W(e.handler) ? e.handler.bind(s) : t[e.handler];
      W(o) && rs(i, o, e);
    }
}
function _i(e) {
  const t = e.type, { mixins: s, extends: n } = t, {
    mixins: i,
    optionsCache: o,
    config: { optionMergeStrategies: r }
  } = e.appContext, a = o.get(t);
  let u;
  return a ? u = a : !i.length && !s && !n ? u = t : (u = {}, i.length && i.forEach(
    (l) => Rs(u, l, r, !0)
  ), Rs(u, t, r)), ee(t) && o.set(t, u), u;
}
function Rs(e, t, s, n = !1) {
  const { mixins: i, extends: o } = t;
  o && Rs(e, o, s, !0), i && i.forEach(
    (r) => Rs(e, r, s, !0)
  );
  for (const r in t)
    if (!(n && r === "expose")) {
      const a = aa[r] || s && s[r];
      e[r] = a ? a(e[r], t[r]) : t[r];
    }
  return e;
}
const aa = {
  data: fr,
  props: dr,
  emits: dr,
  // objects
  methods: Xt,
  computed: Xt,
  // lifecycle
  beforeCreate: Se,
  created: Se,
  beforeMount: Se,
  mounted: Se,
  beforeUpdate: Se,
  updated: Se,
  beforeDestroy: Se,
  beforeUnmount: Se,
  destroyed: Se,
  unmounted: Se,
  activated: Se,
  deactivated: Se,
  errorCaptured: Se,
  serverPrefetch: Se,
  // assets
  components: Xt,
  directives: Xt,
  // watch
  watch: ca,
  // provide / inject
  provide: fr,
  inject: la
};
function fr(e, t) {
  return t ? e ? function() {
    return xe(
      W(e) ? e.call(this, this) : e,
      W(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function la(e, t) {
  return Xt(_n(e), _n(t));
}
function _n(e) {
  if (q(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++)
      t[e[s]] = e[s];
    return t;
  }
  return e;
}
function Se(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Xt(e, t) {
  return e ? xe(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function dr(e, t) {
  return e ? q(e) && q(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : xe(
    /* @__PURE__ */ Object.create(null),
    cr(e),
    cr(t ?? {})
  ) : t;
}
function ca(e, t) {
  if (!e) return t;
  if (!t) return e;
  const s = xe(/* @__PURE__ */ Object.create(null), e);
  for (const n in t)
    s[n] = Se(e[n], t[n]);
  return s;
}
function ki() {
  return {
    app: null,
    config: {
      isNativeTag: Ur,
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
let ua = 0;
function fa(e, t) {
  return function(n, i = null) {
    W(n) || (n = xe({}, n)), i != null && !ee(i) && (i = null);
    const o = ki(), r = /* @__PURE__ */ new WeakSet(), a = [];
    let u = !1;
    const l = o.app = {
      _uid: ua++,
      _component: n,
      _props: i,
      _container: null,
      _context: o,
      _instance: null,
      version: Ja,
      get config() {
        return o.config;
      },
      set config(c) {
      },
      use(c, ...d) {
        return r.has(c) || (c && W(c.install) ? (r.add(c), c.install(l, ...d)) : W(c) && (r.add(c), c(l, ...d))), l;
      },
      mixin(c) {
        return o.mixins.includes(c) || o.mixins.push(c), l;
      },
      component(c, d) {
        return d ? (o.components[c] = d, l) : o.components[c];
      },
      directive(c, d) {
        return d ? (o.directives[c] = d, l) : o.directives[c];
      },
      mount(c, d, m) {
        if (!u) {
          const p = l._ceVNode || Je(n, i);
          return p.appContext = o, m === !0 ? m = "svg" : m === !1 && (m = void 0), e(p, c, m), u = !0, l._container = c, c.__vue_app__ = l, en(p.component);
        }
      },
      onUnmount(c) {
        a.push(c);
      },
      unmount() {
        u && (Xe(
          a,
          l._instance,
          16
        ), e(null, l._container), delete l._container.__vue_app__);
      },
      provide(c, d) {
        return o.provides[c] = d, l;
      },
      runWithContext(c) {
        const d = qt;
        qt = l;
        try {
          return c();
        } finally {
          qt = d;
        }
      }
    };
    return l;
  };
}
let qt = null;
function da(e, t) {
  if (ge) {
    let s = ge.provides;
    const n = ge.parent && ge.parent.provides;
    n === s && (s = ge.provides = Object.create(n)), s[e] = t;
  }
}
function ks(e, t, s = !1) {
  const n = Ha();
  if (n || qt) {
    let i = qt ? qt._context.provides : n ? n.parent == null || n.ce ? n.vnode.appContext && n.vnode.appContext.provides : n.parent.provides : void 0;
    if (i && e in i)
      return i[e];
    if (arguments.length > 1)
      return s && W(t) ? t.call(n && n.proxy) : t;
  }
}
const $i = {}, Ei = () => Object.create($i), ji = (e) => Object.getPrototypeOf(e) === $i;
function pa(e, t, s, n = !1) {
  const i = {}, o = Ei();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Ci(e, t, i, o);
  for (const r in e.propsOptions[0])
    r in i || (i[r] = void 0);
  s ? e.props = n ? i : jo(i) : e.type.props ? e.props = i : e.props = o, e.attrs = o;
}
function ha(e, t, s, n) {
  const {
    props: i,
    attrs: o,
    vnode: { patchFlag: r }
  } = e, a = K(i), [u] = e.propsOptions;
  let l = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (n || r > 0) && !(r & 16)
  ) {
    if (r & 8) {
      const c = e.vnode.dynamicProps;
      for (let d = 0; d < c.length; d++) {
        let m = c[d];
        if (Ys(e.emitsOptions, m))
          continue;
        const p = t[m];
        if (u)
          if (J(o, m))
            p !== o[m] && (o[m] = p, l = !0);
          else {
            const v = Fe(m);
            i[v] = kn(
              u,
              a,
              v,
              p,
              e,
              !1
            );
          }
        else
          p !== o[m] && (o[m] = p, l = !0);
      }
    }
  } else {
    Ci(e, t, i, o) && (l = !0);
    let c;
    for (const d in a)
      (!t || // for camelCase
      !J(t, d) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = wt(d)) === d || !J(t, c))) && (u ? s && // for camelCase
      (s[d] !== void 0 || // for kebab-case
      s[c] !== void 0) && (i[d] = kn(
        u,
        a,
        d,
        void 0,
        e,
        !0
      )) : delete i[d]);
    if (o !== a)
      for (const d in o)
        (!t || !J(t, d)) && (delete o[d], l = !0);
  }
  l && st(e.attrs, "set", "");
}
function Ci(e, t, s, n) {
  const [i, o] = e.propsOptions;
  let r = !1, a;
  if (t)
    for (let u in t) {
      if (Yt(u))
        continue;
      const l = t[u];
      let c;
      i && J(i, c = Fe(u)) ? !o || !o.includes(c) ? s[c] = l : (a || (a = {}))[c] = l : Ys(e.emitsOptions, u) || (!(u in n) || l !== n[u]) && (n[u] = l, r = !0);
    }
  if (o) {
    const u = K(s), l = a || Z;
    for (let c = 0; c < o.length; c++) {
      const d = o[c];
      s[d] = kn(
        i,
        u,
        d,
        l[d],
        e,
        !J(l, d)
      );
    }
  }
  return r;
}
function kn(e, t, s, n, i, o) {
  const r = e[s];
  if (r != null) {
    const a = J(r, "default");
    if (a && n === void 0) {
      const u = r.default;
      if (r.type !== Function && !r.skipFactory && W(u)) {
        const { propsDefaults: l } = i;
        if (s in l)
          n = l[s];
        else {
          const c = hs(i);
          n = l[s] = u.call(
            null,
            t
          ), c();
        }
      } else
        n = u;
      i.ce && i.ce._setProp(s, n);
    }
    r[
      0
      /* shouldCast */
    ] && (o && !a ? n = !1 : r[
      1
      /* shouldCastTrue */
    ] && (n === "" || n === wt(s)) && (n = !0));
  }
  return n;
}
const ma = /* @__PURE__ */ new WeakMap();
function Ti(e, t, s = !1) {
  const n = s ? ma : t.propsCache, i = n.get(e);
  if (i)
    return i;
  const o = e.props, r = {}, a = [];
  let u = !1;
  if (!W(e)) {
    const c = (d) => {
      u = !0;
      const [m, p] = Ti(d, t, !0);
      xe(r, m), p && a.push(...p);
    };
    !s && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!o && !u)
    return ee(e) && n.set(e, Mt), Mt;
  if (q(o))
    for (let c = 0; c < o.length; c++) {
      const d = Fe(o[c]);
      pr(d) && (r[d] = Z);
    }
  else if (o)
    for (const c in o) {
      const d = Fe(c);
      if (pr(d)) {
        const m = o[c], p = r[d] = q(m) || W(m) ? { type: m } : xe({}, m), v = p.type;
        let _ = !1, H = !0;
        if (q(v))
          for (let T = 0; T < v.length; ++T) {
            const O = v[T], N = W(O) && O.name;
            if (N === "Boolean") {
              _ = !0;
              break;
            } else N === "String" && (H = !1);
          }
        else
          _ = W(v) && v.name === "Boolean";
        p[
          0
          /* shouldCast */
        ] = _, p[
          1
          /* shouldCastTrue */
        ] = H, (_ || J(p, "default")) && a.push(d);
      }
    }
  const l = [r, a];
  return ee(e) && n.set(e, l), l;
}
function pr(e) {
  return e[0] !== "$" && !Yt(e);
}
const Xn = (e) => e === "_" || e === "_ctx" || e === "$stable", Zn = (e) => q(e) ? e.map(ze) : [ze(e)], ga = (e, t, s) => {
  if (t._n)
    return t;
  const n = Wo((...i) => Zn(t(...i)), s);
  return n._c = !1, n;
}, Ai = (e, t, s) => {
  const n = e._ctx;
  for (const i in e) {
    if (Xn(i)) continue;
    const o = e[i];
    if (W(o))
      t[i] = ga(i, o, n);
    else if (o != null) {
      const r = Zn(o);
      t[i] = () => r;
    }
  }
}, Ii = (e, t) => {
  const s = Zn(t);
  e.slots.default = () => s;
}, Oi = (e, t, s) => {
  for (const n in t)
    (s || !Xn(n)) && (e[n] = t[n]);
}, ya = (e, t, s) => {
  const n = e.slots = Ei();
  if (e.vnode.shapeFlag & 32) {
    const i = t._;
    i ? (Oi(n, t, s), s && Kr(n, "_", i, !0)) : Ai(t, n);
  } else t && Ii(e, t);
}, va = (e, t, s) => {
  const { vnode: n, slots: i } = e;
  let o = !0, r = Z;
  if (n.shapeFlag & 32) {
    const a = t._;
    a ? s && a === 1 ? o = !1 : Oi(i, t, s) : (o = !t.$stable, Ai(t, i)), r = t;
  } else t && (Ii(e, t), r = { default: 1 });
  if (o)
    for (const a in i)
      !Xn(a) && r[a] == null && delete i[a];
}, Ae = Oa;
function wa(e) {
  return ba(e);
}
function ba(e, t) {
  const s = Ks();
  s.__VUE__ = !0;
  const {
    insert: n,
    remove: i,
    patchProp: o,
    createElement: r,
    createText: a,
    createComment: u,
    setText: l,
    setElementText: c,
    parentNode: d,
    nextSibling: m,
    setScopeId: p = Ke,
    insertStaticContent: v
  } = e, _ = (f, h, w, k = null, S = null, P = null, C = void 0, x = null, j = !!h.dynamicChildren) => {
    if (f === h)
      return;
    f && !Kt(f, h) && (k = Ye(f), we(f, S, P, !0), f = null), h.patchFlag === -2 && (j = !1, h.dynamicChildren = null);
    const { type: $, ref: R, shapeFlag: A } = h;
    switch ($) {
      case Qs:
        H(f, h, w, k);
        break;
      case vt:
        T(f, h, w, k);
        break;
      case fn:
        f == null && O(h, w, k, C);
        break;
      case oe:
        ut(
          f,
          h,
          w,
          k,
          S,
          P,
          C,
          x,
          j
        );
        break;
      default:
        A & 1 ? te(
          f,
          h,
          w,
          k,
          S,
          P,
          C,
          x,
          j
        ) : A & 6 ? ke(
          f,
          h,
          w,
          k,
          S,
          P,
          C,
          x,
          j
        ) : (A & 64 || A & 128) && $.process(
          f,
          h,
          w,
          k,
          S,
          P,
          C,
          x,
          j,
          bt
        );
    }
    R != null && S ? ts(R, f && f.ref, P, h || f, !h) : R == null && f && f.ref != null && ts(f.ref, null, P, f, !0);
  }, H = (f, h, w, k) => {
    if (f == null)
      n(
        h.el = a(h.children),
        w,
        k
      );
    else {
      const S = h.el = f.el;
      h.children !== f.children && l(S, h.children);
    }
  }, T = (f, h, w, k) => {
    f == null ? n(
      h.el = u(h.children || ""),
      w,
      k
    ) : h.el = f.el;
  }, O = (f, h, w, k) => {
    [f.el, f.anchor] = v(
      f.children,
      h,
      w,
      k,
      f.el,
      f.anchor
    );
  }, N = ({ el: f, anchor: h }, w, k) => {
    let S;
    for (; f && f !== h; )
      S = m(f), n(f, w, k), f = S;
    n(h, w, k);
  }, M = ({ el: f, anchor: h }) => {
    let w;
    for (; f && f !== h; )
      w = m(f), i(f), f = w;
    i(h);
  }, te = (f, h, w, k, S, P, C, x, j) => {
    h.type === "svg" ? C = "svg" : h.type === "math" && (C = "mathml"), f == null ? ve(
      h,
      w,
      k,
      S,
      P,
      C,
      x,
      j
    ) : De(
      f,
      h,
      S,
      P,
      C,
      x,
      j
    );
  }, ve = (f, h, w, k, S, P, C, x) => {
    let j, $;
    const { props: R, shapeFlag: A, transition: I, dirs: F } = f;
    if (j = f.el = r(
      f.type,
      P,
      R && R.is,
      R
    ), A & 8 ? c(j, f.children) : A & 16 && re(
      f.children,
      j,
      null,
      k,
      S,
      un(f, P),
      C,
      x
    ), F && St(f, null, k, "created"), _e(j, f, f.scopeId, C, k), R) {
      for (const G in R)
        G !== "value" && !Yt(G) && o(j, G, null, R[G], P, k);
      "value" in R && o(j, "value", null, R.value, P), ($ = R.onVnodeBeforeMount) && Le($, k, f);
    }
    F && St(f, null, k, "beforeMount");
    const U = Sa(S, I);
    U && I.beforeEnter(j), n(j, h, w), (($ = R && R.onVnodeMounted) || U || F) && Ae(() => {
      $ && Le($, k, f), U && I.enter(j), F && St(f, null, k, "mounted");
    }, S);
  }, _e = (f, h, w, k, S) => {
    if (w && p(f, w), k)
      for (let P = 0; P < k.length; P++)
        p(f, k[P]);
    if (S) {
      let P = S.subTree;
      if (h === P || Di(P.type) && (P.ssContent === h || P.ssFallback === h)) {
        const C = S.vnode;
        _e(
          f,
          C,
          C.scopeId,
          C.slotScopeIds,
          S.parent
        );
      }
    }
  }, re = (f, h, w, k, S, P, C, x, j = 0) => {
    for (let $ = j; $ < f.length; $++) {
      const R = f[$] = x ? ht(f[$]) : ze(f[$]);
      _(
        null,
        R,
        h,
        w,
        k,
        S,
        P,
        C,
        x
      );
    }
  }, De = (f, h, w, k, S, P, C) => {
    const x = h.el = f.el;
    let { patchFlag: j, dynamicChildren: $, dirs: R } = h;
    j |= f.patchFlag & 16;
    const A = f.props || Z, I = h.props || Z;
    let F;
    if (w && Pt(w, !1), (F = I.onVnodeBeforeUpdate) && Le(F, w, h, f), R && St(h, f, w, "beforeUpdate"), w && Pt(w, !0), (A.innerHTML && I.innerHTML == null || A.textContent && I.textContent == null) && c(x, ""), $ ? Ce(
      f.dynamicChildren,
      $,
      x,
      w,
      k,
      un(h, S),
      P
    ) : C || B(
      f,
      h,
      x,
      null,
      w,
      k,
      un(h, S),
      P,
      !1
    ), j > 0) {
      if (j & 16)
        ct(x, A, I, w, S);
      else if (j & 2 && A.class !== I.class && o(x, "class", null, I.class, S), j & 4 && o(x, "style", A.style, I.style, S), j & 8) {
        const U = h.dynamicProps;
        for (let G = 0; G < U.length; G++) {
          const z = U[G], pe = A[z], he = I[z];
          (he !== pe || z === "value") && o(x, z, pe, he, S, w);
        }
      }
      j & 1 && f.children !== h.children && c(x, h.children);
    } else !C && $ == null && ct(x, A, I, w, S);
    ((F = I.onVnodeUpdated) || R) && Ae(() => {
      F && Le(F, w, h, f), R && St(h, f, w, "updated");
    }, k);
  }, Ce = (f, h, w, k, S, P, C) => {
    for (let x = 0; x < h.length; x++) {
      const j = f[x], $ = h[x], R = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        j.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (j.type === oe || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Kt(j, $) || // - In the case of a component, it could contain anything.
        j.shapeFlag & 198) ? d(j.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          w
        )
      );
      _(
        j,
        $,
        R,
        null,
        k,
        S,
        P,
        C,
        !0
      );
    }
  }, ct = (f, h, w, k, S) => {
    if (h !== w) {
      if (h !== Z)
        for (const P in h)
          !Yt(P) && !(P in w) && o(
            f,
            P,
            h[P],
            null,
            S,
            k
          );
      for (const P in w) {
        if (Yt(P)) continue;
        const C = w[P], x = h[P];
        C !== x && P !== "value" && o(f, P, x, C, S, k);
      }
      "value" in w && o(f, "value", h.value, w.value, S);
    }
  }, ut = (f, h, w, k, S, P, C, x, j) => {
    const $ = h.el = f ? f.el : a(""), R = h.anchor = f ? f.anchor : a("");
    let { patchFlag: A, dynamicChildren: I, slotScopeIds: F } = h;
    F && (x = x ? x.concat(F) : F), f == null ? (n($, w, k), n(R, w, k), re(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      h.children || [],
      w,
      R,
      S,
      P,
      C,
      x,
      j
    )) : A > 0 && A & 64 && I && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    f.dynamicChildren ? (Ce(
      f.dynamicChildren,
      I,
      w,
      S,
      P,
      C,
      x
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (h.key != null || S && h === S.subTree) && Mi(
      f,
      h,
      !0
      /* shallow */
    )) : B(
      f,
      h,
      w,
      R,
      S,
      P,
      C,
      x,
      j
    );
  }, ke = (f, h, w, k, S, P, C, x, j) => {
    h.slotScopeIds = x, f == null ? h.shapeFlag & 512 ? S.ctx.activate(
      h,
      w,
      k,
      C,
      j
    ) : zt(
      h,
      w,
      k,
      S,
      P,
      C,
      j
    ) : ms(f, h, j);
  }, zt = (f, h, w, k, S, P, C) => {
    const x = f.component = Wa(
      f,
      k,
      S
    );
    if (bi(f) && (x.ctx.renderer = bt), La(x, !1, C), x.asyncDep) {
      if (S && S.registerDep(x, fe, C), !f.el) {
        const j = x.subTree = Je(vt);
        T(null, j, h, w), f.placeholder = j.el;
      }
    } else
      fe(
        x,
        f,
        h,
        w,
        S,
        P,
        C
      );
  }, ms = (f, h, w) => {
    const k = h.component = f.component;
    if (Aa(f, h, w))
      if (k.asyncDep && !k.asyncResolved) {
        Q(k, h, w);
        return;
      } else
        k.next = h, k.update();
    else
      h.el = f.el, k.vnode = h;
  }, fe = (f, h, w, k, S, P, C) => {
    const x = () => {
      if (f.isMounted) {
        let { next: A, bu: I, u: F, parent: U, vnode: G } = f;
        {
          const Te = Ri(f);
          if (Te) {
            A && (A.el = G.el, Q(f, A, C)), Te.asyncDep.then(() => {
              f.isUnmounted || x();
            });
            return;
          }
        }
        let z = A, pe;
        Pt(f, !1), A ? (A.el = G.el, Q(f, A, C)) : A = G, I && _s(I), (pe = A.props && A.props.onVnodeBeforeUpdate) && Le(pe, U, A, G), Pt(f, !0);
        const he = mr(f), be = f.subTree;
        f.subTree = he, _(
          be,
          he,
          // parent may have changed if it's in a teleport
          d(be.el),
          // anchor may have changed if it's in a fragment
          Ye(be),
          f,
          S,
          P
        ), A.el = he.el, z === null && Ia(f, he.el), F && Ae(F, S), (pe = A.props && A.props.onVnodeUpdated) && Ae(
          () => Le(pe, U, A, G),
          S
        );
      } else {
        let A;
        const { el: I, props: F } = h, { bm: U, m: G, parent: z, root: pe, type: he } = f, be = ss(h);
        Pt(f, !1), U && _s(U), !be && (A = F && F.onVnodeBeforeMount) && Le(A, z, h), Pt(f, !0);
        {
          pe.ce && // @ts-expect-error _def is private
          pe.ce._def.shadowRoot !== !1 && pe.ce._injectChildStyle(he);
          const Te = f.subTree = mr(f);
          _(
            null,
            Te,
            w,
            k,
            f,
            S,
            P
          ), h.el = Te.el;
        }
        if (G && Ae(G, S), !be && (A = F && F.onVnodeMounted)) {
          const Te = h;
          Ae(
            () => Le(A, z, Te),
            S
          );
        }
        (h.shapeFlag & 256 || z && ss(z.vnode) && z.vnode.shapeFlag & 256) && f.a && Ae(f.a, S), f.isMounted = !0, h = w = k = null;
      }
    };
    f.scope.on();
    const j = f.effect = new Zr(x);
    f.scope.off();
    const $ = f.update = j.run.bind(j), R = f.job = j.runIfDirty.bind(j);
    R.i = f, R.id = f.uid, j.scheduler = () => Bn(R), Pt(f, !0), $();
  }, Q = (f, h, w) => {
    h.component = f;
    const k = f.vnode.props;
    f.vnode = h, f.next = null, ha(f, h.props, k, w), va(f, h.children, w), ot(), or(f), at();
  }, B = (f, h, w, k, S, P, C, x, j = !1) => {
    const $ = f && f.children, R = f ? f.shapeFlag : 0, A = h.children, { patchFlag: I, shapeFlag: F } = h;
    if (I > 0) {
      if (I & 128) {
        Ze(
          $,
          A,
          w,
          k,
          S,
          P,
          C,
          x,
          j
        );
        return;
      } else if (I & 256) {
        We(
          $,
          A,
          w,
          k,
          S,
          P,
          C,
          x,
          j
        );
        return;
      }
    }
    F & 8 ? (R & 16 && Re($, S, P), A !== $ && c(w, A)) : R & 16 ? F & 16 ? Ze(
      $,
      A,
      w,
      k,
      S,
      P,
      C,
      x,
      j
    ) : Re($, S, P, !0) : (R & 8 && c(w, ""), F & 16 && re(
      A,
      w,
      k,
      S,
      P,
      C,
      x,
      j
    ));
  }, We = (f, h, w, k, S, P, C, x, j) => {
    f = f || Mt, h = h || Mt;
    const $ = f.length, R = h.length, A = Math.min($, R);
    let I;
    for (I = 0; I < A; I++) {
      const F = h[I] = j ? ht(h[I]) : ze(h[I]);
      _(
        f[I],
        F,
        w,
        null,
        S,
        P,
        C,
        x,
        j
      );
    }
    $ > R ? Re(
      f,
      S,
      P,
      !0,
      !1,
      A
    ) : re(
      h,
      w,
      k,
      S,
      P,
      C,
      x,
      j,
      A
    );
  }, Ze = (f, h, w, k, S, P, C, x, j) => {
    let $ = 0;
    const R = h.length;
    let A = f.length - 1, I = R - 1;
    for (; $ <= A && $ <= I; ) {
      const F = f[$], U = h[$] = j ? ht(h[$]) : ze(h[$]);
      if (Kt(F, U))
        _(
          F,
          U,
          w,
          null,
          S,
          P,
          C,
          x,
          j
        );
      else
        break;
      $++;
    }
    for (; $ <= A && $ <= I; ) {
      const F = f[A], U = h[I] = j ? ht(h[I]) : ze(h[I]);
      if (Kt(F, U))
        _(
          F,
          U,
          w,
          null,
          S,
          P,
          C,
          x,
          j
        );
      else
        break;
      A--, I--;
    }
    if ($ > A) {
      if ($ <= I) {
        const F = I + 1, U = F < R ? h[F].el : k;
        for (; $ <= I; )
          _(
            null,
            h[$] = j ? ht(h[$]) : ze(h[$]),
            w,
            U,
            S,
            P,
            C,
            x,
            j
          ), $++;
      }
    } else if ($ > I)
      for (; $ <= A; )
        we(f[$], S, P, !0), $++;
    else {
      const F = $, U = $, G = /* @__PURE__ */ new Map();
      for ($ = U; $ <= I; $++) {
        const b = h[$] = j ? ht(h[$]) : ze(h[$]);
        b.key != null && G.set(b.key, $);
      }
      let z, pe = 0;
      const he = I - U + 1;
      let be = !1, Te = 0;
      const ft = new Array(he);
      for ($ = 0; $ < he; $++) ft[$] = 0;
      for ($ = F; $ <= A; $++) {
        const b = f[$];
        if (pe >= he) {
          we(b, S, P, !0);
          continue;
        }
        let g;
        if (b.key != null)
          g = G.get(b.key);
        else
          for (z = U; z <= I; z++)
            if (ft[z - U] === 0 && Kt(b, h[z])) {
              g = z;
              break;
            }
        g === void 0 ? we(b, S, P, !0) : (ft[g - U] = $ + 1, g >= Te ? Te = g : be = !0, _(
          b,
          h[g],
          w,
          null,
          S,
          P,
          C,
          x,
          j
        ), pe++);
      }
      const At = be ? Pa(ft) : Mt;
      for (z = At.length - 1, $ = he - 1; $ >= 0; $--) {
        const b = U + $, g = h[b], E = h[b + 1], se = b + 1 < R ? (
          // #13559, fallback to el placeholder for unresolved async component
          E.el || E.placeholder
        ) : k;
        ft[$] === 0 ? _(
          null,
          g,
          w,
          se,
          S,
          P,
          C,
          x,
          j
        ) : be && (z < 0 || $ !== At[z] ? He(g, w, se, 2) : z--);
      }
    }
  }, He = (f, h, w, k, S = null) => {
    const { el: P, type: C, transition: x, children: j, shapeFlag: $ } = f;
    if ($ & 6) {
      He(f.component.subTree, h, w, k);
      return;
    }
    if ($ & 128) {
      f.suspense.move(h, w, k);
      return;
    }
    if ($ & 64) {
      C.move(f, h, w, bt);
      return;
    }
    if (C === oe) {
      n(P, h, w);
      for (let A = 0; A < j.length; A++)
        He(j[A], h, w, k);
      n(f.anchor, h, w);
      return;
    }
    if (C === fn) {
      N(f, h, w);
      return;
    }
    if (k !== 2 && $ & 1 && x)
      if (k === 0)
        x.beforeEnter(P), n(P, h, w), Ae(() => x.enter(P), S);
      else {
        const { leave: A, delayLeave: I, afterLeave: F } = x, U = () => {
          f.ctx.isUnmounted ? i(P) : n(P, h, w);
        }, G = () => {
          P._isLeaving && P[Uo](
            !0
            /* cancelled */
          ), A(P, () => {
            U(), F && F();
          });
        };
        I ? I(P, U, G) : G();
      }
    else
      n(P, h, w);
  }, we = (f, h, w, k = !1, S = !1) => {
    const {
      type: P,
      props: C,
      ref: x,
      children: j,
      dynamicChildren: $,
      shapeFlag: R,
      patchFlag: A,
      dirs: I,
      cacheIndex: F
    } = f;
    if (A === -2 && (S = !1), x != null && (ot(), ts(x, null, w, f, !0), at()), F != null && (h.renderCache[F] = void 0), R & 256) {
      h.ctx.deactivate(f);
      return;
    }
    const U = R & 1 && I, G = !ss(f);
    let z;
    if (G && (z = C && C.onVnodeBeforeUnmount) && Le(z, h, f), R & 6)
      sn(f.component, w, k);
    else {
      if (R & 128) {
        f.suspense.unmount(w, k);
        return;
      }
      U && St(f, null, h, "beforeUnmount"), R & 64 ? f.type.remove(
        f,
        h,
        w,
        bt,
        k
      ) : $ && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !$.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (P !== oe || A > 0 && A & 64) ? Re(
        $,
        h,
        w,
        !1,
        !0
      ) : (P === oe && A & 384 || !S && R & 16) && Re(j, h, w), k && gs(f);
    }
    (G && (z = C && C.onVnodeUnmounted) || U) && Ae(() => {
      z && Le(z, h, f), U && St(f, null, h, "unmounted");
    }, w);
  }, gs = (f) => {
    const { type: h, el: w, anchor: k, transition: S } = f;
    if (h === oe) {
      tn(w, k);
      return;
    }
    if (h === fn) {
      M(f);
      return;
    }
    const P = () => {
      i(w), S && !S.persisted && S.afterLeave && S.afterLeave();
    };
    if (f.shapeFlag & 1 && S && !S.persisted) {
      const { leave: C, delayLeave: x } = S, j = () => C(w, P);
      x ? x(f.el, P, j) : j();
    } else
      P();
  }, tn = (f, h) => {
    let w;
    for (; f !== h; )
      w = m(f), i(f), f = w;
    i(h);
  }, sn = (f, h, w) => {
    const { bum: k, scope: S, job: P, subTree: C, um: x, m: j, a: $ } = f;
    hr(j), hr($), k && _s(k), S.stop(), P && (P.flags |= 8, we(C, f, h, w)), x && Ae(x, h), Ae(() => {
      f.isUnmounted = !0;
    }, h);
  }, Re = (f, h, w, k = !1, S = !1, P = 0) => {
    for (let C = P; C < f.length; C++)
      we(f[C], h, w, k, S);
  }, Ye = (f) => {
    if (f.shapeFlag & 6)
      return Ye(f.component.subTree);
    if (f.shapeFlag & 128)
      return f.suspense.next();
    const h = m(f.anchor || f.el), w = h && h[Ho];
    return w ? m(w) : h;
  };
  let Ct = !1;
  const Tt = (f, h, w) => {
    f == null ? h._vnode && we(h._vnode, null, null, !0) : _(
      h._vnode || null,
      f,
      h,
      null,
      null,
      null,
      w
    ), h._vnode = f, Ct || (Ct = !0, or(), gi(), Ct = !1);
  }, bt = {
    p: _,
    um: we,
    m: He,
    r: gs,
    mt: zt,
    mc: re,
    pc: B,
    pbc: Ce,
    n: Ye,
    o: e
  };
  return {
    render: Tt,
    hydrate: void 0,
    createApp: fa(Tt)
  };
}
function un({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function Pt({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Sa(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Mi(e, t, s = !1) {
  const n = e.children, i = t.children;
  if (q(n) && q(i))
    for (let o = 0; o < n.length; o++) {
      const r = n[o];
      let a = i[o];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[o] = ht(i[o]), a.el = r.el), !s && a.patchFlag !== -2 && Mi(r, a)), a.type === Qs && // avoid cached text nodes retaining detached dom nodes
      a.patchFlag !== -1 && (a.el = r.el), a.type === vt && !a.el && (a.el = r.el);
    }
}
function Pa(e) {
  const t = e.slice(), s = [0];
  let n, i, o, r, a;
  const u = e.length;
  for (n = 0; n < u; n++) {
    const l = e[n];
    if (l !== 0) {
      if (i = s[s.length - 1], e[i] < l) {
        t[n] = i, s.push(n);
        continue;
      }
      for (o = 0, r = s.length - 1; o < r; )
        a = o + r >> 1, e[s[a]] < l ? o = a + 1 : r = a;
      l < e[s[o]] && (o > 0 && (t[n] = s[o - 1]), s[o] = n);
    }
  }
  for (o = s.length, r = s[o - 1]; o-- > 0; )
    s[o] = r, r = t[r];
  return s;
}
function Ri(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Ri(t);
}
function hr(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const xa = Symbol.for("v-scx"), _a = () => ks(xa);
function rs(e, t, s) {
  return Ni(e, t, s);
}
function Ni(e, t, s = Z) {
  const { immediate: n, deep: i, flush: o, once: r } = s, a = xe({}, s), u = t && n || !t && o !== "post";
  let l;
  if (us) {
    if (o === "sync") {
      const p = _a();
      l = p.__watcherHandles || (p.__watcherHandles = []);
    } else if (!u) {
      const p = () => {
      };
      return p.stop = Ke, p.resume = Ke, p.pause = Ke, p;
    }
  }
  const c = ge;
  a.call = (p, v, _) => Xe(p, c, v, _);
  let d = !1;
  o === "post" ? a.scheduler = (p) => {
    Ae(p, c && c.suspense);
  } : o !== "sync" && (d = !0, a.scheduler = (p, v) => {
    v ? p() : Bn(p);
  }), a.augmentJob = (p) => {
    t && (p.flags |= 4), d && (p.flags |= 2, c && (p.id = c.uid, p.i = c));
  };
  const m = No(e, t, a);
  return us && (l ? l.push(m) : u && m()), m;
}
function ka(e, t, s) {
  const n = this.proxy, i = le(e) ? e.includes(".") ? Fi(n, e) : () => n[e] : e.bind(n, n);
  let o;
  W(t) ? o = t : (o = t.handler, s = t);
  const r = hs(this), a = Ni(i, o.bind(n), s);
  return r(), a;
}
function Fi(e, t) {
  const s = t.split(".");
  return () => {
    let n = e;
    for (let i = 0; i < s.length && n; i++)
      n = n[s[i]];
    return n;
  };
}
const $a = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Fe(t)}Modifiers`] || e[`${wt(t)}Modifiers`];
function Ea(e, t, ...s) {
  if (e.isUnmounted) return;
  const n = e.vnode.props || Z;
  let i = s;
  const o = t.startsWith("update:"), r = o && $a(n, t.slice(7));
  r && (r.trim && (i = s.map((c) => le(c) ? c.trim() : c)), r.number && (i = s.map(Cs)));
  let a, u = n[a = nn(t)] || // also try camelCase event handler (#2249)
  n[a = nn(Fe(t))];
  !u && o && (u = n[a = nn(wt(t))]), u && Xe(
    u,
    e,
    6,
    i
  );
  const l = n[a + "Once"];
  if (l) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[a])
      return;
    e.emitted[a] = !0, Xe(
      l,
      e,
      6,
      i
    );
  }
}
const ja = /* @__PURE__ */ new WeakMap();
function qi(e, t, s = !1) {
  const n = s ? ja : t.emitsCache, i = n.get(e);
  if (i !== void 0)
    return i;
  const o = e.emits;
  let r = {}, a = !1;
  if (!W(e)) {
    const u = (l) => {
      const c = qi(l, t, !0);
      c && (a = !0, xe(r, c));
    };
    !s && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  return !o && !a ? (ee(e) && n.set(e, null), null) : (q(o) ? o.forEach((u) => r[u] = null) : xe(r, o), ee(e) && n.set(e, r), r);
}
function Ys(e, t) {
  return !e || !Us(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), J(e, t[0].toLowerCase() + t.slice(1)) || J(e, wt(t)) || J(e, t));
}
function mr(e) {
  const {
    type: t,
    vnode: s,
    proxy: n,
    withProxy: i,
    propsOptions: [o],
    slots: r,
    attrs: a,
    emit: u,
    render: l,
    renderCache: c,
    props: d,
    data: m,
    setupState: p,
    ctx: v,
    inheritAttrs: _
  } = e, H = Os(e);
  let T, O;
  try {
    if (s.shapeFlag & 4) {
      const M = i || n, te = M;
      T = ze(
        l.call(
          te,
          M,
          c,
          d,
          p,
          m,
          v
        )
      ), O = a;
    } else {
      const M = t;
      T = ze(
        M.length > 1 ? M(
          d,
          { attrs: a, slots: r, emit: u }
        ) : M(
          d,
          null
        )
      ), O = t.props ? a : Ca(a);
    }
  } catch (M) {
    is.length = 0, Xs(M, e, 1), T = Je(vt);
  }
  let N = T;
  if (O && _ !== !1) {
    const M = Object.keys(O), { shapeFlag: te } = N;
    M.length && te & 7 && (o && M.some(On) && (O = Ta(
      O,
      o
    )), N = Ut(N, O, !1, !0));
  }
  return s.dirs && (N = Ut(N, null, !1, !0), N.dirs = N.dirs ? N.dirs.concat(s.dirs) : s.dirs), s.transition && Kn(N, s.transition), T = N, Os(H), T;
}
const Ca = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || Us(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, Ta = (e, t) => {
  const s = {};
  for (const n in e)
    (!On(n) || !(n.slice(9) in t)) && (s[n] = e[n]);
  return s;
};
function Aa(e, t, s) {
  const { props: n, children: i, component: o } = e, { props: r, children: a, patchFlag: u } = t, l = o.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && u >= 0) {
    if (u & 1024)
      return !0;
    if (u & 16)
      return n ? gr(n, r, l) : !!r;
    if (u & 8) {
      const c = t.dynamicProps;
      for (let d = 0; d < c.length; d++) {
        const m = c[d];
        if (r[m] !== n[m] && !Ys(l, m))
          return !0;
      }
    }
  } else
    return (i || a) && (!a || !a.$stable) ? !0 : n === r ? !1 : n ? r ? gr(n, r, l) : !0 : !!r;
  return !1;
}
function gr(e, t, s) {
  const n = Object.keys(t);
  if (n.length !== Object.keys(e).length)
    return !0;
  for (let i = 0; i < n.length; i++) {
    const o = n[i];
    if (t[o] !== e[o] && !Ys(s, o))
      return !0;
  }
  return !1;
}
function Ia({ vnode: e, parent: t }, s) {
  for (; t; ) {
    const n = t.subTree;
    if (n.suspense && n.suspense.activeBranch === e && (n.el = e.el), n === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
}
const Di = (e) => e.__isSuspense;
function Oa(e, t) {
  t && t.pendingBranch ? q(e) ? t.effects.push(...e) : t.effects.push(e) : Do(e);
}
const oe = Symbol.for("v-fgt"), Qs = Symbol.for("v-txt"), vt = Symbol.for("v-cmt"), fn = Symbol.for("v-stc"), is = [];
let Me = null;
function D(e = !1) {
  is.push(Me = e ? null : []);
}
function Ma() {
  is.pop(), Me = is[is.length - 1] || null;
}
let cs = 1;
function yr(e, t = !1) {
  cs += e, e < 0 && Me && t && (Me.hasOnce = !0);
}
function Wi(e) {
  return e.dynamicChildren = cs > 0 ? Me || Mt : null, Ma(), cs > 0 && Me && Me.push(e), e;
}
function L(e, t, s, n, i, o) {
  return Wi(
    y(
      e,
      t,
      s,
      n,
      i,
      o,
      !0
    )
  );
}
function Ns(e, t, s, n, i) {
  return Wi(
    Je(
      e,
      t,
      s,
      n,
      i,
      !0
    )
  );
}
function Hi(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Kt(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Li = ({ key: e }) => e ?? null, $s = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? le(e) || ye(e) || W(e) ? { i: Oe, r: e, k: t, f: !!s } : e : null);
function y(e, t = null, s = null, n = 0, i = null, o = e === oe ? 0 : 1, r = !1, a = !1) {
  const u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Li(t),
    ref: t && $s(t),
    scopeId: vi,
    slotScopeIds: null,
    children: s,
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
    shapeFlag: o,
    patchFlag: n,
    dynamicProps: i,
    dynamicChildren: null,
    appContext: null,
    ctx: Oe
  };
  return a ? (Yn(u, s), o & 128 && e.normalize(u)) : s && (u.shapeFlag |= le(s) ? 8 : 16), cs > 0 && // avoid a block node from tracking itself
  !r && // has current parent block
  Me && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (u.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  u.patchFlag !== 32 && Me.push(u), u;
}
const Je = Ra;
function Ra(e, t = null, s = null, n = 0, i = null, o = !1) {
  if ((!e || e === sa) && (e = vt), Hi(e)) {
    const a = Ut(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && Yn(a, s), cs > 0 && !o && Me && (a.shapeFlag & 6 ? Me[Me.indexOf(e)] = a : Me.push(a)), a.patchFlag = -2, a;
  }
  if (Ka(e) && (e = e.__vccOpts), t) {
    t = Na(t);
    let { class: a, style: u } = t;
    a && !le(a) && (t.class = je(a)), ee(u) && (Vn(u) && !q(u) && (u = xe({}, u)), t.style = Nn(u));
  }
  const r = le(e) ? 1 : Di(e) ? 128 : Lo(e) ? 64 : ee(e) ? 4 : W(e) ? 2 : 0;
  return y(
    e,
    t,
    s,
    n,
    i,
    r,
    o,
    !0
  );
}
function Na(e) {
  return e ? Vn(e) || ji(e) ? xe({}, e) : e : null;
}
function Ut(e, t, s = !1, n = !1) {
  const { props: i, ref: o, patchFlag: r, children: a, transition: u } = e, l = t ? Fa(i || {}, t) : i, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: l,
    key: l && Li(l),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && o ? q(o) ? o.concat($s(t)) : [o, $s(t)] : $s(t)
    ) : o,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: a,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== oe ? r === -1 ? 16 : r | 16 : r,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: u,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && Ut(e.ssContent),
    ssFallback: e.ssFallback && Ut(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return u && n && Kn(
    c,
    u.clone(c)
  ), c;
}
function ce(e = " ", t = 0) {
  return Je(Qs, null, e, t);
}
function Ve(e = "", t = !1) {
  return t ? (D(), Ns(vt, null, e)) : Je(vt, null, e);
}
function ze(e) {
  return e == null || typeof e == "boolean" ? Je(vt) : q(e) ? Je(
    oe,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Hi(e) ? ht(e) : Je(Qs, null, String(e));
}
function ht(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ut(e);
}
function Yn(e, t) {
  let s = 0;
  const { shapeFlag: n } = e;
  if (t == null)
    t = null;
  else if (q(t))
    s = 16;
  else if (typeof t == "object")
    if (n & 65) {
      const i = t.default;
      i && (i._c && (i._d = !1), Yn(e, i()), i._c && (i._d = !0));
      return;
    } else {
      s = 32;
      const i = t._;
      !i && !ji(t) ? t._ctx = Oe : i === 3 && Oe && (Oe.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else W(t) ? (t = { default: t, _ctx: Oe }, s = 32) : (t = String(t), n & 64 ? (s = 16, t = [ce(t)]) : s = 8);
  e.children = t, e.shapeFlag |= s;
}
function Fa(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const n = e[s];
    for (const i in n)
      if (i === "class")
        t.class !== n.class && (t.class = je([t.class, n.class]));
      else if (i === "style")
        t.style = Nn([t.style, n.style]);
      else if (Us(i)) {
        const o = t[i], r = n[i];
        r && o !== r && !(q(o) && o.includes(r)) && (t[i] = o ? [].concat(o, r) : r);
      } else i !== "" && (t[i] = n[i]);
  }
  return t;
}
function Le(e, t, s, n = null) {
  Xe(e, t, 7, [
    s,
    n
  ]);
}
const qa = ki();
let Da = 0;
function Wa(e, t, s) {
  const n = e.type, i = (t ? t.appContext : e.appContext) || qa, o = {
    uid: Da++,
    vnode: e,
    type: n,
    parent: t,
    appContext: i,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new ao(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(i.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Ti(n, i),
    emitsOptions: qi(n, i),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Z,
    // inheritAttrs
    inheritAttrs: n.inheritAttrs,
    // state
    ctx: Z,
    data: Z,
    props: Z,
    attrs: Z,
    slots: Z,
    refs: Z,
    setupState: Z,
    setupContext: null,
    // suspense related
    suspense: s,
    suspenseId: s ? s.pendingId : 0,
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
  return o.ctx = { _: o }, o.root = t ? t.root : o, o.emit = Ea.bind(null, o), e.ce && e.ce(o), o;
}
let ge = null;
const Ha = () => ge || Oe;
let Fs, $n;
{
  const e = Ks(), t = (s, n) => {
    let i;
    return (i = e[s]) || (i = e[s] = []), i.push(n), (o) => {
      i.length > 1 ? i.forEach((r) => r(o)) : i[0](o);
    };
  };
  Fs = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => ge = s
  ), $n = t(
    "__VUE_SSR_SETTERS__",
    (s) => us = s
  );
}
const hs = (e) => {
  const t = ge;
  return Fs(e), e.scope.on(), () => {
    e.scope.off(), Fs(t);
  };
}, vr = () => {
  ge && ge.scope.off(), Fs(null);
};
function Ui(e) {
  return e.vnode.shapeFlag & 4;
}
let us = !1;
function La(e, t = !1, s = !1) {
  t && $n(t);
  const { props: n, children: i } = e.vnode, o = Ui(e);
  pa(e, n, o, t), ya(e, i, s || t);
  const r = o ? Ua(e, t) : void 0;
  return t && $n(!1), r;
}
function Ua(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, ra);
  const { setup: n } = s;
  if (n) {
    ot();
    const i = e.setupContext = n.length > 1 ? za(e) : null, o = hs(e), r = ps(
      n,
      e,
      0,
      [
        e.props,
        i
      ]
    ), a = Vr(r);
    if (at(), o(), (a || e.sp) && !ss(e) && wi(e), a) {
      if (r.then(vr, vr), t)
        return r.then((u) => {
          wr(e, u);
        }).catch((u) => {
          Xs(u, e, 0);
        });
      e.asyncDep = r;
    } else
      wr(e, r);
  } else
    Vi(e);
}
function wr(e, t, s) {
  W(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ee(t) && (e.setupState = pi(t)), Vi(e);
}
function Vi(e, t, s) {
  const n = e.type;
  e.render || (e.render = n.render || Ke);
  {
    const i = hs(e);
    ot();
    try {
      ia(e);
    } finally {
      at(), i();
    }
  }
}
const Va = {
  get(e, t) {
    return me(e, "get", ""), e[t];
  }
};
function za(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, Va),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function en(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(pi(Co(e.exposed)), {
    get(t, s) {
      if (s in t)
        return t[s];
      if (s in ns)
        return ns[s](e);
    },
    has(t, s) {
      return s in t || s in ns;
    }
  })) : e.proxy;
}
function Ba(e, t = !0) {
  return W(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Ka(e) {
  return W(e) && "__vccOpts" in e;
}
const mt = (e, t) => Mo(e, t, us), Ja = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let En;
const br = typeof window < "u" && window.trustedTypes;
if (br)
  try {
    En = /* @__PURE__ */ br.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const zi = En ? (e) => En.createHTML(e) : (e) => e, Ga = "http://www.w3.org/2000/svg", Xa = "http://www.w3.org/1998/Math/MathML", tt = typeof document < "u" ? document : null, Sr = tt && /* @__PURE__ */ tt.createElement("template"), Za = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, n) => {
    const i = t === "svg" ? tt.createElementNS(Ga, e) : t === "mathml" ? tt.createElementNS(Xa, e) : s ? tt.createElement(e, { is: s }) : tt.createElement(e);
    return e === "select" && n && n.multiple != null && i.setAttribute("multiple", n.multiple), i;
  },
  createText: (e) => tt.createTextNode(e),
  createComment: (e) => tt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => tt.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, s, n, i, o) {
    const r = s ? s.previousSibling : t.lastChild;
    if (i && (i === o || i.nextSibling))
      for (; t.insertBefore(i.cloneNode(!0), s), !(i === o || !(i = i.nextSibling)); )
        ;
    else {
      Sr.innerHTML = zi(
        n === "svg" ? `<svg>${e}</svg>` : n === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Sr.content;
      if (n === "svg" || n === "mathml") {
        const u = a.firstChild;
        for (; u.firstChild; )
          a.appendChild(u.firstChild);
        a.removeChild(u);
      }
      t.insertBefore(a, s);
    }
    return [
      // first
      r ? r.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, Ya = Symbol("_vtc");
function Qa(e, t, s) {
  const n = e[Ya];
  n && (t = (t ? [t, ...n] : [...n]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const qs = Symbol("_vod"), Bi = Symbol("_vsh"), Pr = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(e, { value: t }, { transition: s }) {
    e[qs] = e.style.display === "none" ? "" : e.style.display, s && t ? s.beforeEnter(e) : Jt(e, t);
  },
  mounted(e, { value: t }, { transition: s }) {
    s && t && s.enter(e);
  },
  updated(e, { value: t, oldValue: s }, { transition: n }) {
    !t != !s && (n ? t ? (n.beforeEnter(e), Jt(e, !0), n.enter(e)) : n.leave(e, () => {
      Jt(e, !1);
    }) : Jt(e, t));
  },
  beforeUnmount(e, { value: t }) {
    Jt(e, t);
  }
};
function Jt(e, t) {
  e.style.display = t ? e[qs] : "none", e[Bi] = !t;
}
const el = Symbol(""), tl = /(?:^|;)\s*display\s*:/;
function sl(e, t, s) {
  const n = e.style, i = le(s);
  let o = !1;
  if (s && !i) {
    if (t)
      if (le(t))
        for (const r of t.split(";")) {
          const a = r.slice(0, r.indexOf(":")).trim();
          s[a] == null && Es(n, a, "");
        }
      else
        for (const r in t)
          s[r] == null && Es(n, r, "");
    for (const r in s)
      r === "display" && (o = !0), Es(n, r, s[r]);
  } else if (i) {
    if (t !== s) {
      const r = n[el];
      r && (s += ";" + r), n.cssText = s, o = tl.test(s);
    }
  } else t && e.removeAttribute("style");
  qs in e && (e[qs] = o ? n.display : "", e[Bi] && (n.display = "none"));
}
const xr = /\s*!important$/;
function Es(e, t, s) {
  if (q(s))
    s.forEach((n) => Es(e, t, n));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const n = nl(e, t);
    xr.test(s) ? e.setProperty(
      wt(n),
      s.replace(xr, ""),
      "important"
    ) : e[n] = s;
  }
}
const _r = ["Webkit", "Moz", "ms"], dn = {};
function nl(e, t) {
  const s = dn[t];
  if (s)
    return s;
  let n = Fe(t);
  if (n !== "filter" && n in e)
    return dn[t] = n;
  n = Bs(n);
  for (let i = 0; i < _r.length; i++) {
    const o = _r[i] + n;
    if (o in e)
      return dn[t] = o;
  }
  return t;
}
const kr = "http://www.w3.org/1999/xlink";
function $r(e, t, s, n, i, o = ro(t)) {
  n && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(kr, t.slice(6, t.length)) : e.setAttributeNS(kr, t, s) : s == null || o && !Jr(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    o ? "" : Ge(s) ? String(s) : s
  );
}
function Er(e, t, s, n, i) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? zi(s) : s);
    return;
  }
  const o = e.tagName;
  if (t === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const a = o === "OPTION" ? e.getAttribute("value") || "" : e.value, u = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (a !== u || !("_value" in e)) && (e.value = u), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let r = !1;
  if (s === "" || s == null) {
    const a = typeof e[t];
    a === "boolean" ? s = Jr(s) : s == null && a === "string" ? (s = "", r = !0) : a === "number" && (s = 0, r = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  r && e.removeAttribute(i || t);
}
function Et(e, t, s, n) {
  e.addEventListener(t, s, n);
}
function rl(e, t, s, n) {
  e.removeEventListener(t, s, n);
}
const jr = Symbol("_vei");
function il(e, t, s, n, i = null) {
  const o = e[jr] || (e[jr] = {}), r = o[t];
  if (n && r)
    r.value = n;
  else {
    const [a, u] = ol(t);
    if (n) {
      const l = o[t] = cl(
        n,
        i
      );
      Et(e, a, l, u);
    } else r && (rl(e, a, r, u), o[t] = void 0);
  }
}
const Cr = /(?:Once|Passive|Capture)$/;
function ol(e) {
  let t;
  if (Cr.test(e)) {
    t = {};
    let n;
    for (; n = e.match(Cr); )
      e = e.slice(0, e.length - n[0].length), t[n[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : wt(e.slice(2)), t];
}
let pn = 0;
const al = /* @__PURE__ */ Promise.resolve(), ll = () => pn || (al.then(() => pn = 0), pn = Date.now());
function cl(e, t) {
  const s = (n) => {
    if (!n._vts)
      n._vts = Date.now();
    else if (n._vts <= s.attached)
      return;
    Xe(
      ul(n, s.value),
      t,
      5,
      [n]
    );
  };
  return s.value = e, s.attached = ll(), s;
}
function ul(e, t) {
  if (q(t)) {
    const s = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      s.call(e), e._stopped = !0;
    }, t.map(
      (n) => (i) => !i._stopped && n && n(i)
    );
  } else
    return t;
}
const Tr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, fl = (e, t, s, n, i, o) => {
  const r = i === "svg";
  t === "class" ? Qa(e, n, r) : t === "style" ? sl(e, s, n) : Us(t) ? On(t) || il(e, t, s, n, o) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : dl(e, t, n, r)) ? (Er(e, t, n), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && $r(e, t, n, r, o, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !le(n)) ? Er(e, Fe(t), n, o, t) : (t === "true-value" ? e._trueValue = n : t === "false-value" && (e._falseValue = n), $r(e, t, n, r));
};
function dl(e, t, s, n) {
  if (n)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Tr(t) && W(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const i = e.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return Tr(t) && le(s) ? !1 : t in e;
}
const Ds = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return q(t) ? (s) => _s(t, s) : t;
};
function pl(e) {
  e.target.composing = !0;
}
function Ar(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Dt = Symbol("_assign"), hl = {
  created(e, { modifiers: { lazy: t, trim: s, number: n } }, i) {
    e[Dt] = Ds(i);
    const o = n || i.props && i.props.type === "number";
    Et(e, t ? "change" : "input", (r) => {
      if (r.target.composing) return;
      let a = e.value;
      s && (a = a.trim()), o && (a = Cs(a)), e[Dt](a);
    }), s && Et(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Et(e, "compositionstart", pl), Et(e, "compositionend", Ar), Et(e, "change", Ar));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: n, trim: i, number: o } }, r) {
    if (e[Dt] = Ds(r), e.composing) return;
    const a = (o || e.type === "number") && !/^0\d/.test(e.value) ? Cs(e.value) : e.value, u = t ?? "";
    a !== u && (document.activeElement === e && e.type !== "range" && (n && t === s || i && e.value.trim() === u) || (e.value = u));
  }
}, ml = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: s } }, n) {
    const i = Vs(t);
    Et(e, "change", () => {
      const o = Array.prototype.filter.call(e.options, (r) => r.selected).map(
        (r) => s ? Cs(Ws(r)) : Ws(r)
      );
      e[Dt](
        e.multiple ? i ? new Set(o) : o : o[0]
      ), e._assigning = !0, zn(() => {
        e._assigning = !1;
      });
    }), e[Dt] = Ds(n);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    Ir(e, t);
  },
  beforeUpdate(e, t, s) {
    e[Dt] = Ds(s);
  },
  updated(e, { value: t }) {
    e._assigning || Ir(e, t);
  }
};
function Ir(e, t) {
  const s = e.multiple, n = q(t);
  if (!(s && !n && !Vs(t))) {
    for (let i = 0, o = e.options.length; i < o; i++) {
      const r = e.options[i], a = Ws(r);
      if (s)
        if (n) {
          const u = typeof a;
          u === "string" || u === "number" ? r.selected = t.some((l) => String(l) === String(a)) : r.selected = oo(t, a) > -1;
        } else
          r.selected = t.has(a);
      else if (Js(Ws(r), t)) {
        e.selectedIndex !== i && (e.selectedIndex = i);
        return;
      }
    }
    !s && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function Ws(e) {
  return "_value" in e ? e._value : e.value;
}
const gl = ["ctrl", "shift", "alt", "meta"], yl = {
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
  exact: (e, t) => gl.some((s) => e[`${s}Key`] && !t.includes(s))
}, Qn = (e, t) => {
  const s = e._withMods || (e._withMods = {}), n = t.join(".");
  return s[n] || (s[n] = ((i, ...o) => {
    for (let r = 0; r < t.length; r++) {
      const a = yl[t[r]];
      if (a && a(i, t)) return;
    }
    return e(i, ...o);
  }));
}, vl = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, wl = (e, t) => {
  const s = e._withKeys || (e._withKeys = {}), n = t.join(".");
  return s[n] || (s[n] = ((i) => {
    if (!("key" in i))
      return;
    const o = wt(i.key);
    if (t.some(
      (r) => r === o || vl[r] === o
    ))
      return e(i);
  }));
}, bl = /* @__PURE__ */ xe({ patchProp: fl }, Za);
let Or;
function Sl() {
  return Or || (Or = wa(bl));
}
const Pl = ((...e) => {
  const t = Sl().createApp(...e), { mount: s } = t;
  return t.mount = (n) => {
    const i = _l(n);
    if (!i) return;
    const o = t._component;
    !W(o) && !o.render && !o.template && (o.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const r = s(i, !1, xl(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), r;
  }, t;
});
function xl(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function _l(e) {
  return le(e) ? document.querySelector(e) : e;
}
const kl = { class: "tree-node" }, $l = ["title"], El = { class: "tree-icon" }, jl = {
  key: 0,
  class: "tree-children"
}, Cl = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
  __name: "FileTreeNode",
  props: {
    node: { type: Object, required: !0 },
    selectedPath: { type: String, default: "" }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const s = t, n = X(!0);
    return (i, o) => {
      const r = ta("FileTreeNode", !0);
      return D(), L("div", kl, [
        y("div", {
          class: je(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: o[1] || (o[1] = (a) => s("select", e.node)),
          onDblclick: o[2] || (o[2] = (a) => e.node.kind === "directory" && (n.value = !n.value))
        }, [
          y("span", {
            class: "tree-toggle",
            onClick: o[0] || (o[0] = Qn((a) => e.node.kind === "directory" && (n.value = !n.value), ["stop"]))
          }, V(e.node.kind === "directory" ? n.value ? "⌄" : "›" : ""), 1),
          y("span", El, V(e.node.kind === "directory" ? "▰" : "·"), 1),
          y("span", null, V(e.node.name), 1)
        ], 42, $l),
        e.node.kind === "directory" && n.value ? (D(), L("div", jl, [
          (D(!0), L(oe, null, kt(e.node.children, (a) => (D(), Ns(r, {
            key: a.path,
            node: a,
            "selected-path": e.selectedPath,
            onSelect: o[3] || (o[3] = (u) => s("select", u))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : Ve("", !0)
      ]);
    };
  }
}), Tl = { class: "monaco-editor-shell" }, Al = {
  key: 0,
  class: "editor-loading"
}, Il = {
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
    const s = e, n = t, i = X(null), o = X(!0);
    let r, a, u, l, c = !1;
    Jn(async () => {
      try {
        ({ monaco: u } = await (await import("./monaco-runtime-aHqeNiN2.js").then((v) => v.jz)).configureStudioMonaco()), a = d(), r = u.editor.create(i.value, {
          model: a,
          automaticLayout: !0,
          minimap: { enabled: !1 },
          fontSize: 13,
          tabSize: 2,
          insertSpaces: !0,
          scrollBeyondLastLine: !1,
          wordWrap: "off",
          renderWhitespace: "selection",
          accessibilityPageSize: 20
        }), l = r.onDidChangeModelContent(() => {
          c || n("update:value", a.getValue());
        }), r.addCommand(u.KeyMod.CtrlCmd | u.KeyCode.KeyS, () => n("save")), o.value = !1, m(), r.focus(), n("ready");
      } catch (p) {
        o.value = !1, n("error", p);
      }
    }), rs(() => s.value, (p) => {
      !a || a.getValue() === p || (c = !0, a.setValue(p), c = !1);
    }), rs(() => s.markers, m, { deep: !0 }), Gn(() => {
      l?.dispose(), r?.dispose();
    });
    function d() {
      const p = u.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(s.projectId)}/${s.path}`), v = u.editor.getModel(p);
      return v ? (u.editor.setModelLanguage(v, s.language), v.getValue() !== s.value && v.setValue(s.value), v) : u.editor.createModel(s.value, s.language, p);
    }
    function m() {
      !u || !a || u.editor.setModelMarkers(a, "webwindows-manifest", s.markers.map((p) => ({
        severity: p.severity === "warning" ? u.MarkerSeverity.Warning : u.MarkerSeverity.Error,
        message: `${p.path}: ${p.message}`,
        startLineNumber: p.line || 1,
        startColumn: p.column || 1,
        endLineNumber: p.endLine || p.line || 1,
        endColumn: p.endColumn || Math.max(2, (p.column || 1) + 1)
      })));
    }
    return (p, v) => (D(), L("div", Tl, [
      y("div", {
        ref_key: "host",
        ref: i,
        class: "monaco-editor-host"
      }, null, 512),
      o.value ? (D(), L("div", Al, "正在载入本地编辑器…")) : Ve("", !0)
    ]));
  }
}, Ol = { class: "manifest-inspector" }, Ml = { class: "inspector-mode-tabs" }, Rl = {
  key: 0,
  class: "inspector-note"
}, Nl = {
  key: 1,
  class: "inspector-note error"
}, Fl = ["value"], ql = ["value"], Dl = ["value"], Wl = ["value"], Hl = ["value"], Ll = ["value"], Ul = ["value"], Vl = ["value"], zl = ["value"], Bl = { class: "check" }, Kl = ["checked"], Jl = { class: "check" }, Gl = ["checked"], Xl = { class: "check" }, Zl = ["checked"], Yl = { class: "check" }, Ql = ["checked"], ec = { class: "check" }, tc = ["checked"], sc = { class: "inspector-summary" }, nc = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const s = e, n = t, i = X("form"), o = mt(() => s.manifest && typeof s.manifest == "object" && !Array.isArray(s.manifest));
    function r(a, u) {
      if (!o.value) return;
      const l = JSON.parse(JSON.stringify(s.manifest));
      let c = l;
      a.slice(0, -1).forEach((d) => {
        (!c[d] || typeof c[d] != "object") && (c[d] = {}), c = c[d];
      }), c[a.at(-1)] = u, n("update:manifest", l);
    }
    return (a, u) => (D(), L("div", Ol, [
      y("div", Ml, [
        y("button", {
          type: "button",
          class: je({ active: i.value === "form" }),
          onClick: u[0] || (u[0] = (l) => i.value = "form")
        }, "表单", 2),
        y("button", {
          type: "button",
          class: je({ active: i.value === "json" }),
          onClick: u[1] || (u[1] = (l) => {
            i.value = "json", n("open-json");
          })
        }, "JSON", 2)
      ]),
      i.value === "json" ? (D(), L("div", Rl, [
        u[18] || (u[18] = ce(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        y("button", {
          type: "button",
          onClick: u[2] || (u[2] = (l) => n("open-json"))
        }, "打开 manifest.json")
      ])) : o.value ? (D(), L("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: u[17] || (u[17] = Qn(() => {
        }, ["prevent"]))
      }, [
        y("label", null, [
          u[19] || (u[19] = ce("ID", -1)),
          y("input", {
            value: e.manifest.id,
            onInput: u[3] || (u[3] = (l) => r(["id"], l.target.value))
          }, null, 40, Fl)
        ]),
        y("label", null, [
          u[20] || (u[20] = ce("名称", -1)),
          y("input", {
            value: e.manifest.name,
            onInput: u[4] || (u[4] = (l) => r(["name"], l.target.value))
          }, null, 40, ql)
        ]),
        y("label", null, [
          u[21] || (u[21] = ce("版本", -1)),
          y("input", {
            value: e.manifest.version,
            onInput: u[5] || (u[5] = (l) => r(["version"], l.target.value))
          }, null, 40, Dl)
        ]),
        y("label", null, [
          u[22] || (u[22] = ce("描述", -1)),
          y("textarea", {
            value: e.manifest.description,
            onInput: u[6] || (u[6] = (l) => r(["description"], l.target.value))
          }, null, 40, Wl)
        ]),
        y("label", null, [
          u[23] || (u[23] = ce("分类", -1)),
          y("input", {
            value: e.manifest.category,
            onInput: u[7] || (u[7] = (l) => r(["category"], l.target.value))
          }, null, 40, Hl)
        ]),
        y("label", null, [
          u[24] || (u[24] = ce("入口", -1)),
          y("input", {
            value: e.manifest.entry,
            onInput: u[8] || (u[8] = (l) => r(["entry"], l.target.value))
          }, null, 40, Ll)
        ]),
        y("label", null, [
          u[25] || (u[25] = ce("图标", -1)),
          y("input", {
            value: e.manifest.icon,
            onInput: u[9] || (u[9] = (l) => r(["icon"], l.target.value))
          }, null, 40, Ul)
        ]),
        y("fieldset", null, [
          u[29] || (u[29] = y("legend", null, "Window", -1)),
          y("label", null, [
            u[26] || (u[26] = ce("宽度", -1)),
            y("input", {
              value: e.manifest.window?.width,
              onInput: u[10] || (u[10] = (l) => r(["window", "width"], l.target.value))
            }, null, 40, Vl)
          ]),
          y("label", null, [
            u[27] || (u[27] = ce("高度", -1)),
            y("input", {
              value: e.manifest.window?.height,
              onInput: u[11] || (u[11] = (l) => r(["window", "height"], l.target.value))
            }, null, 40, zl)
          ]),
          y("label", Bl, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: u[12] || (u[12] = (l) => r(["window", "singleton"], l.target.checked))
            }, null, 40, Kl),
            u[28] || (u[28] = ce(" 单实例", -1))
          ])
        ]),
        y("fieldset", null, [
          u[34] || (u[34] = y("legend", null, "Placement", -1)),
          y("label", Jl, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: u[13] || (u[13] = (l) => r(["placement", "startMenu"], l.target.checked))
            }, null, 40, Gl),
            u[30] || (u[30] = ce(" 开始菜单", -1))
          ]),
          y("label", Xl, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: u[14] || (u[14] = (l) => r(["placement", "allFunctions"], l.target.checked))
            }, null, 40, Zl),
            u[31] || (u[31] = ce(" 全部功能", -1))
          ]),
          y("label", Yl, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: u[15] || (u[15] = (l) => r(["placement", "desktop"], l.target.checked))
            }, null, 40, Ql),
            u[32] || (u[32] = ce(" 桌面", -1))
          ]),
          y("label", ec, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: u[16] || (u[16] = (l) => r(["placement", "taskbar"], l.target.checked))
            }, null, 40, tc),
            u[33] || (u[33] = ce(" 任务栏", -1))
          ])
        ]),
        u[35] || (u[35] = y("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (D(), L("div", Nl, "修复 JSON 错误后才能使用可视化表单。")),
      y("div", sc, V(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
};
function rc(e) {
  let t = 0;
  for (let s = 0; s < e.length; s += 1) {
    const n = e.charCodeAt(s);
    if (n >= 55296 && n <= 56319 && s + 1 < e.length) {
      const i = e.charCodeAt(s + 1);
      i >= 56320 && i <= 57343 && (s += 1);
    }
    t += 1;
  }
  return t;
}
const ic = { properties: { type: { enum: ["application", "system"] } } }, Mr = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, oc = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, ac = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, lc = { properties: { status: { enum: ["published", "disabled"] } } }, Ie = rc, cc = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), uc = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), Ki = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), fc = new RegExp("^\\.[a-z0-9]+$", "u"), dc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), pc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function it(e, { instancePath: t = "", parentData: s, parentDataProperty: n, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let r = null, a = 0;
  const u = it.evaluated;
  if (u.dynamicProps && (u.props = void 0), u.dynamicItems && (u.items = void 0), typeof e == "string") {
    if (Ie(e) > 240) {
      const l = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (Ie(e) < 1) {
      const l = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (!Ki.test(e)) {
      const l = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      r === null ? r = [l] : r.push(l), a++;
    }
  } else {
    const l = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    r === null ? r = [l] : r.push(l), a++;
  }
  if (typeof e == "string" && !pc.test(e)) {
    const l = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    r === null ? r = [l] : r.push(l), a++;
  }
  return it.errors = r, a === 0;
}
it.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const hc = new RegExp("^[a-f0-9]{64}$", "u"), mc = new RegExp("^/api/function-package\\.asp\\?", "u");
function Wt(e, { instancePath: t = "", parentData: s, parentDataProperty: n, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let r = null, a = 0;
  const u = Wt.evaluated;
  if (u.dynamicProps && (u.props = void 0), u.dynamicItems && (u.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.size === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.sha256 === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.entry === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.downloadUrl === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const l = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.size !== void 0) {
      let l = e.size;
      if (!(typeof l == "number" && !(l % 1) && !isNaN(l))) {
        const c = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        r === null ? r = [c] : r.push(c), a++;
      }
      if (typeof l == "number" && (l < 0 || isNaN(l))) {
        const c = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.sha256 !== void 0) {
      let l = e.sha256;
      if (typeof l == "string") {
        if (!hc.test(l)) {
          const c = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.entry !== void 0 && (it(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: o }) || (r = r === null ? it.errors : r.concat(it.errors), a = r.length)), e.downloadUrl !== void 0) {
      let l = e.downloadUrl;
      if (typeof l == "string") {
        if (!mc.test(l)) {
          const c = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
  } else {
    const l = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    r === null ? r = [l] : r.push(l), a++;
  }
  return Wt.errors = r, a === 0;
}
Wt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ht(e, { instancePath: t = "", parentData: s, parentDataProperty: n, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let r = null, a = 0;
  const u = Ht.evaluated;
  if (u.dynamicProps && (u.props = void 0), u.dynamicItems && (u.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.id === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.type === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.name === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.version === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.icon === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.entry === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.install === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.placement === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.window === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.id !== void 0) {
      let l = e.id;
      if (typeof l == "string") {
        if (Ie(l) > 160) {
          const c = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (!cc.test(l)) {
          const c = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.legacyIds !== void 0) {
      let l = e.legacyIds;
      if (Array.isArray(l)) {
        const c = l.length;
        for (let p = 0; p < c; p++) {
          let v = l[p];
          if (typeof v == "string") {
            if (Ie(v) < 1) {
              const _ = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              r === null ? r = [_] : r.push(_), a++;
            }
          } else {
            const _ = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            r === null ? r = [_] : r.push(_), a++;
          }
        }
        let d = l.length, m;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let v = l[d];
            if (typeof v == "string") {
              if (typeof p[v] == "number") {
                m = p[v];
                const _ = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: m }, message: "must NOT have duplicate items (items ## " + m + " and " + d + " are identical)" };
                r === null ? r = [_] : r.push(_), a++;
                break;
              }
              p[v] = d;
            }
          }
        }
      } else {
        const c = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.type !== void 0) {
      let l = e.type;
      if (!(l === "application" || l === "system")) {
        const c = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: ic.properties.type.enum }, message: "must be equal to one of the allowed values" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.name !== void 0) {
      let l = e.name;
      if (typeof l == "string") {
        if (Ie(l) < 1) {
          const c = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const l = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const l = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      r === null ? r = [l] : r.push(l), a++;
    }
    if (e.version !== void 0) {
      let l = e.version;
      if (typeof l == "string") {
        if (Ie(l) > 40) {
          const c = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (!uc.test(l)) {
          const c = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.icon !== void 0) {
      let l = e.icon;
      if (typeof l == "string") {
        if (Ie(l) > 240) {
          const c = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (Ie(l) < 1) {
          const c = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (!Ki.test(l)) {
          const c = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.entry !== void 0 && (it(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: o }) || (r = r === null ? it.errors : r.concat(it.errors), a = r.length)), e.install !== void 0) {
      let l = e.install;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.defaultState === void 0) {
          const c = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.source === void 0) {
          const c = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.uninstallable === void 0) {
          const c = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.defaultState !== void 0) {
          let c = l.defaultState;
          if (!(c === "available" || c === "installed")) {
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: Mr.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
        if (l.source !== void 0) {
          let c = l.source;
          if (!(c === "repository" || c === "preinstalled" || c === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: Mr.properties.source.enum }, message: "must be equal to one of the allowed values" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
        if (l.uninstallable !== void 0 && typeof l.uninstallable != "boolean") {
          const c = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.placement !== void 0) {
      let l = e.placement;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.desktop === void 0) {
          const c = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.startMenu === void 0) {
          const c = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.allFunctions === void 0) {
          const c = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.taskbar === void 0) {
          const c = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.desktop !== void 0 && typeof l.desktop != "boolean") {
          const c = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.startMenu !== void 0 && typeof l.startMenu != "boolean") {
          const c = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.startMenuGroup !== void 0) {
          let c = l.startMenuGroup;
          if (!(c === "user" || c === "system")) {
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: oc.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
        if (l.startMenuOrder !== void 0) {
          let c = l.startMenuOrder;
          if (!(typeof c == "number" && !(c % 1) && !isNaN(c))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            r === null ? r = [d] : r.push(d), a++;
          }
          if (typeof c == "number" && (c < 0 || isNaN(c))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
        if (l.allFunctions !== void 0 && typeof l.allFunctions != "boolean") {
          const c = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.taskbar !== void 0 && typeof l.taskbar != "boolean") {
          const c = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.window !== void 0) {
      let l = e.window;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.mode === void 0) {
          const c = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.singleton === void 0) {
          const c = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.width === void 0) {
          const c = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.height === void 0) {
          const c = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.mode !== void 0) {
          let c = l.mode;
          if (!(c === "iframe" || c === "native" || c === "shell")) {
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: ac.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
        if (l.singleton !== void 0 && typeof l.singleton != "boolean") {
          const c = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.width !== void 0) {
          let c = l.width;
          if (typeof c == "string") {
            if (Ie(c) < 1) {
              const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              r === null ? r = [d] : r.push(d), a++;
            }
          } else {
            const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
        if (l.height !== void 0) {
          let c = l.height;
          if (typeof c == "string") {
            if (Ie(c) < 1) {
              const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              r === null ? r = [d] : r.push(d), a++;
            }
          } else {
            const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
        if (l.className !== void 0 && typeof l.className != "string") {
          const c = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let l = e.fileHandlers;
      if (Array.isArray(l)) {
        const c = l.length;
        for (let d = 0; d < c; d++) {
          let m = l[d];
          if (m && typeof m == "object" && !Array.isArray(m)) {
            if (m.action === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              r === null ? r = [p] : r.push(p), a++;
            }
            if (m.adapter === void 0) {
              const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              r === null ? r = [p] : r.push(p), a++;
            }
            if (m.action !== void 0) {
              let p = m.action;
              if (typeof p == "string") {
                if (Ie(p) < 1) {
                  const v = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  r === null ? r = [v] : r.push(v), a++;
                }
              } else {
                const v = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                r === null ? r = [v] : r.push(v), a++;
              }
            }
            if (m.adapter !== void 0) {
              let p = m.adapter;
              if (typeof p == "string") {
                if (Ie(p) < 1) {
                  const v = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  r === null ? r = [v] : r.push(v), a++;
                }
              } else {
                const v = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                r === null ? r = [v] : r.push(v), a++;
              }
            }
            if (m.extensions !== void 0) {
              let p = m.extensions;
              if (Array.isArray(p)) {
                const v = p.length;
                for (let T = 0; T < v; T++) {
                  let O = p[T];
                  if (typeof O == "string") {
                    if (!fc.test(O)) {
                      const N = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + T, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      r === null ? r = [N] : r.push(N), a++;
                    }
                  } else {
                    const N = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + T, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    r === null ? r = [N] : r.push(N), a++;
                  }
                }
                let _ = p.length, H;
                if (_ > 1) {
                  const T = {};
                  for (; _--; ) {
                    let O = p[_];
                    if (typeof O == "string") {
                      if (typeof T[O] == "number") {
                        H = T[O];
                        const N = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: _, j: H }, message: "must NOT have duplicate items (items ## " + H + " and " + _ + " are identical)" };
                        r === null ? r = [N] : r.push(N), a++;
                        break;
                      }
                      T[O] = _;
                    }
                  }
                }
              } else {
                const v = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                r === null ? r = [v] : r.push(v), a++;
              }
            }
            if (m.mimeTypes !== void 0) {
              let p = m.mimeTypes;
              if (Array.isArray(p)) {
                const v = p.length;
                for (let T = 0; T < v; T++) {
                  let O = p[T];
                  if (typeof O == "string") {
                    if (!dc.test(O)) {
                      const N = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + T, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      r === null ? r = [N] : r.push(N), a++;
                    }
                  } else {
                    const N = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + T, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    r === null ? r = [N] : r.push(N), a++;
                  }
                }
                let _ = p.length, H;
                if (_ > 1) {
                  const T = {};
                  for (; _--; ) {
                    let O = p[_];
                    if (typeof O == "string") {
                      if (typeof T[O] == "number") {
                        H = T[O];
                        const N = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: _, j: H }, message: "must NOT have duplicate items (items ## " + H + " and " + _ + " are identical)" };
                        r === null ? r = [N] : r.push(N), a++;
                        break;
                      }
                      T[O] = _;
                    }
                  }
                }
              } else {
                const v = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                r === null ? r = [v] : r.push(v), a++;
              }
            }
            if (m.priority !== void 0 && typeof m.priority != "number") {
              const p = { instancePath: t + "/fileHandlers/" + d + "/priority", schemaPath: "#/$defs/fileHandler/properties/priority/type", keyword: "type", params: { type: "number" }, message: "must be number" };
              r === null ? r = [p] : r.push(p), a++;
            }
          } else {
            const p = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            r === null ? r = [p] : r.push(p), a++;
          }
        }
      } else {
        const c = { instancePath: t + "/fileHandlers", schemaPath: "#/properties/fileHandlers/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.launch !== void 0) {
      let l = e.launch;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.adapter !== void 0) {
          let c = l.adapter;
          if (typeof c == "string") {
            if (Ie(c) < 1) {
              const d = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              r === null ? r = [d] : r.push(d), a++;
            }
          } else {
            const d = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
      } else {
        const c = { instancePath: t + "/launch", schemaPath: "#/$defs/launch/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.catalog !== void 0) {
      let l = e.catalog;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.status !== void 0) {
          let c = l.status;
          if (!(c === "published" || c === "disabled")) {
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: lc.properties.status.enum }, message: "must be equal to one of the allowed values" };
            r === null ? r = [d] : r.push(d), a++;
          }
        }
      } else {
        const c = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
    if (e.package !== void 0 && (Wt(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: i, dynamicAnchors: o }) || (r = r === null ? Wt.errors : r.concat(Wt.errors), a = r.length)), e.runtime !== void 0) {
      let l = e.runtime;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.model === void 0) {
          const c = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.network === void 0) {
          const c = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.sameOrigin === void 0) {
          const c = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.model !== void 0 && l.model !== "browser-zip-sandbox-v1") {
          const c = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.network !== void 0 && l.network !== "none") {
          const c = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          r === null ? r = [c] : r.push(c), a++;
        }
        if (l.sameOrigin !== void 0 && l.sameOrigin !== !1) {
          const c = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          r === null ? r = [c] : r.push(c), a++;
        }
      } else {
        const c = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        r === null ? r = [c] : r.push(c), a++;
      }
    }
  } else {
    const l = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    r === null ? r = [l] : r.push(l), a++;
  }
  return Ht.errors = r, a === 0;
}
Ht.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Vt(e, { instancePath: t = "", parentData: s, parentDataProperty: n, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let r = null, a = 0;
  const u = Vt.evaluated;
  return u.dynamicProps && (u.props = void 0), u.dynamicItems && (u.items = void 0), Ht(e, { instancePath: t, parentData: s, parentDataProperty: n, rootData: i, dynamicAnchors: o }) || (r = r === null ? Ht.errors : r.concat(Ht.errors), a = r.length), Vt.errors = r, a === 0;
}
Vt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let hn;
async function gc() {
  return hn || (hn = yc()), hn;
}
async function yc() {
  const e = await fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" });
  if (!e.ok) throw new Error("无法载入 Manifest v1 Schema。");
  const t = await e.json(), s = t.$defs?.sourceManifest?.properties || {}, n = Object.entries(s).filter(([, i]) => i.readOnly === !0 || i.description?.includes("Reserved") || i.description?.includes("Platform-reserved")).map(([i]) => i);
  return { schema: t, validate: Vt, reservedProperties: n };
}
async function vc(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch (o) {
    return {
      manifest: null,
      diagnostics: [{
        severity: "error",
        path: "$",
        message: o.message,
        ...bc(e, o.message)
      }]
    };
  }
  const { validate: s, reservedProperties: n } = await gc();
  s(t);
  const i = (s.errors || []).map((o) => ({
    severity: "error",
    path: wc(o.instancePath || o.params?.missingProperty || ""),
    message: o.message || o.keyword
  }));
  return n.forEach((o) => {
    Object.prototype.hasOwnProperty.call(t, o) && i.push({
      severity: "warning",
      path: `$.${o}`,
      message: `${o} 是平台保留或发布阶段只读字段，不应由 Source Manifest 编辑。`
    });
  }), { manifest: t, diagnostics: i };
}
function wc(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const s = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(s) ? `[${s}]` : `.${s}`;
  }).join("")}` : `$.${e}` : "$";
}
function bc(e, t) {
  const s = /position\s+(\d+)/i.exec(t);
  if (!s) return { line: 1, column: 1 };
  const n = Math.min(Number(s[1]), e.length), i = e.slice(0, n).split(`
`);
  return { line: i.length, column: i.at(-1).length + 1 };
}
const Sc = {
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
function Pc() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(Sc, null, 2)}
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
const Rr = 240;
function ae(e, t = {}) {
  const s = String(e ?? "");
  if (s.includes("\0")) throw $t("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(s)) throw $t("项目路径不能使用盘符。", e);
  const n = s.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!n) {
    if (t.allowRoot === !0) return "";
    throw $t("项目路径不能为空。", e);
  }
  if (n.startsWith("/")) throw $t("项目路径必须是相对路径。", e);
  if (n.length > Rr)
    throw $t(`项目路径不能超过 ${Rr} 个字符。`, e);
  const i = n.split("/");
  if (i.some((o) => !o || o === "." || o === ".."))
    throw $t("项目路径包含不安全的路径段。", e);
  return i.join("/");
}
function fs(e) {
  const t = ae(e), s = t.lastIndexOf("/");
  return s < 0 ? "" : t.slice(0, s);
}
function jn(e) {
  const t = ae(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function xc(e, t) {
  const s = ae(e, { allowRoot: !0 }), n = String(t ?? "");
  if (!n || n.includes("/") || n.includes("\\"))
    throw $t("文件或目录名称必须是单个安全路径段。", t);
  return ae(s ? `${s}/${n}` : n);
}
function $t(e, t) {
  const s = new TypeError(e);
  return s.code = "invalid-project-path", s.value = t, s;
}
const _c = "webwindows-developer-studio-v1", Nr = 1, kc = 1, ne = "projects", ie = "files", xt = "projectId";
class $c {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || _c, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, !this.indexedDB) throw new Error("IndexedDB is required by Developer Studio.");
  }
  async listProjects() {
    const t = await this.open();
    return (await $e(
      t.transaction(ne, "readonly").objectStore(ne).getAll()
    )).sort((n, i) => String(i.updatedAt).localeCompare(String(n.updatedAt))).map(et);
  }
  async createProject(t = {}) {
    const s = jc(this.crypto), n = this.now(), i = {
      uuid: s,
      displayName: qr(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: kc,
      storageVersion: Nr,
      createdAt: n,
      updatedAt: n,
      editorState: Hs(t.editorState)
    }, o = Ec(t.files || [], s, n), a = (await this.open()).transaction([ne, ie], "readwrite");
    a.objectStore(ne).add(i);
    const u = a.objectStore(ie);
    return o.forEach((l) => u.add(l)), await dt(a), et(i);
  }
  async getProject(t) {
    const s = await this.open(), n = await $e(
      s.transaction(ne, "readonly").objectStore(ne).get(t)
    );
    if (!n) throw ue("project-not-found", "找不到项目。");
    return et(n);
  }
  async renameProject(t, s) {
    return this.updateProject(t, (n) => {
      n.displayName = qr(s);
    });
  }
  async saveEditorState(t, s) {
    return this.updateProject(t, (n) => {
      n.editorState = Hs(s);
    });
  }
  async deleteProject(t) {
    const n = (await this.open()).transaction([ne, ie], "readwrite"), i = n.objectStore(ne);
    if (!await $e(i.get(t))) throw ue("project-not-found", "找不到项目。");
    const r = n.objectStore(ie);
    (await $e(r.index(xt).getAll(t))).forEach((u) => r.delete([t, u.path])), i.delete(t), await dt(n);
  }
  async listEntries(t) {
    await this.getProject(t);
    const s = await this.open();
    return (await $e(
      s.transaction(ie, "readonly").objectStore(ie).index(xt).getAll(t)
    )).sort(Dr).map(et);
  }
  async readProjectState(t) {
    const n = (await this.open()).transaction([ne, ie], "readonly"), i = await $e(n.objectStore(ne).get(t));
    if (!i) throw ue("project-not-found", "找不到项目。");
    const o = await $e(
      n.objectStore(ie).index(xt).getAll(t)
    );
    return await dt(n), {
      project: et(i),
      entries: o.sort(Dr).map(et)
    };
  }
  async readTextFile(t, s) {
    const n = await this.getEntry(t, s);
    if (n.kind !== "file") throw ue("not-a-file", "目标不是文本文件。");
    return n.content;
  }
  async writeTextFile(t, s, n) {
    const i = ae(s), r = (await this.open()).transaction([ne, ie], "readwrite"), a = await Ps(r, t), u = r.objectStore(ie), l = await $e(u.get([t, i]));
    if (!l) throw ue("file-not-found", "找不到文件。");
    if (l.kind !== "file") throw ue("not-a-file", "目标不是文本文件。");
    const c = this.now();
    u.put({ ...l, content: String(n), updatedAt: c }), a.updatedAt = c, r.objectStore(ne).put(a), await dt(r);
  }
  async createFile(t, s, n = "") {
    return this.createEntry(t, s, "file", String(n));
  }
  async createDirectory(t, s) {
    return this.createEntry(t, s, "directory", void 0);
  }
  async renameEntry(t, s, n) {
    const i = ae(s), o = ae(n);
    if (i === o) return this.getEntry(t, i);
    if (o.startsWith(`${i}/`))
      throw ue("invalid-project-path", "目录不能移动到自身内部。");
    const a = (await this.open()).transaction([ne, ie], "readwrite"), u = await Ps(a, t), l = a.objectStore(ie), c = await $e(l.index(xt).getAll(t)), d = c.filter((_) => _.path === i || _.path.startsWith(`${i}/`));
    if (!d.length) throw ue("entry-not-found", "找不到文件或目录。");
    await Fr(c, o);
    const m = new Set(d.map((_) => _.path)), p = new Set(d.map((_) => _.path === i ? o : `${o}${_.path.slice(i.length)}`));
    if (c.some((_) => !m.has(_.path) && p.has(_.path)))
      throw ue("entry-exists", "目标路径已经存在。");
    const v = this.now();
    return d.forEach((_) => {
      const H = _.path === i ? o : `${o}${_.path.slice(i.length)}`;
      l.delete([t, _.path]), l.add({ ..._, path: H, updatedAt: v });
    }), u.editorState = Cc(u.editorState, i, o), u.updatedAt = v, a.objectStore(ne).put(u), await dt(a), this.getEntry(t, o);
  }
  async deleteEntry(t, s) {
    const n = ae(s), o = (await this.open()).transaction([ne, ie], "readwrite"), r = await Ps(o, t), a = o.objectStore(ie), l = (await $e(a.index(xt).getAll(t))).filter((d) => d.path === n || d.path.startsWith(`${n}/`));
    if (!l.length) throw ue("entry-not-found", "找不到文件或目录。");
    l.forEach((d) => a.delete([t, d.path]));
    const c = this.now();
    r.editorState = Tc(r.editorState, n), r.updatedAt = c, o.objectStore(ne).put(r), await dt(o);
  }
  async getEntry(t, s) {
    const n = ae(s);
    await this.getProject(t);
    const i = await this.open(), o = await $e(
      i.transaction(ie, "readonly").objectStore(ie).get([t, n])
    );
    if (!o) throw ue("entry-not-found", "找不到文件或目录。");
    return et(o);
  }
  async close() {
    if (!this.databasePromise) return;
    (await this.databasePromise).close(), this.databasePromise = null;
  }
  async open() {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((t, s) => {
      const n = this.indexedDB.open(this.databaseName, Nr);
      n.onupgradeneeded = () => {
        const i = n.result;
        i.objectStoreNames.contains(ne) || i.createObjectStore(ne, { keyPath: "uuid" }), i.objectStoreNames.contains(ie) || i.createObjectStore(ie, { keyPath: ["projectId", "path"] }).createIndex(xt, "projectId", { unique: !1 });
      }, n.onsuccess = () => t(n.result), n.onerror = () => s(n.error || new Error("Developer Studio database failed to open.")), n.onblocked = () => s(new Error("Developer Studio database upgrade is blocked."));
    });
    try {
      return await this.databasePromise;
    } catch (t) {
      throw this.databasePromise = null, t;
    }
  }
  async updateProject(t, s) {
    const i = (await this.open()).transaction(ne, "readwrite"), o = i.objectStore(ne), r = await $e(o.get(t));
    if (!r) throw ue("project-not-found", "找不到项目。");
    return s(r), r.updatedAt = this.now(), o.put(r), await dt(i), et(r);
  }
  async createEntry(t, s, n, i) {
    const o = ae(s), a = (await this.open()).transaction([ne, ie], "readwrite"), u = await Ps(a, t), l = a.objectStore(ie), c = await $e(l.index(xt).getAll(t));
    if (c.some((p) => p.path === o))
      throw ue("entry-exists", "目标路径已经存在。");
    await Fr(c, o);
    const d = this.now(), m = {
      projectId: t,
      path: o,
      kind: n,
      ...n === "file" ? { content: String(i ?? "") } : {},
      createdAt: d,
      updatedAt: d
    };
    return l.add(m), u.updatedAt = d, a.objectStore(ne).put(u), await dt(a), et(m);
  }
}
function Ec(e, t, s) {
  const n = /* @__PURE__ */ new Set(), i = e.map((o) => {
    const r = ae(o.path);
    if (n.has(r)) throw ue("entry-exists", `模板包含重复路径：${r}`);
    n.add(r);
    const a = o.kind === "directory" ? "directory" : "file";
    return {
      projectId: t,
      path: r,
      kind: a,
      ...a === "file" ? { content: String(o.content ?? "") } : {},
      createdAt: s,
      updatedAt: s
    };
  });
  return i.forEach((o) => {
    const r = fs(o.path);
    if (!r) return;
    const a = i.find((u) => u.path === r);
    if (!a || a.kind !== "directory")
      throw ue("parent-directory-not-found", `模板缺少父目录：${r}`);
  }), i;
}
async function Ps(e, t) {
  const s = await $e(e.objectStore(ne).get(t));
  if (!s) throw ue("project-not-found", "找不到项目。");
  return s;
}
async function Fr(e, t) {
  const s = fs(t);
  if (!s) return;
  const n = e.find((i) => i.path === s);
  if (!n || n.kind !== "directory")
    throw ue("parent-directory-not-found", "父目录不存在。");
}
function jc(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const s = [...t].map((n) => n.toString(16).padStart(2, "0"));
  return `${s.slice(0, 4).join("")}-${s.slice(4, 6).join("")}-${s.slice(6, 8).join("")}-${s.slice(8, 10).join("")}-${s.slice(10).join("")}`;
}
function qr(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw ue("invalid-project-name", "项目名称不能为空。");
  return t;
}
function Hs(e) {
  const t = e && typeof e == "object" ? e : {}, s = (o) => [...new Set((Array.isArray(o) ? o : []).map((r) => {
    try {
      return ae(r);
    } catch {
      return null;
    }
  }).filter(Boolean))], n = s(t.openFiles), i = t.activeFile ? ae(t.activeFile) : n[0] || null;
  return {
    openFiles: n,
    activeFile: i,
    recentFiles: s(t.recentFiles).slice(0, 20)
  };
}
function Cc(e, t, s) {
  const n = (i) => i === t || i?.startsWith(`${t}/`) ? `${s}${i.slice(t.length)}` : i;
  return Hs({
    openFiles: e?.openFiles?.map(n),
    activeFile: n(e?.activeFile),
    recentFiles: e?.recentFiles?.map(n)
  });
}
function Tc(e, t) {
  const s = (i) => i !== t && !i.startsWith(`${t}/`), n = (e?.openFiles || []).filter(s);
  return Hs({
    openFiles: n,
    activeFile: e?.activeFile && s(e.activeFile) ? e.activeFile : n[0] || null,
    recentFiles: (e?.recentFiles || []).filter(s)
  });
}
function Dr(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function et(e) {
  return structuredClone(e);
}
function $e(e) {
  return new Promise((t, s) => {
    e.onsuccess = () => t(e.result), e.onerror = () => s(e.error || new Error("IndexedDB request failed."));
  });
}
function dt(e) {
  return new Promise((t, s) => {
    e.oncomplete = () => t(), e.onerror = () => s(e.error || new Error("IndexedDB transaction failed.")), e.onabort = () => s(e.error || new Error("IndexedDB transaction was aborted."));
  });
}
function ue(e, t) {
  const s = new Error(t);
  return s.code = e, s;
}
function Wr(e, t) {
  return xc(e, t);
}
function Ac(e) {
  const t = [], s = /* @__PURE__ */ new Map();
  e.forEach((i) => s.set(i.path, {
    ...i,
    name: jn(i.path),
    children: []
  })), s.forEach((i) => {
    const o = fs(i.path);
    o ? s.get(o)?.children.push(i) : t.push(i);
  });
  const n = (i) => i.sort((o, r) => o.kind !== r.kind ? o.kind === "directory" ? -1 : 1 : o.name.localeCompare(r.name)).forEach((o) => n(o.children));
  return n(t), t;
}
function Ic(e) {
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
const Ji = "webwindows-project-snapshot-v1";
async function Oc(e, t, s = {}) {
  if (!e || typeof e.readProjectState != "function")
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  const n = await e.readProjectState(t), i = n.entries.filter((l) => l.kind === "file").map((l) => Object.freeze({
    path: ae(l.path),
    content: String(l.content ?? ""),
    byteLength: Lt(l.content ?? "").byteLength
  })).sort((l, c) => Nc(l.path, c.path)), o = /* @__PURE__ */ new Set();
  for (const l of i) {
    if (o.has(l.path)) throw new Error(`Snapshot contains duplicate path: ${l.path}`);
    o.add(l.path);
  }
  const r = i.reduce((l, c) => l + c.byteLength, 0), a = await Mc(Rc(n.project.uuid, i)), u = {
    contract: Ji,
    schemaVersion: 1,
    projectUuid: n.project.uuid,
    projectDisplayName: n.project.displayName,
    snapshotId: `wws1-${a}`,
    revisionHash: a,
    createdAt: s.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    manifestPath: "manifest.json",
    fileCount: i.length,
    totalBytes: r,
    files: Object.freeze(i)
  };
  return Object.freeze(u);
}
function Cn(e, t) {
  const s = ae(t);
  return e.files.find((n) => n.path === s) || null;
}
async function Mc(e) {
  const t = globalThis.crypto;
  if (!t?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const s = await t.subtle.digest("SHA-256", e);
  return [...new Uint8Array(s)].map((n) => n.toString(16).padStart(2, "0")).join("");
}
function Rc(e, t) {
  const s = [Lt(`${Ji}\0${e}\0`)];
  for (const r of t) {
    const a = Lt(r.path), u = Lt(r.content);
    s.push(Hr(a.byteLength), a, Hr(u.byteLength), u);
  }
  const n = s.reduce((r, a) => r + a.byteLength, 0), i = new Uint8Array(n);
  let o = 0;
  for (const r of s)
    i.set(r, o), o += r.byteLength;
  return i;
}
function Hr(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e, !1), t;
}
function Lt(e) {
  return new TextEncoder().encode(String(e));
}
function Nc(e, t) {
  const s = Lt(e), n = Lt(t), i = Math.min(s.length, n.length);
  for (let o = 0; o < i; o += 1)
    if (s[o] !== n[o]) return s[o] - n[o];
  return s.length - n.length;
}
let mn;
async function js() {
  return mn || (mn = Fc()), mn;
}
async function Fc() {
  const e = await Promise.all([
    xs("/data/sdk/manifest-v1.schema.json"),
    xs("/data/sdk/package-runtime-policy-v1.json"),
    xs("/data/sdk/runtime-compatibility-v1.json"),
    xs("/data/sdk/studio-validator-rules-v1.json"),
    qc("/data/sdk/webwindows-public-api-v1.d.ts")
  ]);
  return Object.freeze({
    manifestSchema: e[0],
    packagePolicy: e[1],
    runtimeCompatibility: e[2],
    ruleCatalog: e[3],
    publicApiText: e[4]
  });
}
async function xs(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.json();
}
async function qc(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.text();
}
const Dc = "webwindows-studio-validation-report-v1";
async function Tn(e, t = {}) {
  const s = t.contracts || await js(), n = Jc(s.ruleCatalog), i = [], o = (m, p = {}) => i.push(Gc(n, m, p));
  Wc(s, o), Hc(e, s.packagePolicy, o);
  const r = e.files.find((m) => m.path === "manifest.json");
  let a = null;
  if (!r)
    o("WWP001", { path: "manifest.json", message: "ZIP root 必须包含 manifest.json。" });
  else
    try {
      a = JSON.parse(r.content);
    } catch (m) {
      o("WWM001", {
        path: "manifest.json",
        location: eu(r.content, m.message),
        message: m.message
      });
    }
  a && (Lc(a, s.manifestSchema, o), Uc(e, a, s.packagePolicy, o)), Vc(e, a, s, o);
  const u = [...new Map(i.map((m) => [ru(m), m])).values()].sort(nu), l = u.filter((m) => m.severity === "error").length, c = u.filter((m) => m.severity === "warning").length, d = typeof a?.entry == "string" ? a.entry : null;
  return {
    contract: Dc,
    schemaVersion: 1,
    validatorVersion: s.ruleCatalog.validatorVersion,
    snapshotId: e.snapshotId,
    projectUuid: e.projectUuid,
    manifestIdentity: su(a),
    passed: l === 0,
    errorCount: l,
    warningCount: c,
    diagnostics: u,
    packageFacts: {
      fileCount: e.fileCount,
      unpackedBytes: e.totalBytes,
      entry: d,
      runtimeModel: s.packagePolicy.runtimeModel
    },
    scannerLimitations: [
      "Source diagnostics are conservative static checks, not a complete JavaScript security analysis.",
      "Dynamic URLs and computed property access may require future server/admin review."
    ]
  };
}
function Wc(e, t) {
  const s = e.runtimeCompatibility.packageRuntime;
  (s?.status !== "supported" || s?.model !== e.packagePolicy.runtimeModel) && t("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
}
function Hc(e, t, s) {
  (!e.files.length || e.fileCount !== e.files.length || e.fileCount > t.limits.maxFiles) && s("WWP003", {
    message: `文件数量必须为 1-${t.limits.maxFiles}，当前为 ${e.fileCount}。`,
    metadata: { limit: t.limits.maxFiles, actual: e.fileCount }
  }), e.totalBytes > t.limits.maxUnpackedBytes && s("WWP004", {
    message: `项目解压后不能超过 ${t.limits.maxUnpackedBytes} bytes。`,
    metadata: { limit: t.limits.maxUnpackedBytes, actual: e.totalBytes }
  });
  const n = new Set(t.allowedExtensions);
  for (const i of e.files) {
    try {
      const r = ae(i.path);
      if (r !== i.path || r.length > t.limits.maxPathCharacters)
        throw new Error("not canonical");
    } catch {
      s("WWP002", { path: i.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const o = er(i.path);
    n.has(o) || s("WWP005", {
      path: i.path,
      message: `Package Runtime 不允许文件类型 ${o || "(none)"}。`,
      metadata: { extension: o }
    });
  }
}
function Lc(e, t, s) {
  if (!Vt(e))
    for (const o of Vt.errors || [])
      s("WWM002", {
        path: `manifest.json${tu(o.instancePath, o.params?.missingProperty)}`,
        message: o.message || o.keyword,
        metadata: { keyword: o.keyword, schemaPath: o.schemaPath }
      });
  const n = t.$defs?.sourceManifest?.properties || {};
  for (const [o, r] of Object.entries(n)) {
    if (!Object.prototype.hasOwnProperty.call(e, o)) continue;
    const a = Zc(t, r), u = `${r.description || ""} ${a.description || ""}`;
    a.readOnly === !0 || /server-(?:managed|generated)|published catalog/i.test(u) ? s("WWM003", {
      path: `manifest.json$.${o}`,
      message: `${o} 是发布端生成的只读字段，不能进入 Source Manifest。`
    }) : /platform-reserved/i.test(u) && s("WWM004", {
      path: `manifest.json$.${o}`,
      message: `${o} 是平台保留字段。`
    });
  }
  const i = [
    [e.type === "system", "$.type", "system 类型属于第一方平台能力。"],
    [e.install?.source && e.install.source !== "repository", "$.install.source", "第三方 Source Manifest 应使用 repository source。"],
    [e.window?.mode && e.window.mode !== "iframe", "$.window.mode", "第三方功能当前仅兼容 iframe window mode。"]
  ];
  for (const [o, r, a] of i)
    o && s("WWM004", { path: `manifest.json${r}`, message: a });
}
function Uc(e, t, s, n) {
  if (typeof t.entry != "string") return;
  let i;
  try {
    i = ae(t.entry);
  } catch {
    n("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  (!s.entryExtensions.includes(er(i)) || !Cn(e, i)) && n("WWP006", {
    path: "manifest.json$.entry",
    message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
    metadata: { entry: i }
  });
}
function Vc(e, t, s, n) {
  const i = Xc(s.publicApiText), o = new Set(e.files.map((r) => r.path));
  for (const r of e.files) {
    const a = er(r.path);
    a === ".js" && zc(r, i, n), (a === ".html" || a === ".htm") && Bc(r, o, n), a === ".css" && Kc(r, n);
  }
  (s.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported" || s.runtimeCompatibility.packageRuntime.execution.network !== "none") && n("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
}
function zc(e, t, s) {
  const n = Qc(e.content);
  rt(n, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (i, o) => {
    s("WWS001", { path: e.path, location: Be(e.content, o), message: "Package Runtime 仅支持 classic JavaScript。" });
  }), rt(n, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (i, o) => {
    s("WWS003", { path: e.path, location: Be(e.content, o), message: "功能代码不能引用私有 Native API。" });
  }), rt(n, /\bparent\s*\.\s*WebWindows\b/g, (i, o) => {
    s("WWS004", { path: e.path, location: Be(e.content, o), message: "功能代码不能访问 parent.WebWindows。" });
  }), rt(n, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (i, o) => {
    const r = i[1];
    t.has(r) || s("WWS004", {
      path: e.path,
      location: Be(e.content, o),
      message: `WebWindows.${r} 不属于 Public API v1。`,
      metadata: { namespace: r }
    });
  }), rt(n, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (i, o) => {
    s("WWS005", {
      path: e.path,
      location: Be(e.content, o),
      message: `${i[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
}
function Bc(e, t, s) {
  rt(e.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (n, i) => {
    s("WWS001", { path: e.path, location: Be(e.content, i), message: "Package Runtime 不支持 script type=module。" });
  }), rt(e.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (n, i) => {
    const o = n[2], r = Yc(e.path, o);
    (!r || !t.has(r)) && s("WWS002", {
      path: e.path,
      location: Be(e.content, i),
      message: `脚本或样式依赖必须包含在功能包内：${o}`,
      metadata: { reference: o }
    });
  }), rt(e.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (n, i) => {
    s("WWS002", {
      path: e.path,
      location: Be(e.content, i),
      message: `外部资源在无网络 Runtime 中不可用：${n[1]}`,
      metadata: { reference: n[1] }
    });
  });
}
function Kc(e, t) {
  rt(e.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (s, n) => {
    t("WWS002", {
      path: e.path,
      location: Be(e.content, n),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${s[1]}`,
      metadata: { reference: s[1] }
    });
  });
}
function Jc(e) {
  return new Map(e.rules.map((t) => [t.ruleId, t]));
}
function Gc(e, t, s) {
  const n = e.get(t);
  if (!n) throw new Error(`Unknown validator rule: ${t}`);
  return {
    ruleId: t,
    category: n.category,
    severity: s.severity || n.defaultSeverity,
    path: s.path || null,
    location: s.location || null,
    message: s.message || n.title,
    ...s.metadata ? { metadata: s.metadata } : {}
  };
}
function Xc(e) {
  const t = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(e)?.[1] || "";
  return new Set([...t.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((s) => s[1]));
}
function Zc(e, t) {
  return t?.$ref?.startsWith("#/$defs/") ? e.$defs?.[t.$ref.slice(8)] || t : t || {};
}
function Yc(e, t) {
  const s = String(t || "").split(/[?#]/, 1)[0];
  if (!s || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(s)) return null;
  const n = e.split("/").slice(0, -1);
  for (const i of s.replace(/\\/g, "/").split("/"))
    !i || i === "." || (i === ".." ? n.pop() : n.push(i));
  return n.join("/");
}
function Qc(e) {
  return e.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (t) => t.replace(/[^\n]/g, " ")
  );
}
function rt(e, t, s) {
  for (const n of e.matchAll(t)) s(n, n.index || 0);
}
function Be(e, t) {
  const s = e.slice(0, t).split(`
`);
  return { line: s.length, column: s.at(-1).length + 1 };
}
function eu(e, t) {
  const s = /position\s+(\d+)/i.exec(t);
  return Be(e, s ? Number(s[1]) : 0);
}
function tu(e, t) {
  return `$${(e || (t ? `/${t}` : "")).split("/").slice(1).map((n) => /^\d+$/.test(n) ? `[${n}]` : `.${n.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}
function su(e) {
  return !e || typeof e.id != "string" || typeof e.version != "string" ? null : { id: e.id, version: e.version, name: typeof e.name == "string" ? e.name : null };
}
function er(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function nu(e, t) {
  return e.ruleId.localeCompare(t.ruleId) || String(e.path || "").localeCompare(String(t.path || "")) || (e.location?.line || 0) - (t.location?.line || 0) || e.message.localeCompare(t.message);
}
function ru(e) {
  return [
    e.ruleId,
    e.severity,
    e.path || "",
    e.location?.line || 0,
    e.location?.column || 0,
    e.message
  ].join("\0");
}
const gn = "webwindows-studio-preview-control-v1", iu = "webwindows-studio-preview-console-v1", ou = "webwindows-studio-preview-console-init-v1", au = "webwindows-studio-preview-session-v1", lu = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'", cu = 30 * 1024 * 1024;
function Ls(e = "preview") {
  const t = globalThis.crypto;
  if (!t?.getRandomValues) throw new Error("Web Crypto is required for Preview sessions.");
  const s = new Uint8Array(24);
  t.getRandomValues(s);
  const n = [...s].map((i) => i.toString(16).padStart(2, "0")).join("");
  return `${e}-${n}`;
}
function uu(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class fu {
  constructor({ onConsole: t, onState: s } = {}) {
    this.onConsole = t || (() => {
    }), this.onState = s || (() => {
    }), this.port = null, this.hostNonce = null, this.requests = /* @__PURE__ */ new Map();
  }
  async connect(t) {
    if (this.disconnect(), !t?.contentWindow) throw new Error("Developer Preview Host 尚未加载。");
    this.hostNonce = Ls("host");
    const s = new MessageChannel();
    this.port = s.port1, this.port.onmessage = (n) => this.#t(n.data), this.port.start(), t.contentWindow.postMessage({
      protocol: gn,
      version: 1,
      type: "host.connect",
      hostNonce: this.hostNonce
    }, location.origin, [s.port2]), await this.#e("host.ping", {}, 5e3);
  }
  async start(t, s) {
    const n = new TextEncoder().encode(s).byteLength;
    if (n > cu) throw new Error("Preview document 超过 30 MB 上限。");
    return this.#e("preview.start", {
      session: du(t),
      token: t.token,
      documentHtml: s,
      documentBytes: n
    }, 1e4);
  }
  stop(t) {
    return !this.port || !t ? Promise.resolve() : this.#e("preview.stop", { sessionId: t.sessionId, token: t.token }, 5e3);
  }
  disconnect() {
    this.port?.close(), this.port = null, this.hostNonce = null;
    for (const t of this.requests.values()) t.reject(new Error("Developer Preview Host 已断开。"));
    this.requests.clear();
  }
  #e(t, s, n) {
    if (!this.port || !this.hostNonce) return Promise.reject(new Error("Developer Preview Host 未连接。"));
    const i = Ls("request");
    return new Promise((o, r) => {
      const a = setTimeout(() => {
        this.requests.delete(i), r(new Error(`Developer Preview Host 请求超时：${t}`));
      }, n);
      this.requests.set(i, {
        resolve: (u) => {
          clearTimeout(a), o(u);
        },
        reject: (u) => {
          clearTimeout(a), r(u);
        }
      }), this.port.postMessage({
        protocol: gn,
        version: 1,
        type: t,
        hostNonce: this.hostNonce,
        requestId: i,
        payload: s
      });
    });
  }
  #t(t) {
    if (!uu(t) || t.protocol !== gn || t.version !== 1 || t.hostNonce !== this.hostNonce || typeof t.type != "string") return;
    if (t.type === "preview.console") {
      this.onConsole(t.payload);
      return;
    }
    if (t.type === "preview.state") {
      this.onState(t.payload);
      return;
    }
    if (t.type !== "host.response" || typeof t.requestId != "string") return;
    const s = this.requests.get(t.requestId);
    s && (this.requests.delete(t.requestId), t.ok === !0 ? s.resolve(t.payload) : s.reject(new Error(t.error || "Developer Preview Host 请求失败。")));
  }
}
function du(e) {
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
function pu({ sessionId: e, snapshotId: t, token: s }) {
  const n = JSON.stringify({
    initProtocol: ou,
    protocol: iu,
    sessionId: e,
    snapshotId: t,
    token: s
  }).replace(/</g, "\\u003c");
  return `;(${hu.toString()})(${n});`;
}
function hu(e) {
  let o = null, r = 0;
  const a = [];
  function u(m) {
    const p = String(m);
    return p.length <= 4096 ? p : `${p.slice(0, 4096)}…[truncated]`;
  }
  function l(m, p, v) {
    if (m == null || typeof m == "boolean") return m;
    if (typeof m == "string" || typeof m == "number") return u(m);
    if (typeof m == "bigint") return `${m}n`;
    if (typeof m > "u") return "[undefined]";
    if (typeof m == "function") return `[Function${m.name ? ` ${m.name}` : ""}]`;
    if (typeof m == "symbol") return u(m.toString());
    if (m === globalThis || m === globalThis.window) return "[Window]";
    if (p >= 4) return "[Max depth]";
    if (v.has(m)) return "[Circular]";
    v.add(m);
    try {
      if (typeof Error < "u" && m instanceof Error)
        return { name: u(m.name), message: u(m.message), stack: u(m.stack || "") };
      if (typeof Node < "u" && m instanceof Node)
        return `[DOM ${m.nodeName || "Node"}]`;
      if (Array.isArray(m)) {
        const T = m.slice(0, 40).map((O) => l(O, p + 1, v));
        return m.length > 40 && T.push(`[${m.length - 40} more items]`), T;
      }
      const _ = {}, H = Object.keys(m).slice(0, 40);
      for (const T of H)
        try {
          _[u(T)] = l(m[T], p + 1, v);
        } catch (O) {
          _[u(T)] = `[Unreadable: ${u(O?.message || O)}]`;
        }
      return Object.keys(m).length > 40 && (_["…"] = "[truncated properties]"), _;
    } catch (_) {
      return `[Unserializable: ${u(_?.message || _)}]`;
    } finally {
      v.delete(m);
    }
  }
  function c(m, p) {
    return {
      protocol: e.protocol,
      version: 1,
      type: "console.event",
      sessionId: e.sessionId,
      snapshotId: e.snapshotId,
      token: e.token,
      sequence: r++,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: m,
      arguments: Array.from(p).map((v) => l(v, 0, /* @__PURE__ */ new Set()))
    };
  }
  function d(m, p) {
    const v = c(m, p);
    if (o)
      try {
        o.postMessage(v);
      } catch {
      }
    else a.length < 200 && a.push(v);
  }
  for (const m of ["log", "info", "warn", "error", "debug"]) {
    const p = console[m]?.bind(console) || console.log.bind(console);
    console[m] = function(...v) {
      d(m, v), p(...v);
    };
  }
  addEventListener("error", (m) => d("error", [{
    name: "UncaughtError",
    message: m.message || "Uncaught error",
    file: m.filename || null,
    line: m.lineno || null,
    column: m.colno || null,
    error: m.error || null
  }])), addEventListener("unhandledrejection", (m) => d("error", [{
    name: "UnhandledRejection",
    reason: m.reason
  }])), addEventListener("message", function(p) {
    const v = p.data;
    if (!(!v || v.protocol !== e.initProtocol || v.version !== 1 || v.sessionId !== e.sessionId || v.snapshotId !== e.snapshotId || v.token !== e.token || p.ports.length !== 1 || o))
      for (o = p.ports[0], o.start?.(); a.length; ) o.postMessage(a.shift());
  });
}
const An = Object.freeze({
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8",
  ".svg": "image/svg+xml;charset=utf-8"
}), mu = /* @__PURE__ */ new Set([".html", ".htm", ...Object.keys(An)]);
function gu(e, t, s = {}) {
  const n = Cn(e, "manifest.json");
  if (!n) throw new Error("Preview Snapshot 缺少 manifest.json。");
  const i = JSON.parse(n.content), o = ae(i.entry), r = Cn(e, o);
  if (!r || ![".html", ".htm"].includes(Gt(o)))
    throw new Error("Preview Snapshot 的 HTML entry 不存在。");
  const u = (s.domParser || new DOMParser()).parseFromString(r.content, "text/html");
  if (u.querySelector('script[type="module"]')) throw new Error("Developer Preview 不支持 ES Module。");
  const l = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
  for (const p of e.files) {
    const v = Gt(p.path);
    mu.has(v) && Object.prototype.hasOwnProperty.call(An, v) && ![".css", ".js"].includes(v) && l.set(p.path, yu(p.content, An[v]));
  }
  for (const p of e.files) {
    const v = Gt(p.path);
    v === ".js" && c.set(p.path, p.content), v === ".css" && c.set(p.path, Lr(p.content, p.path, l));
  }
  const d = u.createElement("meta");
  d.httpEquiv = "Content-Security-Policy", d.content = lu, u.head.prepend(d);
  const m = u.createElement("script");
  return m.setAttribute("data-webwindows-preview-bootstrap", "v1"), m.textContent = pu(t), u.head.insertBefore(m, d.nextSibling), u.querySelectorAll("script[src]").forEach((p) => {
    const v = p.getAttribute("src"), _ = Zt(o, v);
    if (!_ || Gt(_) !== ".js" || !c.has(_))
      throw new Error(`Preview 脚本必须来自 Snapshot：${v}`);
    p.removeAttribute("src"), p.textContent = c.get(_);
  }), u.querySelectorAll('link[rel~="stylesheet"][href]').forEach((p) => {
    const v = p.getAttribute("href"), _ = Zt(o, v);
    if (!_ || Gt(_) !== ".css" || !c.has(_))
      throw new Error(`Preview 样式必须来自 Snapshot：${v}`);
    const H = u.createElement("style");
    H.textContent = c.get(_), p.replaceWith(H);
  }), u.querySelectorAll("style").forEach((p) => {
    p.textContent = Lr(p.textContent, o, l);
  }), u.querySelectorAll("[src],[href],[poster]").forEach((p) => {
    for (const v of ["src", "href", "poster"]) {
      if (!p.hasAttribute(v)) continue;
      const _ = Zt(o, p.getAttribute(v));
      _ && l.has(_) && p.setAttribute(v, l.get(_));
    }
  }), u.querySelectorAll("[srcset]").forEach((p) => {
    const v = p.getAttribute("srcset").split(",").map((_) => {
      const H = _.trim().split(/\s+/), T = Zt(o, H[0]);
      return T && l.has(T) && (H[0] = l.get(T)), H.join(" ");
    });
    p.setAttribute("srcset", v.join(", "));
  }), `<!DOCTYPE html>
` + u.documentElement.outerHTML;
}
function Zt(e, t) {
  const s = String(t || "").split(/[?#]/, 1)[0];
  if (!s || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(s)) return null;
  const n = e.split("/").slice(0, -1);
  for (const i of s.replace(/\\/g, "/").split("/"))
    !i || i === "." || (i === ".." ? n.pop() : n.push(i));
  try {
    return ae(n.join("/"));
  } catch {
    return null;
  }
}
function Lr(e, t, s) {
  return String(e).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (n, i, o) => {
    const r = Zt(t, o);
    return r && s.has(r) ? `url("${s.get(r)}")` : n;
  });
}
function yu(e, t) {
  const s = new TextEncoder().encode(String(e));
  let n = "";
  for (let i = 0; i < s.length; i += 32768)
    n += String.fromCharCode(...s.subarray(i, i + 32768));
  return `data:${t};base64,${btoa(n)}`;
}
function Gt(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
const vu = 1800 * 1e3;
class wu {
  constructor({ hostClient: t, ttlMs: s = vu, now: n = () => Date.now() }) {
    if (!t) throw new TypeError("PreviewHostClient is required.");
    this.hostClient = t, this.ttlMs = s, this.now = n, this.sessions = /* @__PURE__ */ new Map(), this.activeSessionId = null;
  }
  get activeSession() {
    return this.activeSessionId && this.sessions.get(this.activeSessionId) || null;
  }
  async run(t, { contracts: s, domParser: n } = {}) {
    const i = await Tn(t, { contracts: s });
    if (!i.passed) return { started: !1, validationReport: i, session: null };
    this.activeSession && await this.stop(this.activeSession.sessionId);
    const o = this.#e(t);
    this.sessions.set(o.sessionId, o), this.activeSessionId = o.sessionId;
    try {
      const r = gu(t, o, { domParser: n });
      return await this.hostClient.start(o, r), o.state = "running", o.expiryTimer = setTimeout(() => this.stop(o.sessionId).catch(() => {
      }), this.ttlMs), { started: !0, validationReport: i, session: yn(o) };
    } catch (r) {
      throw o.state = "failed", o.failure = r?.message || String(r), this.#t(o), r;
    }
  }
  async reload(t, s = {}) {
    const n = this.activeSession;
    n && (n.state = "reloading");
    const i = await Tn(t, { contracts: s.contracts });
    return i.passed ? (n && await this.stop(n.sessionId), this.run(t, s)) : (n && (n.state = "running"), { started: !1, validationReport: i, session: n ? yn(n) : null });
  }
  async stop(t = this.activeSessionId) {
    const s = t ? this.sessions.get(t) : null;
    if (!s) return null;
    try {
      await this.hostClient.stop(s);
    } finally {
      s.state = "closed", this.#t(s);
    }
    return yn(s);
  }
  async dispose() {
    const t = [...this.sessions.keys()];
    for (const s of t) await this.stop(s).catch(() => {
    });
    this.hostClient.disconnect?.();
  }
  #e(t) {
    const s = this.now();
    return {
      contract: au,
      sessionId: Ls("session"),
      projectUuid: t.projectUuid,
      snapshotId: t.snapshotId,
      token: Ls("token"),
      createdAt: new Date(s).toISOString(),
      expiresAt: new Date(s + this.ttlMs).toISOString(),
      state: "created",
      snapshot: t,
      expiryTimer: null,
      failure: null
    };
  }
  #t(t) {
    clearTimeout(t.expiryTimer), t.expiryTimer = null, t.token = null, t.snapshot = null, this.sessions.delete(t.sessionId), this.activeSessionId === t.sessionId && (this.activeSessionId = null);
  }
}
function yn(e) {
  return Object.freeze({
    contract: e.contract,
    sessionId: e.sessionId,
    projectUuid: e.projectUuid,
    snapshotId: e.snapshotId,
    createdAt: e.createdAt,
    expiresAt: e.expiresAt,
    state: e.state,
    ...e.failure ? { failure: e.failure } : {}
  });
}
const bu = { class: "developer-studio" }, Su = { class: "studio-toolbar" }, Pu = ["value"], xu = ["value"], _u = ["disabled"], ku = ["disabled"], $u = ["disabled"], Eu = ["disabled"], ju = ["disabled"], Cu = ["disabled"], Tu = ["disabled"], Au = {
  key: 0,
  class: "studio-main"
}, Iu = { class: "explorer-panel" }, Ou = { class: "panel-heading" }, Mu = { class: "panel-actions" }, Ru = ["disabled"], Nu = ["disabled"], Fu = { class: "file-tree" }, qu = { class: "editor-workbench" }, Du = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, Wu = ["onClick"], Hu = {
  key: 0,
  class: "dirty-dot"
}, Lu = { class: "editor-host" }, Uu = {
  key: 1,
  class: "empty-editor"
}, Vu = { class: "inspector-panel" }, zu = { class: "panel-heading" }, Bu = { class: "panel-switcher" }, Ku = { class: "inspector-content" }, Ju = { class: "project-uuid" }, Gu = { class: "build-inspector" }, Xu = { key: 0 }, Zu = { key: 1 }, Yu = {
  key: 0,
  class: "build-blocked"
}, Qu = { key: 1 }, ef = { class: "hash-row" }, tf = ["disabled"], sf = { class: "preview-inspector" }, nf = { class: "preview-session-banner" }, rf = { key: 0 }, of = { key: 1 }, af = {
  key: 1,
  class: "empty-workspace studio-main"
}, lf = { class: "problems-panel" }, cf = { class: "bottom-tabs" }, uf = ["value"], ff = {
  key: 0,
  class: "problems-empty"
}, df = ["onClick"], pf = {
  key: 0,
  class: "problems-empty"
}, hf = { class: "studio-dialog-actions" }, mf = {
  class: "primary",
  type: "submit"
}, gf = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new $c(), s = X([]), n = X(null), i = X([]), o = X(""), r = X([]), a = X(""), u = X(""), l = X(/* @__PURE__ */ new Set()), c = X(null), d = X([]), m = X(null), p = X(null), v = X(!1), _ = X(null), H = X(!1), T = X(null), O = X([]), N = X("problems"), M = X("preview"), te = X("all"), ve = X(""), _e = X(""), re = X(null);
    let De = null, Ce = 0, ct = 0, ut = null, ke = null;
    const zt = mt(() => Ac(i.value)), ms = mt(() => i.value.find((b) => b.path === a.value)), fe = mt(() => Ic(a.value)), Q = mt(() => a.value === "manifest.json" ? d.value : []), B = mt(() => m.value?.diagnostics || d.value.map((b) => ({
      ruleId: "Manifest",
      severity: b.severity,
      path: b.path,
      message: b.message
    }))), We = mt(() => te.value === "all" ? O.value : O.value.filter((b) => b.level === te.value));
    Jn(async () => {
      try {
        await Ze(), s.value.length && await we(s.value[0].uuid);
      } catch (b) {
        x(b);
      }
    }), Gn(() => {
      clearTimeout(Ce), ke?.dispose().catch(() => {
      }), t.close();
    });
    async function Ze() {
      s.value = await t.listProjects();
    }
    async function He() {
      try {
        await f();
        const b = Pc(), g = await be("新建 WebWindows 功能", "项目名称", b.displayName);
        if (g == null) return;
        const E = await t.createProject({ ...b, displayName: g });
        await Ze(), await we(E.uuid), C("Hello WebWindows 项目已创建。");
      } catch (b) {
        x(b);
      }
    }
    async function we(b) {
      if (!b) return;
      T.value && await G(), await f(), n.value = await t.getProject(b), i.value = await t.listEntries(b);
      const g = n.value.editorState || {};
      r.value = (g.openFiles || []).filter((E) => i.value.some((se) => se.path === E && se.kind === "file")), a.value = i.value.some((E) => E.path === g.activeFile && E.kind === "file") ? g.activeFile : r.value[0] || "", o.value = a.value, l.value = /* @__PURE__ */ new Set(), I(), await Ye(), await bt(), await h();
    }
    async function gs() {
      if (!n.value) return;
      const b = await be("重命名项目", "新的项目名称", n.value.displayName);
      if (b != null)
        try {
          n.value = await t.renameProject(n.value.uuid, b), await Ze(), C("项目已重命名。");
        } catch (g) {
          x(g);
        }
    }
    async function tn() {
      if (n.value && await Te("删除项目", `永久删除项目“${n.value.displayName}”及其全部文件吗？`))
        try {
          const b = n.value.uuid;
          await t.deleteProject(b), n.value = null, i.value = [], r.value = [], a.value = "", o.value = "", u.value = "", I(), await Ze(), s.value.length && await we(s.value[0].uuid), C("项目已删除。");
        } catch (b) {
          x(b);
        }
    }
    async function sn(b) {
      o.value = b.path, b.kind === "file" && await Re(b.path);
    }
    async function Re(b) {
      if (!n.value) return;
      await f();
      const g = ae(b);
      r.value.includes(g) || r.value.push(g), a.value = g, o.value = g, await Ye(), await h();
    }
    async function Ye() {
      if (!n.value || !a.value) {
        u.value = "";
        return;
      }
      u.value = await t.readTextFile(n.value.uuid, a.value), a.value === "manifest.json" && await Tt(u.value), await zn();
    }
    function Ct(b) {
      u.value = b, a.value && (l.value = new Set(l.value).add(a.value), I(), a.value === "manifest.json" && Tt(b).catch(x), clearTimeout(Ce), Ce = window.setTimeout(() => f().catch(x), 700));
    }
    async function Tt(b) {
      const g = ++ct, E = await vc(b);
      g === ct && (c.value = E.manifest, d.value = E.diagnostics);
    }
    async function bt() {
      if (!n.value || !i.value.some((g) => g.path === "manifest.json" && g.kind === "file")) {
        c.value = null, d.value = [];
        return;
      }
      const b = a.value === "manifest.json" ? u.value : await t.readTextFile(n.value.uuid, "manifest.json");
      await Tt(b);
    }
    async function tr(b) {
      a.value !== "manifest.json" && await Re("manifest.json"), Ct(`${JSON.stringify(b, null, 2)}
`);
    }
    async function f() {
      if (clearTimeout(Ce), Ce = 0, !n.value || !a.value || !l.value.has(a.value)) return;
      const b = a.value;
      await t.writeTextFile(n.value.uuid, b, u.value);
      const g = new Set(l.value);
      g.delete(b), l.value = g, n.value = await t.getProject(n.value.uuid);
    }
    async function h() {
      if (!n.value) return;
      const b = [a.value, ...n.value.editorState?.recentFiles || []].filter(Boolean);
      n.value = await t.saveEditorState(n.value.uuid, {
        openFiles: r.value,
        activeFile: a.value || null,
        recentFiles: [...new Set(b)].slice(0, 20)
      });
    }
    function w() {
      const b = i.value.find((g) => g.path === o.value);
      return b?.kind === "directory" ? b.path : b?.path ? fs(b.path) : "";
    }
    async function k(b) {
      if (!n.value) return;
      const E = await be(b === "directory" ? "新建目录" : "新建文件", b === "directory" ? "目录名称" : "文件名称", b === "directory" ? "new-folder" : "new-file.js");
      if (E != null)
        try {
          const se = Wr(w(), E);
          b === "directory" ? await t.createDirectory(n.value.uuid, se) : await t.createFile(n.value.uuid, se, ""), I(), i.value = await t.listEntries(n.value.uuid), o.value = se, b === "file" && await Re(se);
        } catch (se) {
          x(se);
        }
    }
    async function S() {
      const b = i.value.find((E) => E.path === o.value);
      if (!b || !n.value) return;
      const g = await be("重命名", "新的名称", jn(b.path));
      if (g != null)
        try {
          await f();
          const E = Wr(fs(b.path), g);
          await t.renameEntry(n.value.uuid, b.path, E), I(), i.value = await t.listEntries(n.value.uuid), n.value = await t.getProject(n.value.uuid), r.value = n.value.editorState.openFiles, a.value = n.value.editorState.activeFile || "", o.value = E, await Ye();
        } catch (E) {
          x(E);
        }
    }
    async function P() {
      const b = i.value.find((g) => g.path === o.value);
      if (!(!b || !n.value) && await Te("删除文件或目录", `删除“${b.path}”${b.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(n.value.uuid, b.path), I(), i.value = await t.listEntries(n.value.uuid), n.value = await t.getProject(n.value.uuid), r.value = n.value.editorState.openFiles, a.value = n.value.editorState.activeFile || "", o.value = a.value, await Ye();
        } catch (g) {
          x(g);
        }
    }
    function C(b) {
      ve.value = b, _e.value = "", window.setTimeout(() => {
        ve.value === b && (ve.value = "");
      }, 2400);
    }
    function x(b) {
      ve.value = b?.message || "操作失败。", _e.value = "error";
    }
    async function j() {
      if (!n.value) throw new Error("请先打开项目。");
      return await f(), Oc(t, n.value.uuid);
    }
    async function $() {
      if (!v.value) {
        v.value = !0;
        try {
          const b = await j(), g = await js();
          m.value = await Tn(b, { contracts: g }), p.value = null, C(m.value.passed ? "项目验证通过。" : `验证发现 ${m.value.errorCount} 个错误。`);
        } catch (b) {
          x(b);
        } finally {
          v.value = !1;
        }
      }
    }
    async function R() {
      if (!v.value) {
        v.value = !0;
        try {
          const b = await j(), g = await js(), { buildProjectPackage: E } = await import("./deterministic-builder-BWXkxXAe.js");
          p.value = await E(b, { contracts: g }), m.value = p.value.validationReport, C(p.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
        } catch (b) {
          x(b);
        } finally {
          v.value = !1;
        }
      }
    }
    function A() {
      if (!p.value?.artifactReady || !p.value.zipBytes) return;
      const b = p.value.manifestIdentity, g = `${b?.id || "webwindows-function"}-${b?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-"), E = new Blob([p.value.zipBytes], { type: "application/zip" }), se = URL.createObjectURL(E), ys = document.createElement("a");
      ys.href = se, ys.download = `${g}.zip`, ys.click(), window.setTimeout(() => URL.revokeObjectURL(se), 0);
    }
    function I() {
      m.value = null, p.value = null;
    }
    async function F() {
      H.value = !1, ke?.dispose().catch(() => {
      }), ut = new fu({
        onConsole: (b) => {
          const g = T.value || ke?.activeSession;
          !g || b?.sessionId !== g.sessionId || b?.snapshotId !== g.snapshotId || (O.value = [...O.value, b].slice(-1e3));
        },
        onState: (b) => {
          !T.value || b?.sessionId !== T.value.sessionId || (T.value = { ...T.value, state: b.state });
        }
      }), ke = new wu({ hostClient: ut });
      try {
        await ut.connect(_.value), H.value = !0;
      } catch (b) {
        x(b);
      }
    }
    async function U({ reload: b = !1 } = {}) {
      if (!(v.value || !ke || !H.value)) {
        v.value = !0;
        try {
          const g = await j(), E = await js(), se = b && T.value ? await ke.reload(g, { contracts: E }) : await ke.run(g, { contracts: E });
          if (m.value = se.validationReport, p.value = null, N.value = se.started ? "console" : "problems", M.value = "preview", !se.started) {
            C(`Developer Preview 被 ${se.validationReport.errorCount} 个验证错误阻止。`);
            return;
          }
          T.value = se.session, C(b ? "Developer Preview 已从新 Snapshot 重新加载。" : "Developer Preview 已启动。");
        } catch (g) {
          x(g);
        } finally {
          v.value = !1;
        }
      }
    }
    async function G() {
      if (!(!ke || !T.value))
        try {
          await ke.stop(T.value.sessionId), T.value = null, C("Developer Preview 已停止，会话凭据已撤销。");
        } catch (b) {
          x(b);
        }
    }
    function z() {
      O.value = [];
    }
    function pe(b) {
      return b.arguments.map((g) => typeof g == "string" ? g : JSON.stringify(g)).join(" ");
    }
    function he(b) {
      const g = i.value.find((E) => E.kind === "file" && (b.path === E.path || b.path?.startsWith(`${E.path}$`)));
      g && Re(g.path).catch(x);
    }
    function be(b, g, E) {
      return ft({ kind: "text", title: b, message: g, value: E });
    }
    function Te(b, g) {
      return ft({ kind: "confirm", title: b, message: g, value: "" });
    }
    function ft(b) {
      return De && De(null), re.value = { ...b }, new Promise((g) => {
        De = g;
      });
    }
    function At(b) {
      const g = De;
      De = null, re.value = null, g?.(b);
    }
    return (b, g) => (D(), L("main", bu, [
      y("header", Su, [
        g[18] || (g[18] = y("div", { class: "studio-brand" }, [
          y("strong", null, "Developer Studio"),
          y("span", null, "WebWindows Function IDE")
        ], -1)),
        y("button", {
          class: "primary",
          type: "button",
          onClick: He
        }, "新建功能"),
        y("select", {
          "aria-label": "打开项目",
          value: n.value?.uuid || "",
          onChange: g[0] || (g[0] = (E) => we(E.target.value).catch(x))
        }, [
          g[17] || (g[17] = y("option", {
            value: "",
            disabled: ""
          }, "打开项目…", -1)),
          (D(!0), L(oe, null, kt(s.value, (E) => (D(), L("option", {
            key: E.uuid,
            value: E.uuid
          }, V(E.displayName), 9, xu))), 128))
        ], 40, Pu),
        y("button", {
          type: "button",
          disabled: !n.value,
          onClick: gs
        }, "重命名项目", 8, _u),
        y("button", {
          type: "button",
          disabled: !n.value,
          onClick: tn
        }, "删除项目", 8, ku),
        g[19] || (g[19] = y("span", { class: "toolbar-spacer" }, null, -1)),
        y("button", {
          type: "button",
          disabled: !n.value || v.value,
          onClick: $
        }, "Validate", 8, $u),
        y("button", {
          class: "primary",
          type: "button",
          disabled: !n.value || v.value,
          onClick: R
        }, "Build", 8, Eu),
        y("button", {
          class: "primary",
          type: "button",
          disabled: !n.value || v.value || !H.value,
          onClick: g[1] || (g[1] = (E) => U())
        }, "Run", 8, ju),
        y("button", {
          type: "button",
          disabled: !T.value || v.value,
          onClick: g[2] || (g[2] = (E) => U({ reload: !0 }))
        }, "Reload", 8, Cu),
        y("button", {
          type: "button",
          disabled: !T.value,
          onClick: G
        }, "Stop", 8, Tu)
      ]),
      n.value ? (D(), L("section", Au, [
        y("aside", Iu, [
          y("div", Ou, [
            y("span", null, "Project · " + V(n.value.displayName), 1),
            y("div", Mu, [
              y("button", {
                type: "button",
                title: "新建文件",
                onClick: g[3] || (g[3] = (E) => k("file"))
              }, "＋F"),
              y("button", {
                type: "button",
                title: "新建目录",
                onClick: g[4] || (g[4] = (E) => k("directory"))
              }, "＋D"),
              y("button", {
                type: "button",
                title: "重命名",
                disabled: !o.value,
                onClick: S
              }, "R", 8, Ru),
              y("button", {
                type: "button",
                title: "删除",
                disabled: !o.value,
                onClick: P
              }, "×", 8, Nu)
            ])
          ]),
          y("div", Fu, [
            (D(!0), L(oe, null, kt(zt.value, (E) => (D(), Ns(Cl, {
              key: E.path,
              node: E,
              "selected-path": o.value,
              onSelect: sn
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ]),
        y("section", qu, [
          y("nav", Du, [
            (D(!0), L(oe, null, kt(r.value, (E) => (D(), L("button", {
              key: E,
              type: "button",
              class: je(["editor-tab", { active: E === a.value }]),
              onClick: (se) => Re(E).catch(x)
            }, [
              y("span", null, V(di(jn)(E)), 1),
              l.value.has(E) ? (D(), L("span", Hu, "•")) : Ve("", !0)
            ], 10, Wu))), 128))
          ]),
          y("div", Lu, [
            ms.value?.kind === "file" ? (D(), Ns(Il, {
              key: `${n.value.uuid}:${a.value}`,
              "project-id": n.value.uuid,
              path: a.value,
              language: fe.value,
              value: u.value,
              markers: Q.value,
              "onUpdate:value": Ct,
              onSave: g[5] || (g[5] = (E) => f().then(() => C("已保存。")).catch(x)),
              onError: x
            }, null, 8, ["project-id", "path", "language", "value", "markers"])) : (D(), L("div", Uu, [...g[20] || (g[20] = [
              y("h2", null, "选择文件开始编辑", -1),
              y("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ])
        ]),
        y("aside", Vu, [
          y("div", zu, [
            g[21] || (g[21] = y("span", null, "Inspector", -1)),
            y("div", Bu, [
              y("button", {
                type: "button",
                class: je({ active: M.value === "manifest" }),
                onClick: g[6] || (g[6] = (E) => M.value = "manifest")
              }, "Manifest", 2),
              y("button", {
                type: "button",
                class: je({ active: M.value === "preview" }),
                onClick: g[7] || (g[7] = (E) => M.value = "preview")
              }, "Preview", 2)
            ])
          ]),
          Ss(y("div", Ku, [
            g[32] || (g[32] = y("h2", null, "Manifest v1", -1)),
            y("p", Ju, "项目 UUID：" + V(n.value.uuid), 1),
            Je(nc, {
              manifest: c.value,
              diagnostics: d.value,
              "onUpdate:manifest": g[8] || (g[8] = (E) => tr(E).catch(x)),
              onOpenJson: g[9] || (g[9] = (E) => Re("manifest.json").catch(x))
            }, null, 8, ["manifest", "diagnostics"]),
            y("section", Gu, [
              g[31] || (g[31] = y("h3", null, "Validation", -1)),
              m.value ? (D(), L("dl", Zu, [
                y("div", null, [
                  g[22] || (g[22] = y("dt", null, "Result", -1)),
                  y("dd", null, V(m.value.passed ? "Passed" : "Blocked"), 1)
                ]),
                y("div", null, [
                  g[23] || (g[23] = y("dt", null, "Errors", -1)),
                  y("dd", null, V(m.value.errorCount), 1)
                ]),
                y("div", null, [
                  g[24] || (g[24] = y("dt", null, "Warnings", -1)),
                  y("dd", null, V(m.value.warningCount), 1)
                ]),
                y("div", null, [
                  g[25] || (g[25] = y("dt", null, "Files", -1)),
                  y("dd", null, V(m.value.packageFacts.fileCount), 1)
                ]),
                y("div", null, [
                  g[26] || (g[26] = y("dt", null, "Bytes", -1)),
                  y("dd", null, V(m.value.packageFacts.unpackedBytes), 1)
                ])
              ])) : (D(), L("p", Xu, "尚未创建 Snapshot 验证。")),
              p.value ? (D(), L(oe, { key: 2 }, [
                g[30] || (g[30] = y("h3", null, "Build Result", -1)),
                p.value.artifactReady ? (D(), L("dl", Qu, [
                  y("div", null, [
                    g[27] || (g[27] = y("dt", null, "Size", -1)),
                    y("dd", null, V(p.value.zipSize) + " bytes", 1)
                  ]),
                  y("div", null, [
                    g[28] || (g[28] = y("dt", null, "Files", -1)),
                    y("dd", null, V(p.value.fileCount), 1)
                  ]),
                  y("div", ef, [
                    g[29] || (g[29] = y("dt", null, "SHA-256", -1)),
                    y("dd", null, V(p.value.sha256), 1)
                  ])
                ])) : (D(), L("p", Yu, "验证未通过，没有生成可发布 ZIP。")),
                y("button", {
                  type: "button",
                  disabled: !p.value.artifactReady,
                  onClick: A
                }, "Export ZIP", 8, tf)
              ], 64)) : Ve("", !0)
            ])
          ], 512), [
            [Pr, M.value === "manifest"]
          ]),
          Ss(y("div", sf, [
            y("div", nf, [
              g[33] || (g[33] = y("strong", null, "Developer Preview", -1)),
              T.value ? (D(), L("span", rf, V(T.value.state) + " · " + V(T.value.snapshotId), 1)) : (D(), L("span", of, "无活动会话"))
            ]),
            y("iframe", {
              ref_key: "previewHostFrame",
              ref: _,
              class: "preview-host-frame",
              src: "developer-preview-host.html?v=20260829-1",
              title: "Trusted Developer Preview Host",
              referrerpolicy: "no-referrer",
              onLoad: F
            }, null, 544)
          ], 512), [
            [Pr, M.value === "preview"]
          ])
        ])
      ])) : (D(), L("section", af, [
        g[34] || (g[34] = y("h2", null, "创建第一个 WebWindows 功能", -1)),
        g[35] || (g[35] = y("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        y("button", {
          class: "primary",
          type: "button",
          onClick: He
        }, "新建 Hello WebWindows")
      ])),
      y("section", lf, [
        y("div", cf, [
          y("button", {
            type: "button",
            class: je({ active: N.value === "problems" }),
            onClick: g[10] || (g[10] = (E) => N.value = "problems")
          }, [
            g[36] || (g[36] = ce("Problems ", -1)),
            y("span", null, V(B.value.length), 1)
          ], 2),
          y("button", {
            type: "button",
            class: je({ active: N.value === "console" }),
            onClick: g[11] || (g[11] = (E) => N.value = "console")
          }, [
            g[37] || (g[37] = ce("Console ", -1)),
            y("span", null, V(O.value.length), 1)
          ], 2),
          g[39] || (g[39] = y("span", { class: "bottom-spacer" }, null, -1)),
          N.value === "console" ? (D(), L(oe, { key: 0 }, [
            Ss(y("select", {
              "onUpdate:modelValue": g[12] || (g[12] = (E) => te.value = E),
              "aria-label": "Console level"
            }, [
              g[38] || (g[38] = y("option", { value: "all" }, "All levels", -1)),
              (D(), L(oe, null, kt(["log", "info", "warn", "error", "debug"], (E) => y("option", {
                key: E,
                value: E
              }, V(E), 9, uf)), 64))
            ], 512), [
              [ml, te.value]
            ]),
            y("button", {
              type: "button",
              onClick: z
            }, "Clear")
          ], 64)) : Ve("", !0)
        ]),
        N.value === "problems" ? (D(), L(oe, { key: 0 }, [
          B.value.length ? Ve("", !0) : (D(), L("div", ff, "当前 Snapshot 未发现问题。")),
          (D(!0), L(oe, null, kt(B.value, (E, se) => (D(), L("button", {
            key: `${E.ruleId}:${E.path}:${se}`,
            type: "button",
            class: "problem-row",
            onClick: (ys) => he(E)
          }, [
            y("span", {
              class: je(["problem-severity", E.severity])
            }, V(E.ruleId), 3),
            y("code", null, V(E.path), 1),
            y("span", null, V(E.message), 1)
          ], 8, df))), 128))
        ], 64)) : (D(), L(oe, { key: 1 }, [
          We.value.length ? Ve("", !0) : (D(), L("div", pf, "当前 Developer Preview 尚无 Console 输出。")),
          (D(!0), L(oe, null, kt(We.value, (E) => (D(), L("div", {
            key: `${E.sessionId}:${E.sequence}`,
            class: je(["console-row", E.level])
          }, [
            y("time", null, V(E.timestamp), 1),
            y("strong", null, V(E.level), 1),
            y("span", null, V(pe(E)), 1),
            y("code", null, V(E.snapshotId), 1)
          ], 2))), 128))
        ], 64))
      ]),
      ve.value ? (D(), L("div", {
        key: 2,
        class: je(["studio-status", _e.value]),
        role: "status"
      }, V(ve.value), 3)) : Ve("", !0),
      re.value ? (D(), L("div", {
        key: 3,
        class: "studio-dialog-backdrop",
        onKeydown: g[16] || (g[16] = wl((E) => At(re.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        y("form", {
          class: "studio-dialog",
          onSubmit: g[15] || (g[15] = Qn((E) => At(re.value.kind === "confirm" ? !0 : re.value.value), ["prevent"]))
        }, [
          y("h2", null, V(re.value.title), 1),
          y("p", null, V(re.value.message), 1),
          re.value.kind === "text" ? Ss((D(), L("input", {
            key: 0,
            "onUpdate:modelValue": g[13] || (g[13] = (E) => re.value.value = E),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [hl, re.value.value]
          ]) : Ve("", !0),
          y("div", hf, [
            y("button", {
              type: "button",
              onClick: g[14] || (g[14] = (E) => At(re.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            y("button", mf, V(re.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : Ve("", !0)
    ]));
  }
};
Pl(gf).mount("#developer-studio-app");
export {
  Cn as g,
  Mc as s,
  Tn as v
};
