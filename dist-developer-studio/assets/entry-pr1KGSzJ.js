/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function Vn(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Y = {}, Ut = [], Ze = () => {
}, ti = () => !1, tn = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Un = (e) => e.startsWith("onUpdate:"), Se = Object.assign, zn = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, lo = Object.prototype.hasOwnProperty, J = (e, t) => lo.call(e, t), F = Array.isArray, zt = (e) => js(e) === "[object Map]", sn = (e) => js(e) === "[object Set]", dr = (e) => js(e) === "[object Date]", L = (e) => typeof e == "function", ue = (e) => typeof e == "string", Qe = (e) => typeof e == "symbol", te = (e) => e !== null && typeof e == "object", si = (e) => (te(e) || L(e)) && L(e.then) && L(e.catch), ni = Object.prototype.toString, js = (e) => ni.call(e), uo = (e) => js(e).slice(8, -1), ri = (e) => js(e) === "[object Object]", Bn = (e) => ue(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, fs = /* @__PURE__ */ Vn(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), nn = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((n) => t[n] || (t[n] = e(n)));
}, co = /-\w/g, He = nn(
  (e) => e.replace(co, (t) => t.slice(1).toUpperCase())
), fo = /\B([A-Z])/g, kt = nn(
  (e) => e.replace(fo, "-$1").toLowerCase()
), rn = nn((e) => e.charAt(0).toUpperCase() + e.slice(1)), hn = nn(
  (e) => e ? `on${rn(e)}` : ""
), vt = (e, t) => !Object.is(e, t), Rs = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, ii = (e, t, n, r = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: r,
    value: n
  });
}, Hs = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let pr;
const on = () => pr || (pr = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Kn(e) {
  if (F(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const r = e[n], i = ue(r) ? yo(r) : Kn(r);
      if (i)
        for (const u in i)
          t[u] = i[u];
    }
    return t;
  } else if (ue(e) || te(e))
    return e;
}
const po = /;(?![^(]*\))/g, mo = /:([^]+)/, ho = /\/\*[^]*?\*\//g;
function yo(e) {
  const t = {};
  return e.replace(ho, "").split(po).forEach((n) => {
    if (n) {
      const r = n.split(mo);
      r.length > 1 && (t[r[0].trim()] = r[1].trim());
    }
  }), t;
}
function je(e) {
  let t = "";
  if (ue(e))
    t = e;
  else if (F(e))
    for (let n = 0; n < e.length; n++) {
      const r = je(e[n]);
      r && (t += r + " ");
    }
  else if (te(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const go = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", wo = /* @__PURE__ */ Vn(go);
function oi(e) {
  return !!e || e === "";
}
function vo(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let r = 0; n && r < e.length; r++)
    n = an(e[r], t[r]);
  return n;
}
function an(e, t) {
  if (e === t) return !0;
  let n = dr(e), r = dr(t);
  if (n || r)
    return n && r ? e.getTime() === t.getTime() : !1;
  if (n = Qe(e), r = Qe(t), n || r)
    return e === t;
  if (n = F(e), r = F(t), n || r)
    return n && r ? vo(e, t) : !1;
  if (n = te(e), r = te(t), n || r) {
    if (!n || !r)
      return !1;
    const i = Object.keys(e).length, u = Object.keys(t).length;
    if (i !== u)
      return !1;
    for (const s in e) {
      const o = e.hasOwnProperty(s), c = t.hasOwnProperty(s);
      if (o && !c || !o && c || !an(e[s], t[s]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function bo(e, t) {
  return e.findIndex((n) => an(n, t));
}
const ai = (e) => !!(e && e.__v_isRef === !0), V = (e) => ue(e) ? e : e == null ? "" : F(e) || te(e) && (e.toString === ni || !L(e.toString)) ? ai(e) ? V(e.value) : JSON.stringify(e, li, 2) : String(e), li = (e, t) => ai(t) ? li(e, t.value) : zt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [r, i], u) => (n[yn(r, u) + " =>"] = i, n),
    {}
  )
} : sn(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => yn(n))
} : Qe(t) ? yn(t) : te(t) && !F(t) && !ri(t) ? String(t) : t, yn = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Qe(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let _e;
class Po {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = _e, !t && _e && (this.index = (_e.scopes || (_e.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].pause();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].resume();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = _e;
      try {
        return _e = this, t();
      } finally {
        _e = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = _e, _e = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (_e = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let n, r;
      for (n = 0, r = this.effects.length; n < r; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, r = this.cleanups.length; n < r; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, r = this.scopes.length; n < r; n++)
          this.scopes[n].stop(!0);
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
function ko() {
  return _e;
}
let Q;
const gn = /* @__PURE__ */ new WeakSet();
class ui {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, _e && _e.active && _e.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, gn.has(this) && (gn.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || fi(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, mr(this), di(this);
    const t = Q, n = ze;
    Q = this, ze = !0;
    try {
      return this.fn();
    } finally {
      pi(this), Q = t, ze = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Xn(t);
      this.deps = this.depsTail = void 0, mr(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? gn.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    An(this) && this.run();
  }
  get dirty() {
    return An(this);
  }
}
let ci = 0, ds, ps;
function fi(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = ps, ps = e;
    return;
  }
  e.next = ds, ds = e;
}
function Jn() {
  ci++;
}
function Gn() {
  if (--ci > 0)
    return;
  if (ps) {
    let t = ps;
    for (ps = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; ds; ) {
    let t = ds;
    for (ds = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (r) {
          e || (e = r);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function di(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function pi(e) {
  let t, n = e.depsTail, r = n;
  for (; r; ) {
    const i = r.prevDep;
    r.version === -1 ? (r === n && (n = i), Xn(r), $o(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = i;
  }
  e.deps = t, e.depsTail = n;
}
function An(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (mi(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function mi(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === vs) || (e.globalVersion = vs, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !An(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = Q, r = ze;
  Q = e, ze = !0;
  try {
    di(e);
    const i = e.fn(e._value);
    (t.version === 0 || vt(i, e._value)) && (e.flags |= 128, e._value = i, t.version++);
  } catch (i) {
    throw t.version++, i;
  } finally {
    Q = n, ze = r, pi(e), e.flags &= -3;
  }
}
function Xn(e, t = !1) {
  const { dep: n, prevSub: r, nextSub: i } = e;
  if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
    n.computed.flags &= -5;
    for (let u = n.computed.deps; u; u = u.nextDep)
      Xn(u, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function $o(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let ze = !0;
const hi = [];
function ft() {
  hi.push(ze), ze = !1;
}
function dt() {
  const e = hi.pop();
  ze = e === void 0 ? !0 : e;
}
function mr(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Q;
    Q = void 0;
    try {
      t();
    } finally {
      Q = n;
    }
  }
}
let vs = 0;
class So {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Zn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!Q || !ze || Q === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Q)
      n = this.activeLink = new So(Q, this), Q.deps ? (n.prevDep = Q.depsTail, Q.depsTail.nextDep = n, Q.depsTail = n) : Q.deps = Q.depsTail = n, yi(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const r = n.nextDep;
      r.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = r), n.prevDep = Q.depsTail, n.nextDep = void 0, Q.depsTail.nextDep = n, Q.depsTail = n, Q.deps === n && (Q.deps = r);
    }
    return n;
  }
  trigger(t) {
    this.version++, vs++, this.notify(t);
  }
  notify(t) {
    Jn();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Gn();
    }
  }
}
function yi(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let r = t.deps; r; r = r.nextDep)
        yi(r);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const In = /* @__PURE__ */ new WeakMap(), Rt = Symbol(
  ""
), Tn = Symbol(
  ""
), bs = Symbol(
  ""
);
function ge(e, t, n) {
  if (ze && Q) {
    let r = In.get(e);
    r || In.set(e, r = /* @__PURE__ */ new Map());
    let i = r.get(n);
    i || (r.set(n, i = new Zn()), i.map = r, i.key = n), i.track();
  }
}
function ot(e, t, n, r, i, u) {
  const s = In.get(e);
  if (!s) {
    vs++;
    return;
  }
  const o = (c) => {
    c && c.trigger();
  };
  if (Jn(), t === "clear")
    s.forEach(o);
  else {
    const c = F(e), a = c && Bn(n);
    if (c && n === "length") {
      const l = Number(r);
      s.forEach((f, h) => {
        (h === "length" || h === bs || !Qe(h) && h >= l) && o(f);
      });
    } else
      switch ((n !== void 0 || s.has(void 0)) && o(s.get(n)), a && o(s.get(bs)), t) {
        case "add":
          c ? a && o(s.get("length")) : (o(s.get(Rt)), zt(e) && o(s.get(Tn)));
          break;
        case "delete":
          c || (o(s.get(Rt)), zt(e) && o(s.get(Tn)));
          break;
        case "set":
          zt(e) && o(s.get(Rt));
          break;
      }
  }
  Gn();
}
function Lt(e) {
  const t = K(e);
  return t === e ? t : (ge(t, "iterate", bs), Fe(e) ? t : t.map(me));
}
function ln(e) {
  return ge(e = K(e), "iterate", bs), e;
}
const xo = {
  __proto__: null,
  [Symbol.iterator]() {
    return wn(this, Symbol.iterator, me);
  },
  concat(...e) {
    return Lt(this).concat(
      ...e.map((t) => F(t) ? Lt(t) : t)
    );
  },
  entries() {
    return wn(this, "entries", (e) => (e[1] = me(e[1]), e));
  },
  every(e, t) {
    return nt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return nt(this, "filter", e, t, (n) => n.map(me), arguments);
  },
  find(e, t) {
    return nt(this, "find", e, t, me, arguments);
  },
  findIndex(e, t) {
    return nt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return nt(this, "findLast", e, t, me, arguments);
  },
  findLastIndex(e, t) {
    return nt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return nt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return vn(this, "includes", e);
  },
  indexOf(...e) {
    return vn(this, "indexOf", e);
  },
  join(e) {
    return Lt(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return vn(this, "lastIndexOf", e);
  },
  map(e, t) {
    return nt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return rs(this, "pop");
  },
  push(...e) {
    return rs(this, "push", e);
  },
  reduce(e, ...t) {
    return hr(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return hr(this, "reduceRight", e, t);
  },
  shift() {
    return rs(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return nt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return rs(this, "splice", e);
  },
  toReversed() {
    return Lt(this).toReversed();
  },
  toSorted(e) {
    return Lt(this).toSorted(e);
  },
  toSpliced(...e) {
    return Lt(this).toSpliced(...e);
  },
  unshift(...e) {
    return rs(this, "unshift", e);
  },
  values() {
    return wn(this, "values", me);
  }
};
function wn(e, t, n) {
  const r = ln(e), i = r[t]();
  return r !== e && !Fe(e) && (i._next = i.next, i.next = () => {
    const u = i._next();
    return u.value && (u.value = n(u.value)), u;
  }), i;
}
const _o = Array.prototype;
function nt(e, t, n, r, i, u) {
  const s = ln(e), o = s !== e && !Fe(e), c = s[t];
  if (c !== _o[t]) {
    const f = c.apply(e, u);
    return o ? me(f) : f;
  }
  let a = n;
  s !== e && (o ? a = function(f, h) {
    return n.call(this, me(f), h, e);
  } : n.length > 2 && (a = function(f, h) {
    return n.call(this, f, h, e);
  }));
  const l = c.call(s, a, r);
  return o && i ? i(l) : l;
}
function hr(e, t, n, r) {
  const i = ln(e);
  let u = n;
  return i !== e && (Fe(e) ? n.length > 3 && (u = function(s, o, c) {
    return n.call(this, s, o, c, e);
  }) : u = function(s, o, c) {
    return n.call(this, s, me(o), c, e);
  }), i[t](u, ...r);
}
function vn(e, t, n) {
  const r = K(e);
  ge(r, "iterate", bs);
  const i = r[t](...n);
  return (i === -1 || i === !1) && tr(n[0]) ? (n[0] = K(n[0]), r[t](...n)) : i;
}
function rs(e, t, n = []) {
  ft(), Jn();
  const r = K(e)[t].apply(e, n);
  return Gn(), dt(), r;
}
const jo = /* @__PURE__ */ Vn("__proto__,__v_isRef,__isVue"), gi = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Qe)
);
function Eo(e) {
  Qe(e) || (e = String(e));
  const t = K(this);
  return ge(t, "has", e), t.hasOwnProperty(e);
}
class wi {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, r) {
    if (n === "__v_skip") return t.__v_skip;
    const i = this._isReadonly, u = this._isShallow;
    if (n === "__v_isReactive")
      return !i;
    if (n === "__v_isReadonly")
      return i;
    if (n === "__v_isShallow")
      return u;
    if (n === "__v_raw")
      return r === (i ? u ? Wo : ki : u ? Pi : bi).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(r) ? t : void 0;
    const s = F(t);
    if (!i) {
      let c;
      if (s && (c = xo[n]))
        return c;
      if (n === "hasOwnProperty")
        return Eo;
    }
    const o = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      ve(t) ? t : r
    );
    return (Qe(n) ? gi.has(n) : jo(n)) || (i || ge(t, "get", n), u) ? o : ve(o) ? s && Bn(n) ? o : o.value : te(o) ? i ? $i(o) : Qn(o) : o;
  }
}
class vi extends wi {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, r, i) {
    let u = t[n];
    if (!this._isShallow) {
      const c = bt(u);
      if (!Fe(r) && !bt(r) && (u = K(u), r = K(r)), !F(t) && ve(u) && !ve(r))
        return c || (u.value = r), !0;
    }
    const s = F(t) && Bn(n) ? Number(n) < t.length : J(t, n), o = Reflect.set(
      t,
      n,
      r,
      ve(t) ? t : i
    );
    return t === K(i) && (s ? vt(r, u) && ot(t, "set", n, r) : ot(t, "add", n, r)), o;
  }
  deleteProperty(t, n) {
    const r = J(t, n);
    t[n];
    const i = Reflect.deleteProperty(t, n);
    return i && r && ot(t, "delete", n, void 0), i;
  }
  has(t, n) {
    const r = Reflect.has(t, n);
    return (!Qe(n) || !gi.has(n)) && ge(t, "has", n), r;
  }
  ownKeys(t) {
    return ge(
      t,
      "iterate",
      F(t) ? "length" : Rt
    ), Reflect.ownKeys(t);
  }
}
class Ao extends wi {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return !0;
  }
  deleteProperty(t, n) {
    return !0;
  }
}
const Io = /* @__PURE__ */ new vi(), To = /* @__PURE__ */ new Ao(), Mo = /* @__PURE__ */ new vi(!0);
const Mn = (e) => e, Ms = (e) => Reflect.getPrototypeOf(e);
function Co(e, t, n) {
  return function(...r) {
    const i = this.__v_raw, u = K(i), s = zt(u), o = e === "entries" || e === Symbol.iterator && s, c = e === "keys" && s, a = i[e](...r), l = n ? Mn : t ? Ls : me;
    return !t && ge(
      u,
      "iterate",
      c ? Tn : Rt
    ), {
      // iterator protocol
      next() {
        const { value: f, done: h } = a.next();
        return h ? { value: f, done: h } : {
          value: o ? [l(f[0]), l(f[1])] : l(f),
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
function Cs(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function qo(e, t) {
  const n = {
    get(i) {
      const u = this.__v_raw, s = K(u), o = K(i);
      e || (vt(i, o) && ge(s, "get", i), ge(s, "get", o));
      const { has: c } = Ms(s), a = t ? Mn : e ? Ls : me;
      if (c.call(s, i))
        return a(u.get(i));
      if (c.call(s, o))
        return a(u.get(o));
      u !== s && u.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !e && ge(K(i), "iterate", Rt), i.size;
    },
    has(i) {
      const u = this.__v_raw, s = K(u), o = K(i);
      return e || (vt(i, o) && ge(s, "has", i), ge(s, "has", o)), i === o ? u.has(i) : u.has(i) || u.has(o);
    },
    forEach(i, u) {
      const s = this, o = s.__v_raw, c = K(o), a = t ? Mn : e ? Ls : me;
      return !e && ge(c, "iterate", Rt), o.forEach((l, f) => i.call(u, a(l), a(f), s));
    }
  };
  return Se(
    n,
    e ? {
      add: Cs("add"),
      set: Cs("set"),
      delete: Cs("delete"),
      clear: Cs("clear")
    } : {
      add(i) {
        !t && !Fe(i) && !bt(i) && (i = K(i));
        const u = K(this);
        return Ms(u).has.call(u, i) || (u.add(i), ot(u, "add", i, i)), this;
      },
      set(i, u) {
        !t && !Fe(u) && !bt(u) && (u = K(u));
        const s = K(this), { has: o, get: c } = Ms(s);
        let a = o.call(s, i);
        a || (i = K(i), a = o.call(s, i));
        const l = c.call(s, i);
        return s.set(i, u), a ? vt(u, l) && ot(s, "set", i, u) : ot(s, "add", i, u), this;
      },
      delete(i) {
        const u = K(this), { has: s, get: o } = Ms(u);
        let c = s.call(u, i);
        c || (i = K(i), c = s.call(u, i)), o && o.call(u, i);
        const a = u.delete(i);
        return c && ot(u, "delete", i, void 0), a;
      },
      clear() {
        const i = K(this), u = i.size !== 0, s = i.clear();
        return u && ot(
          i,
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
  ].forEach((i) => {
    n[i] = Co(i, e, t);
  }), n;
}
function Yn(e, t) {
  const n = qo(e, t);
  return (r, i, u) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? r : Reflect.get(
    J(n, i) && i in r ? n : r,
    i,
    u
  );
}
const Oo = {
  get: /* @__PURE__ */ Yn(!1, !1)
}, No = {
  get: /* @__PURE__ */ Yn(!1, !0)
}, Ro = {
  get: /* @__PURE__ */ Yn(!0, !1)
};
const bi = /* @__PURE__ */ new WeakMap(), Pi = /* @__PURE__ */ new WeakMap(), ki = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap();
function Do(e) {
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
function Fo(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Do(uo(e));
}
function Qn(e) {
  return bt(e) ? e : er(
    e,
    !1,
    Io,
    Oo,
    bi
  );
}
function Ho(e) {
  return er(
    e,
    !1,
    Mo,
    No,
    Pi
  );
}
function $i(e) {
  return er(
    e,
    !0,
    To,
    Ro,
    ki
  );
}
function er(e, t, n, r, i) {
  if (!te(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const u = Fo(e);
  if (u === 0)
    return e;
  const s = i.get(e);
  if (s)
    return s;
  const o = new Proxy(
    e,
    u === 2 ? r : n
  );
  return i.set(e, o), o;
}
function Bt(e) {
  return bt(e) ? Bt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function bt(e) {
  return !!(e && e.__v_isReadonly);
}
function Fe(e) {
  return !!(e && e.__v_isShallow);
}
function tr(e) {
  return e ? !!e.__v_raw : !1;
}
function K(e) {
  const t = e && e.__v_raw;
  return t ? K(t) : e;
}
function Lo(e) {
  return !J(e, "__v_skip") && Object.isExtensible(e) && ii(e, "__v_skip", !0), e;
}
const me = (e) => te(e) ? Qn(e) : e, Ls = (e) => te(e) ? $i(e) : e;
function ve(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function G(e) {
  return Vo(e, !1);
}
function Vo(e, t) {
  return ve(e) ? e : new Uo(e, t);
}
class Uo {
  constructor(t, n) {
    this.dep = new Zn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : K(t), this._value = n ? t : me(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, r = this.__v_isShallow || Fe(t) || bt(t);
    t = r ? t : K(t), vt(t, n) && (this._rawValue = t, this._value = r ? t : me(t), this.dep.trigger());
  }
}
function Si(e) {
  return ve(e) ? e.value : e;
}
const zo = {
  get: (e, t, n) => t === "__v_raw" ? e : Si(Reflect.get(e, t, n)),
  set: (e, t, n, r) => {
    const i = e[t];
    return ve(i) && !ve(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
  }
};
function xi(e) {
  return Bt(e) ? e : new Proxy(e, zo);
}
class Bo {
  constructor(t, n, r) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Zn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = vs - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = r;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Q !== this)
      return fi(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return mi(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Ko(e, t, n = !1) {
  let r, i;
  return L(e) ? r = e : (r = e.get, i = e.set), new Bo(r, i, n);
}
const qs = {}, Vs = /* @__PURE__ */ new WeakMap();
let qt;
function Jo(e, t = !1, n = qt) {
  if (n) {
    let r = Vs.get(n);
    r || Vs.set(n, r = []), r.push(e);
  }
}
function Go(e, t, n = Y) {
  const { immediate: r, deep: i, once: u, scheduler: s, augmentJob: o, call: c } = n, a = (R) => i ? R : Fe(R) || i === !1 || i === 0 ? at(R, 1) : at(R);
  let l, f, h, d, m = !1, g = !1;
  if (ve(e) ? (f = () => e.value, m = Fe(e)) : Bt(e) ? (f = () => a(e), m = !0) : F(e) ? (g = !0, m = e.some((R) => Bt(R) || Fe(R)), f = () => e.map((R) => {
    if (ve(R))
      return R.value;
    if (Bt(R))
      return a(R);
    if (L(R))
      return c ? c(R, 2) : R();
  })) : L(e) ? t ? f = c ? () => c(e, 2) : e : f = () => {
    if (h) {
      ft();
      try {
        h();
      } finally {
        dt();
      }
    }
    const R = qt;
    qt = l;
    try {
      return c ? c(e, 3, [d]) : e(d);
    } finally {
      qt = R;
    }
  } : f = Ze, t && i) {
    const R = f, Z = i === !0 ? 1 / 0 : i;
    f = () => at(R(), Z);
  }
  const I = ko(), j = () => {
    l.stop(), I && I.active && zn(I.effects, l);
  };
  if (u && t) {
    const R = t;
    t = (...Z) => {
      R(...Z), j();
    };
  }
  let O = g ? new Array(e.length).fill(qs) : qs;
  const M = (R) => {
    if (!(!(l.flags & 1) || !l.dirty && !R))
      if (t) {
        const Z = l.run();
        if (i || m || (g ? Z.some((he, be) => vt(he, O[be])) : vt(Z, O))) {
          h && h();
          const he = qt;
          qt = l;
          try {
            const be = [
              Z,
              // pass undefined as the old value when it's changed for the first time
              O === qs ? void 0 : g && O[0] === qs ? [] : O,
              d
            ];
            O = Z, c ? c(t, 3, be) : (
              // @ts-expect-error
              t(...be)
            );
          } finally {
            qt = he;
          }
        }
      } else
        l.run();
  };
  return o && o(M), l = new ui(f), l.scheduler = s ? () => s(M, !1) : M, d = (R) => Jo(R, !1, l), h = l.onStop = () => {
    const R = Vs.get(l);
    if (R) {
      if (c)
        c(R, 4);
      else
        for (const Z of R) Z();
      Vs.delete(l);
    }
  }, t ? r ? M(!0) : O = l.run() : s ? s(M.bind(null, !0), !0) : l.run(), j.pause = l.pause.bind(l), j.resume = l.resume.bind(l), j.stop = j, j;
}
function at(e, t = 1 / 0, n) {
  if (t <= 0 || !te(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t))
    return e;
  if (n.set(e, t), t--, ve(e))
    at(e.value, t, n);
  else if (F(e))
    for (let r = 0; r < e.length; r++)
      at(e[r], t, n);
  else if (sn(e) || zt(e))
    e.forEach((r) => {
      at(r, t, n);
    });
  else if (ri(e)) {
    for (const r in e)
      at(e[r], t, n);
    for (const r of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, r) && at(e[r], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Es(e, t, n, r) {
  try {
    return r ? e(...r) : e();
  } catch (i) {
    un(i, t, n);
  }
}
function et(e, t, n, r) {
  if (L(e)) {
    const i = Es(e, t, n, r);
    return i && si(i) && i.catch((u) => {
      un(u, t, n);
    }), i;
  }
  if (F(e)) {
    const i = [];
    for (let u = 0; u < e.length; u++)
      i.push(et(e[u], t, n, r));
    return i;
  }
}
function un(e, t, n, r = !0) {
  const i = t ? t.vnode : null, { errorHandler: u, throwUnhandledErrorInProduction: s } = t && t.appContext.config || Y;
  if (t) {
    let o = t.parent;
    const c = t.proxy, a = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; o; ) {
      const l = o.ec;
      if (l) {
        for (let f = 0; f < l.length; f++)
          if (l[f](e, c, a) === !1)
            return;
      }
      o = o.parent;
    }
    if (u) {
      ft(), Es(u, null, 10, [
        e,
        c,
        a
      ]), dt();
      return;
    }
  }
  Xo(e, n, i, r, s);
}
function Xo(e, t, n, r = !0, i = !1) {
  if (i)
    throw e;
  console.error(e);
}
const $e = [];
let Ge = -1;
const Kt = [];
let yt = null, Vt = 0;
const _i = /* @__PURE__ */ Promise.resolve();
let Us = null;
function sr(e) {
  const t = Us || _i;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Zo(e) {
  let t = Ge + 1, n = $e.length;
  for (; t < n; ) {
    const r = t + n >>> 1, i = $e[r], u = Ps(i);
    u < e || u === e && i.flags & 2 ? t = r + 1 : n = r;
  }
  return t;
}
function nr(e) {
  if (!(e.flags & 1)) {
    const t = Ps(e), n = $e[$e.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Ps(n) ? $e.push(e) : $e.splice(Zo(t), 0, e), e.flags |= 1, ji();
  }
}
function ji() {
  Us || (Us = _i.then(Ai));
}
function Yo(e) {
  F(e) ? Kt.push(...e) : yt && e.id === -1 ? yt.splice(Vt + 1, 0, e) : e.flags & 1 || (Kt.push(e), e.flags |= 1), ji();
}
function yr(e, t, n = Ge + 1) {
  for (; n < $e.length; n++) {
    const r = $e[n];
    if (r && r.flags & 2) {
      if (e && r.id !== e.uid)
        continue;
      $e.splice(n, 1), n--, r.flags & 4 && (r.flags &= -2), r(), r.flags & 4 || (r.flags &= -2);
    }
  }
}
function Ei(e) {
  if (Kt.length) {
    const t = [...new Set(Kt)].sort(
      (n, r) => Ps(n) - Ps(r)
    );
    if (Kt.length = 0, yt) {
      yt.push(...t);
      return;
    }
    for (yt = t, Vt = 0; Vt < yt.length; Vt++) {
      const n = yt[Vt];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    yt = null, Vt = 0;
  }
}
const Ps = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Ai(e) {
  try {
    for (Ge = 0; Ge < $e.length; Ge++) {
      const t = $e[Ge];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Es(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ge < $e.length; Ge++) {
      const t = $e[Ge];
      t && (t.flags &= -2);
    }
    Ge = -1, $e.length = 0, Ei(), Us = null, ($e.length || Kt.length) && Ai();
  }
}
let Ce = null, Ii = null;
function zs(e) {
  const t = Ce;
  return Ce = e, Ii = e && e.type.__scopeId || null, t;
}
function Qo(e, t = Ce, n) {
  if (!t || e._n)
    return e;
  const r = (...i) => {
    r._d && jr(-1);
    const u = zs(t);
    let s;
    try {
      s = e(...i);
    } finally {
      zs(u), r._d && jr(1);
    }
    return s;
  };
  return r._n = !0, r._c = !0, r._d = !0, r;
}
function Os(e, t) {
  if (Ce === null)
    return e;
  const n = pn(Ce), r = e.dirs || (e.dirs = []);
  for (let i = 0; i < t.length; i++) {
    let [u, s, o, c = Y] = t[i];
    u && (L(u) && (u = {
      mounted: u,
      updated: u
    }), u.deep && at(s), r.push({
      dir: u,
      instance: n,
      value: s,
      oldValue: void 0,
      arg: o,
      modifiers: c
    }));
  }
  return e;
}
function It(e, t, n, r) {
  const i = e.dirs, u = t && t.dirs;
  for (let s = 0; s < i.length; s++) {
    const o = i[s];
    u && (o.oldValue = u[s].value);
    let c = o.dir[r];
    c && (ft(), et(c, n, 8, [
      e.el,
      o,
      e,
      t
    ]), dt());
  }
}
const ea = Symbol("_vte"), ta = (e) => e.__isTeleport, sa = Symbol("_leaveCb");
function rr(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, rr(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function Ti(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const Bs = /* @__PURE__ */ new WeakMap();
function ms(e, t, n, r, i = !1) {
  if (F(e)) {
    e.forEach(
      (m, g) => ms(
        m,
        t && (F(t) ? t[g] : t),
        n,
        r,
        i
      )
    );
    return;
  }
  if (hs(r) && !i) {
    r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && ms(e, t, n, r.component.subTree);
    return;
  }
  const u = r.shapeFlag & 4 ? pn(r.component) : r.el, s = i ? null : u, { i: o, r: c } = e, a = t && t.r, l = o.refs === Y ? o.refs = {} : o.refs, f = o.setupState, h = K(f), d = f === Y ? ti : (m) => J(h, m);
  if (a != null && a !== c) {
    if (gr(t), ue(a))
      l[a] = null, d(a) && (f[a] = null);
    else if (ve(a)) {
      a.value = null;
      const m = t;
      m.k && (l[m.k] = null);
    }
  }
  if (L(c))
    Es(c, o, 12, [s, l]);
  else {
    const m = ue(c), g = ve(c);
    if (m || g) {
      const I = () => {
        if (e.f) {
          const j = m ? d(c) ? f[c] : l[c] : c.value;
          if (i)
            F(j) && zn(j, u);
          else if (F(j))
            j.includes(u) || j.push(u);
          else if (m)
            l[c] = [u], d(c) && (f[c] = l[c]);
          else {
            const O = [u];
            c.value = O, e.k && (l[e.k] = O);
          }
        } else m ? (l[c] = s, d(c) && (f[c] = s)) : g && (c.value = s, e.k && (l[e.k] = s));
      };
      if (s) {
        const j = () => {
          I(), Bs.delete(e);
        };
        j.id = -1, Bs.set(e, j), Ie(j, n);
      } else
        gr(e), I();
    }
  }
}
function gr(e) {
  const t = Bs.get(e);
  t && (t.flags |= 8, Bs.delete(e));
}
on().requestIdleCallback;
on().cancelIdleCallback;
const hs = (e) => !!e.type.__asyncLoader, Mi = (e) => e.type.__isKeepAlive;
function na(e, t) {
  Ci(e, "a", t);
}
function ra(e, t) {
  Ci(e, "da", t);
}
function Ci(e, t, n = we) {
  const r = e.__wdc || (e.__wdc = () => {
    let i = n;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return e();
  });
  if (cn(t, r, n), n) {
    let i = n.parent;
    for (; i && i.parent; )
      Mi(i.parent.vnode) && ia(r, t, n, i), i = i.parent;
  }
}
function ia(e, t, n, r) {
  const i = cn(
    t,
    e,
    r,
    !0
    /* prepend */
  );
  qi(() => {
    zn(r[t], i);
  }, n);
}
function cn(e, t, n = we, r = !1) {
  if (n) {
    const i = n[e] || (n[e] = []), u = t.__weh || (t.__weh = (...s) => {
      ft();
      const o = As(n), c = et(t, n, e, s);
      return o(), dt(), c;
    });
    return r ? i.unshift(u) : i.push(u), u;
  }
}
const pt = (e) => (t, n = we) => {
  (!$s || e === "sp") && cn(e, (...r) => t(...r), n);
}, oa = pt("bm"), ir = pt("m"), aa = pt(
  "bu"
), la = pt("u"), or = pt(
  "bum"
), qi = pt("um"), ua = pt(
  "sp"
), ca = pt("rtg"), fa = pt("rtc");
function da(e, t = we) {
  cn("ec", e, t);
}
const pa = "components";
function ma(e, t) {
  return ya(pa, e, !0, t) || e;
}
const ha = Symbol.for("v-ndc");
function ya(e, t, n = !0, r = !1) {
  const i = Ce || we;
  if (i) {
    const u = i.type;
    {
      const o = il(
        u,
        !1
      );
      if (o && (o === t || o === He(t) || o === rn(He(t))))
        return u;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      wr(i[e] || u[e], t) || // global registration
      wr(i.appContext[e], t)
    );
    return !s && r ? u : s;
  }
}
function wr(e, t) {
  return e && (e[t] || e[He(t)] || e[rn(He(t))]);
}
function gt(e, t, n, r) {
  let i;
  const u = n, s = F(e);
  if (s || ue(e)) {
    const o = s && Bt(e);
    let c = !1, a = !1;
    o && (c = !Fe(e), a = bt(e), e = ln(e)), i = new Array(e.length);
    for (let l = 0, f = e.length; l < f; l++)
      i[l] = t(
        c ? a ? Ls(me(e[l])) : me(e[l]) : e[l],
        l,
        void 0,
        u
      );
  } else if (typeof e == "number") {
    i = new Array(e);
    for (let o = 0; o < e; o++)
      i[o] = t(o + 1, o, void 0, u);
  } else if (te(e))
    if (e[Symbol.iterator])
      i = Array.from(
        e,
        (o, c) => t(o, c, void 0, u)
      );
    else {
      const o = Object.keys(e);
      i = new Array(o.length);
      for (let c = 0, a = o.length; c < a; c++) {
        const l = o[c];
        i[c] = t(e[l], l, c, u);
      }
    }
  else
    i = [];
  return i;
}
const Cn = (e) => e ? to(e) ? pn(e) : Cn(e.parent) : null, ys = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Se(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Cn(e.parent),
    $root: (e) => Cn(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Ni(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      nr(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = sr.bind(e.proxy)),
    $watch: (e) => Wa.bind(e)
  })
), bn = (e, t) => e !== Y && !e.__isScriptSetup && J(e, t), ga = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: r, data: i, props: u, accessCache: s, type: o, appContext: c } = e;
    let a;
    if (t[0] !== "$") {
      const d = s[t];
      if (d !== void 0)
        switch (d) {
          case 1:
            return r[t];
          case 2:
            return i[t];
          case 4:
            return n[t];
          case 3:
            return u[t];
        }
      else {
        if (bn(r, t))
          return s[t] = 1, r[t];
        if (i !== Y && J(i, t))
          return s[t] = 2, i[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (a = e.propsOptions[0]) && J(a, t)
        )
          return s[t] = 3, u[t];
        if (n !== Y && J(n, t))
          return s[t] = 4, n[t];
        qn && (s[t] = 0);
      }
    }
    const l = ys[t];
    let f, h;
    if (l)
      return t === "$attrs" && ge(e.attrs, "get", ""), l(e);
    if (
      // css module (injected by vue-loader)
      (f = o.__cssModules) && (f = f[t])
    )
      return f;
    if (n !== Y && J(n, t))
      return s[t] = 4, n[t];
    if (
      // global properties
      h = c.config.globalProperties, J(h, t)
    )
      return h[t];
  },
  set({ _: e }, t, n) {
    const { data: r, setupState: i, ctx: u } = e;
    return bn(i, t) ? (i[t] = n, !0) : r !== Y && J(r, t) ? (r[t] = n, !0) : J(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (u[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: i, propsOptions: u, type: s }
  }, o) {
    let c, a;
    return !!(n[o] || e !== Y && o[0] !== "$" && J(e, o) || bn(t, o) || (c = u[0]) && J(c, o) || J(r, o) || J(ys, o) || J(i.config.globalProperties, o) || (a = s.__cssModules) && a[o]);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : J(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function vr(e) {
  return F(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let qn = !0;
function wa(e) {
  const t = Ni(e), n = e.proxy, r = e.ctx;
  qn = !1, t.beforeCreate && br(t.beforeCreate, e, "bc");
  const {
    // state
    data: i,
    computed: u,
    methods: s,
    watch: o,
    provide: c,
    inject: a,
    // lifecycle
    created: l,
    beforeMount: f,
    mounted: h,
    beforeUpdate: d,
    updated: m,
    activated: g,
    deactivated: I,
    beforeDestroy: j,
    beforeUnmount: O,
    destroyed: M,
    unmounted: R,
    render: Z,
    renderTracked: he,
    renderTriggered: be,
    errorCaptured: Pe,
    serverPrefetch: mt,
    // public API
    expose: ne,
    inheritAttrs: Le,
    // assets
    components: Be,
    directives: $t,
    filters: St
  } = t;
  if (a && va(a, r, null), s)
    for (const ee in s) {
      const X = s[ee];
      L(X) && (r[ee] = X.bind(n));
    }
  if (i) {
    const ee = i.call(n, n);
    te(ee) && (e.data = Qn(ee));
  }
  if (qn = !0, u)
    for (const ee in u) {
      const X = u[ee], tt = L(X) ? X.bind(n, n) : L(X.get) ? X.get.bind(n, n) : Ze, xt = !L(X) && L(X.set) ? X.set.bind(n) : Ze, Ve = De({
        get: tt,
        set: xt
      });
      Object.defineProperty(r, ee, {
        enumerable: !0,
        configurable: !0,
        get: () => Ve.value,
        set: (Ee) => Ve.value = Ee
      });
    }
  if (o)
    for (const ee in o)
      Oi(o[ee], r, n, ee);
  if (c) {
    const ee = L(c) ? c.call(n) : c;
    Reflect.ownKeys(ee).forEach((X) => {
      xa(X, ee[X]);
    });
  }
  l && br(l, e, "c");
  function fe(ee, X) {
    F(X) ? X.forEach((tt) => ee(tt.bind(n))) : X && ee(X.bind(n));
  }
  if (fe(oa, f), fe(ir, h), fe(aa, d), fe(la, m), fe(na, g), fe(ra, I), fe(da, Pe), fe(fa, he), fe(ca, be), fe(or, O), fe(qi, R), fe(ua, mt), F(ne))
    if (ne.length) {
      const ee = e.exposed || (e.exposed = {});
      ne.forEach((X) => {
        Object.defineProperty(ee, X, {
          get: () => n[X],
          set: (tt) => n[X] = tt,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  Z && e.render === Ze && (e.render = Z), Le != null && (e.inheritAttrs = Le), Be && (e.components = Be), $t && (e.directives = $t), mt && Ti(e);
}
function va(e, t, n = Ze) {
  F(e) && (e = On(e));
  for (const r in e) {
    const i = e[r];
    let u;
    te(i) ? "default" in i ? u = Ws(
      i.from || r,
      i.default,
      !0
    ) : u = Ws(i.from || r) : u = Ws(i), ve(u) ? Object.defineProperty(t, r, {
      enumerable: !0,
      configurable: !0,
      get: () => u.value,
      set: (s) => u.value = s
    }) : t[r] = u;
  }
}
function br(e, t, n) {
  et(
    F(e) ? e.map((r) => r.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function Oi(e, t, n, r) {
  let i = r.includes(".") ? Gi(n, r) : () => n[r];
  if (ue(e)) {
    const u = t[e];
    L(u) && gs(i, u);
  } else if (L(e))
    gs(i, e.bind(n));
  else if (te(e))
    if (F(e))
      e.forEach((u) => Oi(u, t, n, r));
    else {
      const u = L(e.handler) ? e.handler.bind(n) : t[e.handler];
      L(u) && gs(i, u, e);
    }
}
function Ni(e) {
  const t = e.type, { mixins: n, extends: r } = t, {
    mixins: i,
    optionsCache: u,
    config: { optionMergeStrategies: s }
  } = e.appContext, o = u.get(t);
  let c;
  return o ? c = o : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach(
    (a) => Ks(c, a, s, !0)
  ), Ks(c, t, s)), te(t) && u.set(t, c), c;
}
function Ks(e, t, n, r = !1) {
  const { mixins: i, extends: u } = t;
  u && Ks(e, u, n, !0), i && i.forEach(
    (s) => Ks(e, s, n, !0)
  );
  for (const s in t)
    if (!(r && s === "expose")) {
      const o = ba[s] || n && n[s];
      e[s] = o ? o(e[s], t[s]) : t[s];
    }
  return e;
}
const ba = {
  data: Pr,
  props: kr,
  emits: kr,
  // objects
  methods: ls,
  computed: ls,
  // lifecycle
  beforeCreate: ke,
  created: ke,
  beforeMount: ke,
  mounted: ke,
  beforeUpdate: ke,
  updated: ke,
  beforeDestroy: ke,
  beforeUnmount: ke,
  destroyed: ke,
  unmounted: ke,
  activated: ke,
  deactivated: ke,
  errorCaptured: ke,
  serverPrefetch: ke,
  // assets
  components: ls,
  directives: ls,
  // watch
  watch: ka,
  // provide / inject
  provide: Pr,
  inject: Pa
};
function Pr(e, t) {
  return t ? e ? function() {
    return Se(
      L(e) ? e.call(this, this) : e,
      L(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Pa(e, t) {
  return ls(On(e), On(t));
}
function On(e) {
  if (F(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function ke(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function ls(e, t) {
  return e ? Se(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function kr(e, t) {
  return e ? F(e) && F(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Se(
    /* @__PURE__ */ Object.create(null),
    vr(e),
    vr(t ?? {})
  ) : t;
}
function ka(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Se(/* @__PURE__ */ Object.create(null), e);
  for (const r in t)
    n[r] = ke(e[r], t[r]);
  return n;
}
function Ri() {
  return {
    app: null,
    config: {
      isNativeTag: ti,
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
let $a = 0;
function Sa(e, t) {
  return function(r, i = null) {
    L(r) || (r = Se({}, r)), i != null && !te(i) && (i = null);
    const u = Ri(), s = /* @__PURE__ */ new WeakSet(), o = [];
    let c = !1;
    const a = u.app = {
      _uid: $a++,
      _component: r,
      _props: i,
      _container: null,
      _context: u,
      _instance: null,
      version: al,
      get config() {
        return u.config;
      },
      set config(l) {
      },
      use(l, ...f) {
        return s.has(l) || (l && L(l.install) ? (s.add(l), l.install(a, ...f)) : L(l) && (s.add(l), l(a, ...f))), a;
      },
      mixin(l) {
        return u.mixins.includes(l) || u.mixins.push(l), a;
      },
      component(l, f) {
        return f ? (u.components[l] = f, a) : u.components[l];
      },
      directive(l, f) {
        return f ? (u.directives[l] = f, a) : u.directives[l];
      },
      mount(l, f, h) {
        if (!c) {
          const d = a._ceVNode || Ye(r, i);
          return d.appContext = u, h === !0 ? h = "svg" : h === !1 && (h = void 0), e(d, l, h), c = !0, a._container = l, l.__vue_app__ = a, pn(d.component);
        }
      },
      onUnmount(l) {
        o.push(l);
      },
      unmount() {
        c && (et(
          o,
          a._instance,
          16
        ), e(null, a._container), delete a._container.__vue_app__);
      },
      provide(l, f) {
        return u.provides[l] = f, a;
      },
      runWithContext(l) {
        const f = Jt;
        Jt = a;
        try {
          return l();
        } finally {
          Jt = f;
        }
      }
    };
    return a;
  };
}
let Jt = null;
function xa(e, t) {
  if (we) {
    let n = we.provides;
    const r = we.parent && we.parent.provides;
    r === n && (n = we.provides = Object.create(r)), n[e] = t;
  }
}
function Ws(e, t, n = !1) {
  const r = el();
  if (r || Jt) {
    let i = Jt ? Jt._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
    if (i && e in i)
      return i[e];
    if (arguments.length > 1)
      return n && L(t) ? t.call(r && r.proxy) : t;
  }
}
const Wi = {}, Di = () => Object.create(Wi), Fi = (e) => Object.getPrototypeOf(e) === Wi;
function _a(e, t, n, r = !1) {
  const i = {}, u = Di();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Hi(e, t, i, u);
  for (const s in e.propsOptions[0])
    s in i || (i[s] = void 0);
  n ? e.props = r ? i : Ho(i) : e.type.props ? e.props = i : e.props = u, e.attrs = u;
}
function ja(e, t, n, r) {
  const {
    props: i,
    attrs: u,
    vnode: { patchFlag: s }
  } = e, o = K(i), [c] = e.propsOptions;
  let a = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (r || s > 0) && !(s & 16)
  ) {
    if (s & 8) {
      const l = e.vnode.dynamicProps;
      for (let f = 0; f < l.length; f++) {
        let h = l[f];
        if (fn(e.emitsOptions, h))
          continue;
        const d = t[h];
        if (c)
          if (J(u, h))
            d !== u[h] && (u[h] = d, a = !0);
          else {
            const m = He(h);
            i[m] = Nn(
              c,
              o,
              m,
              d,
              e,
              !1
            );
          }
        else
          d !== u[h] && (u[h] = d, a = !0);
      }
    }
  } else {
    Hi(e, t, i, u) && (a = !0);
    let l;
    for (const f in o)
      (!t || // for camelCase
      !J(t, f) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((l = kt(f)) === f || !J(t, l))) && (c ? n && // for camelCase
      (n[f] !== void 0 || // for kebab-case
      n[l] !== void 0) && (i[f] = Nn(
        c,
        o,
        f,
        void 0,
        e,
        !0
      )) : delete i[f]);
    if (u !== o)
      for (const f in u)
        (!t || !J(t, f)) && (delete u[f], a = !0);
  }
  a && ot(e.attrs, "set", "");
}
function Hi(e, t, n, r) {
  const [i, u] = e.propsOptions;
  let s = !1, o;
  if (t)
    for (let c in t) {
      if (fs(c))
        continue;
      const a = t[c];
      let l;
      i && J(i, l = He(c)) ? !u || !u.includes(l) ? n[l] = a : (o || (o = {}))[l] = a : fn(e.emitsOptions, c) || (!(c in r) || a !== r[c]) && (r[c] = a, s = !0);
    }
  if (u) {
    const c = K(n), a = o || Y;
    for (let l = 0; l < u.length; l++) {
      const f = u[l];
      n[f] = Nn(
        i,
        c,
        f,
        a[f],
        e,
        !J(a, f)
      );
    }
  }
  return s;
}
function Nn(e, t, n, r, i, u) {
  const s = e[n];
  if (s != null) {
    const o = J(s, "default");
    if (o && r === void 0) {
      const c = s.default;
      if (s.type !== Function && !s.skipFactory && L(c)) {
        const { propsDefaults: a } = i;
        if (n in a)
          r = a[n];
        else {
          const l = As(i);
          r = a[n] = c.call(
            null,
            t
          ), l();
        }
      } else
        r = c;
      i.ce && i.ce._setProp(n, r);
    }
    s[
      0
      /* shouldCast */
    ] && (u && !o ? r = !1 : s[
      1
      /* shouldCastTrue */
    ] && (r === "" || r === kt(n)) && (r = !0));
  }
  return r;
}
const Ea = /* @__PURE__ */ new WeakMap();
function Li(e, t, n = !1) {
  const r = n ? Ea : t.propsCache, i = r.get(e);
  if (i)
    return i;
  const u = e.props, s = {}, o = [];
  let c = !1;
  if (!L(e)) {
    const l = (f) => {
      c = !0;
      const [h, d] = Li(f, t, !0);
      Se(s, h), d && o.push(...d);
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  if (!u && !c)
    return te(e) && r.set(e, Ut), Ut;
  if (F(u))
    for (let l = 0; l < u.length; l++) {
      const f = He(u[l]);
      $r(f) && (s[f] = Y);
    }
  else if (u)
    for (const l in u) {
      const f = He(l);
      if ($r(f)) {
        const h = u[l], d = s[f] = F(h) || L(h) ? { type: h } : Se({}, h), m = d.type;
        let g = !1, I = !0;
        if (F(m))
          for (let j = 0; j < m.length; ++j) {
            const O = m[j], M = L(O) && O.name;
            if (M === "Boolean") {
              g = !0;
              break;
            } else M === "String" && (I = !1);
          }
        else
          g = L(m) && m.name === "Boolean";
        d[
          0
          /* shouldCast */
        ] = g, d[
          1
          /* shouldCastTrue */
        ] = I, (g || J(d, "default")) && o.push(f);
      }
    }
  const a = [s, o];
  return te(e) && r.set(e, a), a;
}
function $r(e) {
  return e[0] !== "$" && !fs(e);
}
const ar = (e) => e === "_" || e === "_ctx" || e === "$stable", lr = (e) => F(e) ? e.map(Xe) : [Xe(e)], Aa = (e, t, n) => {
  if (t._n)
    return t;
  const r = Qo((...i) => lr(t(...i)), n);
  return r._c = !1, r;
}, Vi = (e, t, n) => {
  const r = e._ctx;
  for (const i in e) {
    if (ar(i)) continue;
    const u = e[i];
    if (L(u))
      t[i] = Aa(i, u, r);
    else if (u != null) {
      const s = lr(u);
      t[i] = () => s;
    }
  }
}, Ui = (e, t) => {
  const n = lr(t);
  e.slots.default = () => n;
}, zi = (e, t, n) => {
  for (const r in t)
    (n || !ar(r)) && (e[r] = t[r]);
}, Ia = (e, t, n) => {
  const r = e.slots = Di();
  if (e.vnode.shapeFlag & 32) {
    const i = t._;
    i ? (zi(r, t, n), n && ii(r, "_", i, !0)) : Vi(t, r);
  } else t && Ui(e, t);
}, Ta = (e, t, n) => {
  const { vnode: r, slots: i } = e;
  let u = !0, s = Y;
  if (r.shapeFlag & 32) {
    const o = t._;
    o ? n && o === 1 ? u = !1 : zi(i, t, n) : (u = !t.$stable, Vi(t, i)), s = t;
  } else t && (Ui(e, t), s = { default: 1 });
  if (u)
    for (const o in i)
      !ar(o) && s[o] == null && delete i[o];
}, Ie = Ba;
function Ma(e) {
  return Ca(e);
}
function Ca(e, t) {
  const n = on();
  n.__VUE__ = !0;
  const {
    insert: r,
    remove: i,
    patchProp: u,
    createElement: s,
    createText: o,
    createComment: c,
    setText: a,
    setElementText: l,
    parentNode: f,
    nextSibling: h,
    setScopeId: d = Ze,
    insertStaticContent: m
  } = e, g = (p, y, b, S = null, k = null, x = null, T = void 0, A = null, E = !!y.dynamicChildren) => {
    if (p === y)
      return;
    p && !is(p, y) && (S = Ft(p), Ee(p, k, x, !0), p = null), y.patchFlag === -2 && (E = !1, y.dynamicChildren = null);
    const { type: $, ref: q, shapeFlag: C } = y;
    switch ($) {
      case dn:
        I(p, y, b, S);
        break;
      case Pt:
        j(p, y, b, S);
        break;
      case kn:
        p == null && O(y, b, S, T);
        break;
      case ie:
        Be(
          p,
          y,
          b,
          S,
          k,
          x,
          T,
          A,
          E
        );
        break;
      default:
        C & 1 ? Z(
          p,
          y,
          b,
          S,
          k,
          x,
          T,
          A,
          E
        ) : C & 6 ? $t(
          p,
          y,
          b,
          S,
          k,
          x,
          T,
          A,
          E
        ) : (C & 64 || C & 128) && $.process(
          p,
          y,
          b,
          S,
          k,
          x,
          T,
          A,
          E,
          Ke
        );
    }
    q != null && k ? ms(q, p && p.ref, x, y || p, !y) : q == null && p && p.ref != null && ms(p.ref, null, x, p, !0);
  }, I = (p, y, b, S) => {
    if (p == null)
      r(
        y.el = o(y.children),
        b,
        S
      );
    else {
      const k = y.el = p.el;
      y.children !== p.children && a(k, y.children);
    }
  }, j = (p, y, b, S) => {
    p == null ? r(
      y.el = c(y.children || ""),
      b,
      S
    ) : y.el = p.el;
  }, O = (p, y, b, S) => {
    [p.el, p.anchor] = m(
      p.children,
      y,
      b,
      S,
      p.el,
      p.anchor
    );
  }, M = ({ el: p, anchor: y }, b, S) => {
    let k;
    for (; p && p !== y; )
      k = h(p), r(p, b, S), p = k;
    r(y, b, S);
  }, R = ({ el: p, anchor: y }) => {
    let b;
    for (; p && p !== y; )
      b = h(p), i(p), p = b;
    i(y);
  }, Z = (p, y, b, S, k, x, T, A, E) => {
    y.type === "svg" ? T = "svg" : y.type === "math" && (T = "mathml"), p == null ? he(
      y,
      b,
      S,
      k,
      x,
      T,
      A,
      E
    ) : mt(
      p,
      y,
      k,
      x,
      T,
      A,
      E
    );
  }, he = (p, y, b, S, k, x, T, A) => {
    let E, $;
    const { props: q, shapeFlag: C, transition: N, dirs: D } = p;
    if (E = p.el = s(
      p.type,
      x,
      q && q.is,
      q
    ), C & 8 ? l(E, p.children) : C & 16 && Pe(
      p.children,
      E,
      null,
      S,
      k,
      Pn(p, x),
      T,
      A
    ), D && It(p, null, S, "created"), be(E, p, p.scopeId, T, S), q) {
      for (const z in q)
        z !== "value" && !fs(z) && u(E, z, null, q[z], x, S);
      "value" in q && u(E, "value", null, q.value, x), ($ = q.onVnodeBeforeMount) && Je($, S, p);
    }
    D && It(p, null, S, "beforeMount");
    const U = qa(k, N);
    U && N.beforeEnter(E), r(E, y, b), (($ = q && q.onVnodeMounted) || U || D) && Ie(() => {
      $ && Je($, S, p), U && N.enter(E), D && It(p, null, S, "mounted");
    }, k);
  }, be = (p, y, b, S, k) => {
    if (b && d(p, b), S)
      for (let x = 0; x < S.length; x++)
        d(p, S[x]);
    if (k) {
      let x = k.subTree;
      if (y === x || Zi(x.type) && (x.ssContent === y || x.ssFallback === y)) {
        const T = k.vnode;
        be(
          p,
          T,
          T.scopeId,
          T.slotScopeIds,
          k.parent
        );
      }
    }
  }, Pe = (p, y, b, S, k, x, T, A, E = 0) => {
    for (let $ = E; $ < p.length; $++) {
      const q = p[$] = A ? wt(p[$]) : Xe(p[$]);
      g(
        null,
        q,
        y,
        b,
        S,
        k,
        x,
        T,
        A
      );
    }
  }, mt = (p, y, b, S, k, x, T) => {
    const A = y.el = p.el;
    let { patchFlag: E, dynamicChildren: $, dirs: q } = y;
    E |= p.patchFlag & 16;
    const C = p.props || Y, N = y.props || Y;
    let D;
    if (b && Tt(b, !1), (D = N.onVnodeBeforeUpdate) && Je(D, b, y, p), q && It(y, p, b, "beforeUpdate"), b && Tt(b, !0), (C.innerHTML && N.innerHTML == null || C.textContent && N.textContent == null) && l(A, ""), $ ? ne(
      p.dynamicChildren,
      $,
      A,
      b,
      S,
      Pn(y, k),
      x
    ) : T || X(
      p,
      y,
      A,
      null,
      b,
      S,
      Pn(y, k),
      x,
      !1
    ), E > 0) {
      if (E & 16)
        Le(A, C, N, b, k);
      else if (E & 2 && C.class !== N.class && u(A, "class", null, N.class, k), E & 4 && u(A, "style", C.style, N.style, k), E & 8) {
        const U = y.dynamicProps;
        for (let z = 0; z < U.length; z++) {
          const B = U[z], de = C[B], pe = N[B];
          (pe !== de || B === "value") && u(A, B, de, pe, k, b);
        }
      }
      E & 1 && p.children !== y.children && l(A, y.children);
    } else !T && $ == null && Le(A, C, N, b, k);
    ((D = N.onVnodeUpdated) || q) && Ie(() => {
      D && Je(D, b, y, p), q && It(y, p, b, "updated");
    }, S);
  }, ne = (p, y, b, S, k, x, T) => {
    for (let A = 0; A < y.length; A++) {
      const E = p[A], $ = y[A], q = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        E.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (E.type === ie || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !is(E, $) || // - In the case of a component, it could contain anything.
        E.shapeFlag & 198) ? f(E.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          b
        )
      );
      g(
        E,
        $,
        q,
        null,
        S,
        k,
        x,
        T,
        !0
      );
    }
  }, Le = (p, y, b, S, k) => {
    if (y !== b) {
      if (y !== Y)
        for (const x in y)
          !fs(x) && !(x in b) && u(
            p,
            x,
            y[x],
            null,
            k,
            S
          );
      for (const x in b) {
        if (fs(x)) continue;
        const T = b[x], A = y[x];
        T !== A && x !== "value" && u(p, x, A, T, k, S);
      }
      "value" in b && u(p, "value", y.value, b.value, k);
    }
  }, Be = (p, y, b, S, k, x, T, A, E) => {
    const $ = y.el = p ? p.el : o(""), q = y.anchor = p ? p.anchor : o("");
    let { patchFlag: C, dynamicChildren: N, slotScopeIds: D } = y;
    D && (A = A ? A.concat(D) : D), p == null ? (r($, b, S), r(q, b, S), Pe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      y.children || [],
      b,
      q,
      k,
      x,
      T,
      A,
      E
    )) : C > 0 && C & 64 && N && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    p.dynamicChildren ? (ne(
      p.dynamicChildren,
      N,
      b,
      k,
      x,
      T,
      A
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (y.key != null || k && y === k.subTree) && Bi(
      p,
      y,
      !0
      /* shallow */
    )) : X(
      p,
      y,
      b,
      q,
      k,
      x,
      T,
      A,
      E
    );
  }, $t = (p, y, b, S, k, x, T, A, E) => {
    y.slotScopeIds = A, p == null ? y.shapeFlag & 512 ? k.ctx.activate(
      y,
      b,
      S,
      T,
      E
    ) : St(
      y,
      b,
      S,
      k,
      x,
      T,
      E
    ) : Oe(p, y, E);
  }, St = (p, y, b, S, k, x, T) => {
    const A = p.component = Qa(
      p,
      S,
      k
    );
    if (Mi(p) && (A.ctx.renderer = Ke), tl(A, !1, T), A.asyncDep) {
      if (k && k.registerDep(A, fe, T), !p.el) {
        const E = A.subTree = Ye(Pt);
        j(null, E, y, b), p.placeholder = E.el;
      }
    } else
      fe(
        A,
        p,
        y,
        b,
        k,
        x,
        T
      );
  }, Oe = (p, y, b) => {
    const S = y.component = p.component;
    if (Ua(p, y, b))
      if (S.asyncDep && !S.asyncResolved) {
        ee(S, y, b);
        return;
      } else
        S.next = y, S.update();
    else
      y.el = p.el, S.vnode = y;
  }, fe = (p, y, b, S, k, x, T) => {
    const A = () => {
      if (p.isMounted) {
        let { next: C, bu: N, u: D, parent: U, vnode: z } = p;
        {
          const Re = Ki(p);
          if (Re) {
            C && (C.el = z.el, ee(p, C, T)), Re.asyncDep.then(() => {
              p.isUnmounted || A();
            });
            return;
          }
        }
        let B = C, de;
        Tt(p, !1), C ? (C.el = z.el, ee(p, C, T)) : C = z, N && Rs(N), (de = C.props && C.props.onVnodeBeforeUpdate) && Je(de, U, C, z), Tt(p, !0);
        const pe = xr(p), Ne = p.subTree;
        p.subTree = pe, g(
          Ne,
          pe,
          // parent may have changed if it's in a teleport
          f(Ne.el),
          // anchor may have changed if it's in a fragment
          Ft(Ne),
          p,
          k,
          x
        ), C.el = pe.el, B === null && za(p, pe.el), D && Ie(D, k), (de = C.props && C.props.onVnodeUpdated) && Ie(
          () => Je(de, U, C, z),
          k
        );
      } else {
        let C;
        const { el: N, props: D } = y, { bm: U, m: z, parent: B, root: de, type: pe } = p, Ne = hs(y);
        Tt(p, !1), U && Rs(U), !Ne && (C = D && D.onVnodeBeforeMount) && Je(C, B, y), Tt(p, !0);
        {
          de.ce && // @ts-expect-error _def is private
          de.ce._def.shadowRoot !== !1 && de.ce._injectChildStyle(pe);
          const Re = p.subTree = xr(p);
          g(
            null,
            Re,
            b,
            S,
            p,
            k,
            x
          ), y.el = Re.el;
        }
        if (z && Ie(z, k), !Ne && (C = D && D.onVnodeMounted)) {
          const Re = y;
          Ie(
            () => Je(C, B, Re),
            k
          );
        }
        (y.shapeFlag & 256 || B && hs(B.vnode) && B.vnode.shapeFlag & 256) && p.a && Ie(p.a, k), p.isMounted = !0, y = b = S = null;
      }
    };
    p.scope.on();
    const E = p.effect = new ui(A);
    p.scope.off();
    const $ = p.update = E.run.bind(E), q = p.job = E.runIfDirty.bind(E);
    q.i = p, q.id = p.uid, E.scheduler = () => nr(q), Tt(p, !0), $();
  }, ee = (p, y, b) => {
    y.component = p;
    const S = p.vnode.props;
    p.vnode = y, p.next = null, ja(p, y.props, S, b), Ta(p, y.children, b), ft(), yr(p), dt();
  }, X = (p, y, b, S, k, x, T, A, E = !1) => {
    const $ = p && p.children, q = p ? p.shapeFlag : 0, C = y.children, { patchFlag: N, shapeFlag: D } = y;
    if (N > 0) {
      if (N & 128) {
        xt(
          $,
          C,
          b,
          S,
          k,
          x,
          T,
          A,
          E
        );
        return;
      } else if (N & 256) {
        tt(
          $,
          C,
          b,
          S,
          k,
          x,
          T,
          A,
          E
        );
        return;
      }
    }
    D & 8 ? (q & 16 && jt($, k, x), C !== $ && l(b, C)) : q & 16 ? D & 16 ? xt(
      $,
      C,
      b,
      S,
      k,
      x,
      T,
      A,
      E
    ) : jt($, k, x, !0) : (q & 8 && l(b, ""), D & 16 && Pe(
      C,
      b,
      S,
      k,
      x,
      T,
      A,
      E
    ));
  }, tt = (p, y, b, S, k, x, T, A, E) => {
    p = p || Ut, y = y || Ut;
    const $ = p.length, q = y.length, C = Math.min($, q);
    let N;
    for (N = 0; N < C; N++) {
      const D = y[N] = E ? wt(y[N]) : Xe(y[N]);
      g(
        p[N],
        D,
        b,
        null,
        k,
        x,
        T,
        A,
        E
      );
    }
    $ > q ? jt(
      p,
      k,
      x,
      !0,
      !1,
      C
    ) : Pe(
      y,
      b,
      S,
      k,
      x,
      T,
      A,
      E,
      C
    );
  }, xt = (p, y, b, S, k, x, T, A, E) => {
    let $ = 0;
    const q = y.length;
    let C = p.length - 1, N = q - 1;
    for (; $ <= C && $ <= N; ) {
      const D = p[$], U = y[$] = E ? wt(y[$]) : Xe(y[$]);
      if (is(D, U))
        g(
          D,
          U,
          b,
          null,
          k,
          x,
          T,
          A,
          E
        );
      else
        break;
      $++;
    }
    for (; $ <= C && $ <= N; ) {
      const D = p[C], U = y[N] = E ? wt(y[N]) : Xe(y[N]);
      if (is(D, U))
        g(
          D,
          U,
          b,
          null,
          k,
          x,
          T,
          A,
          E
        );
      else
        break;
      C--, N--;
    }
    if ($ > C) {
      if ($ <= N) {
        const D = N + 1, U = D < q ? y[D].el : S;
        for (; $ <= N; )
          g(
            null,
            y[$] = E ? wt(y[$]) : Xe(y[$]),
            b,
            U,
            k,
            x,
            T,
            A,
            E
          ), $++;
      }
    } else if ($ > N)
      for (; $ <= C; )
        Ee(p[$], k, x, !0), $++;
    else {
      const D = $, U = $, z = /* @__PURE__ */ new Map();
      for ($ = U; $ <= N; $++) {
        const ye = y[$] = E ? wt(y[$]) : Xe(y[$]);
        ye.key != null && z.set(ye.key, $);
      }
      let B, de = 0;
      const pe = N - U + 1;
      let Ne = !1, Re = 0;
      const Et = new Array(pe);
      for ($ = 0; $ < pe; $++) Et[$] = 0;
      for ($ = D; $ <= C; $++) {
        const ye = p[$];
        if (de >= pe) {
          Ee(ye, k, x, !0);
          continue;
        }
        let Ae;
        if (ye.key != null)
          Ae = z.get(ye.key);
        else
          for (B = U; B <= N; B++)
            if (Et[B - U] === 0 && is(ye, y[B])) {
              Ae = B;
              break;
            }
        Ae === void 0 ? Ee(ye, k, x, !0) : (Et[Ae - U] = $ + 1, Ae >= Re ? Re = Ae : Ne = !0, g(
          ye,
          y[Ae],
          b,
          null,
          k,
          x,
          T,
          A,
          E
        ), de++);
      }
      const At = Ne ? Oa(Et) : Ut;
      for (B = At.length - 1, $ = pe - 1; $ >= 0; $--) {
        const ye = U + $, Ae = y[ye], Ht = y[ye + 1], P = ye + 1 < q ? (
          // #13559, fallback to el placeholder for unresolved async component
          Ht.el || Ht.placeholder
        ) : S;
        Et[$] === 0 ? g(
          null,
          Ae,
          b,
          P,
          k,
          x,
          T,
          A,
          E
        ) : Ne && (B < 0 || $ !== At[B] ? Ve(Ae, b, P, 2) : B--);
      }
    }
  }, Ve = (p, y, b, S, k = null) => {
    const { el: x, type: T, transition: A, children: E, shapeFlag: $ } = p;
    if ($ & 6) {
      Ve(p.component.subTree, y, b, S);
      return;
    }
    if ($ & 128) {
      p.suspense.move(y, b, S);
      return;
    }
    if ($ & 64) {
      T.move(p, y, b, Ke);
      return;
    }
    if (T === ie) {
      r(x, y, b);
      for (let C = 0; C < E.length; C++)
        Ve(E[C], y, b, S);
      r(p.anchor, y, b);
      return;
    }
    if (T === kn) {
      M(p, y, b);
      return;
    }
    if (S !== 2 && $ & 1 && A)
      if (S === 0)
        A.beforeEnter(x), r(x, y, b), Ie(() => A.enter(x), k);
      else {
        const { leave: C, delayLeave: N, afterLeave: D } = A, U = () => {
          p.ctx.isUnmounted ? i(x) : r(x, y, b);
        }, z = () => {
          x._isLeaving && x[sa](
            !0
            /* cancelled */
          ), C(x, () => {
            U(), D && D();
          });
        };
        N ? N(x, U, z) : z();
      }
    else
      r(x, y, b);
  }, Ee = (p, y, b, S = !1, k = !1) => {
    const {
      type: x,
      props: T,
      ref: A,
      children: E,
      dynamicChildren: $,
      shapeFlag: q,
      patchFlag: C,
      dirs: N,
      cacheIndex: D
    } = p;
    if (C === -2 && (k = !1), A != null && (ft(), ms(A, null, b, p, !0), dt()), D != null && (y.renderCache[D] = void 0), q & 256) {
      y.ctx.deactivate(p);
      return;
    }
    const U = q & 1 && N, z = !hs(p);
    let B;
    if (z && (B = T && T.onVnodeBeforeUnmount) && Je(B, y, p), q & 6)
      Dt(p.component, b, S);
    else {
      if (q & 128) {
        p.suspense.unmount(b, S);
        return;
      }
      U && It(p, null, y, "beforeUnmount"), q & 64 ? p.type.remove(
        p,
        y,
        b,
        Ke,
        S
      ) : $ && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !$.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (x !== ie || C > 0 && C & 64) ? jt(
        $,
        y,
        b,
        !1,
        !0
      ) : (x === ie && C & 384 || !k && q & 16) && jt(E, y, b), S && _t(p);
    }
    (z && (B = T && T.onVnodeUnmounted) || U) && Ie(() => {
      B && Je(B, y, p), U && It(p, null, y, "unmounted");
    }, b);
  }, _t = (p) => {
    const { type: y, el: b, anchor: S, transition: k } = p;
    if (y === ie) {
      Is(b, S);
      return;
    }
    if (y === kn) {
      R(p);
      return;
    }
    const x = () => {
      i(b), k && !k.persisted && k.afterLeave && k.afterLeave();
    };
    if (p.shapeFlag & 1 && k && !k.persisted) {
      const { leave: T, delayLeave: A } = k, E = () => T(b, x);
      A ? A(p.el, x, E) : E();
    } else
      x();
  }, Is = (p, y) => {
    let b;
    for (; p !== y; )
      b = h(p), i(p), p = b;
    i(y);
  }, Dt = (p, y, b) => {
    const { bum: S, scope: k, job: x, subTree: T, um: A, m: E, a: $ } = p;
    Sr(E), Sr($), S && Rs(S), k.stop(), x && (x.flags |= 8, Ee(T, p, y, b)), A && Ie(A, y), Ie(() => {
      p.isUnmounted = !0;
    }, y);
  }, jt = (p, y, b, S = !1, k = !1, x = 0) => {
    for (let T = x; T < p.length; T++)
      Ee(p[T], y, b, S, k);
  }, Ft = (p) => {
    if (p.shapeFlag & 6)
      return Ft(p.component.subTree);
    if (p.shapeFlag & 128)
      return p.suspense.next();
    const y = h(p.anchor || p.el), b = y && y[ea];
    return b ? h(b) : y;
  };
  let ns = !1;
  const st = (p, y, b) => {
    p == null ? y._vnode && Ee(y._vnode, null, null, !0) : g(
      y._vnode || null,
      p,
      y,
      null,
      null,
      null,
      b
    ), y._vnode = p, ns || (ns = !0, yr(), Ei(), ns = !1);
  }, Ke = {
    p: g,
    um: Ee,
    m: Ve,
    r: _t,
    mt: St,
    mc: Pe,
    pc: X,
    pbc: ne,
    n: Ft,
    o: e
  };
  return {
    render: st,
    hydrate: void 0,
    createApp: Sa(st)
  };
}
function Pn({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Tt({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function qa(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Bi(e, t, n = !1) {
  const r = e.children, i = t.children;
  if (F(r) && F(i))
    for (let u = 0; u < r.length; u++) {
      const s = r[u];
      let o = i[u];
      o.shapeFlag & 1 && !o.dynamicChildren && ((o.patchFlag <= 0 || o.patchFlag === 32) && (o = i[u] = wt(i[u]), o.el = s.el), !n && o.patchFlag !== -2 && Bi(s, o)), o.type === dn && // avoid cached text nodes retaining detached dom nodes
      o.patchFlag !== -1 && (o.el = s.el), o.type === Pt && !o.el && (o.el = s.el);
    }
}
function Oa(e) {
  const t = e.slice(), n = [0];
  let r, i, u, s, o;
  const c = e.length;
  for (r = 0; r < c; r++) {
    const a = e[r];
    if (a !== 0) {
      if (i = n[n.length - 1], e[i] < a) {
        t[r] = i, n.push(r);
        continue;
      }
      for (u = 0, s = n.length - 1; u < s; )
        o = u + s >> 1, e[n[o]] < a ? u = o + 1 : s = o;
      a < e[n[u]] && (u > 0 && (t[r] = n[u - 1]), n[u] = r);
    }
  }
  for (u = n.length, s = n[u - 1]; u-- > 0; )
    n[u] = s, s = t[s];
  return n;
}
function Ki(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Ki(t);
}
function Sr(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Na = Symbol.for("v-scx"), Ra = () => Ws(Na);
function gs(e, t, n) {
  return Ji(e, t, n);
}
function Ji(e, t, n = Y) {
  const { immediate: r, deep: i, flush: u, once: s } = n, o = Se({}, n), c = t && r || !t && u !== "post";
  let a;
  if ($s) {
    if (u === "sync") {
      const d = Ra();
      a = d.__watcherHandles || (d.__watcherHandles = []);
    } else if (!c) {
      const d = () => {
      };
      return d.stop = Ze, d.resume = Ze, d.pause = Ze, d;
    }
  }
  const l = we;
  o.call = (d, m, g) => et(d, l, m, g);
  let f = !1;
  u === "post" ? o.scheduler = (d) => {
    Ie(d, l && l.suspense);
  } : u !== "sync" && (f = !0, o.scheduler = (d, m) => {
    m ? d() : nr(d);
  }), o.augmentJob = (d) => {
    t && (d.flags |= 4), f && (d.flags |= 2, l && (d.id = l.uid, d.i = l));
  };
  const h = Go(e, t, o);
  return $s && (a ? a.push(h) : c && h()), h;
}
function Wa(e, t, n) {
  const r = this.proxy, i = ue(e) ? e.includes(".") ? Gi(r, e) : () => r[e] : e.bind(r, r);
  let u;
  L(t) ? u = t : (u = t.handler, n = t);
  const s = As(this), o = Ji(i, u.bind(r), n);
  return s(), o;
}
function Gi(e, t) {
  const n = t.split(".");
  return () => {
    let r = e;
    for (let i = 0; i < n.length && r; i++)
      r = r[n[i]];
    return r;
  };
}
const Da = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${He(t)}Modifiers`] || e[`${kt(t)}Modifiers`];
function Fa(e, t, ...n) {
  if (e.isUnmounted) return;
  const r = e.vnode.props || Y;
  let i = n;
  const u = t.startsWith("update:"), s = u && Da(r, t.slice(7));
  s && (s.trim && (i = n.map((l) => ue(l) ? l.trim() : l)), s.number && (i = n.map(Hs)));
  let o, c = r[o = hn(t)] || // also try camelCase event handler (#2249)
  r[o = hn(He(t))];
  !c && u && (c = r[o = hn(kt(t))]), c && et(
    c,
    e,
    6,
    i
  );
  const a = r[o + "Once"];
  if (a) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[o])
      return;
    e.emitted[o] = !0, et(
      a,
      e,
      6,
      i
    );
  }
}
const Ha = /* @__PURE__ */ new WeakMap();
function Xi(e, t, n = !1) {
  const r = n ? Ha : t.emitsCache, i = r.get(e);
  if (i !== void 0)
    return i;
  const u = e.emits;
  let s = {}, o = !1;
  if (!L(e)) {
    const c = (a) => {
      const l = Xi(a, t, !0);
      l && (o = !0, Se(s, l));
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !u && !o ? (te(e) && r.set(e, null), null) : (F(u) ? u.forEach((c) => s[c] = null) : Se(s, u), te(e) && r.set(e, s), s);
}
function fn(e, t) {
  return !e || !tn(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), J(e, t[0].toLowerCase() + t.slice(1)) || J(e, kt(t)) || J(e, t));
}
function xr(e) {
  const {
    type: t,
    vnode: n,
    proxy: r,
    withProxy: i,
    propsOptions: [u],
    slots: s,
    attrs: o,
    emit: c,
    render: a,
    renderCache: l,
    props: f,
    data: h,
    setupState: d,
    ctx: m,
    inheritAttrs: g
  } = e, I = zs(e);
  let j, O;
  try {
    if (n.shapeFlag & 4) {
      const R = i || r, Z = R;
      j = Xe(
        a.call(
          Z,
          R,
          l,
          f,
          d,
          h,
          m
        )
      ), O = o;
    } else {
      const R = t;
      j = Xe(
        R.length > 1 ? R(
          f,
          { attrs: o, slots: s, emit: c }
        ) : R(
          f,
          null
        )
      ), O = t.props ? o : La(o);
    }
  } catch (R) {
    ws.length = 0, un(R, e, 1), j = Ye(Pt);
  }
  let M = j;
  if (O && g !== !1) {
    const R = Object.keys(O), { shapeFlag: Z } = M;
    R.length && Z & 7 && (u && R.some(Un) && (O = Va(
      O,
      u
    )), M = ss(M, O, !1, !0));
  }
  return n.dirs && (M = ss(M, null, !1, !0), M.dirs = M.dirs ? M.dirs.concat(n.dirs) : n.dirs), n.transition && rr(M, n.transition), j = M, zs(I), j;
}
const La = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || tn(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Va = (e, t) => {
  const n = {};
  for (const r in e)
    (!Un(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
  return n;
};
function Ua(e, t, n) {
  const { props: r, children: i, component: u } = e, { props: s, children: o, patchFlag: c } = t, a = u.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return r ? _r(r, s, a) : !!s;
    if (c & 8) {
      const l = t.dynamicProps;
      for (let f = 0; f < l.length; f++) {
        const h = l[f];
        if (s[h] !== r[h] && !fn(a, h))
          return !0;
      }
    }
  } else
    return (i || o) && (!o || !o.$stable) ? !0 : r === s ? !1 : r ? s ? _r(r, s, a) : !0 : !!s;
  return !1;
}
function _r(e, t, n) {
  const r = Object.keys(t);
  if (r.length !== Object.keys(e).length)
    return !0;
  for (let i = 0; i < r.length; i++) {
    const u = r[i];
    if (t[u] !== e[u] && !fn(n, u))
      return !0;
  }
  return !1;
}
function za({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const r = t.subTree;
    if (r.suspense && r.suspense.activeBranch === e && (r.el = e.el), r === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Zi = (e) => e.__isSuspense;
function Ba(e, t) {
  t && t.pendingBranch ? F(e) ? t.effects.push(...e) : t.effects.push(e) : Yo(e);
}
const ie = Symbol.for("v-fgt"), dn = Symbol.for("v-txt"), Pt = Symbol.for("v-cmt"), kn = Symbol.for("v-stc"), ws = [];
let qe = null;
function W(e = !1) {
  ws.push(qe = e ? null : []);
}
function Ka() {
  ws.pop(), qe = ws[ws.length - 1] || null;
}
let ks = 1;
function jr(e, t = !1) {
  ks += e, e < 0 && qe && t && (qe.hasOnce = !0);
}
function Yi(e) {
  return e.dynamicChildren = ks > 0 ? qe || Ut : null, Ka(), ks > 0 && qe && qe.push(e), e;
}
function H(e, t, n, r, i, u) {
  return Yi(
    w(
      e,
      t,
      n,
      r,
      i,
      u,
      !0
    )
  );
}
function Js(e, t, n, r, i) {
  return Yi(
    Ye(
      e,
      t,
      n,
      r,
      i,
      !0
    )
  );
}
function Qi(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function is(e, t) {
  return e.type === t.type && e.key === t.key;
}
const eo = ({ key: e }) => e ?? null, Ds = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? ue(e) || ve(e) || L(e) ? { i: Ce, r: e, k: t, f: !!n } : e : null);
function w(e, t = null, n = null, r = 0, i = null, u = e === ie ? 0 : 1, s = !1, o = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && eo(t),
    ref: t && Ds(t),
    scopeId: Ii,
    slotScopeIds: null,
    children: n,
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
    patchFlag: r,
    dynamicProps: i,
    dynamicChildren: null,
    appContext: null,
    ctx: Ce
  };
  return o ? (ur(c, n), u & 128 && e.normalize(c)) : n && (c.shapeFlag |= ue(n) ? 8 : 16), ks > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  qe && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || u & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && qe.push(c), c;
}
const Ye = Ja;
function Ja(e, t = null, n = null, r = 0, i = null, u = !1) {
  if ((!e || e === ha) && (e = Pt), Qi(e)) {
    const o = ss(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && ur(o, n), ks > 0 && !u && qe && (o.shapeFlag & 6 ? qe[qe.indexOf(e)] = o : qe.push(o)), o.patchFlag = -2, o;
  }
  if (ol(e) && (e = e.__vccOpts), t) {
    t = Ga(t);
    let { class: o, style: c } = t;
    o && !ue(o) && (t.class = je(o)), te(c) && (tr(c) && !F(c) && (c = Se({}, c)), t.style = Kn(c));
  }
  const s = ue(e) ? 1 : Zi(e) ? 128 : ta(e) ? 64 : te(e) ? 4 : L(e) ? 2 : 0;
  return w(
    e,
    t,
    n,
    r,
    i,
    s,
    u,
    !0
  );
}
function Ga(e) {
  return e ? tr(e) || Fi(e) ? Se({}, e) : e : null;
}
function ss(e, t, n = !1, r = !1) {
  const { props: i, ref: u, patchFlag: s, children: o, transition: c } = e, a = t ? Xa(i || {}, t) : i, l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: a,
    key: a && eo(a),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && u ? F(u) ? u.concat(Ds(t)) : [u, Ds(t)] : Ds(t)
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
    patchFlag: t && e.type !== ie ? s === -1 ? 16 : s | 16 : s,
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
    ssContent: e.ssContent && ss(e.ssContent),
    ssFallback: e.ssFallback && ss(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return c && r && rr(
    l,
    c.clone(l)
  ), l;
}
function ae(e = " ", t = 0) {
  return Ye(dn, null, e, t);
}
function We(e = "", t = !1) {
  return t ? (W(), Js(Pt, null, e)) : Ye(Pt, null, e);
}
function Xe(e) {
  return e == null || typeof e == "boolean" ? Ye(Pt) : F(e) ? Ye(
    ie,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Qi(e) ? wt(e) : Ye(dn, null, String(e));
}
function wt(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ss(e);
}
function ur(e, t) {
  let n = 0;
  const { shapeFlag: r } = e;
  if (t == null)
    t = null;
  else if (F(t))
    n = 16;
  else if (typeof t == "object")
    if (r & 65) {
      const i = t.default;
      i && (i._c && (i._d = !1), ur(e, i()), i._c && (i._d = !0));
      return;
    } else {
      n = 32;
      const i = t._;
      !i && !Fi(t) ? t._ctx = Ce : i === 3 && Ce && (Ce.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else L(t) ? (t = { default: t, _ctx: Ce }, n = 32) : (t = String(t), r & 64 ? (n = 16, t = [ae(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Xa(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    for (const i in r)
      if (i === "class")
        t.class !== r.class && (t.class = je([t.class, r.class]));
      else if (i === "style")
        t.style = Kn([t.style, r.style]);
      else if (tn(i)) {
        const u = t[i], s = r[i];
        s && u !== s && !(F(u) && u.includes(s)) && (t[i] = u ? [].concat(u, s) : s);
      } else i !== "" && (t[i] = r[i]);
  }
  return t;
}
function Je(e, t, n, r = null) {
  et(e, t, 7, [
    n,
    r
  ]);
}
const Za = Ri();
let Ya = 0;
function Qa(e, t, n) {
  const r = e.type, i = (t ? t.appContext : e.appContext) || Za, u = {
    uid: Ya++,
    vnode: e,
    type: r,
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
    scope: new Po(
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
    propsOptions: Li(r, i),
    emitsOptions: Xi(r, i),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Y,
    // inheritAttrs
    inheritAttrs: r.inheritAttrs,
    // state
    ctx: Y,
    data: Y,
    props: Y,
    attrs: Y,
    slots: Y,
    refs: Y,
    setupState: Y,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
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
  return u.ctx = { _: u }, u.root = t ? t.root : u, u.emit = Fa.bind(null, u), e.ce && e.ce(u), u;
}
let we = null;
const el = () => we || Ce;
let Gs, Rn;
{
  const e = on(), t = (n, r) => {
    let i;
    return (i = e[n]) || (i = e[n] = []), i.push(r), (u) => {
      i.length > 1 ? i.forEach((s) => s(u)) : i[0](u);
    };
  };
  Gs = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => we = n
  ), Rn = t(
    "__VUE_SSR_SETTERS__",
    (n) => $s = n
  );
}
const As = (e) => {
  const t = we;
  return Gs(e), e.scope.on(), () => {
    e.scope.off(), Gs(t);
  };
}, Er = () => {
  we && we.scope.off(), Gs(null);
};
function to(e) {
  return e.vnode.shapeFlag & 4;
}
let $s = !1;
function tl(e, t = !1, n = !1) {
  t && Rn(t);
  const { props: r, children: i } = e.vnode, u = to(e);
  _a(e, r, u, t), Ia(e, i, n || t);
  const s = u ? sl(e, t) : void 0;
  return t && Rn(!1), s;
}
function sl(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, ga);
  const { setup: r } = n;
  if (r) {
    ft();
    const i = e.setupContext = r.length > 1 ? rl(e) : null, u = As(e), s = Es(
      r,
      e,
      0,
      [
        e.props,
        i
      ]
    ), o = si(s);
    if (dt(), u(), (o || e.sp) && !hs(e) && Ti(e), o) {
      if (s.then(Er, Er), t)
        return s.then((c) => {
          Ar(e, c);
        }).catch((c) => {
          un(c, e, 0);
        });
      e.asyncDep = s;
    } else
      Ar(e, s);
  } else
    so(e);
}
function Ar(e, t, n) {
  L(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : te(t) && (e.setupState = xi(t)), so(e);
}
function so(e, t, n) {
  const r = e.type;
  e.render || (e.render = r.render || Ze);
  {
    const i = As(e);
    ft();
    try {
      wa(e);
    } finally {
      dt(), i();
    }
  }
}
const nl = {
  get(e, t) {
    return ge(e, "get", ""), e[t];
  }
};
function rl(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, nl),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function pn(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(xi(Lo(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in ys)
        return ys[n](e);
    },
    has(t, n) {
      return n in t || n in ys;
    }
  })) : e.proxy;
}
function il(e, t = !0) {
  return L(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function ol(e) {
  return L(e) && "__vccOpts" in e;
}
const De = (e, t) => Ko(e, t, $s), al = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Wn;
const Ir = typeof window < "u" && window.trustedTypes;
if (Ir)
  try {
    Wn = /* @__PURE__ */ Ir.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const no = Wn ? (e) => Wn.createHTML(e) : (e) => e, ll = "http://www.w3.org/2000/svg", ul = "http://www.w3.org/1998/Math/MathML", it = typeof document < "u" ? document : null, Tr = it && /* @__PURE__ */ it.createElement("template"), cl = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, r) => {
    const i = t === "svg" ? it.createElementNS(ll, e) : t === "mathml" ? it.createElementNS(ul, e) : n ? it.createElement(e, { is: n }) : it.createElement(e);
    return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
  },
  createText: (e) => it.createTextNode(e),
  createComment: (e) => it.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => it.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, r, i, u) {
    const s = n ? n.previousSibling : t.lastChild;
    if (i && (i === u || i.nextSibling))
      for (; t.insertBefore(i.cloneNode(!0), n), !(i === u || !(i = i.nextSibling)); )
        ;
    else {
      Tr.innerHTML = no(
        r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e
      );
      const o = Tr.content;
      if (r === "svg" || r === "mathml") {
        const c = o.firstChild;
        for (; c.firstChild; )
          o.appendChild(c.firstChild);
        o.removeChild(c);
      }
      t.insertBefore(o, n);
    }
    return [
      // first
      s ? s.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, fl = Symbol("_vtc");
function dl(e, t, n) {
  const r = e[fl];
  r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Xs = Symbol("_vod"), ro = Symbol("_vsh"), Mr = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(e, { value: t }, { transition: n }) {
    e[Xs] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : os(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: r }) {
    !t != !n && (r ? t ? (r.beforeEnter(e), os(e, !0), r.enter(e)) : r.leave(e, () => {
      os(e, !1);
    }) : os(e, t));
  },
  beforeUnmount(e, { value: t }) {
    os(e, t);
  }
};
function os(e, t) {
  e.style.display = t ? e[Xs] : "none", e[ro] = !t;
}
const pl = Symbol(""), ml = /(?:^|;)\s*display\s*:/;
function hl(e, t, n) {
  const r = e.style, i = ue(n);
  let u = !1;
  if (n && !i) {
    if (t)
      if (ue(t))
        for (const s of t.split(";")) {
          const o = s.slice(0, s.indexOf(":")).trim();
          n[o] == null && Fs(r, o, "");
        }
      else
        for (const s in t)
          n[s] == null && Fs(r, s, "");
    for (const s in n)
      s === "display" && (u = !0), Fs(r, s, n[s]);
  } else if (i) {
    if (t !== n) {
      const s = r[pl];
      s && (n += ";" + s), r.cssText = n, u = ml.test(n);
    }
  } else t && e.removeAttribute("style");
  Xs in e && (e[Xs] = u ? r.display : "", e[ro] && (r.display = "none"));
}
const Cr = /\s*!important$/;
function Fs(e, t, n) {
  if (F(n))
    n.forEach((r) => Fs(e, t, r));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const r = yl(e, t);
    Cr.test(n) ? e.setProperty(
      kt(r),
      n.replace(Cr, ""),
      "important"
    ) : e[r] = n;
  }
}
const qr = ["Webkit", "Moz", "ms"], $n = {};
function yl(e, t) {
  const n = $n[t];
  if (n)
    return n;
  let r = He(t);
  if (r !== "filter" && r in e)
    return $n[t] = r;
  r = rn(r);
  for (let i = 0; i < qr.length; i++) {
    const u = qr[i] + r;
    if (u in e)
      return $n[t] = u;
  }
  return t;
}
const Or = "http://www.w3.org/1999/xlink";
function Nr(e, t, n, r, i, u = wo(t)) {
  r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Or, t.slice(6, t.length)) : e.setAttributeNS(Or, t, n) : n == null || u && !oi(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    u ? "" : Qe(n) ? String(n) : n
  );
}
function Rr(e, t, n, r, i) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? no(n) : n);
    return;
  }
  const u = e.tagName;
  if (t === "value" && u !== "PROGRESS" && // custom elements may use _value internally
  !u.includes("-")) {
    const o = u === "OPTION" ? e.getAttribute("value") || "" : e.value, c = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (o !== c || !("_value" in e)) && (e.value = c), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let s = !1;
  if (n === "" || n == null) {
    const o = typeof e[t];
    o === "boolean" ? n = oi(n) : n == null && o === "string" ? (n = "", s = !0) : o === "number" && (n = 0, s = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  s && e.removeAttribute(i || t);
}
function Nt(e, t, n, r) {
  e.addEventListener(t, n, r);
}
function gl(e, t, n, r) {
  e.removeEventListener(t, n, r);
}
const Wr = Symbol("_vei");
function wl(e, t, n, r, i = null) {
  const u = e[Wr] || (e[Wr] = {}), s = u[t];
  if (r && s)
    s.value = r;
  else {
    const [o, c] = vl(t);
    if (r) {
      const a = u[t] = kl(
        r,
        i
      );
      Nt(e, o, a, c);
    } else s && (gl(e, o, s, c), u[t] = void 0);
  }
}
const Dr = /(?:Once|Passive|Capture)$/;
function vl(e) {
  let t;
  if (Dr.test(e)) {
    t = {};
    let r;
    for (; r = e.match(Dr); )
      e = e.slice(0, e.length - r[0].length), t[r[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : kt(e.slice(2)), t];
}
let Sn = 0;
const bl = /* @__PURE__ */ Promise.resolve(), Pl = () => Sn || (bl.then(() => Sn = 0), Sn = Date.now());
function kl(e, t) {
  const n = (r) => {
    if (!r._vts)
      r._vts = Date.now();
    else if (r._vts <= n.attached)
      return;
    et(
      $l(r, n.value),
      t,
      5,
      [r]
    );
  };
  return n.value = e, n.attached = Pl(), n;
}
function $l(e, t) {
  if (F(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (r) => (i) => !i._stopped && r && r(i)
    );
  } else
    return t;
}
const Fr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Sl = (e, t, n, r, i, u) => {
  const s = i === "svg";
  t === "class" ? dl(e, r, s) : t === "style" ? hl(e, n, r) : tn(t) ? Un(t) || wl(e, t, n, r, u) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : xl(e, t, r, s)) ? (Rr(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Nr(e, t, r, s, u, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !ue(r)) ? Rr(e, He(t), r, u, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), Nr(e, t, r, s));
};
function xl(e, t, n, r) {
  if (r)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Fr(t) && L(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const i = e.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return Fr(t) && ue(n) ? !1 : t in e;
}
const Zs = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return F(t) ? (n) => Rs(t, n) : t;
};
function _l(e) {
  e.target.composing = !0;
}
function Hr(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Gt = Symbol("_assign"), jl = {
  created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
    e[Gt] = Zs(i);
    const u = r || i.props && i.props.type === "number";
    Nt(e, t ? "change" : "input", (s) => {
      if (s.target.composing) return;
      let o = e.value;
      n && (o = o.trim()), u && (o = Hs(o)), e[Gt](o);
    }), n && Nt(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Nt(e, "compositionstart", _l), Nt(e, "compositionend", Hr), Nt(e, "change", Hr));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: u } }, s) {
    if (e[Gt] = Zs(s), e.composing) return;
    const o = (u || e.type === "number") && !/^0\d/.test(e.value) ? Hs(e.value) : e.value, c = t ?? "";
    o !== c && (document.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c));
  }
}, El = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: n } }, r) {
    const i = sn(t);
    Nt(e, "change", () => {
      const u = Array.prototype.filter.call(e.options, (s) => s.selected).map(
        (s) => n ? Hs(Ys(s)) : Ys(s)
      );
      e[Gt](
        e.multiple ? i ? new Set(u) : u : u[0]
      ), e._assigning = !0, sr(() => {
        e._assigning = !1;
      });
    }), e[Gt] = Zs(r);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    Lr(e, t);
  },
  beforeUpdate(e, t, n) {
    e[Gt] = Zs(n);
  },
  updated(e, { value: t }) {
    e._assigning || Lr(e, t);
  }
};
function Lr(e, t) {
  const n = e.multiple, r = F(t);
  if (!(n && !r && !sn(t))) {
    for (let i = 0, u = e.options.length; i < u; i++) {
      const s = e.options[i], o = Ys(s);
      if (n)
        if (r) {
          const c = typeof o;
          c === "string" || c === "number" ? s.selected = t.some((a) => String(a) === String(o)) : s.selected = bo(t, o) > -1;
        } else
          s.selected = t.has(o);
      else if (an(Ys(s), t)) {
        e.selectedIndex !== i && (e.selectedIndex = i);
        return;
      }
    }
    !n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function Ys(e) {
  return "_value" in e ? e._value : e.value;
}
const Al = ["ctrl", "shift", "alt", "meta"], Il = {
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
  exact: (e, t) => Al.some((n) => e[`${n}Key`] && !t.includes(n))
}, cr = (e, t) => {
  const n = e._withMods || (e._withMods = {}), r = t.join(".");
  return n[r] || (n[r] = ((i, ...u) => {
    for (let s = 0; s < t.length; s++) {
      const o = Il[t[s]];
      if (o && o(i, t)) return;
    }
    return e(i, ...u);
  }));
}, Tl = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Ml = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), r = t.join(".");
  return n[r] || (n[r] = ((i) => {
    if (!("key" in i))
      return;
    const u = kt(i.key);
    if (t.some(
      (s) => s === u || Tl[s] === u
    ))
      return e(i);
  }));
}, Cl = /* @__PURE__ */ Se({ patchProp: Sl }, cl);
let Vr;
function ql() {
  return Vr || (Vr = Ma(Cl));
}
const Ol = ((...e) => {
  const t = ql().createApp(...e), { mount: n } = t;
  return t.mount = (r) => {
    const i = Rl(r);
    if (!i) return;
    const u = t._component;
    !L(u) && !u.render && !u.template && (u.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const s = n(i, !1, Nl(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), s;
  }, t;
});
function Nl(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Rl(e) {
  return ue(e) ? document.querySelector(e) : e;
}
const Wl = { class: "tree-node" }, Dl = ["title"], Fl = { class: "tree-icon" }, Hl = {
  key: 0,
  class: "tree-children"
}, Ll = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
  __name: "FileTreeNode",
  props: {
    node: { type: Object, required: !0 },
    selectedPath: { type: String, default: "" }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = t, r = G(!0);
    return (i, u) => {
      const s = ma("FileTreeNode", !0);
      return W(), H("div", Wl, [
        w("div", {
          class: je(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: u[1] || (u[1] = (o) => n("select", e.node)),
          onDblclick: u[2] || (u[2] = (o) => e.node.kind === "directory" && (r.value = !r.value))
        }, [
          w("span", {
            class: "tree-toggle",
            onClick: u[0] || (u[0] = cr((o) => e.node.kind === "directory" && (r.value = !r.value), ["stop"]))
          }, V(e.node.kind === "directory" ? r.value ? "⌄" : "›" : ""), 1),
          w("span", Fl, V(e.node.kind === "directory" ? "▰" : "·"), 1),
          w("span", null, V(e.node.name), 1)
        ], 42, Dl),
        e.node.kind === "directory" && r.value ? (W(), H("div", Hl, [
          (W(!0), H(ie, null, gt(e.node.children, (o) => (W(), Js(s, {
            key: o.path,
            node: o,
            "selected-path": e.selectedPath,
            onSelect: u[3] || (u[3] = (c) => n("select", c))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : We("", !0)
      ]);
    };
  }
}), Vl = { class: "monaco-editor-shell" }, Ul = {
  key: 0,
  class: "editor-loading"
}, zl = {
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
    const n = e, r = t, i = G(null), u = G(!0);
    let s, o, c, a, l = !1, f;
    ir(async () => {
      try {
        const g = await import("./monaco-runtime-BKpHSqn8.js").then((I) => I.jz);
        ({ monaco: c } = await g.configureStudioMonaco()), f = g.configureManifestSchemaForText, o = h(), m(o.getValue()), s = c.editor.create(i.value, {
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
        }), a = s.onDidChangeModelContent(() => {
          const I = o.getValue();
          m(I), l || r("update:value", I);
        }), s.addCommand(c.KeyMod.CtrlCmd | c.KeyCode.KeyS, () => r("save")), u.value = !1, d(), s.focus(), r("ready");
      } catch (g) {
        u.value = !1, r("error", g);
      }
    }), gs(() => n.value, (g) => {
      !o || o.getValue() === g || (l = !0, o.setValue(g), m(g), l = !1);
    }), gs(() => n.markers, d, { deep: !0 }), or(() => {
      a?.dispose(), s?.dispose();
    });
    function h() {
      const g = c.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(n.projectId)}/${n.path}`), I = c.editor.getModel(g);
      return I ? (c.editor.setModelLanguage(I, n.language), I.getValue() !== n.value && I.setValue(n.value), I) : c.editor.createModel(n.value, n.language, g);
    }
    function d() {
      !c || !o || c.editor.setModelMarkers(o, "webwindows-manifest", n.markers.map((g) => ({
        severity: g.severity === "warning" ? c.MarkerSeverity.Warning : c.MarkerSeverity.Error,
        message: `${g.path}: ${g.message}`,
        startLineNumber: g.line || 1,
        startColumn: g.column || 1,
        endLineNumber: g.endLine || g.line || 1,
        endColumn: g.endColumn || Math.max(2, (g.column || 1) + 1)
      })));
    }
    function m(g) {
      n.path === "manifest.json" && f?.(g);
    }
    return (g, I) => (W(), H("div", Vl, [
      w("div", {
        ref_key: "host",
        ref: i,
        class: "monaco-editor-host"
      }, null, 512),
      u.value ? (W(), H("div", Ul, "正在载入本地编辑器…")) : We("", !0)
    ]));
  }
}, Bl = 1, Ur = 2;
function Wt(e) {
  return !e || typeof e != "object" || Array.isArray(e) ? null : Object.prototype.hasOwnProperty.call(e, "manifestVersion") ? e.manifestVersion === Ur ? Ur : null : Bl;
}
const Kl = { class: "manifest-inspector" }, Jl = { class: "inspector-mode-tabs" }, Gl = {
  key: 0,
  class: "inspector-note"
}, Xl = {
  key: 1,
  class: "inspector-note error"
}, Zl = ["value"], Yl = { key: 0 }, Ql = ["value"], eu = ["value"], tu = ["value"], su = ["value"], nu = ["value"], ru = ["value"], iu = ["value"], ou = ["value"], au = ["value"], lu = ["value"], uu = { class: "check" }, cu = ["checked"], fu = { class: "check" }, du = ["checked"], pu = { class: "check" }, mu = ["checked"], hu = { class: "check" }, yu = ["checked"], gu = { class: "check" }, wu = ["checked"], vu = {
  key: 1,
  class: "permission-fieldset"
}, bu = { class: "permission-heading" }, Pu = ["checked", "onChange"], ku = { class: "permission-meta" }, $u = { key: 0 }, Su = {
  key: 2,
  class: "inspector-note"
}, xu = { class: "inspector-summary" }, _u = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const n = e, r = t, i = G("form"), u = De(() => n.manifest && typeof n.manifest == "object" && !Array.isArray(n.manifest)), s = De(() => {
      if (!u.value) return "—";
      const h = Wt(n.manifest);
      return h === 1 ? "1 (legacy implicit)" : h === 2 ? "2" : `Unsupported (${String(n.manifest.manifestVersion)})`;
    }), o = De(() => Wt(n.manifest) === 2), c = De(() => {
      const h = new Set(n.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
      return (n.permissionRegistry?.permissions || []).filter((d) => d.sourceDeclarable === !0 && h.has(d.id));
    });
    function a(h) {
      const d = (n.brokerMethods?.methods || []).filter((m) => m.requiredPermission === h.id);
      return {
        description: h.description || h.publicApiTargets?.join(", ") || "No public API target registered",
        consent: d[0]?.consent || h.prompt || "unspecified",
        pilot: d.some((m) => m.currentStatus === "pilot-contract-only") ? "Pilot contract only" : "Not in current Pilot",
        methods: d.map((m) => m.id)
      };
    }
    function l(h, d) {
      const m = new Set(Array.isArray(n.manifest.permissions) ? n.manifest.permissions : []);
      d ? m.add(h) : m.delete(h);
      const g = c.value.map((I) => I.id);
      f(["permissions"], g.filter((I) => m.has(I)));
    }
    function f(h, d) {
      if (!u.value) return;
      const m = JSON.parse(JSON.stringify(n.manifest));
      let g = m;
      h.slice(0, -1).forEach((I) => {
        (!g[I] || typeof g[I] != "object") && (g[I] = {}), g = g[I];
      }), g[h.at(-1)] = d, r("update:manifest", m);
    }
    return (h, d) => (W(), H("div", Kl, [
      w("div", Jl, [
        w("button", {
          type: "button",
          class: je({ active: i.value === "form" }),
          onClick: d[0] || (d[0] = (m) => i.value = "form")
        }, "表单", 2),
        w("button", {
          type: "button",
          class: je({ active: i.value === "json" }),
          onClick: d[1] || (d[1] = (m) => {
            i.value = "json", r("open-json");
          })
        }, "JSON", 2)
      ]),
      i.value === "json" ? (W(), H("div", Gl, [
        d[18] || (d[18] = ae(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        w("button", {
          type: "button",
          onClick: d[2] || (d[2] = (m) => r("open-json"))
        }, "打开 manifest.json")
      ])) : u.value ? (W(), H("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: d[17] || (d[17] = cr(() => {
        }, ["prevent"]))
      }, [
        w("label", null, [
          d[19] || (d[19] = ae("Manifest Version", -1)),
          w("input", {
            value: s.value,
            readonly: ""
          }, null, 8, Zl)
        ]),
        o.value ? (W(), H("label", Yl, [
          d[20] || (d[20] = ae("SDK API Version", -1)),
          w("input", {
            value: e.manifest.sdk?.apiVersion,
            readonly: ""
          }, null, 8, Ql)
        ])) : We("", !0),
        w("label", null, [
          d[21] || (d[21] = ae("ID", -1)),
          w("input", {
            value: e.manifest.id,
            onInput: d[3] || (d[3] = (m) => f(["id"], m.target.value))
          }, null, 40, eu)
        ]),
        w("label", null, [
          d[22] || (d[22] = ae("名称", -1)),
          w("input", {
            value: e.manifest.name,
            onInput: d[4] || (d[4] = (m) => f(["name"], m.target.value))
          }, null, 40, tu)
        ]),
        w("label", null, [
          d[23] || (d[23] = ae("版本", -1)),
          w("input", {
            value: e.manifest.version,
            onInput: d[5] || (d[5] = (m) => f(["version"], m.target.value))
          }, null, 40, su)
        ]),
        w("label", null, [
          d[24] || (d[24] = ae("描述", -1)),
          w("textarea", {
            value: e.manifest.description,
            onInput: d[6] || (d[6] = (m) => f(["description"], m.target.value))
          }, null, 40, nu)
        ]),
        w("label", null, [
          d[25] || (d[25] = ae("分类", -1)),
          w("input", {
            value: e.manifest.category,
            onInput: d[7] || (d[7] = (m) => f(["category"], m.target.value))
          }, null, 40, ru)
        ]),
        w("label", null, [
          d[26] || (d[26] = ae("入口", -1)),
          w("input", {
            value: e.manifest.entry,
            onInput: d[8] || (d[8] = (m) => f(["entry"], m.target.value))
          }, null, 40, iu)
        ]),
        w("label", null, [
          d[27] || (d[27] = ae("图标", -1)),
          w("input", {
            value: e.manifest.icon,
            onInput: d[9] || (d[9] = (m) => f(["icon"], m.target.value))
          }, null, 40, ou)
        ]),
        w("fieldset", null, [
          d[31] || (d[31] = w("legend", null, "Window", -1)),
          w("label", null, [
            d[28] || (d[28] = ae("宽度", -1)),
            w("input", {
              value: e.manifest.window?.width,
              onInput: d[10] || (d[10] = (m) => f(["window", "width"], m.target.value))
            }, null, 40, au)
          ]),
          w("label", null, [
            d[29] || (d[29] = ae("高度", -1)),
            w("input", {
              value: e.manifest.window?.height,
              onInput: d[11] || (d[11] = (m) => f(["window", "height"], m.target.value))
            }, null, 40, lu)
          ]),
          w("label", uu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: d[12] || (d[12] = (m) => f(["window", "singleton"], m.target.checked))
            }, null, 40, cu),
            d[30] || (d[30] = ae(" 单实例", -1))
          ])
        ]),
        w("fieldset", null, [
          d[36] || (d[36] = w("legend", null, "Placement", -1)),
          w("label", fu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: d[13] || (d[13] = (m) => f(["placement", "startMenu"], m.target.checked))
            }, null, 40, du),
            d[32] || (d[32] = ae(" 开始菜单", -1))
          ]),
          w("label", pu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: d[14] || (d[14] = (m) => f(["placement", "allFunctions"], m.target.checked))
            }, null, 40, mu),
            d[33] || (d[33] = ae(" 全部功能", -1))
          ]),
          w("label", hu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: d[15] || (d[15] = (m) => f(["placement", "desktop"], m.target.checked))
            }, null, 40, yu),
            d[34] || (d[34] = ae(" 桌面", -1))
          ]),
          w("label", gu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: d[16] || (d[16] = (m) => f(["placement", "taskbar"], m.target.checked))
            }, null, 40, wu),
            d[35] || (d[35] = ae(" 任务栏", -1))
          ])
        ]),
        o.value ? (W(), H("fieldset", vu, [
          d[37] || (d[37] = w("legend", null, "Requested Permissions", -1)),
          d[38] || (d[38] = w("p", { class: "inspector-note" }, "声明仅表示请求授权，不表示 policy allowed、grant 或 Runtime capability。", -1)),
          (W(!0), H(ie, null, gt(c.value, (m) => (W(), H("label", {
            key: m.id,
            class: "permission-option"
          }, [
            w("span", bu, [
              w("input", {
                type: "checkbox",
                checked: e.manifest.permissions?.includes(m.id),
                onChange: (g) => l(m.id, g.target.checked)
              }, null, 40, Pu),
              w("code", null, V(m.displayName || m.id) + " · " + V(m.id), 1)
            ]),
            w("small", null, V(a(m).description), 1),
            w("span", ku, [
              w("b", null, V(m.risk), 1),
              w("span", null, V(a(m).consent), 1),
              w("span", null, V(a(m).pilot), 1)
            ]),
            a(m).methods.length ? (W(), H("small", $u, V(a(m).methods.join(", ")), 1)) : We("", !0)
          ]))), 128))
        ])) : (W(), H("p", Su, "Manifest v1 不承载权限。升级到 v2 必须由开发者显式确认权限，Studio 不会从源码自动推断。")),
        d[39] || (d[39] = w("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (W(), H("div", Xl, "修复 JSON 错误后才能使用可视化表单。")),
      w("div", xu, V(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
};
function ju(e) {
  let t = 0;
  for (let n = 0; n < e.length; n += 1) {
    const r = e.charCodeAt(n);
    if (r >= 55296 && r <= 56319 && n + 1 < e.length) {
      const i = e.charCodeAt(n + 1);
      i >= 56320 && i <= 57343 && (n += 1);
    }
    t += 1;
  }
  return t;
}
const Eu = { properties: { type: { enum: ["application", "system"] } } }, zr = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, Au = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, Iu = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, Tu = { properties: { status: { enum: ["published", "disabled"] } } }, Te = ju, Mu = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), Cu = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), io = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), qu = new RegExp("^\\.[a-z0-9]+$", "u"), Ou = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), Nu = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function ut(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ut.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Te(e) > 240) {
      const a = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (Te(e) < 1) {
      const a = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (!io.test(e)) {
      const a = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [a] : s.push(a), o++;
    }
  } else {
    const a = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [a] : s.push(a), o++;
  }
  if (typeof e == "string" && !Nu.test(e)) {
    const a = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [a] : s.push(a), o++;
  }
  return ut.errors = s, o === 0;
}
ut.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const Ru = new RegExp("^[a-f0-9]{64}$", "u"), Wu = new RegExp("^/api/function-package\\.asp\\?", "u");
function Xt(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Xt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.size === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.sha256 === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.entry === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.downloadUrl === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const a = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.size !== void 0) {
      let a = e.size;
      if (!(typeof a == "number" && !(a % 1) && !isNaN(a))) {
        const l = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        s === null ? s = [l] : s.push(l), o++;
      }
      if (typeof a == "number" && (a < 0 || isNaN(a))) {
        const l = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.sha256 !== void 0) {
      let a = e.sha256;
      if (typeof a == "string") {
        if (!Ru.test(a)) {
          const l = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.entry !== void 0 && (ut(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: u }) || (s = s === null ? ut.errors : s.concat(ut.errors), o = s.length)), e.downloadUrl !== void 0) {
      let a = e.downloadUrl;
      if (typeof a == "string") {
        if (!Wu.test(a)) {
          const l = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
  } else {
    const a = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [a] : s.push(a), o++;
  }
  return Xt.errors = s, o === 0;
}
Xt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Zt(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Zt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.id === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.type === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.name === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.version === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.icon === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.entry === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.install === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.placement === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.window === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.id !== void 0) {
      let a = e.id;
      if (typeof a == "string") {
        if (Te(a) > 160) {
          const l = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (!Mu.test(a)) {
          const l = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.legacyIds !== void 0) {
      let a = e.legacyIds;
      if (Array.isArray(a)) {
        const l = a.length;
        for (let d = 0; d < l; d++) {
          let m = a[d];
          if (typeof m == "string") {
            if (Te(m) < 1) {
              const g = { instancePath: t + "/legacyIds/" + d, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [g] : s.push(g), o++;
            }
          } else {
            const g = { instancePath: t + "/legacyIds/" + d, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [g] : s.push(g), o++;
          }
        }
        let f = a.length, h;
        if (f > 1) {
          const d = {};
          for (; f--; ) {
            let m = a[f];
            if (typeof m == "string") {
              if (typeof d[m] == "number") {
                h = d[m];
                const g = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: f, j: h }, message: "must NOT have duplicate items (items ## " + h + " and " + f + " are identical)" };
                s === null ? s = [g] : s.push(g), o++;
                break;
              }
              d[m] = f;
            }
          }
        }
      } else {
        const l = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.type !== void 0) {
      let a = e.type;
      if (!(a === "application" || a === "system")) {
        const l = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: Eu.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.name !== void 0) {
      let a = e.name;
      if (typeof a == "string") {
        if (Te(a) < 1) {
          const l = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const a = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const a = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.version !== void 0) {
      let a = e.version;
      if (typeof a == "string") {
        if (Te(a) > 40) {
          const l = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (!Cu.test(a)) {
          const l = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.icon !== void 0) {
      let a = e.icon;
      if (typeof a == "string") {
        if (Te(a) > 240) {
          const l = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (Te(a) < 1) {
          const l = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (!io.test(a)) {
          const l = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.entry !== void 0 && (ut(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: u }) || (s = s === null ? ut.errors : s.concat(ut.errors), o = s.length)), e.install !== void 0) {
      let a = e.install;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.defaultState === void 0) {
          const l = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.source === void 0) {
          const l = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.uninstallable === void 0) {
          const l = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.defaultState !== void 0) {
          let l = a.defaultState;
          if (!(l === "available" || l === "installed")) {
            const f = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: zr.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.source !== void 0) {
          let l = a.source;
          if (!(l === "repository" || l === "preinstalled" || l === "system")) {
            const f = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: zr.properties.source.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.uninstallable !== void 0 && typeof a.uninstallable != "boolean") {
          const l = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.placement !== void 0) {
      let a = e.placement;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.desktop === void 0) {
          const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.startMenu === void 0) {
          const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.allFunctions === void 0) {
          const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.taskbar === void 0) {
          const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.desktop !== void 0 && typeof a.desktop != "boolean") {
          const l = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.startMenu !== void 0 && typeof a.startMenu != "boolean") {
          const l = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.startMenuGroup !== void 0) {
          let l = a.startMenuGroup;
          if (!(l === "user" || l === "system")) {
            const f = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: Au.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.startMenuOrder !== void 0) {
          let l = a.startMenuOrder;
          if (!(typeof l == "number" && !(l % 1) && !isNaN(l))) {
            const f = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            s === null ? s = [f] : s.push(f), o++;
          }
          if (typeof l == "number" && (l < 0 || isNaN(l))) {
            const f = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.allFunctions !== void 0 && typeof a.allFunctions != "boolean") {
          const l = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.taskbar !== void 0 && typeof a.taskbar != "boolean") {
          const l = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.window !== void 0) {
      let a = e.window;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.mode === void 0) {
          const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.singleton === void 0) {
          const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.width === void 0) {
          const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.height === void 0) {
          const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.mode !== void 0) {
          let l = a.mode;
          if (!(l === "iframe" || l === "native" || l === "shell")) {
            const f = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: Iu.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.singleton !== void 0 && typeof a.singleton != "boolean") {
          const l = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.width !== void 0) {
          let l = a.width;
          if (typeof l == "string") {
            if (Te(l) < 1) {
              const f = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [f] : s.push(f), o++;
            }
          } else {
            const f = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.height !== void 0) {
          let l = a.height;
          if (typeof l == "string") {
            if (Te(l) < 1) {
              const f = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [f] : s.push(f), o++;
            }
          } else {
            const f = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.className !== void 0 && typeof a.className != "string") {
          const l = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let a = e.fileHandlers;
      if (Array.isArray(a)) {
        const l = a.length;
        for (let f = 0; f < l; f++) {
          let h = a[f];
          if (h && typeof h == "object" && !Array.isArray(h)) {
            if (h.action === void 0) {
              const d = { instancePath: t + "/fileHandlers/" + f, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (h.adapter === void 0) {
              const d = { instancePath: t + "/fileHandlers/" + f, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (h.action !== void 0) {
              let d = h.action;
              if (typeof d == "string") {
                if (Te(d) < 1) {
                  const m = { instancePath: t + "/fileHandlers/" + f + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [m] : s.push(m), o++;
                }
              } else {
                const m = { instancePath: t + "/fileHandlers/" + f + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [m] : s.push(m), o++;
              }
            }
            if (h.adapter !== void 0) {
              let d = h.adapter;
              if (typeof d == "string") {
                if (Te(d) < 1) {
                  const m = { instancePath: t + "/fileHandlers/" + f + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [m] : s.push(m), o++;
                }
              } else {
                const m = { instancePath: t + "/fileHandlers/" + f + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [m] : s.push(m), o++;
              }
            }
            if (h.extensions !== void 0) {
              let d = h.extensions;
              if (Array.isArray(d)) {
                const m = d.length;
                for (let j = 0; j < m; j++) {
                  let O = d[j];
                  if (typeof O == "string") {
                    if (!qu.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + f + "/extensions/" + j, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [M] : s.push(M), o++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + f + "/extensions/" + j, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [M] : s.push(M), o++;
                  }
                }
                let g = d.length, I;
                if (g > 1) {
                  const j = {};
                  for (; g--; ) {
                    let O = d[g];
                    if (typeof O == "string") {
                      if (typeof j[O] == "number") {
                        I = j[O];
                        const M = { instancePath: t + "/fileHandlers/" + f + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: g, j: I }, message: "must NOT have duplicate items (items ## " + I + " and " + g + " are identical)" };
                        s === null ? s = [M] : s.push(M), o++;
                        break;
                      }
                      j[O] = g;
                    }
                  }
                }
              } else {
                const m = { instancePath: t + "/fileHandlers/" + f + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [m] : s.push(m), o++;
              }
            }
            if (h.mimeTypes !== void 0) {
              let d = h.mimeTypes;
              if (Array.isArray(d)) {
                const m = d.length;
                for (let j = 0; j < m; j++) {
                  let O = d[j];
                  if (typeof O == "string") {
                    if (!Ou.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + f + "/mimeTypes/" + j, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [M] : s.push(M), o++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + f + "/mimeTypes/" + j, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [M] : s.push(M), o++;
                  }
                }
                let g = d.length, I;
                if (g > 1) {
                  const j = {};
                  for (; g--; ) {
                    let O = d[g];
                    if (typeof O == "string") {
                      if (typeof j[O] == "number") {
                        I = j[O];
                        const M = { instancePath: t + "/fileHandlers/" + f + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: g, j: I }, message: "must NOT have duplicate items (items ## " + I + " and " + g + " are identical)" };
                        s === null ? s = [M] : s.push(M), o++;
                        break;
                      }
                      j[O] = g;
                    }
                  }
                }
              } else {
                const m = { instancePath: t + "/fileHandlers/" + f + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [m] : s.push(m), o++;
              }
            }
            if (h.priority !== void 0 && typeof h.priority != "number") {
              const d = { instancePath: t + "/fileHandlers/" + f + "/priority", schemaPath: "#/$defs/fileHandler/properties/priority/type", keyword: "type", params: { type: "number" }, message: "must be number" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/fileHandlers/" + f, schemaPath: "#/$defs/fileHandler/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const l = { instancePath: t + "/fileHandlers", schemaPath: "#/properties/fileHandlers/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.launch !== void 0) {
      let a = e.launch;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.adapter !== void 0) {
          let l = a.adapter;
          if (typeof l == "string") {
            if (Te(l) < 1) {
              const f = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [f] : s.push(f), o++;
            }
          } else {
            const f = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
      } else {
        const l = { instancePath: t + "/launch", schemaPath: "#/$defs/launch/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.catalog !== void 0) {
      let a = e.catalog;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.status !== void 0) {
          let l = a.status;
          if (!(l === "published" || l === "disabled")) {
            const f = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: Tu.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
      } else {
        const l = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.package !== void 0 && (Xt(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: i, dynamicAnchors: u }) || (s = s === null ? Xt.errors : s.concat(Xt.errors), o = s.length)), e.runtime !== void 0) {
      let a = e.runtime;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.model === void 0) {
          const l = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.network === void 0) {
          const l = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.sameOrigin === void 0) {
          const l = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.model !== void 0 && a.model !== "browser-zip-sandbox-v1") {
          const l = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.network !== void 0 && a.network !== "none") {
          const l = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.sameOrigin !== void 0 && a.sameOrigin !== !1) {
          const l = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
  } else {
    const a = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [a] : s.push(a), o++;
  }
  return Zt.errors = s, o === 0;
}
Zt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ss(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Ss.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Zt(e, { instancePath: t, parentData: n, parentDataProperty: r, rootData: i, dynamicAnchors: u }) || (s = s === null ? Zt.errors : s.concat(Zt.errors), o = s.length), Ss.errors = s, o === 0;
}
Ss.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Du(e) {
  let t = 0;
  for (let n = 0; n < e.length; n += 1) {
    const r = e.charCodeAt(n);
    if (r >= 55296 && r <= 56319 && n + 1 < e.length) {
      const i = e.charCodeAt(n + 1);
      i >= 56320 && i <= 57343 && (n += 1);
    }
    t += 1;
  }
  return t;
}
function Fu(e, t) {
  return e === t;
}
const Hu = { properties: { type: { enum: ["application", "system"] } } }, Br = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, Lu = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, Vu = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, Uu = { properties: { status: { enum: ["published", "disabled"] } } }, zu = { enum: ["device.battery-status.read"] }, Bu = Fu;
function Yt(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Yt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Array.isArray(e)) {
    const a = e.length;
    for (let h = 0; h < a; h++) {
      let d = e[h];
      if (typeof d != "string") {
        const m = { instancePath: t + "/" + h, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [m] : s.push(m), o++;
      }
      if (d !== "device.battery-status.read") {
        const m = { instancePath: t + "/" + h, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/enum", keyword: "enum", params: { allowedValues: zu.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [m] : s.push(m), o++;
      }
    }
    let l = e.length, f;
    if (l > 1) {
      e: for (; l--; )
        for (f = l; f--; )
          if (Bu(e[l], e[f])) {
            const h = { instancePath: t, schemaPath: "#/uniqueItems", keyword: "uniqueItems", params: { i: l, j: f }, message: "must NOT have duplicate items (items ## " + f + " and " + l + " are identical)" };
            s === null ? s = [h] : s.push(h), o++;
            break e;
          }
    }
  } else {
    const a = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "array" }, message: "must be array" };
    s === null ? s = [a] : s.push(a), o++;
  }
  return Yt.errors = s, o === 0;
}
Yt.evaluated = { items: !0, dynamicProps: !1, dynamicItems: !1 };
const Me = Du, oo = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), Ku = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function ct(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ct.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Me(e) > 240) {
      const a = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (Me(e) < 1) {
      const a = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (!oo.test(e)) {
      const a = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [a] : s.push(a), o++;
    }
  } else {
    const a = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [a] : s.push(a), o++;
  }
  if (typeof e == "string" && !Ku.test(e)) {
    const a = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [a] : s.push(a), o++;
  }
  return ct.errors = s, o === 0;
}
ct.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const Ju = new RegExp("^[a-f0-9]{64}$", "u"), Gu = new RegExp("^/api/function-package\\.asp\\?", "u");
function Qt(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Qt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.size === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.sha256 === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.entry === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.downloadUrl === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const a = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.size !== void 0) {
      let a = e.size;
      if (!(typeof a == "number" && !(a % 1) && !isNaN(a))) {
        const l = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        s === null ? s = [l] : s.push(l), o++;
      }
      if (typeof a == "number" && (a < 0 || isNaN(a))) {
        const l = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.sha256 !== void 0) {
      let a = e.sha256;
      if (typeof a == "string") {
        if (!Ju.test(a)) {
          const l = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.entry !== void 0 && (ct(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: u }) || (s = s === null ? ct.errors : s.concat(ct.errors), o = s.length)), e.downloadUrl !== void 0) {
      let a = e.downloadUrl;
      if (typeof a == "string") {
        if (!Gu.test(a)) {
          const l = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
  } else {
    const a = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [a] : s.push(a), o++;
  }
  return Qt.errors = s, o === 0;
}
Qt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Xu = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), Zu = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), Yu = new RegExp("^\\.[a-z0-9]+$", "u"), Qu = new RegExp("^[^/\\s]+/[^/\\s]+$", "u");
function es(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = es.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.manifestVersion === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "manifestVersion" }, message: "must have required property 'manifestVersion'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.sdk === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sdk" }, message: "must have required property 'sdk'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.permissions === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "permissions" }, message: "must have required property 'permissions'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.id === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.type === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.name === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.version === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.icon === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.entry === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.install === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.placement === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.window === void 0) {
      const a = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.manifestVersion !== void 0 && e.manifestVersion !== 2) {
      const a = { instancePath: t + "/manifestVersion", schemaPath: "#/properties/manifestVersion/const", keyword: "const", params: { allowedValue: 2 }, message: "must be equal to constant" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.sdk !== void 0) {
      let a = e.sdk;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.apiVersion === void 0) {
          const l = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/required", keyword: "required", params: { missingProperty: "apiVersion" }, message: "must have required property 'apiVersion'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        for (const l in a)
          if (l !== "apiVersion") {
            const f = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: l }, message: "must NOT have additional properties" };
            s === null ? s = [f] : s.push(f), o++;
          }
        if (a.apiVersion !== void 0 && a.apiVersion !== "1") {
          const l = { instancePath: t + "/sdk/apiVersion", schemaPath: "#/$defs/sdk/properties/apiVersion/const", keyword: "const", params: { allowedValue: "1" }, message: "must be equal to constant" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.permissions !== void 0 && (Yt(e.permissions, { instancePath: t + "/permissions", parentData: e, parentDataProperty: "permissions", rootData: i, dynamicAnchors: u }) || (s = s === null ? Yt.errors : s.concat(Yt.errors), o = s.length)), e.id !== void 0) {
      let a = e.id;
      if (typeof a == "string") {
        if (Me(a) > 160) {
          const l = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (!Xu.test(a)) {
          const l = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.legacyIds !== void 0) {
      let a = e.legacyIds;
      if (Array.isArray(a)) {
        const l = a.length;
        for (let d = 0; d < l; d++) {
          let m = a[d];
          if (typeof m == "string") {
            if (Me(m) < 1) {
              const g = { instancePath: t + "/legacyIds/" + d, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [g] : s.push(g), o++;
            }
          } else {
            const g = { instancePath: t + "/legacyIds/" + d, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [g] : s.push(g), o++;
          }
        }
        let f = a.length, h;
        if (f > 1) {
          const d = {};
          for (; f--; ) {
            let m = a[f];
            if (typeof m == "string") {
              if (typeof d[m] == "number") {
                h = d[m];
                const g = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: f, j: h }, message: "must NOT have duplicate items (items ## " + h + " and " + f + " are identical)" };
                s === null ? s = [g] : s.push(g), o++;
                break;
              }
              d[m] = f;
            }
          }
        }
      } else {
        const l = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.type !== void 0) {
      let a = e.type;
      if (!(a === "application" || a === "system")) {
        const l = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: Hu.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.name !== void 0) {
      let a = e.name;
      if (typeof a == "string") {
        if (Me(a) < 1) {
          const l = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const a = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const a = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [a] : s.push(a), o++;
    }
    if (e.version !== void 0) {
      let a = e.version;
      if (typeof a == "string") {
        if (Me(a) > 40) {
          const l = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (!Zu.test(a)) {
          const l = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.icon !== void 0) {
      let a = e.icon;
      if (typeof a == "string") {
        if (Me(a) > 240) {
          const l = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (Me(a) < 1) {
          const l = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (!oo.test(a)) {
          const l = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.entry !== void 0 && (ct(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: u }) || (s = s === null ? ct.errors : s.concat(ct.errors), o = s.length)), e.install !== void 0) {
      let a = e.install;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.defaultState === void 0) {
          const l = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.source === void 0) {
          const l = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.uninstallable === void 0) {
          const l = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.defaultState !== void 0) {
          let l = a.defaultState;
          if (!(l === "available" || l === "installed")) {
            const f = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: Br.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.source !== void 0) {
          let l = a.source;
          if (!(l === "repository" || l === "preinstalled" || l === "system")) {
            const f = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: Br.properties.source.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.uninstallable !== void 0 && typeof a.uninstallable != "boolean") {
          const l = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.placement !== void 0) {
      let a = e.placement;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.desktop === void 0) {
          const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.startMenu === void 0) {
          const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.allFunctions === void 0) {
          const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.taskbar === void 0) {
          const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.desktop !== void 0 && typeof a.desktop != "boolean") {
          const l = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.startMenu !== void 0 && typeof a.startMenu != "boolean") {
          const l = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.startMenuGroup !== void 0) {
          let l = a.startMenuGroup;
          if (!(l === "user" || l === "system")) {
            const f = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: Lu.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.startMenuOrder !== void 0) {
          let l = a.startMenuOrder;
          if (!(typeof l == "number" && !(l % 1) && !isNaN(l))) {
            const f = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            s === null ? s = [f] : s.push(f), o++;
          }
          if (typeof l == "number" && (l < 0 || isNaN(l))) {
            const f = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.allFunctions !== void 0 && typeof a.allFunctions != "boolean") {
          const l = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.taskbar !== void 0 && typeof a.taskbar != "boolean") {
          const l = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.window !== void 0) {
      let a = e.window;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.mode === void 0) {
          const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.singleton === void 0) {
          const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.width === void 0) {
          const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.height === void 0) {
          const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.mode !== void 0) {
          let l = a.mode;
          if (!(l === "iframe" || l === "native" || l === "shell")) {
            const f = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: Vu.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.singleton !== void 0 && typeof a.singleton != "boolean") {
          const l = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.width !== void 0) {
          let l = a.width;
          if (typeof l == "string") {
            if (Me(l) < 1) {
              const f = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [f] : s.push(f), o++;
            }
          } else {
            const f = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.height !== void 0) {
          let l = a.height;
          if (typeof l == "string") {
            if (Me(l) < 1) {
              const f = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [f] : s.push(f), o++;
            }
          } else {
            const f = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
        if (a.className !== void 0 && typeof a.className != "string") {
          const l = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let a = e.fileHandlers;
      if (Array.isArray(a)) {
        const l = a.length;
        for (let f = 0; f < l; f++) {
          let h = a[f];
          if (h && typeof h == "object" && !Array.isArray(h)) {
            if (h.action === void 0) {
              const d = { instancePath: t + "/fileHandlers/" + f, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (h.adapter === void 0) {
              const d = { instancePath: t + "/fileHandlers/" + f, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (h.action !== void 0) {
              let d = h.action;
              if (typeof d == "string") {
                if (Me(d) < 1) {
                  const m = { instancePath: t + "/fileHandlers/" + f + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [m] : s.push(m), o++;
                }
              } else {
                const m = { instancePath: t + "/fileHandlers/" + f + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [m] : s.push(m), o++;
              }
            }
            if (h.adapter !== void 0) {
              let d = h.adapter;
              if (typeof d == "string") {
                if (Me(d) < 1) {
                  const m = { instancePath: t + "/fileHandlers/" + f + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [m] : s.push(m), o++;
                }
              } else {
                const m = { instancePath: t + "/fileHandlers/" + f + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [m] : s.push(m), o++;
              }
            }
            if (h.extensions !== void 0) {
              let d = h.extensions;
              if (Array.isArray(d)) {
                const m = d.length;
                for (let j = 0; j < m; j++) {
                  let O = d[j];
                  if (typeof O == "string") {
                    if (!Yu.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + f + "/extensions/" + j, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [M] : s.push(M), o++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + f + "/extensions/" + j, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [M] : s.push(M), o++;
                  }
                }
                let g = d.length, I;
                if (g > 1) {
                  const j = {};
                  for (; g--; ) {
                    let O = d[g];
                    if (typeof O == "string") {
                      if (typeof j[O] == "number") {
                        I = j[O];
                        const M = { instancePath: t + "/fileHandlers/" + f + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: g, j: I }, message: "must NOT have duplicate items (items ## " + I + " and " + g + " are identical)" };
                        s === null ? s = [M] : s.push(M), o++;
                        break;
                      }
                      j[O] = g;
                    }
                  }
                }
              } else {
                const m = { instancePath: t + "/fileHandlers/" + f + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [m] : s.push(m), o++;
              }
            }
            if (h.mimeTypes !== void 0) {
              let d = h.mimeTypes;
              if (Array.isArray(d)) {
                const m = d.length;
                for (let j = 0; j < m; j++) {
                  let O = d[j];
                  if (typeof O == "string") {
                    if (!Qu.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + f + "/mimeTypes/" + j, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [M] : s.push(M), o++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + f + "/mimeTypes/" + j, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [M] : s.push(M), o++;
                  }
                }
                let g = d.length, I;
                if (g > 1) {
                  const j = {};
                  for (; g--; ) {
                    let O = d[g];
                    if (typeof O == "string") {
                      if (typeof j[O] == "number") {
                        I = j[O];
                        const M = { instancePath: t + "/fileHandlers/" + f + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: g, j: I }, message: "must NOT have duplicate items (items ## " + I + " and " + g + " are identical)" };
                        s === null ? s = [M] : s.push(M), o++;
                        break;
                      }
                      j[O] = g;
                    }
                  }
                }
              } else {
                const m = { instancePath: t + "/fileHandlers/" + f + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [m] : s.push(m), o++;
              }
            }
            if (h.priority !== void 0 && typeof h.priority != "number") {
              const d = { instancePath: t + "/fileHandlers/" + f + "/priority", schemaPath: "#/$defs/fileHandler/properties/priority/type", keyword: "type", params: { type: "number" }, message: "must be number" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/fileHandlers/" + f, schemaPath: "#/$defs/fileHandler/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const l = { instancePath: t + "/fileHandlers", schemaPath: "#/properties/fileHandlers/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.launch !== void 0) {
      let a = e.launch;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.adapter !== void 0) {
          let l = a.adapter;
          if (typeof l == "string") {
            if (Me(l) < 1) {
              const f = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [f] : s.push(f), o++;
            }
          } else {
            const f = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
      } else {
        const l = { instancePath: t + "/launch", schemaPath: "#/$defs/launch/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.catalog !== void 0) {
      let a = e.catalog;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.status !== void 0) {
          let l = a.status;
          if (!(l === "published" || l === "disabled")) {
            const f = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: Uu.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [f] : s.push(f), o++;
          }
        }
      } else {
        const l = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
    if (e.package !== void 0 && (Qt(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: i, dynamicAnchors: u }) || (s = s === null ? Qt.errors : s.concat(Qt.errors), o = s.length)), e.runtime !== void 0) {
      let a = e.runtime;
      if (a && typeof a == "object" && !Array.isArray(a)) {
        if (a.model === void 0) {
          const l = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.network === void 0) {
          const l = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.sameOrigin === void 0) {
          const l = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.model !== void 0 && a.model !== "browser-zip-sandbox-v1") {
          const l = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.network !== void 0 && a.network !== "none") {
          const l = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          s === null ? s = [l] : s.push(l), o++;
        }
        if (a.sameOrigin !== void 0 && a.sameOrigin !== !1) {
          const l = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          s === null ? s = [l] : s.push(l), o++;
        }
      } else {
        const l = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [l] : s.push(l), o++;
      }
    }
  } else {
    const a = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [a] : s.push(a), o++;
  }
  return es.errors = s, o === 0;
}
es.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function xs(e, { instancePath: t = "", parentData: n, parentDataProperty: r, rootData: i = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = xs.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), es(e, { instancePath: t, parentData: n, parentDataProperty: r, rootData: i, dynamicAnchors: u }) || (s = s === null ? es.errors : s.concat(es.errors), o = s.length), xs.errors = s, o === 0;
}
xs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let xn;
async function ec() {
  return xn || (xn = tc()), xn;
}
async function tc() {
  const e = await Promise.all([
    fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v2.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/permissions-v1.json", { credentials: "same-origin" })
  ]);
  if (e.some((i) => !i.ok)) throw new Error("无法载入 Manifest 平台契约。");
  const [t, n, r] = await Promise.all(e.map((i) => i.json()));
  return {
    schemas: { 1: t, 2: n },
    validators: { 1: Ss, 2: xs },
    permissionRegistry: r,
    permissionIds: new Set(r.permissions.map((i) => i.id)),
    sourceDeclarableIds: new Set(r.sourceDeclaration?.declarablePermissionIds || [])
  };
}
async function sc(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch (a) {
    return {
      manifest: null,
      diagnostics: [{
        severity: "error",
        path: "$",
        message: a.message,
        ...ac(e, a.message)
      }]
    };
  }
  const n = Wt(t);
  if (n == null)
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
  const r = await ec(), i = r.schemas[n], u = r.validators[n];
  u(t);
  const s = (u.errors || []).filter((a) => !ic(n, a)).map((a) => ({
    ruleId: "WWM002",
    severity: "error",
    path: oc(a.instancePath || a.params?.missingProperty || ""),
    message: a.message || a.keyword
  }));
  nc(t, n, r.permissionIds, r.sourceDeclarableIds, s), n === 2 && t.sdk?.apiVersion !== void 0 && t.sdk.apiVersion !== "1" && s.push({
    ruleId: "WWM009",
    severity: "error",
    path: "$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。"
  });
  const o = i.$defs?.sourceManifest?.properties || {};
  return Object.entries(o).filter(([, a]) => a.readOnly === !0 || a.description?.includes("Reserved") || a.description?.includes("Platform-reserved")).map(([a]) => a).forEach((a) => {
    Object.prototype.hasOwnProperty.call(t, a) && s.push({
      ruleId: a === "launch" ? "WWM004" : "WWM003",
      severity: "warning",
      path: `$.${a}`,
      message: `${a} 是平台保留或发布阶段只读字段，不应由 Source Manifest 编辑。`
    });
  }), { manifest: t, manifestVersion: n, diagnostics: s };
}
function nc(e, t, n, r, i) {
  if (t === 1) {
    Object.prototype.hasOwnProperty.call(e, "permissions") && i.push({
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
    u.has(s) && i.push({ ruleId: "WWM007", severity: "error", path: c, message: `重复权限：${s}` }), u.add(s), rc(s) ? i.push({ ruleId: "WWM008", severity: "error", path: c, message: `禁止声明超级或私有权限：${s}` }) : n.has(s) ? r.has(s) || i.push({ ruleId: "WWM008", severity: "error", path: c, message: `权限尚未开放 Source Manifest 声明：${s}` }) : i.push({ ruleId: "WWM006", severity: "error", path: c, message: `未知权限：${s}` });
  });
}
function rc(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function ic(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function oc(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const n = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(n) ? `[${n}]` : `.${n}`;
  }).join("")}` : `$.${e}` : "$";
}
function ac(e, t) {
  const n = /position\s+(\d+)/i.exec(t);
  if (!n) return { line: 1, column: 1 };
  const r = Math.min(Number(n[1]), e.length), i = e.slice(0, r).split(`
`);
  return { line: i.length, column: i.at(-1).length + 1 };
}
const lc = {
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
function uc() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(lc, null, 2)}
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
const Kr = 240;
function le(e, t = {}) {
  const n = String(e ?? "");
  if (n.includes("\0")) throw Ot("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(n)) throw Ot("项目路径不能使用盘符。", e);
  const r = n.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!r) {
    if (t.allowRoot === !0) return "";
    throw Ot("项目路径不能为空。", e);
  }
  if (r.startsWith("/")) throw Ot("项目路径必须是相对路径。", e);
  if (r.length > Kr)
    throw Ot(`项目路径不能超过 ${Kr} 个字符。`, e);
  const i = r.split("/");
  if (i.some((u) => !u || u === "." || u === ".."))
    throw Ot("项目路径包含不安全的路径段。", e);
  return i.join("/");
}
function _s(e) {
  const t = le(e), n = t.lastIndexOf("/");
  return n < 0 ? "" : t.slice(0, n);
}
function Dn(e) {
  const t = le(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function cc(e, t) {
  const n = le(e, { allowRoot: !0 }), r = String(t ?? "");
  if (!r || r.includes("/") || r.includes("\\"))
    throw Ot("文件或目录名称必须是单个安全路径段。", t);
  return le(n ? `${n}/${r}` : r);
}
function Ot(e, t) {
  const n = new TypeError(e);
  return n.code = "invalid-project-path", n.value = t, n;
}
const fc = "webwindows-developer-studio-v1", Jr = 1, dc = 1, se = "projects", oe = "files", Mt = "projectId";
class pc {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || fc, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, !this.indexedDB) throw new Error("IndexedDB is required by Developer Studio.");
  }
  async listProjects() {
    const t = await this.open();
    return (await xe(
      t.transaction(se, "readonly").objectStore(se).getAll()
    )).sort((r, i) => String(i.updatedAt).localeCompare(String(r.updatedAt))).map(rt);
  }
  async createProject(t = {}) {
    const n = hc(this.crypto), r = this.now(), i = {
      uuid: n,
      displayName: Xr(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: dc,
      storageVersion: Jr,
      createdAt: r,
      updatedAt: r,
      editorState: Qs(t.editorState)
    }, u = mc(t.files || [], n, r), o = (await this.open()).transaction([se, oe], "readwrite");
    o.objectStore(se).add(i);
    const c = o.objectStore(oe);
    return u.forEach((a) => c.add(a)), await ht(o), rt(i);
  }
  async getProject(t) {
    const n = await this.open(), r = await xe(
      n.transaction(se, "readonly").objectStore(se).get(t)
    );
    if (!r) throw ce("project-not-found", "找不到项目。");
    return rt(r);
  }
  async renameProject(t, n) {
    return this.updateProject(t, (r) => {
      r.displayName = Xr(n);
    });
  }
  async saveEditorState(t, n) {
    return this.updateProject(t, (r) => {
      r.editorState = Qs(n);
    });
  }
  async deleteProject(t) {
    const r = (await this.open()).transaction([se, oe], "readwrite"), i = r.objectStore(se);
    if (!await xe(i.get(t))) throw ce("project-not-found", "找不到项目。");
    const s = r.objectStore(oe);
    (await xe(s.index(Mt).getAll(t))).forEach((c) => s.delete([t, c.path])), i.delete(t), await ht(r);
  }
  async listEntries(t) {
    await this.getProject(t);
    const n = await this.open();
    return (await xe(
      n.transaction(oe, "readonly").objectStore(oe).index(Mt).getAll(t)
    )).sort(Zr).map(rt);
  }
  async readProjectState(t) {
    const r = (await this.open()).transaction([se, oe], "readonly"), i = await xe(r.objectStore(se).get(t));
    if (!i) throw ce("project-not-found", "找不到项目。");
    const u = await xe(
      r.objectStore(oe).index(Mt).getAll(t)
    );
    return await ht(r), {
      project: rt(i),
      entries: u.sort(Zr).map(rt)
    };
  }
  async readTextFile(t, n) {
    const r = await this.getEntry(t, n);
    if (r.kind !== "file") throw ce("not-a-file", "目标不是文本文件。");
    return r.content;
  }
  async writeTextFile(t, n, r) {
    const i = le(n), s = (await this.open()).transaction([se, oe], "readwrite"), o = await Ns(s, t), c = s.objectStore(oe), a = await xe(c.get([t, i]));
    if (!a) throw ce("file-not-found", "找不到文件。");
    if (a.kind !== "file") throw ce("not-a-file", "目标不是文本文件。");
    const l = this.now();
    c.put({ ...a, content: String(r), updatedAt: l }), o.updatedAt = l, s.objectStore(se).put(o), await ht(s);
  }
  async createFile(t, n, r = "") {
    return this.createEntry(t, n, "file", String(r));
  }
  async createDirectory(t, n) {
    return this.createEntry(t, n, "directory", void 0);
  }
  async renameEntry(t, n, r) {
    const i = le(n), u = le(r);
    if (i === u) return this.getEntry(t, i);
    if (u.startsWith(`${i}/`))
      throw ce("invalid-project-path", "目录不能移动到自身内部。");
    const o = (await this.open()).transaction([se, oe], "readwrite"), c = await Ns(o, t), a = o.objectStore(oe), l = await xe(a.index(Mt).getAll(t)), f = l.filter((g) => g.path === i || g.path.startsWith(`${i}/`));
    if (!f.length) throw ce("entry-not-found", "找不到文件或目录。");
    await Gr(l, u);
    const h = new Set(f.map((g) => g.path)), d = new Set(f.map((g) => g.path === i ? u : `${u}${g.path.slice(i.length)}`));
    if (l.some((g) => !h.has(g.path) && d.has(g.path)))
      throw ce("entry-exists", "目标路径已经存在。");
    const m = this.now();
    return f.forEach((g) => {
      const I = g.path === i ? u : `${u}${g.path.slice(i.length)}`;
      a.delete([t, g.path]), a.add({ ...g, path: I, updatedAt: m });
    }), c.editorState = yc(c.editorState, i, u), c.updatedAt = m, o.objectStore(se).put(c), await ht(o), this.getEntry(t, u);
  }
  async deleteEntry(t, n) {
    const r = le(n), u = (await this.open()).transaction([se, oe], "readwrite"), s = await Ns(u, t), o = u.objectStore(oe), a = (await xe(o.index(Mt).getAll(t))).filter((f) => f.path === r || f.path.startsWith(`${r}/`));
    if (!a.length) throw ce("entry-not-found", "找不到文件或目录。");
    a.forEach((f) => o.delete([t, f.path]));
    const l = this.now();
    s.editorState = gc(s.editorState, r), s.updatedAt = l, u.objectStore(se).put(s), await ht(u);
  }
  async getEntry(t, n) {
    const r = le(n);
    await this.getProject(t);
    const i = await this.open(), u = await xe(
      i.transaction(oe, "readonly").objectStore(oe).get([t, r])
    );
    if (!u) throw ce("entry-not-found", "找不到文件或目录。");
    return rt(u);
  }
  async close() {
    if (!this.databasePromise) return;
    (await this.databasePromise).close(), this.databasePromise = null;
  }
  async open() {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((t, n) => {
      const r = this.indexedDB.open(this.databaseName, Jr);
      r.onupgradeneeded = () => {
        const i = r.result;
        i.objectStoreNames.contains(se) || i.createObjectStore(se, { keyPath: "uuid" }), i.objectStoreNames.contains(oe) || i.createObjectStore(oe, { keyPath: ["projectId", "path"] }).createIndex(Mt, "projectId", { unique: !1 });
      }, r.onsuccess = () => t(r.result), r.onerror = () => n(r.error || new Error("Developer Studio database failed to open.")), r.onblocked = () => n(new Error("Developer Studio database upgrade is blocked."));
    });
    try {
      return await this.databasePromise;
    } catch (t) {
      throw this.databasePromise = null, t;
    }
  }
  async updateProject(t, n) {
    const i = (await this.open()).transaction(se, "readwrite"), u = i.objectStore(se), s = await xe(u.get(t));
    if (!s) throw ce("project-not-found", "找不到项目。");
    return n(s), s.updatedAt = this.now(), u.put(s), await ht(i), rt(s);
  }
  async createEntry(t, n, r, i) {
    const u = le(n), o = (await this.open()).transaction([se, oe], "readwrite"), c = await Ns(o, t), a = o.objectStore(oe), l = await xe(a.index(Mt).getAll(t));
    if (l.some((d) => d.path === u))
      throw ce("entry-exists", "目标路径已经存在。");
    await Gr(l, u);
    const f = this.now(), h = {
      projectId: t,
      path: u,
      kind: r,
      ...r === "file" ? { content: String(i ?? "") } : {},
      createdAt: f,
      updatedAt: f
    };
    return a.add(h), c.updatedAt = f, o.objectStore(se).put(c), await ht(o), rt(h);
  }
}
function mc(e, t, n) {
  const r = /* @__PURE__ */ new Set(), i = e.map((u) => {
    const s = le(u.path);
    if (r.has(s)) throw ce("entry-exists", `模板包含重复路径：${s}`);
    r.add(s);
    const o = u.kind === "directory" ? "directory" : "file";
    return {
      projectId: t,
      path: s,
      kind: o,
      ...o === "file" ? { content: String(u.content ?? "") } : {},
      createdAt: n,
      updatedAt: n
    };
  });
  return i.forEach((u) => {
    const s = _s(u.path);
    if (!s) return;
    const o = i.find((c) => c.path === s);
    if (!o || o.kind !== "directory")
      throw ce("parent-directory-not-found", `模板缺少父目录：${s}`);
  }), i;
}
async function Ns(e, t) {
  const n = await xe(e.objectStore(se).get(t));
  if (!n) throw ce("project-not-found", "找不到项目。");
  return n;
}
async function Gr(e, t) {
  const n = _s(t);
  if (!n) return;
  const r = e.find((i) => i.path === n);
  if (!r || r.kind !== "directory")
    throw ce("parent-directory-not-found", "父目录不存在。");
}
function hc(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const n = [...t].map((r) => r.toString(16).padStart(2, "0"));
  return `${n.slice(0, 4).join("")}-${n.slice(4, 6).join("")}-${n.slice(6, 8).join("")}-${n.slice(8, 10).join("")}-${n.slice(10).join("")}`;
}
function Xr(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw ce("invalid-project-name", "项目名称不能为空。");
  return t;
}
function Qs(e) {
  const t = e && typeof e == "object" ? e : {}, n = (u) => [...new Set((Array.isArray(u) ? u : []).map((s) => {
    try {
      return le(s);
    } catch {
      return null;
    }
  }).filter(Boolean))], r = n(t.openFiles), i = t.activeFile ? le(t.activeFile) : r[0] || null;
  return {
    openFiles: r,
    activeFile: i,
    recentFiles: n(t.recentFiles).slice(0, 20)
  };
}
function yc(e, t, n) {
  const r = (i) => i === t || i?.startsWith(`${t}/`) ? `${n}${i.slice(t.length)}` : i;
  return Qs({
    openFiles: e?.openFiles?.map(r),
    activeFile: r(e?.activeFile),
    recentFiles: e?.recentFiles?.map(r)
  });
}
function gc(e, t) {
  const n = (i) => i !== t && !i.startsWith(`${t}/`), r = (e?.openFiles || []).filter(n);
  return Qs({
    openFiles: r,
    activeFile: e?.activeFile && n(e.activeFile) ? e.activeFile : r[0] || null,
    recentFiles: (e?.recentFiles || []).filter(n)
  });
}
function Zr(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function rt(e) {
  return structuredClone(e);
}
function xe(e) {
  return new Promise((t, n) => {
    e.onsuccess = () => t(e.result), e.onerror = () => n(e.error || new Error("IndexedDB request failed."));
  });
}
function ht(e) {
  return new Promise((t, n) => {
    e.oncomplete = () => t(), e.onerror = () => n(e.error || new Error("IndexedDB transaction failed.")), e.onabort = () => n(e.error || new Error("IndexedDB transaction was aborted."));
  });
}
function ce(e, t) {
  const n = new Error(t);
  return n.code = e, n;
}
function Yr(e, t) {
  return cc(e, t);
}
function wc(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((i) => n.set(i.path, {
    ...i,
    name: Dn(i.path),
    children: []
  })), n.forEach((i) => {
    const u = _s(i.path);
    u ? n.get(u)?.children.push(i) : t.push(i);
  });
  const r = (i) => i.sort((u, s) => u.kind !== s.kind ? u.kind === "directory" ? -1 : 1 : u.name.localeCompare(s.name)).forEach((u) => r(u.children));
  return r(t), t;
}
function vc(e) {
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
const ao = "webwindows-project-snapshot-v1";
async function bc(e, t, n = {}) {
  if (!e || typeof e.readProjectState != "function")
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  const r = await e.readProjectState(t), i = r.entries.filter((a) => a.kind === "file").map((a) => Object.freeze({
    path: le(a.path),
    content: String(a.content ?? ""),
    byteLength: ts(a.content ?? "").byteLength
  })).sort((a, l) => $c(a.path, l.path)), u = /* @__PURE__ */ new Set();
  for (const a of i) {
    if (u.has(a.path)) throw new Error(`Snapshot contains duplicate path: ${a.path}`);
    u.add(a.path);
  }
  const s = i.reduce((a, l) => a + l.byteLength, 0), o = await Pc(kc(r.project.uuid, i)), c = {
    contract: ao,
    schemaVersion: 1,
    projectUuid: r.project.uuid,
    projectDisplayName: r.project.displayName,
    snapshotId: `wws1-${o}`,
    revisionHash: o,
    createdAt: n.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    manifestPath: "manifest.json",
    fileCount: i.length,
    totalBytes: s,
    files: Object.freeze(i)
  };
  return Object.freeze(c);
}
function Fn(e, t) {
  const n = le(t);
  return e.files.find((r) => r.path === n) || null;
}
async function Pc(e) {
  const t = globalThis.crypto;
  if (!t?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const n = await t.subtle.digest("SHA-256", e);
  return [...new Uint8Array(n)].map((r) => r.toString(16).padStart(2, "0")).join("");
}
function kc(e, t) {
  const n = [ts(`${ao}\0${e}\0`)];
  for (const s of t) {
    const o = ts(s.path), c = ts(s.content);
    n.push(Qr(o.byteLength), o, Qr(c.byteLength), c);
  }
  const r = n.reduce((s, o) => s + o.byteLength, 0), i = new Uint8Array(r);
  let u = 0;
  for (const s of n)
    i.set(s, u), u += s.byteLength;
  return i;
}
function Qr(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e, !1), t;
}
function ts(e) {
  return new TextEncoder().encode(String(e));
}
function $c(e, t) {
  const n = ts(e), r = ts(t), i = Math.min(n.length, r.length);
  for (let u = 0; u < i; u += 1)
    if (n[u] !== r[u]) return n[u] - r[u];
  return n.length - r.length;
}
let _n;
async function us() {
  return _n || (_n = Sc()), _n;
}
async function Sc() {
  const e = await Promise.all([
    Ct("/data/sdk/manifest-v1.schema.json"),
    Ct("/data/sdk/manifest-v2.schema.json"),
    Ct("/data/sdk/permissions-v1.json"),
    Ct("/data/sdk/capability-broker-methods-v1.json"),
    Ct("/data/sdk/package-runtime-policy-v1.json"),
    Ct("/data/sdk/runtime-compatibility-v1.json"),
    Ct("/data/sdk/studio-validator-rules-v1.json"),
    xc("/data/sdk/webwindows-public-api-v1.d.ts")
  ]);
  return Object.freeze({
    manifestSchema: e[0],
    manifestSchemas: Object.freeze({ 1: e[0], 2: e[1] }),
    permissionRegistry: e[2],
    brokerMethods: e[3],
    packagePolicy: e[4],
    runtimeCompatibility: e[5],
    ruleCatalog: e[6],
    publicApiText: e[7]
  });
}
async function Ct(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.json();
}
async function xc(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.text();
}
const _c = "webwindows-studio-validation-report-v1";
async function Hn(e, t = {}) {
  const n = t.contracts || await us(), r = Wc(n.ruleCatalog), i = [], u = (h, d = {}) => i.push(Dc(r, h, d));
  jc(n, u), Ec(e, n.packagePolicy, u);
  const s = e.files.find((h) => h.path === "manifest.json");
  let o = null;
  if (!s)
    u("WWP001", { path: "manifest.json", message: "ZIP root 必须包含 manifest.json。" });
  else
    try {
      o = JSON.parse(s.content);
    } catch (h) {
      u("WWM001", {
        path: "manifest.json",
        location: Uc(s.content, h.message),
        message: h.message
      });
    }
  o && (Ac(o, n, u), Cc(e, o, n.packagePolicy, u)), qc(e, o, n, u);
  const c = [...new Map(i.map((h) => [Jc(h), h])).values()].sort(Kc), a = c.filter((h) => h.severity === "error").length, l = c.filter((h) => h.severity === "warning").length, f = typeof o?.entry == "string" ? o.entry : null;
  return {
    contract: _c,
    schemaVersion: 1,
    validatorVersion: n.ruleCatalog.validatorVersion,
    snapshotId: e.snapshotId,
    projectUuid: e.projectUuid,
    manifestIdentity: Bc(o),
    passed: a === 0,
    errorCount: a,
    warningCount: l,
    diagnostics: c,
    packageFacts: {
      fileCount: e.fileCount,
      unpackedBytes: e.totalBytes,
      entry: f,
      runtimeModel: n.packagePolicy.runtimeModel
    },
    scannerLimitations: [
      "Source diagnostics are conservative static checks, not a complete JavaScript security analysis.",
      "Dynamic URLs and computed property access may require future server/admin review."
    ]
  };
}
function jc(e, t) {
  const n = e.runtimeCompatibility.packageRuntime;
  (n?.status !== "supported" || n?.model !== e.packagePolicy.runtimeModel) && t("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
}
function Ec(e, t, n) {
  (!e.files.length || e.fileCount !== e.files.length || e.fileCount > t.limits.maxFiles) && n("WWP003", {
    message: `文件数量必须为 1-${t.limits.maxFiles}，当前为 ${e.fileCount}。`,
    metadata: { limit: t.limits.maxFiles, actual: e.fileCount }
  }), e.totalBytes > t.limits.maxUnpackedBytes && n("WWP004", {
    message: `项目解压后不能超过 ${t.limits.maxUnpackedBytes} bytes。`,
    metadata: { limit: t.limits.maxUnpackedBytes, actual: e.totalBytes }
  });
  const r = new Set(t.allowedExtensions);
  for (const i of e.files) {
    try {
      const s = le(i.path);
      if (s !== i.path || s.length > t.limits.maxPathCharacters)
        throw new Error("not canonical");
    } catch {
      n("WWP002", { path: i.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const u = fr(i.path);
    r.has(u) || n("WWP005", {
      path: i.path,
      message: `Package Runtime 不允许文件类型 ${u || "(none)"}。`,
      metadata: { extension: u }
    });
  }
}
function Ac(e, t, n) {
  const r = Wt(e);
  if (r == null) {
    n("WWM005", {
      path: "manifest.json$.manifestVersion",
      message: "不支持的 Manifest 版本；legacy v1 省略 manifestVersion，v2 显式使用数字 2。"
    });
    return;
  }
  const i = t.manifestSchemas?.[r] || t.manifestSchema, u = r === 2 ? xs : Ss;
  if (!u(e))
    for (const c of u.errors || [])
      Mc(r, c) || n("WWM002", {
        path: `manifest.json${zc(c.instancePath, c.params?.missingProperty)}`,
        message: c.message || c.keyword,
        metadata: { keyword: c.keyword, schemaPath: c.schemaPath }
      });
  Ic(e, r, t.permissionRegistry, n), r === 2 && e.sdk?.apiVersion !== void 0 && e.sdk.apiVersion !== "1" && n("WWM009", {
    path: "manifest.json$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。",
    metadata: { actual: e.sdk.apiVersion }
  });
  const s = i.$defs?.sourceManifest?.properties || {};
  for (const [c, a] of Object.entries(s)) {
    if (!Object.prototype.hasOwnProperty.call(e, c)) continue;
    const l = Hc(i, a), f = `${a.description || ""} ${l.description || ""}`;
    l.readOnly === !0 || /server-(?:managed|generated)|published catalog/i.test(f) ? n("WWM003", {
      path: `manifest.json$.${c}`,
      message: `${c} 是发布端生成的只读字段，不能进入 Source Manifest。`
    }) : /platform-reserved/i.test(f) && n("WWM004", {
      path: `manifest.json$.${c}`,
      message: `${c} 是平台保留字段。`
    });
  }
  const o = [
    [e.type === "system", "$.type", "system 类型属于第一方平台能力。"],
    [e.install?.source && e.install.source !== "repository", "$.install.source", "第三方 Source Manifest 应使用 repository source。"],
    [e.window?.mode && e.window.mode !== "iframe", "$.window.mode", "第三方功能当前仅兼容 iframe window mode。"]
  ];
  for (const [c, a, l] of o)
    c && n("WWM004", { path: `manifest.json${a}`, message: l });
}
function Ic(e, t, n, r) {
  if (t === 1) {
    Object.prototype.hasOwnProperty.call(e, "permissions") && r("WWM008", {
      path: "manifest.json$.permissions",
      message: "Manifest v1 不承载权限声明；该字段不会授予能力，请显式迁移到 v2。"
    });
    return;
  }
  if (!Array.isArray(e.permissions)) return;
  const i = new Set((n?.permissions || []).map((o) => o.id)), u = new Set(n?.sourceDeclaration?.declarablePermissionIds || []), s = /* @__PURE__ */ new Set();
  e.permissions.forEach((o, c) => {
    if (typeof o != "string") return;
    const a = `manifest.json$.permissions[${c}]`;
    s.has(o) && r("WWM007", { path: a, message: `重复权限：${o}`, metadata: { permission: o } }), s.add(o), Tc(o) ? r("WWM008", { path: a, message: `禁止声明超级或私有权限：${o}`, metadata: { permission: o } }) : i.has(o) ? u.has(o) || r("WWM008", { path: a, message: `权限尚未开放 Source Manifest 声明：${o}`, metadata: { permission: o } }) : r("WWM006", { path: a, message: `未知权限：${o}`, metadata: { permission: o } });
  });
}
function Tc(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function Mc(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function Cc(e, t, n, r) {
  if (typeof t.entry != "string") return;
  let i;
  try {
    i = le(t.entry);
  } catch {
    r("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  (!n.entryExtensions.includes(fr(i)) || !Fn(e, i)) && r("WWP006", {
    path: "manifest.json$.entry",
    message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
    metadata: { entry: i }
  });
}
function qc(e, t, n, r) {
  const i = Fc(n.publicApiText), u = new Set(e.files.map((s) => s.path));
  for (const s of e.files) {
    const o = fr(s.path);
    o === ".js" && Oc(s, i, t, r), (o === ".html" || o === ".htm") && Nc(s, u, r), o === ".css" && Rc(s, r);
  }
  (n.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported" || n.runtimeCompatibility.packageRuntime.execution.network !== "none") && r("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
}
function Oc(e, t, n, r) {
  const i = Vc(e.content);
  lt(i, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (s, o) => {
    r("WWS001", { path: e.path, location: Ue(e.content, o), message: "Package Runtime 仅支持 classic JavaScript。" });
  }), lt(i, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (s, o) => {
    r("WWS003", { path: e.path, location: Ue(e.content, o), message: "功能代码不能引用私有 Native API。" });
  }), lt(i, /\bparent\s*\.\s*WebWindows\b/g, (s, o) => {
    r("WWS004", { path: e.path, location: Ue(e.content, o), message: "功能代码不能访问 parent.WebWindows。" });
  }), lt(i, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (s, o) => {
    const c = s[1];
    t.has(c) || r("WWS004", {
      path: e.path,
      location: Ue(e.content, o),
      message: `WebWindows.${c} 不属于 Public API v1。`,
      metadata: { namespace: c }
    });
  }), lt(i, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (s, o) => {
    r("WWS005", {
      path: e.path,
      location: Ue(e.content, o),
      message: `${s[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
  const u = /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*device\s*\.\s*battery\s*\.\s*(?:getState|refresh)\s*\(/g.exec(i);
  u && (Wt(n) !== 2 || !n.permissions?.includes("device.battery-status.read")) && r("WWM010", {
    path: e.path,
    location: Ue(e.content, u.index),
    message: "Battery Broker API 需要 Manifest v2 声明 device.battery-status.read；静态提示不会自动授予权限。",
    metadata: { requiredPermission: "device.battery-status.read" }
  });
}
function Nc(e, t, n) {
  lt(e.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (r, i) => {
    n("WWS001", { path: e.path, location: Ue(e.content, i), message: "Package Runtime 不支持 script type=module。" });
  }), lt(e.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (r, i) => {
    const u = r[2], s = Lc(e.path, u);
    (!s || !t.has(s)) && n("WWS002", {
      path: e.path,
      location: Ue(e.content, i),
      message: `脚本或样式依赖必须包含在功能包内：${u}`,
      metadata: { reference: u }
    });
  }), lt(e.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (r, i) => {
    n("WWS002", {
      path: e.path,
      location: Ue(e.content, i),
      message: `外部资源在无网络 Runtime 中不可用：${r[1]}`,
      metadata: { reference: r[1] }
    });
  });
}
function Rc(e, t) {
  lt(e.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (n, r) => {
    t("WWS002", {
      path: e.path,
      location: Ue(e.content, r),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${n[1]}`,
      metadata: { reference: n[1] }
    });
  });
}
function Wc(e) {
  return new Map(e.rules.map((t) => [t.ruleId, t]));
}
function Dc(e, t, n) {
  const r = e.get(t);
  if (!r) throw new Error(`Unknown validator rule: ${t}`);
  return {
    ruleId: t,
    category: r.category,
    severity: n.severity || r.defaultSeverity,
    path: n.path || null,
    location: n.location || null,
    message: n.message || r.title,
    ...n.metadata ? { metadata: n.metadata } : {}
  };
}
function Fc(e) {
  const t = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(e)?.[1] || "";
  return new Set([...t.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((n) => n[1]));
}
function Hc(e, t) {
  return t?.$ref?.startsWith("#/$defs/") ? e.$defs?.[t.$ref.slice(8)] || t : t || {};
}
function Lc(e, t) {
  const n = String(t || "").split(/[?#]/, 1)[0];
  if (!n || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(n)) return null;
  const r = e.split("/").slice(0, -1);
  for (const i of n.replace(/\\/g, "/").split("/"))
    !i || i === "." || (i === ".." ? r.pop() : r.push(i));
  return r.join("/");
}
function Vc(e) {
  return e.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (t) => t.replace(/[^\n]/g, " ")
  );
}
function lt(e, t, n) {
  for (const r of e.matchAll(t)) n(r, r.index || 0);
}
function Ue(e, t) {
  const n = e.slice(0, t).split(`
`);
  return { line: n.length, column: n.at(-1).length + 1 };
}
function Uc(e, t) {
  const n = /position\s+(\d+)/i.exec(t);
  return Ue(e, n ? Number(n[1]) : 0);
}
function zc(e, t) {
  return `$${(e || (t ? `/${t}` : "")).split("/").slice(1).map((r) => /^\d+$/.test(r) ? `[${r}]` : `.${r.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}
function Bc(e) {
  return !e || typeof e.id != "string" || typeof e.version != "string" ? null : {
    id: e.id,
    version: e.version,
    name: typeof e.name == "string" ? e.name : null,
    manifestVersion: Wt(e),
    sdkApiVersion: typeof e.sdk?.apiVersion == "string" ? e.sdk.apiVersion : null
  };
}
function fr(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function Kc(e, t) {
  return e.ruleId.localeCompare(t.ruleId) || String(e.path || "").localeCompare(String(t.path || "")) || (e.location?.line || 0) - (t.location?.line || 0) || e.message.localeCompare(t.message);
}
function Jc(e) {
  return [
    e.ruleId,
    e.severity,
    e.path || "",
    e.location?.line || 0,
    e.location?.column || 0,
    e.message
  ].join("\0");
}
const jn = "webwindows-studio-preview-control-v1", Gc = "webwindows-studio-preview-console-v1", Xc = "webwindows-studio-preview-console-init-v1", Zc = "webwindows-studio-preview-session-v1", Yc = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'", Qc = 30 * 1024 * 1024;
function en(e = "preview") {
  const t = globalThis.crypto;
  if (!t?.getRandomValues) throw new Error("Web Crypto is required for Preview sessions.");
  const n = new Uint8Array(24);
  t.getRandomValues(n);
  const r = [...n].map((i) => i.toString(16).padStart(2, "0")).join("");
  return `${e}-${r}`;
}
function ef(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class tf {
  constructor({ onConsole: t, onState: n } = {}) {
    this.onConsole = t || (() => {
    }), this.onState = n || (() => {
    }), this.port = null, this.hostNonce = null, this.requests = /* @__PURE__ */ new Map();
  }
  async connect(t) {
    if (this.disconnect(), !t?.contentWindow) throw new Error("Developer Preview Host 尚未加载。");
    this.hostNonce = en("host");
    const n = new MessageChannel();
    this.port = n.port1, this.port.onmessage = (r) => this.#t(r.data), this.port.start(), t.contentWindow.postMessage({
      protocol: jn,
      version: 1,
      type: "host.connect",
      hostNonce: this.hostNonce
    }, location.origin, [n.port2]), await this.#e("host.ping", {}, 5e3);
  }
  async start(t, n) {
    const r = new TextEncoder().encode(n).byteLength;
    if (r > Qc) throw new Error("Preview document 超过 30 MB 上限。");
    return this.#e("preview.start", {
      session: sf(t),
      token: t.token,
      documentHtml: n,
      documentBytes: r
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
  #e(t, n, r) {
    if (!this.port || !this.hostNonce) return Promise.reject(new Error("Developer Preview Host 未连接。"));
    const i = en("request");
    return new Promise((u, s) => {
      const o = setTimeout(() => {
        this.requests.delete(i), s(new Error(`Developer Preview Host 请求超时：${t}`));
      }, r);
      this.requests.set(i, {
        resolve: (c) => {
          clearTimeout(o), u(c);
        },
        reject: (c) => {
          clearTimeout(o), s(c);
        }
      }), this.port.postMessage({
        protocol: jn,
        version: 1,
        type: t,
        hostNonce: this.hostNonce,
        requestId: i,
        payload: n
      });
    });
  }
  #t(t) {
    if (!ef(t) || t.protocol !== jn || t.version !== 1 || t.hostNonce !== this.hostNonce || typeof t.type != "string") return;
    if (t.type === "preview.console") {
      this.onConsole(t.payload);
      return;
    }
    if (t.type === "preview.state") {
      this.onState(t.payload);
      return;
    }
    if (t.type !== "host.response" || typeof t.requestId != "string") return;
    const n = this.requests.get(t.requestId);
    n && (this.requests.delete(t.requestId), t.ok === !0 ? n.resolve(t.payload) : n.reject(new Error(t.error || "Developer Preview Host 请求失败。")));
  }
}
function sf(e) {
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
function nf({ sessionId: e, snapshotId: t, token: n }) {
  const r = JSON.stringify({
    initProtocol: Xc,
    protocol: Gc,
    sessionId: e,
    snapshotId: t,
    token: n
  }).replace(/</g, "\\u003c");
  return `;(${rf.toString()})(${r});`;
}
function rf(e) {
  let u = null, s = 0;
  const o = [];
  function c(h) {
    const d = String(h);
    return d.length <= 4096 ? d : `${d.slice(0, 4096)}…[truncated]`;
  }
  function a(h, d, m) {
    if (h == null || typeof h == "boolean") return h;
    if (typeof h == "string" || typeof h == "number") return c(h);
    if (typeof h == "bigint") return `${h}n`;
    if (typeof h > "u") return "[undefined]";
    if (typeof h == "function") return `[Function${h.name ? ` ${h.name}` : ""}]`;
    if (typeof h == "symbol") return c(h.toString());
    if (h === globalThis || h === globalThis.window) return "[Window]";
    if (d >= 4) return "[Max depth]";
    if (m.has(h)) return "[Circular]";
    m.add(h);
    try {
      if (typeof Error < "u" && h instanceof Error)
        return { name: c(h.name), message: c(h.message), stack: c(h.stack || "") };
      if (typeof Node < "u" && h instanceof Node)
        return `[DOM ${h.nodeName || "Node"}]`;
      if (Array.isArray(h)) {
        const j = h.slice(0, 40).map((O) => a(O, d + 1, m));
        return h.length > 40 && j.push(`[${h.length - 40} more items]`), j;
      }
      const g = {}, I = Object.keys(h).slice(0, 40);
      for (const j of I)
        try {
          g[c(j)] = a(h[j], d + 1, m);
        } catch (O) {
          g[c(j)] = `[Unreadable: ${c(O?.message || O)}]`;
        }
      return Object.keys(h).length > 40 && (g["…"] = "[truncated properties]"), g;
    } catch (g) {
      return `[Unserializable: ${c(g?.message || g)}]`;
    } finally {
      m.delete(h);
    }
  }
  function l(h, d) {
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
      arguments: Array.from(d).map((m) => a(m, 0, /* @__PURE__ */ new Set()))
    };
  }
  function f(h, d) {
    const m = l(h, d);
    if (u)
      try {
        u.postMessage(m);
      } catch {
      }
    else o.length < 200 && o.push(m);
  }
  for (const h of ["log", "info", "warn", "error", "debug"]) {
    const d = console[h]?.bind(console) || console.log.bind(console);
    console[h] = function(...m) {
      f(h, m), d(...m);
    };
  }
  addEventListener("error", (h) => f("error", [{
    name: "UncaughtError",
    message: h.message || "Uncaught error",
    file: h.filename || null,
    line: h.lineno || null,
    column: h.colno || null,
    error: h.error || null
  }])), addEventListener("unhandledrejection", (h) => f("error", [{
    name: "UnhandledRejection",
    reason: h.reason
  }])), addEventListener("message", function(d) {
    const m = d.data;
    if (!(!m || m.protocol !== e.initProtocol || m.version !== 1 || m.sessionId !== e.sessionId || m.snapshotId !== e.snapshotId || m.token !== e.token || d.ports.length !== 1 || u))
      for (u = d.ports[0], u.start?.(); o.length; ) u.postMessage(o.shift());
  });
}
const Ln = Object.freeze({
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8",
  ".svg": "image/svg+xml;charset=utf-8"
}), of = /* @__PURE__ */ new Set([".html", ".htm", ...Object.keys(Ln)]);
function af(e, t, n = {}) {
  const r = Fn(e, "manifest.json");
  if (!r) throw new Error("Preview Snapshot 缺少 manifest.json。");
  const i = JSON.parse(r.content), u = le(i.entry), s = Fn(e, u);
  if (!s || ![".html", ".htm"].includes(as(u)))
    throw new Error("Preview Snapshot 的 HTML entry 不存在。");
  const c = (n.domParser || new DOMParser()).parseFromString(s.content, "text/html");
  if (c.querySelector('script[type="module"]')) throw new Error("Developer Preview 不支持 ES Module。");
  const a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  for (const d of e.files) {
    const m = as(d.path);
    of.has(m) && Object.prototype.hasOwnProperty.call(Ln, m) && ![".css", ".js"].includes(m) && a.set(d.path, lf(d.content, Ln[m]));
  }
  for (const d of e.files) {
    const m = as(d.path);
    m === ".js" && l.set(d.path, d.content), m === ".css" && l.set(d.path, ei(d.content, d.path, a));
  }
  const f = c.createElement("meta");
  f.httpEquiv = "Content-Security-Policy", f.content = Yc, c.head.prepend(f);
  const h = c.createElement("script");
  return h.setAttribute("data-webwindows-preview-bootstrap", "v1"), h.textContent = nf(t), c.head.insertBefore(h, f.nextSibling), c.querySelectorAll("script[src]").forEach((d) => {
    const m = d.getAttribute("src"), g = cs(u, m);
    if (!g || as(g) !== ".js" || !l.has(g))
      throw new Error(`Preview 脚本必须来自 Snapshot：${m}`);
    d.removeAttribute("src"), d.textContent = l.get(g);
  }), c.querySelectorAll('link[rel~="stylesheet"][href]').forEach((d) => {
    const m = d.getAttribute("href"), g = cs(u, m);
    if (!g || as(g) !== ".css" || !l.has(g))
      throw new Error(`Preview 样式必须来自 Snapshot：${m}`);
    const I = c.createElement("style");
    I.textContent = l.get(g), d.replaceWith(I);
  }), c.querySelectorAll("style").forEach((d) => {
    d.textContent = ei(d.textContent, u, a);
  }), c.querySelectorAll("[src],[href],[poster]").forEach((d) => {
    for (const m of ["src", "href", "poster"]) {
      if (!d.hasAttribute(m)) continue;
      const g = cs(u, d.getAttribute(m));
      g && a.has(g) && d.setAttribute(m, a.get(g));
    }
  }), c.querySelectorAll("[srcset]").forEach((d) => {
    const m = d.getAttribute("srcset").split(",").map((g) => {
      const I = g.trim().split(/\s+/), j = cs(u, I[0]);
      return j && a.has(j) && (I[0] = a.get(j)), I.join(" ");
    });
    d.setAttribute("srcset", m.join(", "));
  }), `<!DOCTYPE html>
` + c.documentElement.outerHTML;
}
function cs(e, t) {
  const n = String(t || "").split(/[?#]/, 1)[0];
  if (!n || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(n)) return null;
  const r = e.split("/").slice(0, -1);
  for (const i of n.replace(/\\/g, "/").split("/"))
    !i || i === "." || (i === ".." ? r.pop() : r.push(i));
  try {
    return le(r.join("/"));
  } catch {
    return null;
  }
}
function ei(e, t, n) {
  return String(e).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (r, i, u) => {
    const s = cs(t, u);
    return s && n.has(s) ? `url("${n.get(s)}")` : r;
  });
}
function lf(e, t) {
  const n = new TextEncoder().encode(String(e));
  let r = "";
  for (let i = 0; i < n.length; i += 32768)
    r += String.fromCharCode(...n.subarray(i, i + 32768));
  return `data:${t};base64,${btoa(r)}`;
}
function as(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
const uf = 1800 * 1e3;
class cf {
  constructor({ hostClient: t, ttlMs: n = uf, now: r = () => Date.now() }) {
    if (!t) throw new TypeError("PreviewHostClient is required.");
    this.hostClient = t, this.ttlMs = n, this.now = r, this.sessions = /* @__PURE__ */ new Map(), this.activeSessionId = null;
  }
  get activeSession() {
    return this.activeSessionId && this.sessions.get(this.activeSessionId) || null;
  }
  async run(t, { contracts: n, domParser: r } = {}) {
    const i = await Hn(t, { contracts: n });
    if (!i.passed) return { started: !1, validationReport: i, session: null };
    this.activeSession && await this.stop(this.activeSession.sessionId);
    const u = this.#e(t);
    this.sessions.set(u.sessionId, u), this.activeSessionId = u.sessionId;
    try {
      const s = af(t, u, { domParser: r });
      return await this.hostClient.start(u, s), u.state = "running", u.expiryTimer = setTimeout(() => this.stop(u.sessionId).catch(() => {
      }), this.ttlMs), { started: !0, validationReport: i, session: En(u) };
    } catch (s) {
      throw u.state = "failed", u.failure = s?.message || String(s), this.#t(u), s;
    }
  }
  async reload(t, n = {}) {
    const r = this.activeSession;
    r && (r.state = "reloading");
    const i = await Hn(t, { contracts: n.contracts });
    return i.passed ? (r && await this.stop(r.sessionId), this.run(t, n)) : (r && (r.state = "running"), { started: !1, validationReport: i, session: r ? En(r) : null });
  }
  async stop(t = this.activeSessionId) {
    const n = t ? this.sessions.get(t) : null;
    if (!n) return null;
    try {
      await this.hostClient.stop(n);
    } finally {
      n.state = "closed", this.#t(n);
    }
    return En(n);
  }
  async dispose() {
    const t = [...this.sessions.keys()];
    for (const n of t) await this.stop(n).catch(() => {
    });
    this.hostClient.disconnect?.();
  }
  #e(t) {
    const n = this.now();
    return {
      contract: Zc,
      sessionId: en("session"),
      projectUuid: t.projectUuid,
      snapshotId: t.snapshotId,
      token: en("token"),
      createdAt: new Date(n).toISOString(),
      expiresAt: new Date(n + this.ttlMs).toISOString(),
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
function En(e) {
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
const ff = { class: "developer-studio" }, df = { class: "studio-toolbar" }, pf = ["value"], mf = ["value"], hf = ["disabled"], yf = ["disabled"], gf = ["disabled"], wf = ["disabled"], vf = ["disabled"], bf = ["disabled"], Pf = ["disabled"], kf = {
  key: 0,
  class: "studio-main"
}, $f = { class: "explorer-panel" }, Sf = { class: "panel-heading" }, xf = { class: "panel-actions" }, _f = ["disabled"], jf = ["disabled"], Ef = { class: "file-tree" }, Af = { class: "editor-workbench" }, If = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, Tf = ["onClick"], Mf = {
  key: 0,
  class: "dirty-dot"
}, Cf = { class: "editor-host" }, qf = {
  key: 1,
  class: "empty-editor"
}, Of = { class: "inspector-panel" }, Nf = { class: "panel-heading" }, Rf = { class: "panel-switcher" }, Wf = { class: "inspector-content" }, Df = { class: "project-uuid" }, Ff = { class: "build-inspector" }, Hf = { key: 0 }, Lf = { key: 1 }, Vf = {
  key: 0,
  class: "build-blocked"
}, Uf = { key: 1 }, zf = { class: "hash-row" }, Bf = ["disabled"], Kf = { class: "preview-inspector" }, Jf = { class: "preview-session-banner" }, Gf = { key: 0 }, Xf = { key: 1 }, Zf = {
  key: 1,
  class: "empty-workspace studio-main"
}, Yf = { class: "problems-panel" }, Qf = { class: "bottom-tabs" }, ed = ["value"], td = {
  key: 0,
  class: "problems-empty"
}, sd = ["onClick"], nd = {
  key: 0,
  class: "problems-empty"
}, rd = { class: "studio-dialog-actions" }, id = {
  class: "primary",
  type: "submit"
}, od = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new pc(), n = G([]), r = G(null), i = G([]), u = G(""), s = G([]), o = G(""), c = G(""), a = G(/* @__PURE__ */ new Set()), l = G(null), f = G([]), h = G(null), d = G(null), m = G(null), g = G(null), I = G(!1), j = G(null), O = G(!1), M = G(null), R = G([]), Z = G("problems"), he = G("preview"), be = G("all"), Pe = G(""), mt = G(""), ne = G(null);
    let Le = null, Be = 0, $t = 0, St = null, Oe = null;
    const fe = De(() => wc(i.value)), ee = De(() => i.value.find((P) => P.path === o.value)), X = De(() => vc(o.value)), tt = De(() => o.value === "manifest.json" ? f.value : []), xt = De(() => Wt(l.value)), Ve = De(() => m.value?.diagnostics || f.value.map((P) => ({
      ruleId: "Manifest",
      severity: P.severity,
      path: P.path,
      message: P.message
    }))), Ee = De(() => be.value === "all" ? R.value : R.value.filter((P) => P.level === be.value));
    ir(async () => {
      try {
        const P = await us();
        h.value = P.permissionRegistry, d.value = P.brokerMethods, await _t(), n.value.length && await Dt(n.value[0].uuid);
      } catch (P) {
        q(P);
      }
    }), or(() => {
      clearTimeout(Be), Oe?.dispose().catch(() => {
      }), t.close();
    });
    async function _t() {
      n.value = await t.listProjects();
    }
    async function Is() {
      try {
        await S();
        const P = uc(), v = await At("新建 WebWindows 功能", "项目名称", P.displayName);
        if (v == null) return;
        const _ = await t.createProject({ ...P, displayName: v });
        await _t(), await Dt(_.uuid), $("Hello WebWindows 项目已创建。");
      } catch (P) {
        q(P);
      }
    }
    async function Dt(P) {
      if (!P) return;
      M.value && await pe(), await S(), r.value = await t.getProject(P), i.value = await t.listEntries(P);
      const v = r.value.editorState || {};
      s.value = (v.openFiles || []).filter((_) => i.value.some((re) => re.path === _ && re.kind === "file")), o.value = i.value.some((_) => _.path === v.activeFile && _.kind === "file") ? v.activeFile : s.value[0] || "", u.value = o.value, a.value = /* @__PURE__ */ new Set(), z(), await Ke(), await y(), await k();
    }
    async function jt() {
      if (!r.value) return;
      const P = await At("重命名项目", "新的项目名称", r.value.displayName);
      if (P != null)
        try {
          r.value = await t.renameProject(r.value.uuid, P), await _t(), $("项目已重命名。");
        } catch (v) {
          q(v);
        }
    }
    async function Ft() {
      if (r.value && await ye("删除项目", `永久删除项目“${r.value.displayName}”及其全部文件吗？`))
        try {
          const P = r.value.uuid;
          await t.deleteProject(P), r.value = null, i.value = [], s.value = [], o.value = "", u.value = "", c.value = "", z(), await _t(), n.value.length && await Dt(n.value[0].uuid), $("项目已删除。");
        } catch (P) {
          q(P);
        }
    }
    async function ns(P) {
      u.value = P.path, P.kind === "file" && await st(P.path);
    }
    async function st(P) {
      if (!r.value) return;
      await S();
      const v = le(P);
      s.value.includes(v) || s.value.push(v), o.value = v, u.value = v, await Ke(), await k();
    }
    async function Ke() {
      if (!r.value || !o.value) {
        c.value = "";
        return;
      }
      c.value = await t.readTextFile(r.value.uuid, o.value), o.value === "manifest.json" && await p(c.value), await sr();
    }
    function mn(P) {
      c.value = P, o.value && (a.value = new Set(a.value).add(o.value), z(), o.value === "manifest.json" && p(P).catch(q), clearTimeout(Be), Be = window.setTimeout(() => S().catch(q), 700));
    }
    async function p(P) {
      const v = ++$t, _ = await sc(P);
      v === $t && (l.value = _.manifest, f.value = _.diagnostics);
    }
    async function y() {
      if (!r.value || !i.value.some((v) => v.path === "manifest.json" && v.kind === "file")) {
        l.value = null, f.value = [];
        return;
      }
      const P = o.value === "manifest.json" ? c.value : await t.readTextFile(r.value.uuid, "manifest.json");
      await p(P);
    }
    async function b(P) {
      o.value !== "manifest.json" && await st("manifest.json"), mn(`${JSON.stringify(P, null, 2)}
`);
    }
    async function S() {
      if (clearTimeout(Be), Be = 0, !r.value || !o.value || !a.value.has(o.value)) return;
      const P = o.value;
      await t.writeTextFile(r.value.uuid, P, c.value);
      const v = new Set(a.value);
      v.delete(P), a.value = v, r.value = await t.getProject(r.value.uuid);
    }
    async function k() {
      if (!r.value) return;
      const P = [o.value, ...r.value.editorState?.recentFiles || []].filter(Boolean);
      r.value = await t.saveEditorState(r.value.uuid, {
        openFiles: s.value,
        activeFile: o.value || null,
        recentFiles: [...new Set(P)].slice(0, 20)
      });
    }
    function x() {
      const P = i.value.find((v) => v.path === u.value);
      return P?.kind === "directory" ? P.path : P?.path ? _s(P.path) : "";
    }
    async function T(P) {
      if (!r.value) return;
      const _ = await At(P === "directory" ? "新建目录" : "新建文件", P === "directory" ? "目录名称" : "文件名称", P === "directory" ? "new-folder" : "new-file.js");
      if (_ != null)
        try {
          const re = Yr(x(), _);
          P === "directory" ? await t.createDirectory(r.value.uuid, re) : await t.createFile(r.value.uuid, re, ""), z(), i.value = await t.listEntries(r.value.uuid), u.value = re, P === "file" && await st(re);
        } catch (re) {
          q(re);
        }
    }
    async function A() {
      const P = i.value.find((_) => _.path === u.value);
      if (!P || !r.value) return;
      const v = await At("重命名", "新的名称", Dn(P.path));
      if (v != null)
        try {
          await S();
          const _ = Yr(_s(P.path), v);
          await t.renameEntry(r.value.uuid, P.path, _), z(), i.value = await t.listEntries(r.value.uuid), r.value = await t.getProject(r.value.uuid), s.value = r.value.editorState.openFiles, o.value = r.value.editorState.activeFile || "", u.value = _, await Ke();
        } catch (_) {
          q(_);
        }
    }
    async function E() {
      const P = i.value.find((v) => v.path === u.value);
      if (!(!P || !r.value) && await ye("删除文件或目录", `删除“${P.path}”${P.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(r.value.uuid, P.path), z(), i.value = await t.listEntries(r.value.uuid), r.value = await t.getProject(r.value.uuid), s.value = r.value.editorState.openFiles, o.value = r.value.editorState.activeFile || "", u.value = o.value, await Ke();
        } catch (v) {
          q(v);
        }
    }
    function $(P) {
      Pe.value = P, mt.value = "", window.setTimeout(() => {
        Pe.value === P && (Pe.value = "");
      }, 2400);
    }
    function q(P) {
      Pe.value = P?.message || "操作失败。", mt.value = "error";
    }
    async function C() {
      if (!r.value) throw new Error("请先打开项目。");
      return await S(), bc(t, r.value.uuid);
    }
    async function N() {
      if (!I.value) {
        I.value = !0;
        try {
          const P = await C(), v = await us();
          m.value = await Hn(P, { contracts: v }), g.value = null, $(m.value.passed ? "项目验证通过。" : `验证发现 ${m.value.errorCount} 个错误。`);
        } catch (P) {
          q(P);
        } finally {
          I.value = !1;
        }
      }
    }
    async function D() {
      if (!I.value) {
        I.value = !0;
        try {
          const P = await C(), v = await us(), { buildProjectPackage: _ } = await import("./deterministic-builder-D9i-uKy9.js");
          g.value = await _(P, { contracts: v }), m.value = g.value.validationReport, $(g.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
        } catch (P) {
          q(P);
        } finally {
          I.value = !1;
        }
      }
    }
    function U() {
      if (!g.value?.artifactReady || !g.value.zipBytes) return;
      const P = g.value.manifestIdentity, v = `${P?.id || "webwindows-function"}-${P?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-"), _ = new Blob([g.value.zipBytes], { type: "application/zip" }), re = URL.createObjectURL(_), Ts = document.createElement("a");
      Ts.href = re, Ts.download = `${v}.zip`, Ts.click(), window.setTimeout(() => URL.revokeObjectURL(re), 0);
    }
    function z() {
      m.value = null, g.value = null;
    }
    async function B() {
      O.value = !1, Oe?.dispose().catch(() => {
      }), St = new tf({
        onConsole: (P) => {
          const v = M.value || Oe?.activeSession;
          !v || P?.sessionId !== v.sessionId || P?.snapshotId !== v.snapshotId || (R.value = [...R.value, P].slice(-1e3));
        },
        onState: (P) => {
          !M.value || P?.sessionId !== M.value.sessionId || (M.value = { ...M.value, state: P.state });
        }
      }), Oe = new cf({ hostClient: St });
      try {
        await St.connect(j.value), O.value = !0;
      } catch (P) {
        q(P);
      }
    }
    async function de({ reload: P = !1 } = {}) {
      if (!(I.value || !Oe || !O.value)) {
        I.value = !0;
        try {
          const v = await C(), _ = await us(), re = P && M.value ? await Oe.reload(v, { contracts: _ }) : await Oe.run(v, { contracts: _ });
          if (m.value = re.validationReport, g.value = null, Z.value = re.started ? "console" : "problems", he.value = "preview", !re.started) {
            $(`Developer Preview 被 ${re.validationReport.errorCount} 个验证错误阻止。`);
            return;
          }
          M.value = re.session, $(P ? "Developer Preview 已从新 Snapshot 重新加载。" : "Developer Preview 已启动。");
        } catch (v) {
          q(v);
        } finally {
          I.value = !1;
        }
      }
    }
    async function pe() {
      if (!(!Oe || !M.value))
        try {
          await Oe.stop(M.value.sessionId), M.value = null, $("Developer Preview 已停止，会话凭据已撤销。");
        } catch (P) {
          q(P);
        }
    }
    function Ne() {
      R.value = [];
    }
    function Re(P) {
      return P.arguments.map((v) => typeof v == "string" ? v : JSON.stringify(v)).join(" ");
    }
    function Et(P) {
      const v = i.value.find((_) => _.kind === "file" && (P.path === _.path || P.path?.startsWith(`${_.path}$`)));
      v && st(v.path).catch(q);
    }
    function At(P, v, _) {
      return Ae({ kind: "text", title: P, message: v, value: _ });
    }
    function ye(P, v) {
      return Ae({ kind: "confirm", title: P, message: v, value: "" });
    }
    function Ae(P) {
      return Le && Le(null), ne.value = { ...P }, new Promise((v) => {
        Le = v;
      });
    }
    function Ht(P) {
      const v = Le;
      Le = null, ne.value = null, v?.(P);
    }
    return (P, v) => (W(), H("main", ff, [
      w("header", df, [
        v[18] || (v[18] = w("div", { class: "studio-brand" }, [
          w("strong", null, "Developer Studio"),
          w("span", null, "WebWindows Function IDE")
        ], -1)),
        w("button", {
          class: "primary",
          type: "button",
          onClick: Is
        }, "新建功能"),
        w("select", {
          "aria-label": "打开项目",
          value: r.value?.uuid || "",
          onChange: v[0] || (v[0] = (_) => Dt(_.target.value).catch(q))
        }, [
          v[17] || (v[17] = w("option", {
            value: "",
            disabled: ""
          }, "打开项目…", -1)),
          (W(!0), H(ie, null, gt(n.value, (_) => (W(), H("option", {
            key: _.uuid,
            value: _.uuid
          }, V(_.displayName), 9, mf))), 128))
        ], 40, pf),
        w("button", {
          type: "button",
          disabled: !r.value,
          onClick: jt
        }, "重命名项目", 8, hf),
        w("button", {
          type: "button",
          disabled: !r.value,
          onClick: Ft
        }, "删除项目", 8, yf),
        v[19] || (v[19] = w("span", { class: "toolbar-spacer" }, null, -1)),
        w("button", {
          type: "button",
          disabled: !r.value || I.value,
          onClick: N
        }, "Validate", 8, gf),
        w("button", {
          class: "primary",
          type: "button",
          disabled: !r.value || I.value,
          onClick: D
        }, "Build", 8, wf),
        w("button", {
          class: "primary",
          type: "button",
          disabled: !r.value || I.value || !O.value,
          onClick: v[1] || (v[1] = (_) => de())
        }, "Run", 8, vf),
        w("button", {
          type: "button",
          disabled: !M.value || I.value,
          onClick: v[2] || (v[2] = (_) => de({ reload: !0 }))
        }, "Reload", 8, bf),
        w("button", {
          type: "button",
          disabled: !M.value,
          onClick: pe
        }, "Stop", 8, Pf)
      ]),
      r.value ? (W(), H("section", kf, [
        w("aside", $f, [
          w("div", Sf, [
            w("span", null, "Project · " + V(r.value.displayName), 1),
            w("div", xf, [
              w("button", {
                type: "button",
                title: "新建文件",
                onClick: v[3] || (v[3] = (_) => T("file"))
              }, "＋F"),
              w("button", {
                type: "button",
                title: "新建目录",
                onClick: v[4] || (v[4] = (_) => T("directory"))
              }, "＋D"),
              w("button", {
                type: "button",
                title: "重命名",
                disabled: !u.value,
                onClick: A
              }, "R", 8, _f),
              w("button", {
                type: "button",
                title: "删除",
                disabled: !u.value,
                onClick: E
              }, "×", 8, jf)
            ])
          ]),
          w("div", Ef, [
            (W(!0), H(ie, null, gt(fe.value, (_) => (W(), Js(Ll, {
              key: _.path,
              node: _,
              "selected-path": u.value,
              onSelect: ns
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ]),
        w("section", Af, [
          w("nav", If, [
            (W(!0), H(ie, null, gt(s.value, (_) => (W(), H("button", {
              key: _,
              type: "button",
              class: je(["editor-tab", { active: _ === o.value }]),
              onClick: (re) => st(_).catch(q)
            }, [
              w("span", null, V(Si(Dn)(_)), 1),
              a.value.has(_) ? (W(), H("span", Mf, "•")) : We("", !0)
            ], 10, Tf))), 128))
          ]),
          w("div", Cf, [
            ee.value?.kind === "file" ? (W(), Js(zl, {
              key: `${r.value.uuid}:${o.value}`,
              "project-id": r.value.uuid,
              path: o.value,
              language: X.value,
              value: c.value,
              markers: tt.value,
              "onUpdate:value": mn,
              onSave: v[5] || (v[5] = (_) => S().then(() => $("已保存。")).catch(q)),
              onError: q
            }, null, 8, ["project-id", "path", "language", "value", "markers"])) : (W(), H("div", qf, [...v[20] || (v[20] = [
              w("h2", null, "选择文件开始编辑", -1),
              w("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ])
        ]),
        w("aside", Of, [
          w("div", Nf, [
            v[21] || (v[21] = w("span", null, "Inspector", -1)),
            w("div", Rf, [
              w("button", {
                type: "button",
                class: je({ active: he.value === "manifest" }),
                onClick: v[6] || (v[6] = (_) => he.value = "manifest")
              }, "Manifest", 2),
              w("button", {
                type: "button",
                class: je({ active: he.value === "preview" }),
                onClick: v[7] || (v[7] = (_) => he.value = "preview")
              }, "Preview", 2)
            ])
          ]),
          Os(w("div", Wf, [
            w("h2", null, "Manifest " + V(xt.value === 2 ? "v2" : xt.value === 1 ? "v1" : "unsupported"), 1),
            w("p", Df, "项目 UUID：" + V(r.value.uuid), 1),
            Ye(_u, {
              manifest: l.value,
              diagnostics: f.value,
              "permission-registry": h.value,
              "broker-methods": d.value,
              "onUpdate:manifest": v[8] || (v[8] = (_) => b(_).catch(q)),
              onOpenJson: v[9] || (v[9] = (_) => st("manifest.json").catch(q))
            }, null, 8, ["manifest", "diagnostics", "permission-registry", "broker-methods"]),
            w("section", Ff, [
              v[31] || (v[31] = w("h3", null, "Validation", -1)),
              m.value ? (W(), H("dl", Lf, [
                w("div", null, [
                  v[22] || (v[22] = w("dt", null, "Result", -1)),
                  w("dd", null, V(m.value.passed ? "Passed" : "Blocked"), 1)
                ]),
                w("div", null, [
                  v[23] || (v[23] = w("dt", null, "Errors", -1)),
                  w("dd", null, V(m.value.errorCount), 1)
                ]),
                w("div", null, [
                  v[24] || (v[24] = w("dt", null, "Warnings", -1)),
                  w("dd", null, V(m.value.warningCount), 1)
                ]),
                w("div", null, [
                  v[25] || (v[25] = w("dt", null, "Files", -1)),
                  w("dd", null, V(m.value.packageFacts.fileCount), 1)
                ]),
                w("div", null, [
                  v[26] || (v[26] = w("dt", null, "Bytes", -1)),
                  w("dd", null, V(m.value.packageFacts.unpackedBytes), 1)
                ])
              ])) : (W(), H("p", Hf, "尚未创建 Snapshot 验证。")),
              g.value ? (W(), H(ie, { key: 2 }, [
                v[30] || (v[30] = w("h3", null, "Build Result", -1)),
                g.value.artifactReady ? (W(), H("dl", Uf, [
                  w("div", null, [
                    v[27] || (v[27] = w("dt", null, "Size", -1)),
                    w("dd", null, V(g.value.zipSize) + " bytes", 1)
                  ]),
                  w("div", null, [
                    v[28] || (v[28] = w("dt", null, "Files", -1)),
                    w("dd", null, V(g.value.fileCount), 1)
                  ]),
                  w("div", zf, [
                    v[29] || (v[29] = w("dt", null, "SHA-256", -1)),
                    w("dd", null, V(g.value.sha256), 1)
                  ])
                ])) : (W(), H("p", Vf, "验证未通过，没有生成可发布 ZIP。")),
                w("button", {
                  type: "button",
                  disabled: !g.value.artifactReady,
                  onClick: U
                }, "Export ZIP", 8, Bf)
              ], 64)) : We("", !0)
            ])
          ], 512), [
            [Mr, he.value === "manifest"]
          ]),
          Os(w("div", Kf, [
            w("div", Jf, [
              v[32] || (v[32] = w("strong", null, "Developer Preview", -1)),
              M.value ? (W(), H("span", Gf, V(M.value.state) + " · " + V(M.value.snapshotId), 1)) : (W(), H("span", Xf, "无活动会话"))
            ]),
            w("iframe", {
              ref_key: "previewHostFrame",
              ref: j,
              class: "preview-host-frame",
              src: "developer-preview-host.html?v=20260829-1",
              title: "Trusted Developer Preview Host",
              referrerpolicy: "no-referrer",
              onLoad: B
            }, null, 544)
          ], 512), [
            [Mr, he.value === "preview"]
          ])
        ])
      ])) : (W(), H("section", Zf, [
        v[33] || (v[33] = w("h2", null, "创建第一个 WebWindows 功能", -1)),
        v[34] || (v[34] = w("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        w("button", {
          class: "primary",
          type: "button",
          onClick: Is
        }, "新建 Hello WebWindows")
      ])),
      w("section", Yf, [
        w("div", Qf, [
          w("button", {
            type: "button",
            class: je({ active: Z.value === "problems" }),
            onClick: v[10] || (v[10] = (_) => Z.value = "problems")
          }, [
            v[35] || (v[35] = ae("Problems ", -1)),
            w("span", null, V(Ve.value.length), 1)
          ], 2),
          w("button", {
            type: "button",
            class: je({ active: Z.value === "console" }),
            onClick: v[11] || (v[11] = (_) => Z.value = "console")
          }, [
            v[36] || (v[36] = ae("Console ", -1)),
            w("span", null, V(R.value.length), 1)
          ], 2),
          v[38] || (v[38] = w("span", { class: "bottom-spacer" }, null, -1)),
          Z.value === "console" ? (W(), H(ie, { key: 0 }, [
            Os(w("select", {
              "onUpdate:modelValue": v[12] || (v[12] = (_) => be.value = _),
              "aria-label": "Console level"
            }, [
              v[37] || (v[37] = w("option", { value: "all" }, "All levels", -1)),
              (W(), H(ie, null, gt(["log", "info", "warn", "error", "debug"], (_) => w("option", {
                key: _,
                value: _
              }, V(_), 9, ed)), 64))
            ], 512), [
              [El, be.value]
            ]),
            w("button", {
              type: "button",
              onClick: Ne
            }, "Clear")
          ], 64)) : We("", !0)
        ]),
        Z.value === "problems" ? (W(), H(ie, { key: 0 }, [
          Ve.value.length ? We("", !0) : (W(), H("div", td, "当前 Snapshot 未发现问题。")),
          (W(!0), H(ie, null, gt(Ve.value, (_, re) => (W(), H("button", {
            key: `${_.ruleId}:${_.path}:${re}`,
            type: "button",
            class: "problem-row",
            onClick: (Ts) => Et(_)
          }, [
            w("span", {
              class: je(["problem-severity", _.severity])
            }, V(_.ruleId), 3),
            w("code", null, V(_.path), 1),
            w("span", null, V(_.message), 1)
          ], 8, sd))), 128))
        ], 64)) : (W(), H(ie, { key: 1 }, [
          Ee.value.length ? We("", !0) : (W(), H("div", nd, "当前 Developer Preview 尚无 Console 输出。")),
          (W(!0), H(ie, null, gt(Ee.value, (_) => (W(), H("div", {
            key: `${_.sessionId}:${_.sequence}`,
            class: je(["console-row", _.level])
          }, [
            w("time", null, V(_.timestamp), 1),
            w("strong", null, V(_.level), 1),
            w("span", null, V(Re(_)), 1),
            w("code", null, V(_.snapshotId), 1)
          ], 2))), 128))
        ], 64))
      ]),
      Pe.value ? (W(), H("div", {
        key: 2,
        class: je(["studio-status", mt.value]),
        role: "status"
      }, V(Pe.value), 3)) : We("", !0),
      ne.value ? (W(), H("div", {
        key: 3,
        class: "studio-dialog-backdrop",
        onKeydown: v[16] || (v[16] = Ml((_) => Ht(ne.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        w("form", {
          class: "studio-dialog",
          onSubmit: v[15] || (v[15] = cr((_) => Ht(ne.value.kind === "confirm" ? !0 : ne.value.value), ["prevent"]))
        }, [
          w("h2", null, V(ne.value.title), 1),
          w("p", null, V(ne.value.message), 1),
          ne.value.kind === "text" ? Os((W(), H("input", {
            key: 0,
            "onUpdate:modelValue": v[13] || (v[13] = (_) => ne.value.value = _),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [jl, ne.value.value]
          ]) : We("", !0),
          w("div", rd, [
            w("button", {
              type: "button",
              onClick: v[14] || (v[14] = (_) => Ht(ne.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            w("button", id, V(ne.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : We("", !0)
    ]));
  }
};
Ol(od).mount("#developer-studio-app");
export {
  Wt as a,
  Fn as g,
  Pc as s,
  Hn as v
};
