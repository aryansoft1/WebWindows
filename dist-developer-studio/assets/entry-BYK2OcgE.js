/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function hn(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const r of e.split(",")) t[r] = 1;
  return (r) => r in t;
}
const Y = {}, Kt = [], tt = () => {
}, Oi = () => !1, $r = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), mn = (e) => e.startsWith("onUpdate:"), Ee = Object.assign, yn = (e, t) => {
  const r = e.indexOf(t);
  r > -1 && e.splice(r, 1);
}, Ho = Object.prototype.hasOwnProperty, G = (e, t) => Ho.call(e, t), H = Array.isArray, Zt = (e) => Rs(e) === "[object Map]", Ir = (e) => Rs(e) === "[object Set]", zn = (e) => Rs(e) === "[object Date]", B = (e) => typeof e == "function", pe = (e) => typeof e == "string", st = (e) => typeof e == "symbol", re = (e) => e !== null && typeof e == "object", Ti = (e) => (re(e) || B(e)) && B(e.then) && B(e.catch), Mi = Object.prototype.toString, Rs = (e) => Mi.call(e), Bo = (e) => Rs(e).slice(8, -1), Ci = (e) => Rs(e) === "[object Object]", gn = (e) => pe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ks = /* @__PURE__ */ hn(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), qr = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((r) => t[r] || (t[r] = e(r)));
}, Uo = /-\w/g, Be = qr(
  (e) => e.replace(Uo, (t) => t.slice(1).toUpperCase())
), Ko = /\B([A-Z])/g, _t = qr(
  (e) => e.replace(Ko, "-$1").toLowerCase()
), Sr = qr((e) => e.charAt(0).toUpperCase() + e.slice(1)), Dr = qr(
  (e) => e ? `on${Sr(e)}` : ""
), qt = (e, t) => !Object.is(e, t), sr = (e, ...t) => {
  for (let r = 0; r < e.length; r++)
    e[r](...t);
}, Ni = (e, t, r, a = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: a,
    value: r
  });
}, or = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Fn;
const xr = () => Fn || (Fn = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function wn(e) {
  if (H(e)) {
    const t = {};
    for (let r = 0; r < e.length; r++) {
      const a = e[r], l = pe(a) ? Xo(a) : wn(a);
      if (l)
        for (const u in l)
          t[u] = l[u];
    }
    return t;
  } else if (pe(e) || re(e))
    return e;
}
const Zo = /;(?![^(]*\))/g, Jo = /:([^]+)/, Go = /\/\*[^]*?\*\//g;
function Xo(e) {
  const t = {};
  return e.replace(Go, "").split(Zo).forEach((r) => {
    if (r) {
      const a = r.split(Jo);
      a.length > 1 && (t[a[0].trim()] = a[1].trim());
    }
  }), t;
}
function ge(e) {
  let t = "";
  if (pe(e))
    t = e;
  else if (H(e))
    for (let r = 0; r < e.length; r++) {
      const a = ge(e[r]);
      a && (t += a + " ");
    }
  else if (re(e))
    for (const r in e)
      e[r] && (t += r + " ");
  return t.trim();
}
const Yo = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Qo = /* @__PURE__ */ hn(Yo);
function Li(e) {
  return !!e || e === "";
}
function ea(e, t) {
  if (e.length !== t.length) return !1;
  let r = !0;
  for (let a = 0; r && a < e.length; a++)
    r = Ar(e[a], t[a]);
  return r;
}
function Ar(e, t) {
  if (e === t) return !0;
  let r = zn(e), a = zn(t);
  if (r || a)
    return r && a ? e.getTime() === t.getTime() : !1;
  if (r = st(e), a = st(t), r || a)
    return e === t;
  if (r = H(e), a = H(t), r || a)
    return r && a ? ea(e, t) : !1;
  if (r = re(e), a = re(t), r || a) {
    if (!r || !a)
      return !1;
    const l = Object.keys(e).length, u = Object.keys(t).length;
    if (l !== u)
      return !1;
    for (const s in e) {
      const o = e.hasOwnProperty(s), c = t.hasOwnProperty(s);
      if (o && !c || !o && c || !Ar(e[s], t[s]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function ta(e, t) {
  return e.findIndex((r) => Ar(r, t));
}
const Di = (e) => !!(e && e.__v_isRef === !0), N = (e) => pe(e) ? e : e == null ? "" : H(e) || re(e) && (e.toString === Mi || !B(e.toString)) ? Di(e) ? N(e.value) : JSON.stringify(e, Ri, 2) : String(e), Ri = (e, t) => Di(t) ? Ri(e, t.value) : Zt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (r, [a, l], u) => (r[Rr(a, u) + " =>"] = l, r),
    {}
  )
} : Ir(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((r) => Rr(r))
} : st(t) ? Rr(t) : re(t) && !H(t) && !Ci(t) ? String(t) : t, Rr = (e, t = "") => {
  var r;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    st(e) ? `Symbol(${(r = e.description) != null ? r : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Me;
class sa {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Me, !t && Me && (this.index = (Me.scopes || (Me.scopes = [])).push(
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
      const r = Me;
      try {
        return Me = this, t();
      } finally {
        Me = r;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Me, Me = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Me = this.prevScope, this.prevScope = void 0);
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
function ra() {
  return Me;
}
let te;
const zr = /* @__PURE__ */ new WeakSet();
class zi {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Me && Me.active && Me.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, zr.has(this) && (zr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Wi(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Wn(this), Vi(this);
    const t = te, r = Je;
    te = this, Je = !0;
    try {
      return this.fn();
    } finally {
      Hi(this), te = t, Je = r, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Pn(t);
      this.deps = this.depsTail = void 0, Wn(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? zr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Qr(this) && this.run();
  }
  get dirty() {
    return Qr(this);
  }
}
let Fi = 0, $s, Is;
function Wi(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Is, Is = e;
    return;
  }
  e.next = $s, $s = e;
}
function vn() {
  Fi++;
}
function bn() {
  if (--Fi > 0)
    return;
  if (Is) {
    let t = Is;
    for (Is = void 0; t; ) {
      const r = t.next;
      t.next = void 0, t.flags &= -9, t = r;
    }
  }
  let e;
  for (; $s; ) {
    let t = $s;
    for ($s = void 0; t; ) {
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
function Vi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Hi(e) {
  let t, r = e.depsTail, a = r;
  for (; a; ) {
    const l = a.prevDep;
    a.version === -1 ? (a === r && (r = l), Pn(a), na(a)) : t = a, a.dep.activeLink = a.prevActiveLink, a.prevActiveLink = void 0, a = l;
  }
  e.deps = t, e.depsTail = r;
}
function Qr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Bi(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Bi(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === js) || (e.globalVersion = js, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Qr(e))))
    return;
  e.flags |= 2;
  const t = e.dep, r = te, a = Je;
  te = e, Je = !0;
  try {
    Vi(e);
    const l = e.fn(e._value);
    (t.version === 0 || qt(l, e._value)) && (e.flags |= 128, e._value = l, t.version++);
  } catch (l) {
    throw t.version++, l;
  } finally {
    te = r, Je = a, Hi(e), e.flags &= -3;
  }
}
function Pn(e, t = !1) {
  const { dep: r, prevSub: a, nextSub: l } = e;
  if (a && (a.nextSub = l, e.prevSub = void 0), l && (l.prevSub = a, e.nextSub = void 0), r.subs === e && (r.subs = a, !a && r.computed)) {
    r.computed.flags &= -5;
    for (let u = r.computed.deps; u; u = u.nextDep)
      Pn(u, !0);
  }
  !t && !--r.sc && r.map && r.map.delete(r.key);
}
function na(e) {
  const { prevDep: t, nextDep: r } = e;
  t && (t.nextDep = r, e.prevDep = void 0), r && (r.prevDep = t, e.nextDep = void 0);
}
let Je = !0;
const Ui = [];
function yt() {
  Ui.push(Je), Je = !1;
}
function gt() {
  const e = Ui.pop();
  Je = e === void 0 ? !0 : e;
}
function Wn(e) {
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
let js = 0;
class ia {
  constructor(t, r) {
    this.sub = t, this.dep = r, this.version = r.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class kn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!te || !Je || te === this.computed)
      return;
    let r = this.activeLink;
    if (r === void 0 || r.sub !== te)
      r = this.activeLink = new ia(te, this), te.deps ? (r.prevDep = te.depsTail, te.depsTail.nextDep = r, te.depsTail = r) : te.deps = te.depsTail = r, Ki(r);
    else if (r.version === -1 && (r.version = this.version, r.nextDep)) {
      const a = r.nextDep;
      a.prevDep = r.prevDep, r.prevDep && (r.prevDep.nextDep = a), r.prevDep = te.depsTail, r.nextDep = void 0, te.depsTail.nextDep = r, te.depsTail = r, te.deps === r && (te.deps = a);
    }
    return r;
  }
  trigger(t) {
    this.version++, js++, this.notify(t);
  }
  notify(t) {
    vn();
    try {
      for (let r = this.subs; r; r = r.prevSub)
        r.sub.notify() && r.sub.dep.notify();
    } finally {
      bn();
    }
  }
}
function Ki(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let a = t.deps; a; a = a.nextDep)
        Ki(a);
    }
    const r = e.dep.subs;
    r !== e && (e.prevSub = r, r && (r.nextSub = e)), e.dep.subs = e;
  }
}
const en = /* @__PURE__ */ new WeakMap(), Ft = Symbol(
  ""
), tn = Symbol(
  ""
), Es = Symbol(
  ""
);
function Se(e, t, r) {
  if (Je && te) {
    let a = en.get(e);
    a || en.set(e, a = /* @__PURE__ */ new Map());
    let l = a.get(r);
    l || (a.set(r, l = new kn()), l.map = a, l.key = r), l.track();
  }
}
function dt(e, t, r, a, l, u) {
  const s = en.get(e);
  if (!s) {
    js++;
    return;
  }
  const o = (c) => {
    c && c.trigger();
  };
  if (vn(), t === "clear")
    s.forEach(o);
  else {
    const c = H(e), n = c && gn(r);
    if (c && r === "length") {
      const i = Number(a);
      s.forEach((d, h) => {
        (h === "length" || h === Es || !st(h) && h >= i) && o(d);
      });
    } else
      switch ((r !== void 0 || s.has(void 0)) && o(s.get(r)), n && o(s.get(Es)), t) {
        case "add":
          c ? n && o(s.get("length")) : (o(s.get(Ft)), Zt(e) && o(s.get(tn)));
          break;
        case "delete":
          c || (o(s.get(Ft)), Zt(e) && o(s.get(tn)));
          break;
        case "set":
          Zt(e) && o(s.get(Ft));
          break;
      }
  }
  bn();
}
function Ht(e) {
  const t = J(e);
  return t === e ? t : (Se(t, "iterate", Es), He(e) ? t : t.map(be));
}
function _r(e) {
  return Se(e = J(e), "iterate", Es), e;
}
const oa = {
  __proto__: null,
  [Symbol.iterator]() {
    return Fr(this, Symbol.iterator, be);
  },
  concat(...e) {
    return Ht(this).concat(
      ...e.map((t) => H(t) ? Ht(t) : t)
    );
  },
  entries() {
    return Fr(this, "entries", (e) => (e[1] = be(e[1]), e));
  },
  every(e, t) {
    return at(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return at(this, "filter", e, t, (r) => r.map(be), arguments);
  },
  find(e, t) {
    return at(this, "find", e, t, be, arguments);
  },
  findIndex(e, t) {
    return at(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return at(this, "findLast", e, t, be, arguments);
  },
  findLastIndex(e, t) {
    return at(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return at(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Wr(this, "includes", e);
  },
  indexOf(...e) {
    return Wr(this, "indexOf", e);
  },
  join(e) {
    return Ht(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Wr(this, "lastIndexOf", e);
  },
  map(e, t) {
    return at(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return fs(this, "pop");
  },
  push(...e) {
    return fs(this, "push", e);
  },
  reduce(e, ...t) {
    return Vn(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Vn(this, "reduceRight", e, t);
  },
  shift() {
    return fs(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return at(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return fs(this, "splice", e);
  },
  toReversed() {
    return Ht(this).toReversed();
  },
  toSorted(e) {
    return Ht(this).toSorted(e);
  },
  toSpliced(...e) {
    return Ht(this).toSpliced(...e);
  },
  unshift(...e) {
    return fs(this, "unshift", e);
  },
  values() {
    return Fr(this, "values", be);
  }
};
function Fr(e, t, r) {
  const a = _r(e), l = a[t]();
  return a !== e && !He(e) && (l._next = l.next, l.next = () => {
    const u = l._next();
    return u.value && (u.value = r(u.value)), u;
  }), l;
}
const aa = Array.prototype;
function at(e, t, r, a, l, u) {
  const s = _r(e), o = s !== e && !He(e), c = s[t];
  if (c !== aa[t]) {
    const d = c.apply(e, u);
    return o ? be(d) : d;
  }
  let n = r;
  s !== e && (o ? n = function(d, h) {
    return r.call(this, be(d), h, e);
  } : r.length > 2 && (n = function(d, h) {
    return r.call(this, d, h, e);
  }));
  const i = c.call(s, n, a);
  return o && l ? l(i) : i;
}
function Vn(e, t, r, a) {
  const l = _r(e);
  let u = r;
  return l !== e && (He(e) ? r.length > 3 && (u = function(s, o, c) {
    return r.call(this, s, o, c, e);
  }) : u = function(s, o, c) {
    return r.call(this, s, be(o), c, e);
  }), l[t](u, ...a);
}
function Wr(e, t, r) {
  const a = J(e);
  Se(a, "iterate", Es);
  const l = a[t](...r);
  return (l === -1 || l === !1) && Sn(r[0]) ? (r[0] = J(r[0]), a[t](...r)) : l;
}
function fs(e, t, r = []) {
  yt(), vn();
  const a = J(e)[t].apply(e, r);
  return bn(), gt(), a;
}
const la = /* @__PURE__ */ hn("__proto__,__v_isRef,__isVue"), Zi = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(st)
);
function ua(e) {
  st(e) || (e = String(e));
  const t = J(this);
  return Se(t, "has", e), t.hasOwnProperty(e);
}
class Ji {
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
      return a === (l ? u ? va : Qi : u ? Yi : Xi).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(a) ? t : void 0;
    const s = H(t);
    if (!l) {
      let c;
      if (s && (c = oa[r]))
        return c;
      if (r === "hasOwnProperty")
        return ua;
    }
    const o = Reflect.get(
      t,
      r,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Ae(t) ? t : a
    );
    return (st(r) ? Zi.has(r) : la(r)) || (l || Se(t, "get", r), u) ? o : Ae(o) ? s && gn(r) ? o : o.value : re(o) ? l ? eo(o) : In(o) : o;
  }
}
class Gi extends Ji {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, r, a, l) {
    let u = t[r];
    if (!this._isShallow) {
      const c = St(u);
      if (!He(a) && !St(a) && (u = J(u), a = J(a)), !H(t) && Ae(u) && !Ae(a))
        return c || (u.value = a), !0;
    }
    const s = H(t) && gn(r) ? Number(r) < t.length : G(t, r), o = Reflect.set(
      t,
      r,
      a,
      Ae(t) ? t : l
    );
    return t === J(l) && (s ? qt(a, u) && dt(t, "set", r, a) : dt(t, "add", r, a)), o;
  }
  deleteProperty(t, r) {
    const a = G(t, r);
    t[r];
    const l = Reflect.deleteProperty(t, r);
    return l && a && dt(t, "delete", r, void 0), l;
  }
  has(t, r) {
    const a = Reflect.has(t, r);
    return (!st(r) || !Zi.has(r)) && Se(t, "has", r), a;
  }
  ownKeys(t) {
    return Se(
      t,
      "iterate",
      H(t) ? "length" : Ft
    ), Reflect.ownKeys(t);
  }
}
class ca extends Ji {
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
const da = /* @__PURE__ */ new Gi(), pa = /* @__PURE__ */ new ca(), fa = /* @__PURE__ */ new Gi(!0);
const sn = (e) => e, Js = (e) => Reflect.getPrototypeOf(e);
function ha(e, t, r) {
  return function(...a) {
    const l = this.__v_raw, u = J(l), s = Zt(u), o = e === "entries" || e === Symbol.iterator && s, c = e === "keys" && s, n = l[e](...a), i = r ? sn : t ? ar : be;
    return !t && Se(
      u,
      "iterate",
      c ? tn : Ft
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
function Gs(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function ma(e, t) {
  const r = {
    get(l) {
      const u = this.__v_raw, s = J(u), o = J(l);
      e || (qt(l, o) && Se(s, "get", l), Se(s, "get", o));
      const { has: c } = Js(s), n = t ? sn : e ? ar : be;
      if (c.call(s, l))
        return n(u.get(l));
      if (c.call(s, o))
        return n(u.get(o));
      u !== s && u.get(l);
    },
    get size() {
      const l = this.__v_raw;
      return !e && Se(J(l), "iterate", Ft), l.size;
    },
    has(l) {
      const u = this.__v_raw, s = J(u), o = J(l);
      return e || (qt(l, o) && Se(s, "has", l), Se(s, "has", o)), l === o ? u.has(l) : u.has(l) || u.has(o);
    },
    forEach(l, u) {
      const s = this, o = s.__v_raw, c = J(o), n = t ? sn : e ? ar : be;
      return !e && Se(c, "iterate", Ft), o.forEach((i, d) => l.call(u, n(i), n(d), s));
    }
  };
  return Ee(
    r,
    e ? {
      add: Gs("add"),
      set: Gs("set"),
      delete: Gs("delete"),
      clear: Gs("clear")
    } : {
      add(l) {
        !t && !He(l) && !St(l) && (l = J(l));
        const u = J(this);
        return Js(u).has.call(u, l) || (u.add(l), dt(u, "add", l, l)), this;
      },
      set(l, u) {
        !t && !He(u) && !St(u) && (u = J(u));
        const s = J(this), { has: o, get: c } = Js(s);
        let n = o.call(s, l);
        n || (l = J(l), n = o.call(s, l));
        const i = c.call(s, l);
        return s.set(l, u), n ? qt(u, i) && dt(s, "set", l, u) : dt(s, "add", l, u), this;
      },
      delete(l) {
        const u = J(this), { has: s, get: o } = Js(u);
        let c = s.call(u, l);
        c || (l = J(l), c = s.call(u, l)), o && o.call(u, l);
        const n = u.delete(l);
        return c && dt(u, "delete", l, void 0), n;
      },
      clear() {
        const l = J(this), u = l.size !== 0, s = l.clear();
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
    r[l] = ha(l, e, t);
  }), r;
}
function $n(e, t) {
  const r = ma(e, t);
  return (a, l, u) => l === "__v_isReactive" ? !e : l === "__v_isReadonly" ? e : l === "__v_raw" ? a : Reflect.get(
    G(r, l) && l in a ? r : a,
    l,
    u
  );
}
const ya = {
  get: /* @__PURE__ */ $n(!1, !1)
}, ga = {
  get: /* @__PURE__ */ $n(!1, !0)
}, wa = {
  get: /* @__PURE__ */ $n(!0, !1)
};
const Xi = /* @__PURE__ */ new WeakMap(), Yi = /* @__PURE__ */ new WeakMap(), Qi = /* @__PURE__ */ new WeakMap(), va = /* @__PURE__ */ new WeakMap();
function ba(e) {
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
function Pa(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : ba(Bo(e));
}
function In(e) {
  return St(e) ? e : qn(
    e,
    !1,
    da,
    ya,
    Xi
  );
}
function ka(e) {
  return qn(
    e,
    !1,
    fa,
    ga,
    Yi
  );
}
function eo(e) {
  return qn(
    e,
    !0,
    pa,
    wa,
    Qi
  );
}
function qn(e, t, r, a, l) {
  if (!re(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const u = Pa(e);
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
function Jt(e) {
  return St(e) ? Jt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function St(e) {
  return !!(e && e.__v_isReadonly);
}
function He(e) {
  return !!(e && e.__v_isShallow);
}
function Sn(e) {
  return e ? !!e.__v_raw : !1;
}
function J(e) {
  const t = e && e.__v_raw;
  return t ? J(t) : e;
}
function $a(e) {
  return !G(e, "__v_skip") && Object.isExtensible(e) && Ni(e, "__v_skip", !0), e;
}
const be = (e) => re(e) ? In(e) : e, ar = (e) => re(e) ? eo(e) : e;
function Ae(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function K(e) {
  return Ia(e, !1);
}
function Ia(e, t) {
  return Ae(e) ? e : new qa(e, t);
}
class qa {
  constructor(t, r) {
    this.dep = new kn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = r ? t : J(t), this._value = r ? t : be(t), this.__v_isShallow = r;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const r = this._rawValue, a = this.__v_isShallow || He(t) || St(t);
    t = a ? t : J(t), qt(t, r) && (this._rawValue = t, this._value = a ? t : be(t), this.dep.trigger());
  }
}
function to(e) {
  return Ae(e) ? e.value : e;
}
const Sa = {
  get: (e, t, r) => t === "__v_raw" ? e : to(Reflect.get(e, t, r)),
  set: (e, t, r, a) => {
    const l = e[t];
    return Ae(l) && !Ae(r) ? (l.value = r, !0) : Reflect.set(e, t, r, a);
  }
};
function so(e) {
  return Jt(e) ? e : new Proxy(e, Sa);
}
class xa {
  constructor(t, r, a) {
    this.fn = t, this.setter = r, this._value = void 0, this.dep = new kn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = js - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !r, this.isSSR = a;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    te !== this)
      return Wi(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Bi(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Aa(e, t, r = !1) {
  let a, l;
  return B(e) ? a = e : (a = e.get, l = e.set), new xa(a, l, r);
}
const Xs = {}, lr = /* @__PURE__ */ new WeakMap();
let Lt;
function _a(e, t = !1, r = Lt) {
  if (r) {
    let a = lr.get(r);
    a || lr.set(r, a = []), a.push(e);
  }
}
function ja(e, t, r = Y) {
  const { immediate: a, deep: l, once: u, scheduler: s, augmentJob: o, call: c } = r, n = (C) => l ? C : He(C) || l === !1 || l === 0 ? pt(C, 1) : pt(C);
  let i, d, h, p, f = !1, g = !1;
  if (Ae(e) ? (d = () => e.value, f = He(e)) : Jt(e) ? (d = () => n(e), f = !0) : H(e) ? (g = !0, f = e.some((C) => Jt(C) || He(C)), d = () => e.map((C) => {
    if (Ae(C))
      return C.value;
    if (Jt(C))
      return n(C);
    if (B(C))
      return c ? c(C, 2) : C();
  })) : B(e) ? t ? d = c ? () => c(e, 2) : e : d = () => {
    if (h) {
      yt();
      try {
        h();
      } finally {
        gt();
      }
    }
    const C = Lt;
    Lt = i;
    try {
      return c ? c(e, 3, [p]) : e(p);
    } finally {
      Lt = C;
    }
  } : d = tt, t && l) {
    const C = d, Q = l === !0 ? 1 / 0 : l;
    d = () => pt(C(), Q);
  }
  const k = ra(), $ = () => {
    i.stop(), k && k.active && yn(k.effects, i);
  };
  if (u && t) {
    const C = t;
    t = (...Q) => {
      C(...Q), $();
    };
  }
  let O = g ? new Array(e.length).fill(Xs) : Xs;
  const M = (C) => {
    if (!(!(i.flags & 1) || !i.dirty && !C))
      if (t) {
        const Q = i.run();
        if (l || f || (g ? Q.some((he, oe) => qt(he, O[oe])) : qt(Q, O))) {
          h && h();
          const he = Lt;
          Lt = i;
          try {
            const oe = [
              Q,
              // pass undefined as the old value when it's changed for the first time
              O === Xs ? void 0 : g && O[0] === Xs ? [] : O,
              p
            ];
            O = Q, c ? c(t, 3, oe) : (
              // @ts-expect-error
              t(...oe)
            );
          } finally {
            Lt = he;
          }
        }
      } else
        i.run();
  };
  return o && o(M), i = new zi(d), i.scheduler = s ? () => s(M, !1) : M, p = (C) => _a(C, !1, i), h = i.onStop = () => {
    const C = lr.get(i);
    if (C) {
      if (c)
        c(C, 4);
      else
        for (const Q of C) Q();
      lr.delete(i);
    }
  }, t ? a ? M(!0) : O = i.run() : s ? s(M.bind(null, !0), !0) : i.run(), $.pause = i.pause.bind(i), $.resume = i.resume.bind(i), $.stop = $, $;
}
function pt(e, t = 1 / 0, r) {
  if (t <= 0 || !re(e) || e.__v_skip || (r = r || /* @__PURE__ */ new Map(), (r.get(e) || 0) >= t))
    return e;
  if (r.set(e, t), t--, Ae(e))
    pt(e.value, t, r);
  else if (H(e))
    for (let a = 0; a < e.length; a++)
      pt(e[a], t, r);
  else if (Ir(e) || Zt(e))
    e.forEach((a) => {
      pt(a, t, r);
    });
  else if (Ci(e)) {
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
function zs(e, t, r, a) {
  try {
    return a ? e(...a) : e();
  } catch (l) {
    jr(l, t, r);
  }
}
function rt(e, t, r, a) {
  if (B(e)) {
    const l = zs(e, t, r, a);
    return l && Ti(l) && l.catch((u) => {
      jr(u, t, r);
    }), l;
  }
  if (H(e)) {
    const l = [];
    for (let u = 0; u < e.length; u++)
      l.push(rt(e[u], t, r, a));
    return l;
  }
}
function jr(e, t, r, a = !0) {
  const l = t ? t.vnode : null, { errorHandler: u, throwUnhandledErrorInProduction: s } = t && t.appContext.config || Y;
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
      yt(), zs(u, null, 10, [
        e,
        c,
        n
      ]), gt();
      return;
    }
  }
  Ea(e, r, l, a, s);
}
function Ea(e, t, r, a = !0, l = !1) {
  if (l)
    throw e;
  console.error(e);
}
const je = [];
let Qe = -1;
const Gt = [];
let $t = null, Ut = 0;
const ro = /* @__PURE__ */ Promise.resolve();
let ur = null;
function xn(e) {
  const t = ur || ro;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Oa(e) {
  let t = Qe + 1, r = je.length;
  for (; t < r; ) {
    const a = t + r >>> 1, l = je[a], u = Os(l);
    u < e || u === e && l.flags & 2 ? t = a + 1 : r = a;
  }
  return t;
}
function An(e) {
  if (!(e.flags & 1)) {
    const t = Os(e), r = je[je.length - 1];
    !r || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Os(r) ? je.push(e) : je.splice(Oa(t), 0, e), e.flags |= 1, no();
  }
}
function no() {
  ur || (ur = ro.then(oo));
}
function Ta(e) {
  H(e) ? Gt.push(...e) : $t && e.id === -1 ? $t.splice(Ut + 1, 0, e) : e.flags & 1 || (Gt.push(e), e.flags |= 1), no();
}
function Hn(e, t, r = Qe + 1) {
  for (; r < je.length; r++) {
    const a = je[r];
    if (a && a.flags & 2) {
      if (e && a.id !== e.uid)
        continue;
      je.splice(r, 1), r--, a.flags & 4 && (a.flags &= -2), a(), a.flags & 4 || (a.flags &= -2);
    }
  }
}
function io(e) {
  if (Gt.length) {
    const t = [...new Set(Gt)].sort(
      (r, a) => Os(r) - Os(a)
    );
    if (Gt.length = 0, $t) {
      $t.push(...t);
      return;
    }
    for ($t = t, Ut = 0; Ut < $t.length; Ut++) {
      const r = $t[Ut];
      r.flags & 4 && (r.flags &= -2), r.flags & 8 || r(), r.flags &= -2;
    }
    $t = null, Ut = 0;
  }
}
const Os = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function oo(e) {
  try {
    for (Qe = 0; Qe < je.length; Qe++) {
      const t = je[Qe];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), zs(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Qe < je.length; Qe++) {
      const t = je[Qe];
      t && (t.flags &= -2);
    }
    Qe = -1, je.length = 0, io(), ur = null, (je.length || Gt.length) && oo();
  }
}
let ze = null, ao = null;
function cr(e) {
  const t = ze;
  return ze = e, ao = e && e.type.__scopeId || null, t;
}
function Ma(e, t = ze, r) {
  if (!t || e._n)
    return e;
  const a = (...l) => {
    a._d && ti(-1);
    const u = cr(t);
    let s;
    try {
      s = e(...l);
    } finally {
      cr(u), a._d && ti(1);
    }
    return s;
  };
  return a._n = !0, a._c = !0, a._d = !0, a;
}
function hs(e, t) {
  if (ze === null)
    return e;
  const r = Mr(ze), a = e.dirs || (e.dirs = []);
  for (let l = 0; l < t.length; l++) {
    let [u, s, o, c = Y] = t[l];
    u && (B(u) && (u = {
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
function Mt(e, t, r, a) {
  const l = e.dirs, u = t && t.dirs;
  for (let s = 0; s < l.length; s++) {
    const o = l[s];
    u && (o.oldValue = u[s].value);
    let c = o.dir[a];
    c && (yt(), rt(c, r, 8, [
      e.el,
      o,
      e,
      t
    ]), gt());
  }
}
const Ca = Symbol("_vte"), Na = (e) => e.__isTeleport, La = Symbol("_leaveCb");
function _n(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, _n(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function lo(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const dr = /* @__PURE__ */ new WeakMap();
function qs(e, t, r, a, l = !1) {
  if (H(e)) {
    e.forEach(
      (f, g) => qs(
        f,
        t && (H(t) ? t[g] : t),
        r,
        a,
        l
      )
    );
    return;
  }
  if (Ss(a) && !l) {
    a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && qs(e, t, r, a.component.subTree);
    return;
  }
  const u = a.shapeFlag & 4 ? Mr(a.component) : a.el, s = l ? null : u, { i: o, r: c } = e, n = t && t.r, i = o.refs === Y ? o.refs = {} : o.refs, d = o.setupState, h = J(d), p = d === Y ? Oi : (f) => G(h, f);
  if (n != null && n !== c) {
    if (Bn(t), pe(n))
      i[n] = null, p(n) && (d[n] = null);
    else if (Ae(n)) {
      n.value = null;
      const f = t;
      f.k && (i[f.k] = null);
    }
  }
  if (B(c))
    zs(c, o, 12, [s, i]);
  else {
    const f = pe(c), g = Ae(c);
    if (f || g) {
      const k = () => {
        if (e.f) {
          const $ = f ? p(c) ? d[c] : i[c] : c.value;
          if (l)
            H($) && yn($, u);
          else if (H($))
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
          k(), dr.delete(e);
        };
        $.id = -1, dr.set(e, $), Ne($, r);
      } else
        Bn(e), k();
    }
  }
}
function Bn(e) {
  const t = dr.get(e);
  t && (t.flags |= 8, dr.delete(e));
}
xr().requestIdleCallback;
xr().cancelIdleCallback;
const Ss = (e) => !!e.type.__asyncLoader, uo = (e) => e.type.__isKeepAlive;
function Da(e, t) {
  co(e, "a", t);
}
function Ra(e, t) {
  co(e, "da", t);
}
function co(e, t, r = xe) {
  const a = e.__wdc || (e.__wdc = () => {
    let l = r;
    for (; l; ) {
      if (l.isDeactivated)
        return;
      l = l.parent;
    }
    return e();
  });
  if (Er(t, a, r), r) {
    let l = r.parent;
    for (; l && l.parent; )
      uo(l.parent.vnode) && za(a, t, r, l), l = l.parent;
  }
}
function za(e, t, r, a) {
  const l = Er(
    t,
    e,
    a,
    !0
    /* prepend */
  );
  po(() => {
    yn(a[t], l);
  }, r);
}
function Er(e, t, r = xe, a = !1) {
  if (r) {
    const l = r[e] || (r[e] = []), u = t.__weh || (t.__weh = (...s) => {
      yt();
      const o = Fs(r), c = rt(t, r, e, s);
      return o(), gt(), c;
    });
    return a ? l.unshift(u) : l.push(u), u;
  }
}
const wt = (e) => (t, r = xe) => {
  (!Ms || e === "sp") && Er(e, (...a) => t(...a), r);
}, Fa = wt("bm"), jn = wt("m"), Wa = wt(
  "bu"
), Va = wt("u"), En = wt(
  "bum"
), po = wt("um"), Ha = wt(
  "sp"
), Ba = wt("rtg"), Ua = wt("rtc");
function Ka(e, t = xe) {
  Er("ec", e, t);
}
const Za = "components";
function Ja(e, t) {
  return Xa(Za, e, !0, t) || e;
}
const Ga = Symbol.for("v-ndc");
function Xa(e, t, r = !0, a = !1) {
  const l = ze || xe;
  if (l) {
    const u = l.type;
    {
      const o = zl(
        u,
        !1
      );
      if (o && (o === t || o === Be(t) || o === Sr(Be(t))))
        return u;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      Un(l[e] || u[e], t) || // global registration
      Un(l.appContext[e], t)
    );
    return !s && a ? u : s;
  }
}
function Un(e, t) {
  return e && (e[t] || e[Be(t)] || e[Sr(Be(t))]);
}
function Ke(e, t, r, a) {
  let l;
  const u = r, s = H(e);
  if (s || pe(e)) {
    const o = s && Jt(e);
    let c = !1, n = !1;
    o && (c = !He(e), n = St(e), e = _r(e)), l = new Array(e.length);
    for (let i = 0, d = e.length; i < d; i++)
      l[i] = t(
        c ? n ? ar(be(e[i])) : be(e[i]) : e[i],
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
const rn = (e) => e ? To(e) ? Mr(e) : rn(e.parent) : null, xs = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Ee(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => rn(e.parent),
    $root: (e) => rn(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => ho(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      An(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = xn.bind(e.proxy)),
    $watch: (e) => vl.bind(e)
  })
), Vr = (e, t) => e !== Y && !e.__isScriptSetup && G(e, t), Ya = {
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
        if (Vr(a, t))
          return s[t] = 1, a[t];
        if (l !== Y && G(l, t))
          return s[t] = 2, l[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (n = e.propsOptions[0]) && G(n, t)
        )
          return s[t] = 3, u[t];
        if (r !== Y && G(r, t))
          return s[t] = 4, r[t];
        nn && (s[t] = 0);
      }
    }
    const i = xs[t];
    let d, h;
    if (i)
      return t === "$attrs" && Se(e.attrs, "get", ""), i(e);
    if (
      // css module (injected by vue-loader)
      (d = o.__cssModules) && (d = d[t])
    )
      return d;
    if (r !== Y && G(r, t))
      return s[t] = 4, r[t];
    if (
      // global properties
      h = c.config.globalProperties, G(h, t)
    )
      return h[t];
  },
  set({ _: e }, t, r) {
    const { data: a, setupState: l, ctx: u } = e;
    return Vr(l, t) ? (l[t] = r, !0) : a !== Y && G(a, t) ? (a[t] = r, !0) : G(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (u[t] = r, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: r, ctx: a, appContext: l, propsOptions: u, type: s }
  }, o) {
    let c, n;
    return !!(r[o] || e !== Y && o[0] !== "$" && G(e, o) || Vr(t, o) || (c = u[0]) && G(c, o) || G(a, o) || G(xs, o) || G(l.config.globalProperties, o) || (n = s.__cssModules) && n[o]);
  },
  defineProperty(e, t, r) {
    return r.get != null ? e._.accessCache[t] = 0 : G(r, "value") && this.set(e, t, r.value, null), Reflect.defineProperty(e, t, r);
  }
};
function Kn(e) {
  return H(e) ? e.reduce(
    (t, r) => (t[r] = null, t),
    {}
  ) : e;
}
let nn = !0;
function Qa(e) {
  const t = ho(e), r = e.proxy, a = e.ctx;
  nn = !1, t.beforeCreate && Zn(t.beforeCreate, e, "bc");
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
    destroyed: M,
    unmounted: C,
    render: Q,
    renderTracked: he,
    renderTriggered: oe,
    errorCaptured: fe,
    serverPrefetch: nt,
    // public API
    expose: Oe,
    inheritAttrs: it,
    // assets
    components: vt,
    directives: jt,
    filters: we
  } = t;
  if (n && el(n, a, null), s)
    for (const ee in s) {
      const Z = s[ee];
      B(Z) && (a[ee] = Z.bind(r));
    }
  if (l) {
    const ee = l.call(r, r);
    re(ee) && (e.data = In(ee));
  }
  if (nn = !0, u)
    for (const ee in u) {
      const Z = u[ee], me = B(Z) ? Z.bind(r, r) : B(Z.get) ? Z.get.bind(r, r) : tt, Wt = !B(Z) && B(Z.set) ? Z.set.bind(r) : tt, ot = Re({
        get: me,
        set: Wt
      });
      Object.defineProperty(a, ee, {
        enumerable: !0,
        configurable: !0,
        get: () => ot.value,
        set: (Ce) => ot.value = Ce
      });
    }
  if (o)
    for (const ee in o)
      fo(o[ee], a, r, ee);
  if (c) {
    const ee = B(c) ? c.call(r) : c;
    Reflect.ownKeys(ee).forEach((Z) => {
      ol(Z, ee[Z]);
    });
  }
  i && Zn(i, e, "c");
  function ae(ee, Z) {
    H(Z) ? Z.forEach((me) => ee(me.bind(r))) : Z && ee(Z.bind(r));
  }
  if (ae(Fa, d), ae(jn, h), ae(Wa, p), ae(Va, f), ae(Da, g), ae(Ra, k), ae(Ka, fe), ae(Ua, he), ae(Ba, oe), ae(En, O), ae(po, C), ae(Ha, nt), H(Oe))
    if (Oe.length) {
      const ee = e.exposed || (e.exposed = {});
      Oe.forEach((Z) => {
        Object.defineProperty(ee, Z, {
          get: () => r[Z],
          set: (me) => r[Z] = me,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  Q && e.render === tt && (e.render = Q), it != null && (e.inheritAttrs = it), vt && (e.components = vt), jt && (e.directives = jt), nt && lo(e);
}
function el(e, t, r = tt) {
  H(e) && (e = on(e));
  for (const a in e) {
    const l = e[a];
    let u;
    re(l) ? "default" in l ? u = rr(
      l.from || a,
      l.default,
      !0
    ) : u = rr(l.from || a) : u = rr(l), Ae(u) ? Object.defineProperty(t, a, {
      enumerable: !0,
      configurable: !0,
      get: () => u.value,
      set: (s) => u.value = s
    }) : t[a] = u;
  }
}
function Zn(e, t, r) {
  rt(
    H(e) ? e.map((a) => a.bind(t.proxy)) : e.bind(t.proxy),
    t,
    r
  );
}
function fo(e, t, r, a) {
  let l = a.includes(".") ? xo(r, a) : () => r[a];
  if (pe(e)) {
    const u = t[e];
    B(u) && As(l, u);
  } else if (B(e))
    As(l, e.bind(r));
  else if (re(e))
    if (H(e))
      e.forEach((u) => fo(u, t, r, a));
    else {
      const u = B(e.handler) ? e.handler.bind(r) : t[e.handler];
      B(u) && As(l, u, e);
    }
}
function ho(e) {
  const t = e.type, { mixins: r, extends: a } = t, {
    mixins: l,
    optionsCache: u,
    config: { optionMergeStrategies: s }
  } = e.appContext, o = u.get(t);
  let c;
  return o ? c = o : !l.length && !r && !a ? c = t : (c = {}, l.length && l.forEach(
    (n) => pr(c, n, s, !0)
  ), pr(c, t, s)), re(t) && u.set(t, c), c;
}
function pr(e, t, r, a = !1) {
  const { mixins: l, extends: u } = t;
  u && pr(e, u, r, !0), l && l.forEach(
    (s) => pr(e, s, r, !0)
  );
  for (const s in t)
    if (!(a && s === "expose")) {
      const o = tl[s] || r && r[s];
      e[s] = o ? o(e[s], t[s]) : t[s];
    }
  return e;
}
const tl = {
  data: Jn,
  props: Gn,
  emits: Gn,
  // objects
  methods: vs,
  computed: vs,
  // lifecycle
  beforeCreate: _e,
  created: _e,
  beforeMount: _e,
  mounted: _e,
  beforeUpdate: _e,
  updated: _e,
  beforeDestroy: _e,
  beforeUnmount: _e,
  destroyed: _e,
  unmounted: _e,
  activated: _e,
  deactivated: _e,
  errorCaptured: _e,
  serverPrefetch: _e,
  // assets
  components: vs,
  directives: vs,
  // watch
  watch: rl,
  // provide / inject
  provide: Jn,
  inject: sl
};
function Jn(e, t) {
  return t ? e ? function() {
    return Ee(
      B(e) ? e.call(this, this) : e,
      B(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function sl(e, t) {
  return vs(on(e), on(t));
}
function on(e) {
  if (H(e)) {
    const t = {};
    for (let r = 0; r < e.length; r++)
      t[e[r]] = e[r];
    return t;
  }
  return e;
}
function _e(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function vs(e, t) {
  return e ? Ee(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Gn(e, t) {
  return e ? H(e) && H(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Ee(
    /* @__PURE__ */ Object.create(null),
    Kn(e),
    Kn(t ?? {})
  ) : t;
}
function rl(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = Ee(/* @__PURE__ */ Object.create(null), e);
  for (const a in t)
    r[a] = _e(e[a], t[a]);
  return r;
}
function mo() {
  return {
    app: null,
    config: {
      isNativeTag: Oi,
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
let nl = 0;
function il(e, t) {
  return function(a, l = null) {
    B(a) || (a = Ee({}, a)), l != null && !re(l) && (l = null);
    const u = mo(), s = /* @__PURE__ */ new WeakSet(), o = [];
    let c = !1;
    const n = u.app = {
      _uid: nl++,
      _component: a,
      _props: l,
      _container: null,
      _context: u,
      _instance: null,
      version: Wl,
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
      mount(i, d, h) {
        if (!c) {
          const p = n._ceVNode || Ge(a, l);
          return p.appContext = u, h === !0 ? h = "svg" : h === !1 && (h = void 0), e(p, i, h), c = !0, n._container = i, i.__vue_app__ = n, Mr(p.component);
        }
      },
      onUnmount(i) {
        o.push(i);
      },
      unmount() {
        c && (rt(
          o,
          n._instance,
          16
        ), e(null, n._container), delete n._container.__vue_app__);
      },
      provide(i, d) {
        return u.provides[i] = d, n;
      },
      runWithContext(i) {
        const d = Xt;
        Xt = n;
        try {
          return i();
        } finally {
          Xt = d;
        }
      }
    };
    return n;
  };
}
let Xt = null;
function ol(e, t) {
  if (xe) {
    let r = xe.provides;
    const a = xe.parent && xe.parent.provides;
    a === r && (r = xe.provides = Object.create(a)), r[e] = t;
  }
}
function rr(e, t, r = !1) {
  const a = Cl();
  if (a || Xt) {
    let l = Xt ? Xt._context.provides : a ? a.parent == null || a.ce ? a.vnode.appContext && a.vnode.appContext.provides : a.parent.provides : void 0;
    if (l && e in l)
      return l[e];
    if (arguments.length > 1)
      return r && B(t) ? t.call(a && a.proxy) : t;
  }
}
const yo = {}, go = () => Object.create(yo), wo = (e) => Object.getPrototypeOf(e) === yo;
function al(e, t, r, a = !1) {
  const l = {}, u = go();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), vo(e, t, l, u);
  for (const s in e.propsOptions[0])
    s in l || (l[s] = void 0);
  r ? e.props = a ? l : ka(l) : e.type.props ? e.props = l : e.props = u, e.attrs = u;
}
function ll(e, t, r, a) {
  const {
    props: l,
    attrs: u,
    vnode: { patchFlag: s }
  } = e, o = J(l), [c] = e.propsOptions;
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
        if (Or(e.emitsOptions, h))
          continue;
        const p = t[h];
        if (c)
          if (G(u, h))
            p !== u[h] && (u[h] = p, n = !0);
          else {
            const f = Be(h);
            l[f] = an(
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
    vo(e, t, l, u) && (n = !0);
    let i;
    for (const d in o)
      (!t || // for camelCase
      !G(t, d) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((i = _t(d)) === d || !G(t, i))) && (c ? r && // for camelCase
      (r[d] !== void 0 || // for kebab-case
      r[i] !== void 0) && (l[d] = an(
        c,
        o,
        d,
        void 0,
        e,
        !0
      )) : delete l[d]);
    if (u !== o)
      for (const d in u)
        (!t || !G(t, d)) && (delete u[d], n = !0);
  }
  n && dt(e.attrs, "set", "");
}
function vo(e, t, r, a) {
  const [l, u] = e.propsOptions;
  let s = !1, o;
  if (t)
    for (let c in t) {
      if (ks(c))
        continue;
      const n = t[c];
      let i;
      l && G(l, i = Be(c)) ? !u || !u.includes(i) ? r[i] = n : (o || (o = {}))[i] = n : Or(e.emitsOptions, c) || (!(c in a) || n !== a[c]) && (a[c] = n, s = !0);
    }
  if (u) {
    const c = J(r), n = o || Y;
    for (let i = 0; i < u.length; i++) {
      const d = u[i];
      r[d] = an(
        l,
        c,
        d,
        n[d],
        e,
        !G(n, d)
      );
    }
  }
  return s;
}
function an(e, t, r, a, l, u) {
  const s = e[r];
  if (s != null) {
    const o = G(s, "default");
    if (o && a === void 0) {
      const c = s.default;
      if (s.type !== Function && !s.skipFactory && B(c)) {
        const { propsDefaults: n } = l;
        if (r in n)
          a = n[r];
        else {
          const i = Fs(l);
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
    ] && (a === "" || a === _t(r)) && (a = !0));
  }
  return a;
}
const ul = /* @__PURE__ */ new WeakMap();
function bo(e, t, r = !1) {
  const a = r ? ul : t.propsCache, l = a.get(e);
  if (l)
    return l;
  const u = e.props, s = {}, o = [];
  let c = !1;
  if (!B(e)) {
    const i = (d) => {
      c = !0;
      const [h, p] = bo(d, t, !0);
      Ee(s, h), p && o.push(...p);
    };
    !r && t.mixins.length && t.mixins.forEach(i), e.extends && i(e.extends), e.mixins && e.mixins.forEach(i);
  }
  if (!u && !c)
    return re(e) && a.set(e, Kt), Kt;
  if (H(u))
    for (let i = 0; i < u.length; i++) {
      const d = Be(u[i]);
      Xn(d) && (s[d] = Y);
    }
  else if (u)
    for (const i in u) {
      const d = Be(i);
      if (Xn(d)) {
        const h = u[i], p = s[d] = H(h) || B(h) ? { type: h } : Ee({}, h), f = p.type;
        let g = !1, k = !0;
        if (H(f))
          for (let $ = 0; $ < f.length; ++$) {
            const O = f[$], M = B(O) && O.name;
            if (M === "Boolean") {
              g = !0;
              break;
            } else M === "String" && (k = !1);
          }
        else
          g = B(f) && f.name === "Boolean";
        p[
          0
          /* shouldCast */
        ] = g, p[
          1
          /* shouldCastTrue */
        ] = k, (g || G(p, "default")) && o.push(d);
      }
    }
  const n = [s, o];
  return re(e) && a.set(e, n), n;
}
function Xn(e) {
  return e[0] !== "$" && !ks(e);
}
const On = (e) => e === "_" || e === "_ctx" || e === "$stable", Tn = (e) => H(e) ? e.map(et) : [et(e)], cl = (e, t, r) => {
  if (t._n)
    return t;
  const a = Ma((...l) => Tn(t(...l)), r);
  return a._c = !1, a;
}, Po = (e, t, r) => {
  const a = e._ctx;
  for (const l in e) {
    if (On(l)) continue;
    const u = e[l];
    if (B(u))
      t[l] = cl(l, u, a);
    else if (u != null) {
      const s = Tn(u);
      t[l] = () => s;
    }
  }
}, ko = (e, t) => {
  const r = Tn(t);
  e.slots.default = () => r;
}, $o = (e, t, r) => {
  for (const a in t)
    (r || !On(a)) && (e[a] = t[a]);
}, dl = (e, t, r) => {
  const a = e.slots = go();
  if (e.vnode.shapeFlag & 32) {
    const l = t._;
    l ? ($o(a, t, r), r && Ni(a, "_", l, !0)) : Po(t, a);
  } else t && ko(e, t);
}, pl = (e, t, r) => {
  const { vnode: a, slots: l } = e;
  let u = !0, s = Y;
  if (a.shapeFlag & 32) {
    const o = t._;
    o ? r && o === 1 ? u = !1 : $o(l, t, r) : (u = !t.$stable, Po(t, l)), s = t;
  } else t && (ko(e, t), s = { default: 1 });
  if (u)
    for (const o in l)
      !On(o) && s[o] == null && delete l[o];
}, Ne = xl;
function fl(e) {
  return hl(e);
}
function hl(e, t) {
  const r = xr();
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
    setScopeId: p = tt,
    insertStaticContent: f
  } = e, g = (m, w, b, x = null, I = null, S = null, E = void 0, _ = null, j = !!w.dynamicChildren) => {
    if (m === w)
      return;
    m && !ms(m, w) && (x = Xe(m), Ce(m, I, S, !0), m = null), w.patchFlag === -2 && (j = !1, w.dynamicChildren = null);
    const { type: A, ref: W, shapeFlag: T } = w;
    switch (A) {
      case Tr:
        k(m, w, b, x);
        break;
      case xt:
        $(m, w, b, x);
        break;
      case Br:
        m == null && O(w, b, x, E);
        break;
      case se:
        vt(
          m,
          w,
          b,
          x,
          I,
          S,
          E,
          _,
          j
        );
        break;
      default:
        T & 1 ? Q(
          m,
          w,
          b,
          x,
          I,
          S,
          E,
          _,
          j
        ) : T & 6 ? jt(
          m,
          w,
          b,
          x,
          I,
          S,
          E,
          _,
          j
        ) : (T & 64 || T & 128) && A.process(
          m,
          w,
          b,
          x,
          I,
          S,
          E,
          _,
          j,
          Ot
        );
    }
    W != null && I ? qs(W, m && m.ref, S, w || m, !w) : W == null && m && m.ref != null && qs(m.ref, null, S, m, !0);
  }, k = (m, w, b, x) => {
    if (m == null)
      a(
        w.el = o(w.children),
        b,
        x
      );
    else {
      const I = w.el = m.el;
      w.children !== m.children && n(I, w.children);
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
  }, M = ({ el: m, anchor: w }, b, x) => {
    let I;
    for (; m && m !== w; )
      I = h(m), a(m, b, x), m = I;
    a(w, b, x);
  }, C = ({ el: m, anchor: w }) => {
    let b;
    for (; m && m !== w; )
      b = h(m), l(m), m = b;
    l(w);
  }, Q = (m, w, b, x, I, S, E, _, j) => {
    w.type === "svg" ? E = "svg" : w.type === "math" && (E = "mathml"), m == null ? he(
      w,
      b,
      x,
      I,
      S,
      E,
      _,
      j
    ) : nt(
      m,
      w,
      I,
      S,
      E,
      _,
      j
    );
  }, he = (m, w, b, x, I, S, E, _) => {
    let j, A;
    const { props: W, shapeFlag: T, transition: F, dirs: z } = m;
    if (j = m.el = s(
      m.type,
      S,
      W && W.is,
      W
    ), T & 8 ? i(j, m.children) : T & 16 && fe(
      m.children,
      j,
      null,
      x,
      I,
      Hr(m, S),
      E,
      _
    ), z && Mt(m, null, x, "created"), oe(j, m, m.scopeId, E, x), W) {
      for (const X in W)
        X !== "value" && !ks(X) && u(j, X, null, W[X], S, x);
      "value" in W && u(j, "value", null, W.value, S), (A = W.onVnodeBeforeMount) && Ye(A, x, m);
    }
    z && Mt(m, null, x, "beforeMount");
    const R = ml(I, F);
    R && F.beforeEnter(j), a(j, w, b), ((A = W && W.onVnodeMounted) || R || z) && Ne(() => {
      A && Ye(A, x, m), R && F.enter(j), z && Mt(m, null, x, "mounted");
    }, I);
  }, oe = (m, w, b, x, I) => {
    if (b && p(m, b), x)
      for (let S = 0; S < x.length; S++)
        p(m, x[S]);
    if (I) {
      let S = I.subTree;
      if (w === S || _o(S.type) && (S.ssContent === w || S.ssFallback === w)) {
        const E = I.vnode;
        oe(
          m,
          E,
          E.scopeId,
          E.slotScopeIds,
          I.parent
        );
      }
    }
  }, fe = (m, w, b, x, I, S, E, _, j = 0) => {
    for (let A = j; A < m.length; A++) {
      const W = m[A] = _ ? It(m[A]) : et(m[A]);
      g(
        null,
        W,
        w,
        b,
        x,
        I,
        S,
        E,
        _
      );
    }
  }, nt = (m, w, b, x, I, S, E) => {
    const _ = w.el = m.el;
    let { patchFlag: j, dynamicChildren: A, dirs: W } = w;
    j |= m.patchFlag & 16;
    const T = m.props || Y, F = w.props || Y;
    let z;
    if (b && Ct(b, !1), (z = F.onVnodeBeforeUpdate) && Ye(z, b, w, m), W && Mt(w, m, b, "beforeUpdate"), b && Ct(b, !0), (T.innerHTML && F.innerHTML == null || T.textContent && F.textContent == null) && i(_, ""), A ? Oe(
      m.dynamicChildren,
      A,
      _,
      b,
      x,
      Hr(w, I),
      S
    ) : E || Z(
      m,
      w,
      _,
      null,
      b,
      x,
      Hr(w, I),
      S,
      !1
    ), j > 0) {
      if (j & 16)
        it(_, T, F, b, I);
      else if (j & 2 && T.class !== F.class && u(_, "class", null, F.class, I), j & 4 && u(_, "style", T.style, F.style, I), j & 8) {
        const R = w.dynamicProps;
        for (let X = 0; X < R.length; X++) {
          const U = R[X], Pe = T[U], ke = F[U];
          (ke !== Pe || U === "value") && u(_, U, Pe, ke, I, b);
        }
      }
      j & 1 && m.children !== w.children && i(_, w.children);
    } else !E && A == null && it(_, T, F, b, I);
    ((z = F.onVnodeUpdated) || W) && Ne(() => {
      z && Ye(z, b, w, m), W && Mt(w, m, b, "updated");
    }, x);
  }, Oe = (m, w, b, x, I, S, E) => {
    for (let _ = 0; _ < w.length; _++) {
      const j = m[_], A = w[_], W = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        j.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (j.type === se || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !ms(j, A) || // - In the case of a component, it could contain anything.
        j.shapeFlag & 198) ? d(j.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          b
        )
      );
      g(
        j,
        A,
        W,
        null,
        x,
        I,
        S,
        E,
        !0
      );
    }
  }, it = (m, w, b, x, I) => {
    if (w !== b) {
      if (w !== Y)
        for (const S in w)
          !ks(S) && !(S in b) && u(
            m,
            S,
            w[S],
            null,
            I,
            x
          );
      for (const S in b) {
        if (ks(S)) continue;
        const E = b[S], _ = w[S];
        E !== _ && S !== "value" && u(m, S, _, E, I, x);
      }
      "value" in b && u(m, "value", w.value, b.value, I);
    }
  }, vt = (m, w, b, x, I, S, E, _, j) => {
    const A = w.el = m ? m.el : o(""), W = w.anchor = m ? m.anchor : o("");
    let { patchFlag: T, dynamicChildren: F, slotScopeIds: z } = w;
    z && (_ = _ ? _.concat(z) : z), m == null ? (a(A, b, x), a(W, b, x), fe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      w.children || [],
      b,
      W,
      I,
      S,
      E,
      _,
      j
    )) : T > 0 && T & 64 && F && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    m.dynamicChildren ? (Oe(
      m.dynamicChildren,
      F,
      b,
      I,
      S,
      E,
      _
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (w.key != null || I && w === I.subTree) && Io(
      m,
      w,
      !0
      /* shallow */
    )) : Z(
      m,
      w,
      b,
      W,
      I,
      S,
      E,
      _,
      j
    );
  }, jt = (m, w, b, x, I, S, E, _, j) => {
    w.slotScopeIds = _, m == null ? w.shapeFlag & 512 ? I.ctx.activate(
      w,
      b,
      x,
      E,
      j
    ) : we(
      w,
      b,
      x,
      I,
      S,
      E,
      j
    ) : bt(m, w, j);
  }, we = (m, w, b, x, I, S, E) => {
    const _ = m.component = Ml(
      m,
      x,
      I
    );
    if (uo(m) && (_.ctx.renderer = Ot), Nl(_, !1, E), _.asyncDep) {
      if (I && I.registerDep(_, ae, E), !m.el) {
        const j = _.subTree = Ge(xt);
        $(null, j, w, b), m.placeholder = j.el;
      }
    } else
      ae(
        _,
        m,
        w,
        b,
        I,
        S,
        E
      );
  }, bt = (m, w, b) => {
    const x = w.component = m.component;
    if (ql(m, w, b))
      if (x.asyncDep && !x.asyncResolved) {
        ee(x, w, b);
        return;
      } else
        x.next = w, x.update();
    else
      w.el = m.el, x.vnode = w;
  }, ae = (m, w, b, x, I, S, E) => {
    const _ = () => {
      if (m.isMounted) {
        let { next: T, bu: F, u: z, parent: R, vnode: X } = m;
        {
          const ve = qo(m);
          if (ve) {
            T && (T.el = X.el, ee(m, T, E)), ve.asyncDep.then(() => {
              m.isUnmounted || _();
            });
            return;
          }
        }
        let U = T, Pe;
        Ct(m, !1), T ? (T.el = X.el, ee(m, T, E)) : T = X, F && sr(F), (Pe = T.props && T.props.onVnodeBeforeUpdate) && Ye(Pe, R, T, X), Ct(m, !0);
        const ke = Qn(m), We = m.subTree;
        m.subTree = ke, g(
          We,
          ke,
          // parent may have changed if it's in a teleport
          d(We.el),
          // anchor may have changed if it's in a fragment
          Xe(We),
          m,
          I,
          S
        ), T.el = ke.el, U === null && Sl(m, ke.el), z && Ne(z, I), (Pe = T.props && T.props.onVnodeUpdated) && Ne(
          () => Ye(Pe, R, T, X),
          I
        );
      } else {
        let T;
        const { el: F, props: z } = w, { bm: R, m: X, parent: U, root: Pe, type: ke } = m, We = Ss(w);
        Ct(m, !1), R && sr(R), !We && (T = z && z.onVnodeBeforeMount) && Ye(T, U, w), Ct(m, !0);
        {
          Pe.ce && // @ts-expect-error _def is private
          Pe.ce._def.shadowRoot !== !1 && Pe.ce._injectChildStyle(ke);
          const ve = m.subTree = Qn(m);
          g(
            null,
            ve,
            b,
            x,
            m,
            I,
            S
          ), w.el = ve.el;
        }
        if (X && Ne(X, I), !We && (T = z && z.onVnodeMounted)) {
          const ve = w;
          Ne(
            () => Ye(T, U, ve),
            I
          );
        }
        (w.shapeFlag & 256 || U && Ss(U.vnode) && U.vnode.shapeFlag & 256) && m.a && Ne(m.a, I), m.isMounted = !0, w = b = x = null;
      }
    };
    m.scope.on();
    const j = m.effect = new zi(_);
    m.scope.off();
    const A = m.update = j.run.bind(j), W = m.job = j.runIfDirty.bind(j);
    W.i = m, W.id = m.uid, j.scheduler = () => An(W), Ct(m, !0), A();
  }, ee = (m, w, b) => {
    w.component = m;
    const x = m.vnode.props;
    m.vnode = w, m.next = null, ll(m, w.props, x, b), pl(m, w.children, b), yt(), Hn(m), gt();
  }, Z = (m, w, b, x, I, S, E, _, j = !1) => {
    const A = m && m.children, W = m ? m.shapeFlag : 0, T = w.children, { patchFlag: F, shapeFlag: z } = w;
    if (F > 0) {
      if (F & 128) {
        Wt(
          A,
          T,
          b,
          x,
          I,
          S,
          E,
          _,
          j
        );
        return;
      } else if (F & 256) {
        me(
          A,
          T,
          b,
          x,
          I,
          S,
          E,
          _,
          j
        );
        return;
      }
    }
    z & 8 ? (W & 16 && Pt(A, I, S), T !== A && i(b, T)) : W & 16 ? z & 16 ? Wt(
      A,
      T,
      b,
      x,
      I,
      S,
      E,
      _,
      j
    ) : Pt(A, I, S, !0) : (W & 8 && i(b, ""), z & 16 && fe(
      T,
      b,
      x,
      I,
      S,
      E,
      _,
      j
    ));
  }, me = (m, w, b, x, I, S, E, _, j) => {
    m = m || Kt, w = w || Kt;
    const A = m.length, W = w.length, T = Math.min(A, W);
    let F;
    for (F = 0; F < T; F++) {
      const z = w[F] = j ? It(w[F]) : et(w[F]);
      g(
        m[F],
        z,
        b,
        null,
        I,
        S,
        E,
        _,
        j
      );
    }
    A > W ? Pt(
      m,
      I,
      S,
      !0,
      !1,
      T
    ) : fe(
      w,
      b,
      x,
      I,
      S,
      E,
      _,
      j,
      T
    );
  }, Wt = (m, w, b, x, I, S, E, _, j) => {
    let A = 0;
    const W = w.length;
    let T = m.length - 1, F = W - 1;
    for (; A <= T && A <= F; ) {
      const z = m[A], R = w[A] = j ? It(w[A]) : et(w[A]);
      if (ms(z, R))
        g(
          z,
          R,
          b,
          null,
          I,
          S,
          E,
          _,
          j
        );
      else
        break;
      A++;
    }
    for (; A <= T && A <= F; ) {
      const z = m[T], R = w[F] = j ? It(w[F]) : et(w[F]);
      if (ms(z, R))
        g(
          z,
          R,
          b,
          null,
          I,
          S,
          E,
          _,
          j
        );
      else
        break;
      T--, F--;
    }
    if (A > T) {
      if (A <= F) {
        const z = F + 1, R = z < W ? w[z].el : x;
        for (; A <= F; )
          g(
            null,
            w[A] = j ? It(w[A]) : et(w[A]),
            b,
            R,
            I,
            S,
            E,
            _,
            j
          ), A++;
      }
    } else if (A > F)
      for (; A <= T; )
        Ce(m[A], I, S, !0), A++;
    else {
      const z = A, R = A, X = /* @__PURE__ */ new Map();
      for (A = R; A <= F; A++) {
        const $e = w[A] = j ? It(w[A]) : et(w[A]);
        $e.key != null && X.set($e.key, A);
      }
      let U, Pe = 0;
      const ke = F - R + 1;
      let We = !1, ve = 0;
      const Tt = new Array(ke);
      for (A = 0; A < ke; A++) Tt[A] = 0;
      for (A = z; A <= T; A++) {
        const $e = m[A];
        if (Pe >= ke) {
          Ce($e, I, S, !0);
          continue;
        }
        let Ve;
        if ($e.key != null)
          Ve = X.get($e.key);
        else
          for (U = R; U <= F; U++)
            if (Tt[U - R] === 0 && ms($e, w[U])) {
              Ve = U;
              break;
            }
        Ve === void 0 ? Ce($e, I, S, !0) : (Tt[Ve - R] = A + 1, Ve >= ve ? ve = Ve : We = !0, g(
          $e,
          w[Ve],
          b,
          null,
          I,
          S,
          E,
          _,
          j
        ), Pe++);
      }
      const ps = We ? yl(Tt) : Kt;
      for (U = ps.length - 1, A = ke - 1; A >= 0; A--) {
        const $e = R + A, Ve = w[$e], Bs = w[$e + 1], Us = $e + 1 < W ? (
          // #13559, fallback to el placeholder for unresolved async component
          Bs.el || Bs.placeholder
        ) : x;
        Tt[A] === 0 ? g(
          null,
          Ve,
          b,
          Us,
          I,
          S,
          E,
          _,
          j
        ) : We && (U < 0 || A !== ps[U] ? ot(Ve, b, Us, 2) : U--);
      }
    }
  }, ot = (m, w, b, x, I = null) => {
    const { el: S, type: E, transition: _, children: j, shapeFlag: A } = m;
    if (A & 6) {
      ot(m.component.subTree, w, b, x);
      return;
    }
    if (A & 128) {
      m.suspense.move(w, b, x);
      return;
    }
    if (A & 64) {
      E.move(m, w, b, Ot);
      return;
    }
    if (E === se) {
      a(S, w, b);
      for (let T = 0; T < j.length; T++)
        ot(j[T], w, b, x);
      a(m.anchor, w, b);
      return;
    }
    if (E === Br) {
      M(m, w, b);
      return;
    }
    if (x !== 2 && A & 1 && _)
      if (x === 0)
        _.beforeEnter(S), a(S, w, b), Ne(() => _.enter(S), I);
      else {
        const { leave: T, delayLeave: F, afterLeave: z } = _, R = () => {
          m.ctx.isUnmounted ? l(S) : a(S, w, b);
        }, X = () => {
          S._isLeaving && S[La](
            !0
            /* cancelled */
          ), T(S, () => {
            R(), z && z();
          });
        };
        F ? F(S, R, X) : X();
      }
    else
      a(S, w, b);
  }, Ce = (m, w, b, x = !1, I = !1) => {
    const {
      type: S,
      props: E,
      ref: _,
      children: j,
      dynamicChildren: A,
      shapeFlag: W,
      patchFlag: T,
      dirs: F,
      cacheIndex: z
    } = m;
    if (T === -2 && (I = !1), _ != null && (yt(), qs(_, null, b, m, !0), gt()), z != null && (w.renderCache[z] = void 0), W & 256) {
      w.ctx.deactivate(m);
      return;
    }
    const R = W & 1 && F, X = !Ss(m);
    let U;
    if (X && (U = E && E.onVnodeBeforeUnmount) && Ye(U, w, m), W & 6)
      ds(m.component, b, x);
    else {
      if (W & 128) {
        m.suspense.unmount(b, x);
        return;
      }
      R && Mt(m, null, w, "beforeUnmount"), W & 64 ? m.type.remove(
        m,
        w,
        b,
        Ot,
        x
      ) : A && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !A.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (S !== se || T > 0 && T & 64) ? Pt(
        A,
        w,
        b,
        !1,
        !0
      ) : (S === se && T & 384 || !I && W & 16) && Pt(j, w, b), x && Vs(m);
    }
    (X && (U = E && E.onVnodeUnmounted) || R) && Ne(() => {
      U && Ye(U, w, m), R && Mt(m, null, w, "unmounted");
    }, b);
  }, Vs = (m) => {
    const { type: w, el: b, anchor: x, transition: I } = m;
    if (w === se) {
      Hs(b, x);
      return;
    }
    if (w === Br) {
      C(m);
      return;
    }
    const S = () => {
      l(b), I && !I.persisted && I.afterLeave && I.afterLeave();
    };
    if (m.shapeFlag & 1 && I && !I.persisted) {
      const { leave: E, delayLeave: _ } = I, j = () => E(b, S);
      _ ? _(m.el, S, j) : j();
    } else
      S();
  }, Hs = (m, w) => {
    let b;
    for (; m !== w; )
      b = h(m), l(m), m = b;
    l(w);
  }, ds = (m, w, b) => {
    const { bum: x, scope: I, job: S, subTree: E, um: _, m: j, a: A } = m;
    Yn(j), Yn(A), x && sr(x), I.stop(), S && (S.flags |= 8, Ce(E, m, w, b)), _ && Ne(_, w), Ne(() => {
      m.isUnmounted = !0;
    }, w);
  }, Pt = (m, w, b, x = !1, I = !1, S = 0) => {
    for (let E = S; E < m.length; E++)
      Ce(m[E], w, b, x, I);
  }, Xe = (m) => {
    if (m.shapeFlag & 6)
      return Xe(m.component.subTree);
    if (m.shapeFlag & 128)
      return m.suspense.next();
    const w = h(m.anchor || m.el), b = w && w[Ca];
    return b ? h(b) : w;
  };
  let Vt = !1;
  const Et = (m, w, b) => {
    m == null ? w._vnode && Ce(w._vnode, null, null, !0) : g(
      w._vnode || null,
      m,
      w,
      null,
      null,
      null,
      b
    ), w._vnode = m, Vt || (Vt = !0, Hn(), io(), Vt = !1);
  }, Ot = {
    p: g,
    um: Ce,
    m: ot,
    r: Vs,
    mt: we,
    mc: fe,
    pc: Z,
    pbc: Oe,
    n: Xe,
    o: e
  };
  return {
    render: Et,
    hydrate: void 0,
    createApp: il(Et)
  };
}
function Hr({ type: e, props: t }, r) {
  return r === "svg" && e === "foreignObject" || r === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : r;
}
function Ct({ effect: e, job: t }, r) {
  r ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function ml(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Io(e, t, r = !1) {
  const a = e.children, l = t.children;
  if (H(a) && H(l))
    for (let u = 0; u < a.length; u++) {
      const s = a[u];
      let o = l[u];
      o.shapeFlag & 1 && !o.dynamicChildren && ((o.patchFlag <= 0 || o.patchFlag === 32) && (o = l[u] = It(l[u]), o.el = s.el), !r && o.patchFlag !== -2 && Io(s, o)), o.type === Tr && // avoid cached text nodes retaining detached dom nodes
      o.patchFlag !== -1 && (o.el = s.el), o.type === xt && !o.el && (o.el = s.el);
    }
}
function yl(e) {
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
function qo(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : qo(t);
}
function Yn(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const gl = Symbol.for("v-scx"), wl = () => rr(gl);
function As(e, t, r) {
  return So(e, t, r);
}
function So(e, t, r = Y) {
  const { immediate: a, deep: l, flush: u, once: s } = r, o = Ee({}, r), c = t && a || !t && u !== "post";
  let n;
  if (Ms) {
    if (u === "sync") {
      const p = wl();
      n = p.__watcherHandles || (p.__watcherHandles = []);
    } else if (!c) {
      const p = () => {
      };
      return p.stop = tt, p.resume = tt, p.pause = tt, p;
    }
  }
  const i = xe;
  o.call = (p, f, g) => rt(p, i, f, g);
  let d = !1;
  u === "post" ? o.scheduler = (p) => {
    Ne(p, i && i.suspense);
  } : u !== "sync" && (d = !0, o.scheduler = (p, f) => {
    f ? p() : An(p);
  }), o.augmentJob = (p) => {
    t && (p.flags |= 4), d && (p.flags |= 2, i && (p.id = i.uid, p.i = i));
  };
  const h = ja(e, t, o);
  return Ms && (n ? n.push(h) : c && h()), h;
}
function vl(e, t, r) {
  const a = this.proxy, l = pe(e) ? e.includes(".") ? xo(a, e) : () => a[e] : e.bind(a, a);
  let u;
  B(t) ? u = t : (u = t.handler, r = t);
  const s = Fs(this), o = So(l, u.bind(a), r);
  return s(), o;
}
function xo(e, t) {
  const r = t.split(".");
  return () => {
    let a = e;
    for (let l = 0; l < r.length && a; l++)
      a = a[r[l]];
    return a;
  };
}
const bl = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Be(t)}Modifiers`] || e[`${_t(t)}Modifiers`];
function Pl(e, t, ...r) {
  if (e.isUnmounted) return;
  const a = e.vnode.props || Y;
  let l = r;
  const u = t.startsWith("update:"), s = u && bl(a, t.slice(7));
  s && (s.trim && (l = r.map((i) => pe(i) ? i.trim() : i)), s.number && (l = r.map(or)));
  let o, c = a[o = Dr(t)] || // also try camelCase event handler (#2249)
  a[o = Dr(Be(t))];
  !c && u && (c = a[o = Dr(_t(t))]), c && rt(
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
    e.emitted[o] = !0, rt(
      n,
      e,
      6,
      l
    );
  }
}
const kl = /* @__PURE__ */ new WeakMap();
function Ao(e, t, r = !1) {
  const a = r ? kl : t.emitsCache, l = a.get(e);
  if (l !== void 0)
    return l;
  const u = e.emits;
  let s = {}, o = !1;
  if (!B(e)) {
    const c = (n) => {
      const i = Ao(n, t, !0);
      i && (o = !0, Ee(s, i));
    };
    !r && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !u && !o ? (re(e) && a.set(e, null), null) : (H(u) ? u.forEach((c) => s[c] = null) : Ee(s, u), re(e) && a.set(e, s), s);
}
function Or(e, t) {
  return !e || !$r(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), G(e, t[0].toLowerCase() + t.slice(1)) || G(e, _t(t)) || G(e, t));
}
function Qn(e) {
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
  } = e, k = cr(e);
  let $, O;
  try {
    if (r.shapeFlag & 4) {
      const C = l || a, Q = C;
      $ = et(
        n.call(
          Q,
          C,
          i,
          d,
          p,
          h,
          f
        )
      ), O = o;
    } else {
      const C = t;
      $ = et(
        C.length > 1 ? C(
          d,
          { attrs: o, slots: s, emit: c }
        ) : C(
          d,
          null
        )
      ), O = t.props ? o : $l(o);
    }
  } catch (C) {
    _s.length = 0, jr(C, e, 1), $ = Ge(xt);
  }
  let M = $;
  if (O && g !== !1) {
    const C = Object.keys(O), { shapeFlag: Q } = M;
    C.length && Q & 7 && (u && C.some(mn) && (O = Il(
      O,
      u
    )), M = cs(M, O, !1, !0));
  }
  return r.dirs && (M = cs(M, null, !1, !0), M.dirs = M.dirs ? M.dirs.concat(r.dirs) : r.dirs), r.transition && _n(M, r.transition), $ = M, cr(k), $;
}
const $l = (e) => {
  let t;
  for (const r in e)
    (r === "class" || r === "style" || $r(r)) && ((t || (t = {}))[r] = e[r]);
  return t;
}, Il = (e, t) => {
  const r = {};
  for (const a in e)
    (!mn(a) || !(a.slice(9) in t)) && (r[a] = e[a]);
  return r;
};
function ql(e, t, r) {
  const { props: a, children: l, component: u } = e, { props: s, children: o, patchFlag: c } = t, n = u.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (r && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return a ? ei(a, s, n) : !!s;
    if (c & 8) {
      const i = t.dynamicProps;
      for (let d = 0; d < i.length; d++) {
        const h = i[d];
        if (s[h] !== a[h] && !Or(n, h))
          return !0;
      }
    }
  } else
    return (l || o) && (!o || !o.$stable) ? !0 : a === s ? !1 : a ? s ? ei(a, s, n) : !0 : !!s;
  return !1;
}
function ei(e, t, r) {
  const a = Object.keys(t);
  if (a.length !== Object.keys(e).length)
    return !0;
  for (let l = 0; l < a.length; l++) {
    const u = a[l];
    if (t[u] !== e[u] && !Or(r, u))
      return !0;
  }
  return !1;
}
function Sl({ vnode: e, parent: t }, r) {
  for (; t; ) {
    const a = t.subTree;
    if (a.suspense && a.suspense.activeBranch === e && (a.el = e.el), a === e)
      (e = t.vnode).el = r, t = t.parent;
    else
      break;
  }
}
const _o = (e) => e.__isSuspense;
function xl(e, t) {
  t && t.pendingBranch ? H(e) ? t.effects.push(...e) : t.effects.push(e) : Ta(e);
}
const se = Symbol.for("v-fgt"), Tr = Symbol.for("v-txt"), xt = Symbol.for("v-cmt"), Br = Symbol.for("v-stc"), _s = [];
let Fe = null;
function L(e = !1) {
  _s.push(Fe = e ? null : []);
}
function Al() {
  _s.pop(), Fe = _s[_s.length - 1] || null;
}
let Ts = 1;
function ti(e, t = !1) {
  Ts += e, e < 0 && Fe && t && (Fe.hasOnce = !0);
}
function jo(e) {
  return e.dynamicChildren = Ts > 0 ? Fe || Kt : null, Al(), Ts > 0 && Fe && Fe.push(e), e;
}
function D(e, t, r, a, l, u) {
  return jo(
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
function fr(e, t, r, a, l) {
  return jo(
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
function Eo(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function ms(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Oo = ({ key: e }) => e ?? null, nr = ({
  ref: e,
  ref_key: t,
  ref_for: r
}) => (typeof e == "number" && (e = "" + e), e != null ? pe(e) || Ae(e) || B(e) ? { i: ze, r: e, k: t, f: !!r } : e : null);
function y(e, t = null, r = null, a = 0, l = null, u = e === se ? 0 : 1, s = !1, o = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Oo(t),
    ref: t && nr(t),
    scopeId: ao,
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
    ctx: ze
  };
  return o ? (Mn(c, r), u & 128 && e.normalize(c)) : r && (c.shapeFlag |= pe(r) ? 8 : 16), Ts > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  Fe && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || u & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && Fe.push(c), c;
}
const Ge = _l;
function _l(e, t = null, r = null, a = 0, l = null, u = !1) {
  if ((!e || e === Ga) && (e = xt), Eo(e)) {
    const o = cs(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return r && Mn(o, r), Ts > 0 && !u && Fe && (o.shapeFlag & 6 ? Fe[Fe.indexOf(e)] = o : Fe.push(o)), o.patchFlag = -2, o;
  }
  if (Fl(e) && (e = e.__vccOpts), t) {
    t = jl(t);
    let { class: o, style: c } = t;
    o && !pe(o) && (t.class = ge(o)), re(c) && (Sn(c) && !H(c) && (c = Ee({}, c)), t.style = wn(c));
  }
  const s = pe(e) ? 1 : _o(e) ? 128 : Na(e) ? 64 : re(e) ? 4 : B(e) ? 2 : 0;
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
function jl(e) {
  return e ? Sn(e) || wo(e) ? Ee({}, e) : e : null;
}
function cs(e, t, r = !1, a = !1) {
  const { props: l, ref: u, patchFlag: s, children: o, transition: c } = e, n = t ? El(l || {}, t) : l, i = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: n,
    key: n && Oo(n),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      r && u ? H(u) ? u.concat(nr(t)) : [u, nr(t)] : nr(t)
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
    ssContent: e.ssContent && cs(e.ssContent),
    ssFallback: e.ssFallback && cs(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return c && a && _n(
    i,
    c.clone(i)
  ), i;
}
function le(e = " ", t = 0) {
  return Ge(Tr, null, e, t);
}
function qe(e = "", t = !1) {
  return t ? (L(), fr(xt, null, e)) : Ge(xt, null, e);
}
function et(e) {
  return e == null || typeof e == "boolean" ? Ge(xt) : H(e) ? Ge(
    se,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Eo(e) ? It(e) : Ge(Tr, null, String(e));
}
function It(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : cs(e);
}
function Mn(e, t) {
  let r = 0;
  const { shapeFlag: a } = e;
  if (t == null)
    t = null;
  else if (H(t))
    r = 16;
  else if (typeof t == "object")
    if (a & 65) {
      const l = t.default;
      l && (l._c && (l._d = !1), Mn(e, l()), l._c && (l._d = !0));
      return;
    } else {
      r = 32;
      const l = t._;
      !l && !wo(t) ? t._ctx = ze : l === 3 && ze && (ze.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else B(t) ? (t = { default: t, _ctx: ze }, r = 32) : (t = String(t), a & 64 ? (r = 16, t = [le(t)]) : r = 8);
  e.children = t, e.shapeFlag |= r;
}
function El(...e) {
  const t = {};
  for (let r = 0; r < e.length; r++) {
    const a = e[r];
    for (const l in a)
      if (l === "class")
        t.class !== a.class && (t.class = ge([t.class, a.class]));
      else if (l === "style")
        t.style = wn([t.style, a.style]);
      else if ($r(l)) {
        const u = t[l], s = a[l];
        s && u !== s && !(H(u) && u.includes(s)) && (t[l] = u ? [].concat(u, s) : s);
      } else l !== "" && (t[l] = a[l]);
  }
  return t;
}
function Ye(e, t, r, a = null) {
  rt(e, t, 7, [
    r,
    a
  ]);
}
const Ol = mo();
let Tl = 0;
function Ml(e, t, r) {
  const a = e.type, l = (t ? t.appContext : e.appContext) || Ol, u = {
    uid: Tl++,
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
    scope: new sa(
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
    propsOptions: bo(a, l),
    emitsOptions: Ao(a, l),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Y,
    // inheritAttrs
    inheritAttrs: a.inheritAttrs,
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
  return u.ctx = { _: u }, u.root = t ? t.root : u, u.emit = Pl.bind(null, u), e.ce && e.ce(u), u;
}
let xe = null;
const Cl = () => xe || ze;
let hr, ln;
{
  const e = xr(), t = (r, a) => {
    let l;
    return (l = e[r]) || (l = e[r] = []), l.push(a), (u) => {
      l.length > 1 ? l.forEach((s) => s(u)) : l[0](u);
    };
  };
  hr = t(
    "__VUE_INSTANCE_SETTERS__",
    (r) => xe = r
  ), ln = t(
    "__VUE_SSR_SETTERS__",
    (r) => Ms = r
  );
}
const Fs = (e) => {
  const t = xe;
  return hr(e), e.scope.on(), () => {
    e.scope.off(), hr(t);
  };
}, si = () => {
  xe && xe.scope.off(), hr(null);
};
function To(e) {
  return e.vnode.shapeFlag & 4;
}
let Ms = !1;
function Nl(e, t = !1, r = !1) {
  t && ln(t);
  const { props: a, children: l } = e.vnode, u = To(e);
  al(e, a, u, t), dl(e, l, r || t);
  const s = u ? Ll(e, t) : void 0;
  return t && ln(!1), s;
}
function Ll(e, t) {
  const r = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Ya);
  const { setup: a } = r;
  if (a) {
    yt();
    const l = e.setupContext = a.length > 1 ? Rl(e) : null, u = Fs(e), s = zs(
      a,
      e,
      0,
      [
        e.props,
        l
      ]
    ), o = Ti(s);
    if (gt(), u(), (o || e.sp) && !Ss(e) && lo(e), o) {
      if (s.then(si, si), t)
        return s.then((c) => {
          ri(e, c);
        }).catch((c) => {
          jr(c, e, 0);
        });
      e.asyncDep = s;
    } else
      ri(e, s);
  } else
    Mo(e);
}
function ri(e, t, r) {
  B(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : re(t) && (e.setupState = so(t)), Mo(e);
}
function Mo(e, t, r) {
  const a = e.type;
  e.render || (e.render = a.render || tt);
  {
    const l = Fs(e);
    yt();
    try {
      Qa(e);
    } finally {
      gt(), l();
    }
  }
}
const Dl = {
  get(e, t) {
    return Se(e, "get", ""), e[t];
  }
};
function Rl(e) {
  const t = (r) => {
    e.exposed = r || {};
  };
  return {
    attrs: new Proxy(e.attrs, Dl),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Mr(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(so($a(e.exposed)), {
    get(t, r) {
      if (r in t)
        return t[r];
      if (r in xs)
        return xs[r](e);
    },
    has(t, r) {
      return r in t || r in xs;
    }
  })) : e.proxy;
}
function zl(e, t = !0) {
  return B(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Fl(e) {
  return B(e) && "__vccOpts" in e;
}
const Re = (e, t) => Aa(e, t, Ms), Wl = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let un;
const ni = typeof window < "u" && window.trustedTypes;
if (ni)
  try {
    un = /* @__PURE__ */ ni.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Co = un ? (e) => un.createHTML(e) : (e) => e, Vl = "http://www.w3.org/2000/svg", Hl = "http://www.w3.org/1998/Math/MathML", ct = typeof document < "u" ? document : null, ii = ct && /* @__PURE__ */ ct.createElement("template"), Bl = {
  insert: (e, t, r) => {
    t.insertBefore(e, r || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, r, a) => {
    const l = t === "svg" ? ct.createElementNS(Vl, e) : t === "mathml" ? ct.createElementNS(Hl, e) : r ? ct.createElement(e, { is: r }) : ct.createElement(e);
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
      ii.innerHTML = Co(
        a === "svg" ? `<svg>${e}</svg>` : a === "mathml" ? `<math>${e}</math>` : e
      );
      const o = ii.content;
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
}, Ul = Symbol("_vtc");
function Kl(e, t, r) {
  const a = e[Ul];
  a && (t = (t ? [t, ...a] : [...a]).join(" ")), t == null ? e.removeAttribute("class") : r ? e.setAttribute("class", t) : e.className = t;
}
const mr = Symbol("_vod"), No = Symbol("_vsh"), Ur = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(e, { value: t }, { transition: r }) {
    e[mr] = e.style.display === "none" ? "" : e.style.display, r && t ? r.beforeEnter(e) : ys(e, t);
  },
  mounted(e, { value: t }, { transition: r }) {
    r && t && r.enter(e);
  },
  updated(e, { value: t, oldValue: r }, { transition: a }) {
    !t != !r && (a ? t ? (a.beforeEnter(e), ys(e, !0), a.enter(e)) : a.leave(e, () => {
      ys(e, !1);
    }) : ys(e, t));
  },
  beforeUnmount(e, { value: t }) {
    ys(e, t);
  }
};
function ys(e, t) {
  e.style.display = t ? e[mr] : "none", e[No] = !t;
}
const Zl = Symbol(""), Jl = /(?:^|;)\s*display\s*:/;
function Gl(e, t, r) {
  const a = e.style, l = pe(r);
  let u = !1;
  if (r && !l) {
    if (t)
      if (pe(t))
        for (const s of t.split(";")) {
          const o = s.slice(0, s.indexOf(":")).trim();
          r[o] == null && ir(a, o, "");
        }
      else
        for (const s in t)
          r[s] == null && ir(a, s, "");
    for (const s in r)
      s === "display" && (u = !0), ir(a, s, r[s]);
  } else if (l) {
    if (t !== r) {
      const s = a[Zl];
      s && (r += ";" + s), a.cssText = r, u = Jl.test(r);
    }
  } else t && e.removeAttribute("style");
  mr in e && (e[mr] = u ? a.display : "", e[No] && (a.display = "none"));
}
const oi = /\s*!important$/;
function ir(e, t, r) {
  if (H(r))
    r.forEach((a) => ir(e, t, a));
  else if (r == null && (r = ""), t.startsWith("--"))
    e.setProperty(t, r);
  else {
    const a = Xl(e, t);
    oi.test(r) ? e.setProperty(
      _t(a),
      r.replace(oi, ""),
      "important"
    ) : e[a] = r;
  }
}
const ai = ["Webkit", "Moz", "ms"], Kr = {};
function Xl(e, t) {
  const r = Kr[t];
  if (r)
    return r;
  let a = Be(t);
  if (a !== "filter" && a in e)
    return Kr[t] = a;
  a = Sr(a);
  for (let l = 0; l < ai.length; l++) {
    const u = ai[l] + a;
    if (u in e)
      return Kr[t] = u;
  }
  return t;
}
const li = "http://www.w3.org/1999/xlink";
function ui(e, t, r, a, l, u = Qo(t)) {
  a && t.startsWith("xlink:") ? r == null ? e.removeAttributeNS(li, t.slice(6, t.length)) : e.setAttributeNS(li, t, r) : r == null || u && !Li(r) ? e.removeAttribute(t) : e.setAttribute(
    t,
    u ? "" : st(r) ? String(r) : r
  );
}
function ci(e, t, r, a, l) {
  if (t === "innerHTML" || t === "textContent") {
    r != null && (e[t] = t === "innerHTML" ? Co(r) : r);
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
    o === "boolean" ? r = Li(r) : r == null && o === "string" ? (r = "", s = !0) : o === "number" && (r = 0, s = !0);
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
function Yl(e, t, r, a) {
  e.removeEventListener(t, r, a);
}
const di = Symbol("_vei");
function Ql(e, t, r, a, l = null) {
  const u = e[di] || (e[di] = {}), s = u[t];
  if (a && s)
    s.value = a;
  else {
    const [o, c] = eu(t);
    if (a) {
      const n = u[t] = ru(
        a,
        l
      );
      Rt(e, o, n, c);
    } else s && (Yl(e, o, s, c), u[t] = void 0);
  }
}
const pi = /(?:Once|Passive|Capture)$/;
function eu(e) {
  let t;
  if (pi.test(e)) {
    t = {};
    let a;
    for (; a = e.match(pi); )
      e = e.slice(0, e.length - a[0].length), t[a[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : _t(e.slice(2)), t];
}
let Zr = 0;
const tu = /* @__PURE__ */ Promise.resolve(), su = () => Zr || (tu.then(() => Zr = 0), Zr = Date.now());
function ru(e, t) {
  const r = (a) => {
    if (!a._vts)
      a._vts = Date.now();
    else if (a._vts <= r.attached)
      return;
    rt(
      nu(a, r.value),
      t,
      5,
      [a]
    );
  };
  return r.value = e, r.attached = su(), r;
}
function nu(e, t) {
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
const fi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, iu = (e, t, r, a, l, u) => {
  const s = l === "svg";
  t === "class" ? Kl(e, a, s) : t === "style" ? Gl(e, r, a) : $r(t) ? mn(t) || Ql(e, t, r, a, u) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : ou(e, t, a, s)) ? (ci(e, t, a), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ui(e, t, a, s, u, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !pe(a)) ? ci(e, Be(t), a, u, t) : (t === "true-value" ? e._trueValue = a : t === "false-value" && (e._falseValue = a), ui(e, t, a, s));
};
function ou(e, t, r, a) {
  if (a)
    return !!(t === "innerHTML" || t === "textContent" || t in e && fi(t) && B(r));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const l = e.tagName;
    if (l === "IMG" || l === "VIDEO" || l === "CANVAS" || l === "SOURCE")
      return !1;
  }
  return fi(t) && pe(r) ? !1 : t in e;
}
const yr = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return H(t) ? (r) => sr(t, r) : t;
};
function au(e) {
  e.target.composing = !0;
}
function hi(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Yt = Symbol("_assign"), lu = {
  created(e, { modifiers: { lazy: t, trim: r, number: a } }, l) {
    e[Yt] = yr(l);
    const u = a || l.props && l.props.type === "number";
    Rt(e, t ? "change" : "input", (s) => {
      if (s.target.composing) return;
      let o = e.value;
      r && (o = o.trim()), u && (o = or(o)), e[Yt](o);
    }), r && Rt(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Rt(e, "compositionstart", au), Rt(e, "compositionend", hi), Rt(e, "change", hi));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: r, modifiers: { lazy: a, trim: l, number: u } }, s) {
    if (e[Yt] = yr(s), e.composing) return;
    const o = (u || e.type === "number") && !/^0\d/.test(e.value) ? or(e.value) : e.value, c = t ?? "";
    o !== c && (document.activeElement === e && e.type !== "range" && (a && t === r || l && e.value.trim() === c) || (e.value = c));
  }
}, uu = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: r } }, a) {
    const l = Ir(t);
    Rt(e, "change", () => {
      const u = Array.prototype.filter.call(e.options, (s) => s.selected).map(
        (s) => r ? or(gr(s)) : gr(s)
      );
      e[Yt](
        e.multiple ? l ? new Set(u) : u : u[0]
      ), e._assigning = !0, xn(() => {
        e._assigning = !1;
      });
    }), e[Yt] = yr(a);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    mi(e, t);
  },
  beforeUpdate(e, t, r) {
    e[Yt] = yr(r);
  },
  updated(e, { value: t }) {
    e._assigning || mi(e, t);
  }
};
function mi(e, t) {
  const r = e.multiple, a = H(t);
  if (!(r && !a && !Ir(t))) {
    for (let l = 0, u = e.options.length; l < u; l++) {
      const s = e.options[l], o = gr(s);
      if (r)
        if (a) {
          const c = typeof o;
          c === "string" || c === "number" ? s.selected = t.some((n) => String(n) === String(o)) : s.selected = ta(t, o) > -1;
        } else
          s.selected = t.has(o);
      else if (Ar(gr(s), t)) {
        e.selectedIndex !== l && (e.selectedIndex = l);
        return;
      }
    }
    !r && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function gr(e) {
  return "_value" in e ? e._value : e.value;
}
const cu = ["ctrl", "shift", "alt", "meta"], du = {
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
  exact: (e, t) => cu.some((r) => e[`${r}Key`] && !t.includes(r))
}, Cn = (e, t) => {
  const r = e._withMods || (e._withMods = {}), a = t.join(".");
  return r[a] || (r[a] = ((l, ...u) => {
    for (let s = 0; s < t.length; s++) {
      const o = du[t[s]];
      if (o && o(l, t)) return;
    }
    return e(l, ...u);
  }));
}, pu = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, fu = (e, t) => {
  const r = e._withKeys || (e._withKeys = {}), a = t.join(".");
  return r[a] || (r[a] = ((l) => {
    if (!("key" in l))
      return;
    const u = _t(l.key);
    if (t.some(
      (s) => s === u || pu[s] === u
    ))
      return e(l);
  }));
}, hu = /* @__PURE__ */ Ee({ patchProp: iu }, Bl);
let yi;
function mu() {
  return yi || (yi = fl(hu));
}
const yu = ((...e) => {
  const t = mu().createApp(...e), { mount: r } = t;
  return t.mount = (a) => {
    const l = wu(a);
    if (!l) return;
    const u = t._component;
    !B(u) && !u.render && !u.template && (u.template = l.innerHTML), l.nodeType === 1 && (l.textContent = "");
    const s = r(l, !1, gu(l));
    return l instanceof Element && (l.removeAttribute("v-cloak"), l.setAttribute("data-v-app", "")), s;
  }, t;
});
function gu(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function wu(e) {
  return pe(e) ? document.querySelector(e) : e;
}
const vu = { class: "tree-node" }, bu = ["title"], Pu = {
  key: 0,
  class: "tree-children"
}, ku = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
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
      const c = Ja("FileTreeNode", !0);
      return L(), D("div", vu, [
        y("div", {
          class: ge(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: o[1] || (o[1] = (n) => r("select", e.node)),
          onDblclick: o[2] || (o[2] = (n) => e.node.kind === "directory" && (a.value = !a.value))
        }, [
          y("span", {
            class: "tree-toggle",
            onClick: o[0] || (o[0] = Cn((n) => e.node.kind === "directory" && (a.value = !a.value), ["stop"]))
          }, N(e.node.kind === "directory" ? a.value ? "⌄" : "›" : ""), 1),
          y("span", {
            class: ge(["tree-icon", u(e.node)])
          }, N(l(e.node)), 3),
          y("span", null, N(e.node.name), 1)
        ], 42, bu),
        e.node.kind === "directory" && a.value ? (L(), D("div", Pu, [
          (L(!0), D(se, null, Ke(e.node.children, (n) => (L(), fr(c, {
            key: n.path,
            node: n,
            "selected-path": e.selectedPath,
            onSelect: o[3] || (o[3] = (i) => r("select", i))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : qe("", !0)
      ]);
    };
  }
}), $u = { class: "monaco-editor-shell" }, Iu = {
  key: 0,
  class: "editor-loading"
}, qu = {
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
    const r = e, a = t, l = K(null), u = K(!0);
    let s, o, c, n, i = !1, d;
    jn(async () => {
      try {
        const g = await import("./monaco-runtime-BcgZ2pqz.js").then((k) => k.jz);
        ({ monaco: c } = await g.configureStudioMonaco()), d = g.configureManifestSchemaForText, o = h(), f(o.getValue()), s = c.editor.create(l.value, {
          model: o,
          theme: "webwindows-studio-light",
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
          const k = o.getValue();
          f(k), i || a("update:value", k);
        }), s.addCommand(c.KeyMod.CtrlCmd | c.KeyCode.KeyS, () => a("save")), u.value = !1, p(), s.focus(), a("ready");
      } catch (g) {
        u.value = !1, a("error", g);
      }
    }), As(() => r.value, (g) => {
      !o || o.getValue() === g || (i = !0, o.setValue(g), f(g), i = !1);
    }), As(() => r.markers, p, { deep: !0 }), En(() => {
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
    return (g, k) => (L(), D("div", $u, [
      y("div", {
        ref_key: "host",
        ref: l,
        class: "monaco-editor-host"
      }, null, 512),
      u.value ? (L(), D("div", Iu, "正在载入本地编辑器…")) : qe("", !0)
    ]));
  }
}, Su = 1, gi = 2;
function At(e) {
  return !e || typeof e != "object" || Array.isArray(e) ? null : Object.prototype.hasOwnProperty.call(e, "manifestVersion") ? e.manifestVersion === gi ? gi : null : Su;
}
const xu = { class: "manifest-inspector" }, Au = { class: "inspector-mode-tabs" }, _u = {
  key: 0,
  class: "inspector-note"
}, ju = {
  key: 1,
  class: "inspector-note error"
}, Eu = ["value"], Ou = { key: 0 }, Tu = ["value"], Mu = ["value"], Cu = ["value"], Nu = ["value"], Lu = ["value"], Du = ["value"], Ru = ["value"], zu = ["value"], Fu = ["value"], Wu = ["value"], Vu = { class: "check" }, Hu = ["checked"], Bu = { class: "check" }, Uu = ["checked"], Ku = { class: "check" }, Zu = ["checked"], Ju = { class: "check" }, Gu = ["checked"], Xu = { class: "check" }, Yu = ["checked"], Qu = {
  key: 1,
  class: "permission-fieldset"
}, ec = { class: "permission-heading" }, tc = ["checked", "onChange"], sc = { class: "permission-meta" }, rc = { key: 0 }, nc = {
  key: 2,
  class: "inspector-note"
}, ic = { class: "inspector-summary" }, oc = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const r = e, a = t, l = K("form"), u = Re(() => r.manifest && typeof r.manifest == "object" && !Array.isArray(r.manifest)), s = Re(() => {
      if (!u.value) return "—";
      const h = At(r.manifest);
      return h === 1 ? "1 (legacy implicit)" : h === 2 ? "2" : `Unsupported (${String(r.manifest.manifestVersion)})`;
    }), o = Re(() => At(r.manifest) === 2), c = Re(() => {
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
    return (h, p) => (L(), D("div", xu, [
      y("div", Au, [
        y("button", {
          type: "button",
          class: ge({ active: l.value === "form" }),
          onClick: p[0] || (p[0] = (f) => l.value = "form")
        }, "表单", 2),
        y("button", {
          type: "button",
          class: ge({ active: l.value === "json" }),
          onClick: p[1] || (p[1] = (f) => {
            l.value = "json", a("open-json");
          })
        }, "JSON", 2)
      ]),
      l.value === "json" ? (L(), D("div", _u, [
        p[18] || (p[18] = le(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        y("button", {
          type: "button",
          onClick: p[2] || (p[2] = (f) => a("open-json"))
        }, "打开 manifest.json")
      ])) : u.value ? (L(), D("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: p[17] || (p[17] = Cn(() => {
        }, ["prevent"]))
      }, [
        y("label", null, [
          p[19] || (p[19] = le("Manifest Version", -1)),
          y("input", {
            value: s.value,
            readonly: ""
          }, null, 8, Eu)
        ]),
        o.value ? (L(), D("label", Ou, [
          p[20] || (p[20] = le("SDK API Version", -1)),
          y("input", {
            value: e.manifest.sdk?.apiVersion,
            readonly: ""
          }, null, 8, Tu)
        ])) : qe("", !0),
        y("label", null, [
          p[21] || (p[21] = le("ID", -1)),
          y("input", {
            value: e.manifest.id,
            onInput: p[3] || (p[3] = (f) => d(["id"], f.target.value))
          }, null, 40, Mu)
        ]),
        y("label", null, [
          p[22] || (p[22] = le("名称", -1)),
          y("input", {
            value: e.manifest.name,
            onInput: p[4] || (p[4] = (f) => d(["name"], f.target.value))
          }, null, 40, Cu)
        ]),
        y("label", null, [
          p[23] || (p[23] = le("版本", -1)),
          y("input", {
            value: e.manifest.version,
            onInput: p[5] || (p[5] = (f) => d(["version"], f.target.value))
          }, null, 40, Nu)
        ]),
        y("label", null, [
          p[24] || (p[24] = le("描述", -1)),
          y("textarea", {
            value: e.manifest.description,
            onInput: p[6] || (p[6] = (f) => d(["description"], f.target.value))
          }, null, 40, Lu)
        ]),
        y("label", null, [
          p[25] || (p[25] = le("分类", -1)),
          y("input", {
            value: e.manifest.category,
            onInput: p[7] || (p[7] = (f) => d(["category"], f.target.value))
          }, null, 40, Du)
        ]),
        y("label", null, [
          p[26] || (p[26] = le("入口", -1)),
          y("input", {
            value: e.manifest.entry,
            onInput: p[8] || (p[8] = (f) => d(["entry"], f.target.value))
          }, null, 40, Ru)
        ]),
        y("label", null, [
          p[27] || (p[27] = le("图标", -1)),
          y("input", {
            value: e.manifest.icon,
            onInput: p[9] || (p[9] = (f) => d(["icon"], f.target.value))
          }, null, 40, zu)
        ]),
        y("fieldset", null, [
          p[31] || (p[31] = y("legend", null, "Window", -1)),
          y("label", null, [
            p[28] || (p[28] = le("宽度", -1)),
            y("input", {
              value: e.manifest.window?.width,
              onInput: p[10] || (p[10] = (f) => d(["window", "width"], f.target.value))
            }, null, 40, Fu)
          ]),
          y("label", null, [
            p[29] || (p[29] = le("高度", -1)),
            y("input", {
              value: e.manifest.window?.height,
              onInput: p[11] || (p[11] = (f) => d(["window", "height"], f.target.value))
            }, null, 40, Wu)
          ]),
          y("label", Vu, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: p[12] || (p[12] = (f) => d(["window", "singleton"], f.target.checked))
            }, null, 40, Hu),
            p[30] || (p[30] = le(" 单实例", -1))
          ])
        ]),
        y("fieldset", null, [
          p[36] || (p[36] = y("legend", null, "Placement", -1)),
          y("label", Bu, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: p[13] || (p[13] = (f) => d(["placement", "startMenu"], f.target.checked))
            }, null, 40, Uu),
            p[32] || (p[32] = le(" 开始菜单", -1))
          ]),
          y("label", Ku, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: p[14] || (p[14] = (f) => d(["placement", "allFunctions"], f.target.checked))
            }, null, 40, Zu),
            p[33] || (p[33] = le(" 全部功能", -1))
          ]),
          y("label", Ju, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: p[15] || (p[15] = (f) => d(["placement", "desktop"], f.target.checked))
            }, null, 40, Gu),
            p[34] || (p[34] = le(" 桌面", -1))
          ]),
          y("label", Xu, [
            y("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: p[16] || (p[16] = (f) => d(["placement", "taskbar"], f.target.checked))
            }, null, 40, Yu),
            p[35] || (p[35] = le(" 任务栏", -1))
          ])
        ]),
        o.value ? (L(), D("fieldset", Qu, [
          p[37] || (p[37] = y("legend", null, "Requested Permissions", -1)),
          p[38] || (p[38] = y("p", { class: "inspector-note" }, "声明仅表示请求授权，不表示 policy allowed、grant 或 Runtime capability。", -1)),
          (L(!0), D(se, null, Ke(c.value, (f) => (L(), D("label", {
            key: f.id,
            class: "permission-option"
          }, [
            y("span", ec, [
              y("input", {
                type: "checkbox",
                checked: e.manifest.permissions?.includes(f.id),
                onChange: (g) => i(f.id, g.target.checked)
              }, null, 40, tc),
              y("code", null, N(f.displayName || f.id) + " · " + N(f.id), 1)
            ]),
            y("small", null, N(n(f).description), 1),
            y("span", sc, [
              y("b", null, N(f.risk), 1),
              y("span", null, N(n(f).consent), 1),
              y("span", null, N(n(f).pilot), 1)
            ]),
            n(f).methods.length ? (L(), D("small", rc, N(n(f).methods.join(", ")), 1)) : qe("", !0)
          ]))), 128))
        ])) : (L(), D("p", nc, "Manifest v1 不承载权限。升级到 v2 必须由开发者显式确认权限，Studio 不会从源码自动推断。")),
        p[39] || (p[39] = y("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (L(), D("div", ju, "修复 JSON 错误后才能使用可视化表单。")),
      y("div", ic, N(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
}, ac = { class: "permission-inspector" }, lc = {
  key: 0,
  class: "problems-empty"
}, uc = {
  __name: "PermissionInspector",
  props: {
    manifest: { type: Object, default: null },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null },
    runtimeCompatibility: { type: Object, default: null },
    decisions: { type: Array, default: () => [] }
  },
  setup(e) {
    const t = e, r = Re(() => {
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
    return (a, l) => (L(), D("div", ac, [
      l[9] || (l[9] = y("p", { class: "inspector-note" }, "Declaration、review policy、Host grant 与 Runtime capability 是独立事实。", -1)),
      (L(!0), D(se, null, Ke(r.value, (u) => (L(), D("article", {
        key: u.id,
        class: "permission-card"
      }, [
        y("h3", null, N(u.displayName || u.id), 1),
        y("code", null, N(u.id), 1),
        y("p", null, N(u.description), 1),
        y("dl", null, [
          y("div", null, [
            l[0] || (l[0] = y("dt", null, "Risk", -1)),
            y("dd", null, N(u.risk), 1)
          ]),
          y("div", null, [
            l[1] || (l[1] = y("dt", null, "Consent", -1)),
            y("dd", null, N(u.consent), 1)
          ]),
          y("div", null, [
            l[2] || (l[2] = y("dt", null, "Declared", -1)),
            y("dd", null, N(u.declared ? "yes" : "no"), 1)
          ]),
          y("div", null, [
            l[3] || (l[3] = y("dt", null, "Policy", -1)),
            y("dd", null, N(u.latest?.policyDecision || "not-evaluated"), 1)
          ]),
          y("div", null, [
            l[4] || (l[4] = y("dt", null, "Grant", -1)),
            y("dd", null, N(u.latest?.grantState || "not-evaluated"), 1)
          ]),
          y("div", null, [
            l[5] || (l[5] = y("dt", null, "Runtime capability", -1)),
            y("dd", null, N(u.capability), 1)
          ]),
          y("div", null, [
            l[6] || (l[6] = y("dt", null, "Effective", -1)),
            y("dd", null, N(u.latest ? u.latest.finalDecision : "not-evaluated"), 1)
          ]),
          y("div", null, [
            l[7] || (l[7] = y("dt", null, "Policy version", -1)),
            y("dd", null, N(u.latest?.policyVersion || "—"), 1)
          ])
        ]),
        l[8] || (l[8] = y("h4", null, "Broker methods", -1)),
        (L(!0), D(se, null, Ke(u.methods, (s) => (L(), D("code", {
          key: s.id,
          class: "permission-method"
        }, N(s.id), 1))), 128))
      ]))), 128)),
      r.value.length ? qe("", !0) : (L(), D("div", lc, "当前 registry 没有可声明的 Preview permission。"))
    ]));
  }
};
function cc(e) {
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
const dc = { properties: { type: { enum: ["application", "system"] } } }, wi = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, pc = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, fc = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, hc = { properties: { status: { enum: ["published", "disabled"] } } }, Le = cc, mc = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), yc = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), Lo = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), gc = new RegExp("^\\.[a-z0-9]+$", "u"), wc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), vc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function ht(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ht.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Le(e) > 240) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (Le(e) < 1) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (!Lo.test(e)) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [n] : s.push(n), o++;
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [n] : s.push(n), o++;
  }
  if (typeof e == "string" && !vc.test(e)) {
    const n = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [n] : s.push(n), o++;
  }
  return ht.errors = s, o === 0;
}
ht.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const bc = new RegExp("^[a-f0-9]{64}$", "u"), Pc = new RegExp("^/api/function-package\\.asp\\?", "u");
function Qt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Qt.evaluated;
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
        if (!bc.test(n)) {
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
        if (!Pc.test(n)) {
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
  return Qt.errors = s, o === 0;
}
Qt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function es(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = es.evaluated;
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
        if (Le(n) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!mc.test(n)) {
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
            if (Le(f) < 1) {
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
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: dc.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let n = e.name;
      if (typeof n == "string") {
        if (Le(n) < 1) {
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
        if (Le(n) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!yc.test(n)) {
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
        if (Le(n) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (Le(n) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Lo.test(n)) {
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
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: wi.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.source !== void 0) {
          let i = n.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: wi.properties.source.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: pc.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: fc.properties.mode.enum }, message: "must be equal to one of the allowed values" };
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
            if (Le(i) < 1) {
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
            if (Le(i) < 1) {
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
                if (Le(p) < 1) {
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
                if (Le(p) < 1) {
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
                    if (!gc.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [M] : s.push(M), o++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [M] : s.push(M), o++;
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
                        const M = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: g, j: k }, message: "must NOT have duplicate items (items ## " + k + " and " + g + " are identical)" };
                        s === null ? s = [M] : s.push(M), o++;
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
                    if (!wc.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [M] : s.push(M), o++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [M] : s.push(M), o++;
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
                        const M = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: g, j: k }, message: "must NOT have duplicate items (items ## " + k + " and " + g + " are identical)" };
                        s === null ? s = [M] : s.push(M), o++;
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
            if (Le(i) < 1) {
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
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: hc.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (Qt(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? Qt.errors : s.concat(Qt.errors), o = s.length)), e.runtime !== void 0) {
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
  return es.errors = s, o === 0;
}
es.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Cs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Cs.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), es(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? es.errors : s.concat(es.errors), o = s.length), Cs.errors = s, o === 0;
}
Cs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function kc(e) {
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
function $c(e, t) {
  return e === t;
}
const Ic = { properties: { type: { enum: ["application", "system"] } } }, vi = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, qc = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, Sc = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, xc = { properties: { status: { enum: ["published", "disabled"] } } }, Ac = { enum: ["device.battery-status.read"] }, _c = $c;
function ts(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ts.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Array.isArray(e)) {
    const n = e.length;
    for (let h = 0; h < n; h++) {
      let p = e[h];
      if (typeof p != "string") {
        const f = { instancePath: t + "/" + h, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [f] : s.push(f), o++;
      }
      if (p !== "device.battery-status.read") {
        const f = { instancePath: t + "/" + h, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/enum", keyword: "enum", params: { allowedValues: Ac.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [f] : s.push(f), o++;
      }
    }
    let i = e.length, d;
    if (i > 1) {
      e: for (; i--; )
        for (d = i; d--; )
          if (_c(e[i], e[d])) {
            const h = { instancePath: t, schemaPath: "#/uniqueItems", keyword: "uniqueItems", params: { i, j: d }, message: "must NOT have duplicate items (items ## " + d + " and " + i + " are identical)" };
            s === null ? s = [h] : s.push(h), o++;
            break e;
          }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "array" }, message: "must be array" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return ts.errors = s, o === 0;
}
ts.evaluated = { items: !0, dynamicProps: !1, dynamicItems: !1 };
const De = kc, Do = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), jc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function mt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = mt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (De(e) > 240) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (De(e) < 1) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (!Do.test(e)) {
      const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [n] : s.push(n), o++;
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [n] : s.push(n), o++;
  }
  if (typeof e == "string" && !jc.test(e)) {
    const n = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [n] : s.push(n), o++;
  }
  return mt.errors = s, o === 0;
}
mt.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const Ec = new RegExp("^[a-f0-9]{64}$", "u"), Oc = new RegExp("^/api/function-package\\.asp\\?", "u");
function ss(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ss.evaluated;
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
        if (!Ec.test(n)) {
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
        if (!Oc.test(n)) {
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
  return ss.errors = s, o === 0;
}
ss.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Tc = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), Mc = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), Cc = new RegExp("^\\.[a-z0-9]+$", "u"), Nc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u");
function rs(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = rs.evaluated;
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
    if (e.permissions !== void 0 && (ts(e.permissions, { instancePath: t + "/permissions", parentData: e, parentDataProperty: "permissions", rootData: l, dynamicAnchors: u }) || (s = s === null ? ts.errors : s.concat(ts.errors), o = s.length)), e.id !== void 0) {
      let n = e.id;
      if (typeof n == "string") {
        if (De(n) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Tc.test(n)) {
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
            if (De(f) < 1) {
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
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: Ic.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let n = e.name;
      if (typeof n == "string") {
        if (De(n) < 1) {
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
        if (De(n) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Mc.test(n)) {
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
        if (De(n) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (De(n) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Do.test(n)) {
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
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: vi.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (n.source !== void 0) {
          let i = n.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: vi.properties.source.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: qc.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: Sc.properties.mode.enum }, message: "must be equal to one of the allowed values" };
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
            if (De(i) < 1) {
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
            if (De(i) < 1) {
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
                if (De(p) < 1) {
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
                if (De(p) < 1) {
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
                    if (!Cc.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [M] : s.push(M), o++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [M] : s.push(M), o++;
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
                        const M = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: g, j: k }, message: "must NOT have duplicate items (items ## " + k + " and " + g + " are identical)" };
                        s === null ? s = [M] : s.push(M), o++;
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
                    if (!Nc.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [M] : s.push(M), o++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [M] : s.push(M), o++;
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
                        const M = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: g, j: k }, message: "must NOT have duplicate items (items ## " + k + " and " + g + " are identical)" };
                        s === null ? s = [M] : s.push(M), o++;
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
            if (De(i) < 1) {
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
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: xc.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (ss(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? ss.errors : s.concat(ss.errors), o = s.length)), e.runtime !== void 0) {
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
  return rs.errors = s, o === 0;
}
rs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ns(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Ns.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), rs(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? rs.errors : s.concat(rs.errors), o = s.length), Ns.errors = s, o === 0;
}
Ns.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let Jr;
async function Lc() {
  return Jr || (Jr = Dc()), Jr;
}
async function Dc() {
  const e = await Promise.all([
    fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v2.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/permissions-v1.json", { credentials: "same-origin" })
  ]);
  if (e.some((l) => !l.ok)) throw new Error("无法载入 Manifest 平台契约。");
  const [t, r, a] = await Promise.all(e.map((l) => l.json()));
  return {
    schemas: { 1: t, 2: r },
    validators: { 1: Cs, 2: Ns },
    permissionRegistry: a,
    permissionIds: new Set(a.permissions.map((l) => l.id)),
    sourceDeclarableIds: new Set(a.sourceDeclaration?.declarablePermissionIds || [])
  };
}
async function Rc(e) {
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
        ...Hc(e, n.message)
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
  const a = await Lc(), l = a.schemas[r], u = a.validators[r];
  u(t);
  const s = (u.errors || []).filter((n) => !Wc(r, n)).map((n) => ({
    ruleId: "WWM002",
    severity: "error",
    path: Vc(n.instancePath || n.params?.missingProperty || ""),
    message: n.message || n.keyword
  }));
  zc(t, r, a.permissionIds, a.sourceDeclarableIds, s), r === 2 && t.sdk?.apiVersion !== void 0 && t.sdk.apiVersion !== "1" && s.push({
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
function zc(e, t, r, a, l) {
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
    u.has(s) && l.push({ ruleId: "WWM007", severity: "error", path: c, message: `重复权限：${s}` }), u.add(s), Fc(s) ? l.push({ ruleId: "WWM008", severity: "error", path: c, message: `禁止声明超级或私有权限：${s}` }) : r.has(s) ? a.has(s) || l.push({ ruleId: "WWM008", severity: "error", path: c, message: `权限尚未开放 Source Manifest 声明：${s}` }) : l.push({ ruleId: "WWM006", severity: "error", path: c, message: `未知权限：${s}` });
  });
}
function Fc(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function Wc(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function Vc(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const r = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(r) ? `[${r}]` : `.${r}`;
  }).join("")}` : `$.${e}` : "$";
}
function Hc(e, t) {
  const r = /position\s+(\d+)/i.exec(t);
  if (!r) return { line: 1, column: 1 };
  const a = Math.min(Number(r[1]), e.length), l = e.slice(0, a).split(`
`);
  return { line: l.length, column: l.at(-1).length + 1 };
}
const Bc = {
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
function Uc() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(Bc, null, 2)}
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
const bi = 240;
function ce(e, t = {}) {
  const r = String(e ?? "");
  if (r.includes("\0")) throw Dt("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(r)) throw Dt("项目路径不能使用盘符。", e);
  const a = r.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!a) {
    if (t.allowRoot === !0) return "";
    throw Dt("项目路径不能为空。", e);
  }
  if (a.startsWith("/")) throw Dt("项目路径必须是相对路径。", e);
  if (a.length > bi)
    throw Dt(`项目路径不能超过 ${bi} 个字符。`, e);
  const l = a.split("/");
  if (l.some((u) => !u || u === "." || u === ".."))
    throw Dt("项目路径包含不安全的路径段。", e);
  return l.join("/");
}
function Ls(e) {
  const t = ce(e), r = t.lastIndexOf("/");
  return r < 0 ? "" : t.slice(0, r);
}
function cn(e) {
  const t = ce(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function Kc(e, t) {
  const r = ce(e, { allowRoot: !0 }), a = String(t ?? "");
  if (!a || a.includes("/") || a.includes("\\"))
    throw Dt("文件或目录名称必须是单个安全路径段。", t);
  return ce(r ? `${r}/${a}` : a);
}
function Dt(e, t) {
  const r = new TypeError(e);
  return r.code = "invalid-project-path", r.value = t, r;
}
const Ro = 1;
class Zc {
  constructor(t, r) {
    this.storage = t, this.key = r, this.onversionchange = null;
  }
  transaction(t, r = "readonly") {
    return new Jc(this, t, r);
  }
  close() {
  }
  readDocument() {
    const t = this.storage.getItem(this.key);
    if (!t) return Xc();
    const r = JSON.parse(t);
    if (r?.schemaVersion !== Ro || !Array.isArray(r.projects) || !Array.isArray(r.files))
      throw new DOMException("Developer Studio fallback storage is invalid.", "DataError");
    return structuredClone(r);
  }
  writeDocument(t) {
    this.storage.setItem(this.key, JSON.stringify(t));
  }
}
class Jc {
  constructor(t, r, a) {
    this.database = t, this.storeNames = new Set(Array.isArray(r) ? r : [r]), this.mode = a, this.document = t.readDocument(), this.error = null, this.oncomplete = null, this.onerror = null, this.onabort = null, this.pending = 0, this.failed = !1, this.completionTimer = 0;
  }
  objectStore(t) {
    if (!this.storeNames.has(t)) throw new DOMException(`Store ${t} is not in this transaction.`, "NotFoundError");
    return new Gc(this, t);
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
class Gc {
  constructor(t, r) {
    this.transaction = t, this.name = r;
  }
  get(t) {
    return this.transaction.request(() => Bt(this.records().find((r) => Ys(this.name, r, t))));
  }
  getAll() {
    return this.transaction.request(() => this.records().map(Bt));
  }
  add(t) {
    return this.transaction.request(() => {
      if (this.requireWritable(), this.records().some((r) => Ys(this.name, r, Gr(this.name, t))))
        throw new DOMException("The key already exists.", "ConstraintError");
      return this.records().push(Bt(t)), Gr(this.name, t);
    });
  }
  put(t) {
    return this.transaction.request(() => {
      this.requireWritable();
      const r = Gr(this.name, t), a = this.records().findIndex((l) => Ys(this.name, l, r));
      return a >= 0 ? this.records()[a] = Bt(t) : this.records().push(Bt(t)), r;
    });
  }
  delete(t) {
    return this.transaction.request(() => {
      this.requireWritable();
      const r = this.records().findIndex((a) => Ys(this.name, a, t));
      r >= 0 && this.records().splice(r, 1);
    });
  }
  index(t) {
    if (this.name !== "files" || t !== "projectId")
      throw new DOMException(`Index ${t} does not exist.`, "NotFoundError");
    return {
      getAll: (r) => this.transaction.request(() => this.records().filter((a) => a.projectId === r).map(Bt))
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
function Xc() {
  return { schemaVersion: Ro, projects: [], files: [] };
}
function Gr(e, t) {
  return e === "projects" ? t.uuid : [t.projectId, t.path];
}
function Ys(e, t, r) {
  return e === "projects" ? t.uuid === r : Array.isArray(r) && t.projectId === r[0] && t.path === r[1];
}
function Bt(e) {
  return e === void 0 ? void 0 : structuredClone(e);
}
const Yc = "webwindows-developer-studio-v1", Pi = 1, Qc = 1, ed = "localstorage-fallback-v1", ie = "projects", ue = "files", Nt = "projectId", td = Object.freeze({
  open: "打开",
  "open-blocked": "升级",
  "create-project": "写入",
  reset: "重建",
  "reset-blocked": "重建"
});
class sd extends Error {
  constructor(t, r, a) {
    const l = String(r?.name || "StorageError"), u = String(r?.message || a || "未知错误"), s = td[t] || "访问";
    super(a || `Developer Studio 项目存储${s}失败（${l}: ${u}）。`), this.name = "StudioStorageError", this.code = "studio-storage-failure", this.stage = t, this.causeName = l, this.causeMessage = u, this.recoverable = t !== "open-blocked" && t !== "reset-blocked", this.cause = r;
  }
}
function Nn(e) {
  return e?.code === "studio-storage-failure";
}
class rd {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.localStorage = t.localStorage || globalThis.localStorage, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || Yc, this.fallbackStorageKey = `${this.databaseName}:${ed}`, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, this.storageMode = "indexeddb", this.storageModeCause = null, !this.indexedDB && !this.localStorage)
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
    return (await Te(
      t.transaction(ie, "readonly").objectStore(ie).getAll()
    )).sort((a, l) => String(l.updatedAt).localeCompare(String(a.updatedAt))).map(lt);
  }
  async createProject(t = {}) {
    return this.runStorageOperation("create-project", () => this.createProjectAttempt(t), { retry: !0 });
  }
  async createProjectAttempt(t = {}) {
    const r = id(this.crypto), a = this.now(), l = {
      uuid: r,
      displayName: $i(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: Qc,
      storageVersion: Pi,
      createdAt: a,
      updatedAt: a,
      editorState: wr(t.editorState)
    }, u = nd(t.files || [], r, a), o = (await this.open()).transaction([ie, ue], "readwrite");
    o.objectStore(ie).add(l);
    const c = o.objectStore(ue);
    return u.forEach((n) => c.add(n)), await kt(o), lt(l);
  }
  async getProject(t) {
    const r = await this.open(), a = await Te(
      r.transaction(ie, "readonly").objectStore(ie).get(t)
    );
    if (!a) throw ye("project-not-found", "找不到项目。");
    return lt(a);
  }
  async renameProject(t, r) {
    return this.updateProject(t, (a) => {
      a.displayName = $i(r);
    });
  }
  async saveEditorState(t, r) {
    return this.updateProject(t, (a) => {
      a.editorState = wr(r);
    });
  }
  async deleteProject(t) {
    const a = (await this.open()).transaction([ie, ue], "readwrite"), l = a.objectStore(ie);
    if (!await Te(l.get(t))) throw ye("project-not-found", "找不到项目。");
    const s = a.objectStore(ue);
    (await Te(s.index(Nt).getAll(t))).forEach((c) => s.delete([t, c.path])), l.delete(t), await kt(a);
  }
  async listEntries(t) {
    await this.getProject(t);
    const r = await this.open();
    return (await Te(
      r.transaction(ue, "readonly").objectStore(ue).index(Nt).getAll(t)
    )).sort(Ii).map(lt);
  }
  async readProjectState(t) {
    const a = (await this.open()).transaction([ie, ue], "readonly"), l = await Te(a.objectStore(ie).get(t));
    if (!l) throw ye("project-not-found", "找不到项目。");
    const u = await Te(
      a.objectStore(ue).index(Nt).getAll(t)
    );
    return await kt(a), {
      project: lt(l),
      entries: u.sort(Ii).map(lt)
    };
  }
  async readTextFile(t, r) {
    const a = await this.getEntry(t, r);
    if (a.kind !== "file") throw ye("not-a-file", "目标不是文本文件。");
    return a.content;
  }
  async writeTextFile(t, r, a) {
    const l = ce(r), s = (await this.open()).transaction([ie, ue], "readwrite"), o = await Qs(s, t), c = s.objectStore(ue), n = await Te(c.get([t, l]));
    if (!n) throw ye("file-not-found", "找不到文件。");
    if (n.kind !== "file") throw ye("not-a-file", "目标不是文本文件。");
    const i = this.now();
    c.put({ ...n, content: String(a), updatedAt: i }), o.updatedAt = i, s.objectStore(ie).put(o), await kt(s);
  }
  async createFile(t, r, a = "") {
    return this.createEntry(t, r, "file", String(a));
  }
  async createDirectory(t, r) {
    return this.createEntry(t, r, "directory", void 0);
  }
  async renameEntry(t, r, a) {
    const l = ce(r), u = ce(a);
    if (l === u) return this.getEntry(t, l);
    if (u.startsWith(`${l}/`))
      throw ye("invalid-project-path", "目录不能移动到自身内部。");
    const o = (await this.open()).transaction([ie, ue], "readwrite"), c = await Qs(o, t), n = o.objectStore(ue), i = await Te(n.index(Nt).getAll(t)), d = i.filter((g) => g.path === l || g.path.startsWith(`${l}/`));
    if (!d.length) throw ye("entry-not-found", "找不到文件或目录。");
    await ki(i, u);
    const h = new Set(d.map((g) => g.path)), p = new Set(d.map((g) => g.path === l ? u : `${u}${g.path.slice(l.length)}`));
    if (i.some((g) => !h.has(g.path) && p.has(g.path)))
      throw ye("entry-exists", "目标路径已经存在。");
    const f = this.now();
    return d.forEach((g) => {
      const k = g.path === l ? u : `${u}${g.path.slice(l.length)}`;
      n.delete([t, g.path]), n.add({ ...g, path: k, updatedAt: f });
    }), c.editorState = od(c.editorState, l, u), c.updatedAt = f, o.objectStore(ie).put(c), await kt(o), this.getEntry(t, u);
  }
  async deleteEntry(t, r) {
    const a = ce(r), u = (await this.open()).transaction([ie, ue], "readwrite"), s = await Qs(u, t), o = u.objectStore(ue), n = (await Te(o.index(Nt).getAll(t))).filter((d) => d.path === a || d.path.startsWith(`${a}/`));
    if (!n.length) throw ye("entry-not-found", "找不到文件或目录。");
    n.forEach((d) => o.delete([t, d.path]));
    const i = this.now();
    s.editorState = ad(s.editorState, a), s.updatedAt = i, u.objectStore(ie).put(s), await kt(u);
  }
  async getEntry(t, r) {
    const a = ce(r);
    await this.getProject(t);
    const l = await this.open(), u = await Te(
      l.transaction(ue, "readonly").objectStore(ue).get([t, a])
    );
    if (!u) throw ye("entry-not-found", "找不到文件或目录。");
    return lt(u);
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
        throw ut("reset", t, "Developer Studio 浏览器降级存储重建失败。");
      }
    await new Promise((t, r) => {
      const a = this.indexedDB.deleteDatabase(this.databaseName);
      a.onsuccess = () => t(), a.onerror = () => r(ut("reset", a.error)), a.onblocked = () => r(ut(
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
      return this.openFallback(ut("open", null, "当前浏览器不支持 IndexedDB。"));
    this.databasePromise = new Promise((t, r) => {
      const a = this.indexedDB.open(this.databaseName, Pi);
      a.onupgradeneeded = () => {
        const l = a.result;
        l.objectStoreNames.contains(ie) || l.createObjectStore(ie, { keyPath: "uuid" }), l.objectStoreNames.contains(ue) || l.createObjectStore(ue, { keyPath: ["projectId", "path"] }).createIndex(Nt, "projectId", { unique: !1 });
      }, a.onsuccess = () => t(a.result), a.onerror = () => r(ut("open", a.error)), a.onblocked = () => r(ut(
        "open-blocked",
        null,
        "Developer Studio 项目存储升级被其他窗口阻止。请关闭其他 Developer Studio 窗口后重试。"
      ));
    });
    try {
      const t = await this.databasePromise;
      return t.onversionchange = () => t.close(), t;
    } catch (t) {
      if (this.databasePromise = null, ud(t, this.localStorage)) return this.openFallback(t);
      throw t;
    }
  }
  async openFallback(t) {
    if (!this.localStorage) throw t;
    try {
      const r = this.storageMode !== "localstorage-fallback", a = new Zc(this.localStorage, this.fallbackStorageKey);
      return a.readDocument(), this.storageMode = "localstorage-fallback", this.storageModeCause = t, this.databasePromise = Promise.resolve(a), r && console.warn("[DeveloperStudio] IndexedDB 不可用，启用受限的 localStorage 项目工作区。", t), a;
    } catch (r) {
      throw this.databasePromise = null, ut("open", r, "Developer Studio 的 IndexedDB 与浏览器降级存储均不可用。");
    }
  }
  async runStorageOperation(t, r, a = {}) {
    const l = a.retry ? 2 : 1;
    for (let u = 0; u < l; u += 1)
      try {
        return await r();
      } catch (s) {
        if (!zo(s)) throw s;
        const o = Nn(s) ? s : ut(t, s);
        if (u + 1 >= l || !ld(o)) throw o;
        await this.close();
      }
    throw ut(t, null);
  }
  async updateProject(t, r) {
    const l = (await this.open()).transaction(ie, "readwrite"), u = l.objectStore(ie), s = await Te(u.get(t));
    if (!s) throw ye("project-not-found", "找不到项目。");
    return r(s), s.updatedAt = this.now(), u.put(s), await kt(l), lt(s);
  }
  async createEntry(t, r, a, l) {
    const u = ce(r), o = (await this.open()).transaction([ie, ue], "readwrite"), c = await Qs(o, t), n = o.objectStore(ue), i = await Te(n.index(Nt).getAll(t));
    if (i.some((p) => p.path === u))
      throw ye("entry-exists", "目标路径已经存在。");
    await ki(i, u);
    const d = this.now(), h = {
      projectId: t,
      path: u,
      kind: a,
      ...a === "file" ? { content: String(l ?? "") } : {},
      createdAt: d,
      updatedAt: d
    };
    return n.add(h), c.updatedAt = d, o.objectStore(ie).put(c), await kt(o), lt(h);
  }
}
function nd(e, t, r) {
  const a = /* @__PURE__ */ new Set(), l = e.map((u) => {
    const s = ce(u.path);
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
    const s = Ls(u.path);
    if (!s) return;
    const o = l.find((c) => c.path === s);
    if (!o || o.kind !== "directory")
      throw ye("parent-directory-not-found", `模板缺少父目录：${s}`);
  }), l;
}
async function Qs(e, t) {
  const r = await Te(e.objectStore(ie).get(t));
  if (!r) throw ye("project-not-found", "找不到项目。");
  return r;
}
async function ki(e, t) {
  const r = Ls(t);
  if (!r) return;
  const a = e.find((l) => l.path === r);
  if (!a || a.kind !== "directory")
    throw ye("parent-directory-not-found", "父目录不存在。");
}
function id(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const r = [...t].map((a) => a.toString(16).padStart(2, "0"));
  return `${r.slice(0, 4).join("")}-${r.slice(4, 6).join("")}-${r.slice(6, 8).join("")}-${r.slice(8, 10).join("")}-${r.slice(10).join("")}`;
}
function $i(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw ye("invalid-project-name", "项目名称不能为空。");
  return t;
}
function wr(e) {
  const t = e && typeof e == "object" ? e : {}, r = (u) => [...new Set((Array.isArray(u) ? u : []).map((s) => {
    try {
      return ce(s);
    } catch {
      return null;
    }
  }).filter(Boolean))], a = r(t.openFiles), l = t.activeFile ? ce(t.activeFile) : a[0] || null;
  return {
    openFiles: a,
    activeFile: l,
    recentFiles: r(t.recentFiles).slice(0, 20)
  };
}
function od(e, t, r) {
  const a = (l) => l === t || l?.startsWith(`${t}/`) ? `${r}${l.slice(t.length)}` : l;
  return wr({
    openFiles: e?.openFiles?.map(a),
    activeFile: a(e?.activeFile),
    recentFiles: e?.recentFiles?.map(a)
  });
}
function ad(e, t) {
  const r = (l) => l !== t && !l.startsWith(`${t}/`), a = (e?.openFiles || []).filter(r);
  return wr({
    openFiles: a,
    activeFile: e?.activeFile && r(e.activeFile) ? e.activeFile : a[0] || null,
    recentFiles: (e?.recentFiles || []).filter(r)
  });
}
function Ii(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function lt(e) {
  return structuredClone(e);
}
function Te(e) {
  return new Promise((t, r) => {
    e.onsuccess = () => t(e.result), e.onerror = () => r(e.error || new Error("IndexedDB request failed."));
  });
}
function kt(e) {
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
function ut(e, t, r) {
  return new sd(e, t, r);
}
function zo(e) {
  return Nn(e) ? !0 : ["UnknownError", "InvalidStateError", "AbortError", "QuotaExceededError", "SecurityError"].includes(String(e?.name || "")) || /internal error/i.test(String(e?.message || ""));
}
function ld(e) {
  return ["UnknownError", "InvalidStateError", "AbortError"].includes(String(e?.causeName || e?.name || "")) || /internal error/i.test(String(e?.causeMessage || e?.message || ""));
}
function ud(e, t) {
  if (!t || !zo(e)) return !1;
  const r = String(e?.causeName || e?.name || "");
  return ["UnknownError", "InvalidStateError", "SecurityError"].includes(r) || /internal error/i.test(String(e?.causeMessage || e?.message || ""));
}
function ye(e, t) {
  const r = new Error(t);
  return r.code = e, r;
}
function qi(e, t) {
  return Kc(e, t);
}
function cd(e) {
  const t = [], r = /* @__PURE__ */ new Map();
  e.forEach((l) => r.set(l.path, {
    ...l,
    name: cn(l.path),
    children: []
  })), r.forEach((l) => {
    const u = Ls(l.path);
    u ? r.get(u)?.children.push(l) : t.push(l);
  });
  const a = (l) => l.sort((u, s) => u.kind !== s.kind ? u.kind === "directory" ? -1 : 1 : u.name.localeCompare(s.name)).forEach((u) => a(u.children));
  return a(t), t;
}
function dd(e) {
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
const Fo = "webwindows-project-snapshot-v1";
async function pd(e, t, r = {}) {
  if (!e || typeof e.readProjectState != "function")
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  const a = await e.readProjectState(t), l = a.entries.filter((n) => n.kind === "file").map((n) => Object.freeze({
    path: ce(n.path),
    content: String(n.content ?? ""),
    byteLength: ns(n.content ?? "").byteLength
  })).sort((n, i) => md(n.path, i.path)), u = /* @__PURE__ */ new Set();
  for (const n of l) {
    if (u.has(n.path)) throw new Error(`Snapshot contains duplicate path: ${n.path}`);
    u.add(n.path);
  }
  const s = l.reduce((n, i) => n + i.byteLength, 0), o = await fd(hd(a.project.uuid, l)), c = {
    contract: Fo,
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
function vr(e, t) {
  const r = ce(t);
  return e.files.find((a) => a.path === r) || null;
}
async function fd(e) {
  const t = globalThis.crypto;
  if (!t?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const r = await t.subtle.digest("SHA-256", e);
  return [...new Uint8Array(r)].map((a) => a.toString(16).padStart(2, "0")).join("");
}
function hd(e, t) {
  const r = [ns(`${Fo}\0${e}\0`)];
  for (const s of t) {
    const o = ns(s.path), c = ns(s.content);
    r.push(Si(o.byteLength), o, Si(c.byteLength), c);
  }
  const a = r.reduce((s, o) => s + o.byteLength, 0), l = new Uint8Array(a);
  let u = 0;
  for (const s of r)
    l.set(s, u), u += s.byteLength;
  return l;
}
function Si(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e, !1), t;
}
function ns(e) {
  return new TextEncoder().encode(String(e));
}
function md(e, t) {
  const r = ns(e), a = ns(t), l = Math.min(r.length, a.length);
  for (let u = 0; u < l; u += 1)
    if (r[u] !== a[u]) return r[u] - a[u];
  return r.length - a.length;
}
let Xr;
async function bs() {
  return Xr || (Xr = yd()), Xr;
}
async function yd() {
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
    gd("/data/sdk/webwindows-public-api-v1.d.ts")
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
async function gd(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.text();
}
function wd(e) {
  if (typeof e != "string" || e.charCodeAt(0) === 65279) throw Ie("JSON BOM is forbidden");
  let t = 0;
  const r = () => {
    for (; /[\u0009\u000a\u000d\u0020]/.test(e[t] || ""); ) t += 1;
  }, a = () => {
    if (e[t++] !== '"') throw Ie("Expected JSON string");
    let u = "";
    for (; t < e.length; ) {
      const s = e[t++];
      if (s === '"')
        return vd(u), u;
      if (s.charCodeAt(0) < 32) throw Ie("Control character in JSON string");
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
      if (o !== "u") throw Ie("Invalid JSON escape");
      const n = e.slice(t, t + 4);
      if (!/^[0-9a-fA-F]{4}$/.test(n)) throw Ie("Invalid JSON Unicode escape");
      u += String.fromCharCode(Number.parseInt(n, 16)), t += 4;
    }
    throw Ie("Unterminated JSON string");
  }, l = (u = 0) => {
    if (u > 100) throw Ie("JSON nesting limit exceeded");
    if (r(), e[t] === "{") {
      t += 1, r();
      const o = /* @__PURE__ */ new Set();
      if (e[t] === "}") {
        t += 1;
        return;
      }
      for (; ; ) {
        const c = a();
        if (o.has(c)) throw Ie(`Duplicate JSON property: ${c}`);
        if (o.add(c), r(), e[t++] !== ":") throw Ie("Expected JSON colon");
        if (l(u + 1), r(), e[t] === "}") {
          t += 1;
          return;
        }
        if (e[t++] !== ",") throw Ie("Expected JSON comma");
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
        if (e[t++] !== ",") throw Ie("Expected JSON comma");
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
    if (!s) throw Ie("Invalid JSON value");
    if (!Number.isFinite(Number(s[0]))) throw Ie("Non-finite JSON number");
    t += s[0].length;
  };
  if (r(), l(), r(), t !== e.length) throw Ie("Trailing JSON data is forbidden");
}
function vd(e) {
  for (let t = 0; t < e.length; t += 1) {
    const r = e.charCodeAt(t);
    if (r >= 55296 && r <= 56319) {
      const a = e.charCodeAt(t + 1);
      if (!(a >= 56320 && a <= 57343)) throw Ie("Unpaired JSON surrogate");
      t += 1;
    } else if (r >= 56320 && r <= 57343) throw Ie("Unpaired JSON surrogate");
  }
}
function Ie(e) {
  const t = new SyntaxError(e);
  return t.code = "ambiguous-json", t;
}
const bd = "webwindows-studio-validation-report-v1";
async function dn(e, t = {}) {
  const r = t.contracts || await bs(), a = Od(r.ruleCatalog), l = [], u = (h, p = {}) => l.push(Td(a, h, p));
  Pd(r, u), kd(e, r.packagePolicy, u);
  const s = e.files.find((h) => h.path === "manifest.json");
  let o = null;
  if (!s)
    u("WWP001", { path: "manifest.json", message: "ZIP root 必须包含 manifest.json。" });
  else
    try {
      wd(s.content), o = JSON.parse(s.content);
    } catch (h) {
      u("WWM001", {
        path: "manifest.json",
        location: Dd(s.content, h.message),
        message: h.message
      });
    }
  o && ($d(o, r, u), xd(e, o, r.packagePolicy, u)), Ad(e, o, r, u);
  const c = [...new Map(l.map((h) => [Wd(h), h])).values()].sort(Fd), n = c.filter((h) => h.severity === "error").length, i = c.filter((h) => h.severity === "warning").length, d = typeof o?.entry == "string" ? o.entry : null;
  return {
    contract: bd,
    schemaVersion: 1,
    validatorVersion: r.ruleCatalog.validatorVersion,
    snapshotId: e.snapshotId,
    projectUuid: e.projectUuid,
    manifestIdentity: zd(o),
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
function Pd(e, t) {
  const r = e.runtimeCompatibility.packageRuntime;
  (r?.status !== "supported" || r?.model !== e.packagePolicy.runtimeModel) && t("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
}
function kd(e, t, r) {
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
      const s = ce(l.path);
      if (s !== l.path || s.length > t.limits.maxPathCharacters)
        throw new Error("not canonical");
    } catch {
      r("WWP002", { path: l.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const u = Ln(l.path);
    a.has(u) || r("WWP005", {
      path: l.path,
      message: `Package Runtime 不允许文件类型 ${u || "(none)"}。`,
      metadata: { extension: u }
    });
  }
}
function $d(e, t, r) {
  const a = At(e);
  if (a == null) {
    r("WWM005", {
      path: "manifest.json$.manifestVersion",
      message: "不支持的 Manifest 版本；legacy v1 省略 manifestVersion，v2 显式使用数字 2。"
    });
    return;
  }
  const l = t.manifestSchemas?.[a] || t.manifestSchema, u = a === 2 ? Ns : Cs;
  if (!u(e))
    for (const c of u.errors || [])
      Sd(a, c) || r("WWM002", {
        path: `manifest.json${Rd(c.instancePath, c.params?.missingProperty)}`,
        message: c.message || c.keyword,
        metadata: { keyword: c.keyword, schemaPath: c.schemaPath }
      });
  Id(e, a, t.permissionRegistry, r), a === 2 && e.sdk?.apiVersion !== void 0 && e.sdk.apiVersion !== "1" && r("WWM009", {
    path: "manifest.json$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。",
    metadata: { actual: e.sdk.apiVersion }
  });
  const s = l.$defs?.sourceManifest?.properties || {};
  for (const [c, n] of Object.entries(s)) {
    if (!Object.prototype.hasOwnProperty.call(e, c)) continue;
    const i = Cd(l, n), d = `${n.description || ""} ${i.description || ""}`;
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
function Id(e, t, r, a) {
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
    s.has(o) && a("WWM007", { path: n, message: `重复权限：${o}`, metadata: { permission: o } }), s.add(o), qd(o) ? a("WWM008", { path: n, message: `禁止声明超级或私有权限：${o}`, metadata: { permission: o } }) : l.has(o) ? u.has(o) || a("WWM008", { path: n, message: `权限尚未开放 Source Manifest 声明：${o}`, metadata: { permission: o } }) : a("WWM006", { path: n, message: `未知权限：${o}`, metadata: { permission: o } });
  });
}
function qd(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function Sd(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function xd(e, t, r, a) {
  if (typeof t.entry != "string") return;
  let l;
  try {
    l = ce(t.entry);
  } catch {
    a("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  (!r.entryExtensions.includes(Ln(l)) || !vr(e, l)) && a("WWP006", {
    path: "manifest.json$.entry",
    message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
    metadata: { entry: l }
  });
}
function Ad(e, t, r, a) {
  const l = Md(r.publicApiText), u = new Set(e.files.map((s) => s.path));
  for (const s of e.files) {
    const o = Ln(s.path);
    o === ".js" && _d(s, l, t, a), (o === ".html" || o === ".htm") && jd(s, u, a), o === ".css" && Ed(s, a);
  }
  (r.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported" || r.runtimeCompatibility.packageRuntime.execution.network !== "none") && a("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
}
function _d(e, t, r, a) {
  const l = Ld(e.content);
  ft(l, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (s, o) => {
    a("WWS001", { path: e.path, location: Ze(e.content, o), message: "Package Runtime 仅支持 classic JavaScript。" });
  }), ft(l, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (s, o) => {
    a("WWS003", { path: e.path, location: Ze(e.content, o), message: "功能代码不能引用私有 Native API。" });
  }), ft(l, /\bparent\s*\.\s*WebWindows\b/g, (s, o) => {
    a("WWS004", { path: e.path, location: Ze(e.content, o), message: "功能代码不能访问 parent.WebWindows。" });
  }), ft(l, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (s, o) => {
    const c = s[1];
    t.has(c) || a("WWS004", {
      path: e.path,
      location: Ze(e.content, o),
      message: `WebWindows.${c} 不属于 Public API v1。`,
      metadata: { namespace: c }
    });
  }), ft(l, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (s, o) => {
    a("WWS005", {
      path: e.path,
      location: Ze(e.content, o),
      message: `${s[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
  const u = /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*device\s*\.\s*battery\s*\.\s*(?:getState|refresh)\s*\(/g.exec(l);
  u && (At(r) !== 2 || !r.permissions?.includes("device.battery-status.read")) && a("WWM010", {
    path: e.path,
    location: Ze(e.content, u.index),
    message: "Battery Broker API 需要 Manifest v2 声明 device.battery-status.read；静态提示不会自动授予权限。",
    metadata: { requiredPermission: "device.battery-status.read" }
  });
}
function jd(e, t, r) {
  ft(e.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (a, l) => {
    r("WWS001", { path: e.path, location: Ze(e.content, l), message: "Package Runtime 不支持 script type=module。" });
  }), ft(e.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (a, l) => {
    const u = a[2], s = Nd(e.path, u);
    (!s || !t.has(s)) && r("WWS002", {
      path: e.path,
      location: Ze(e.content, l),
      message: `脚本或样式依赖必须包含在功能包内：${u}`,
      metadata: { reference: u }
    });
  }), ft(e.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (a, l) => {
    r("WWS002", {
      path: e.path,
      location: Ze(e.content, l),
      message: `外部资源在无网络 Runtime 中不可用：${a[1]}`,
      metadata: { reference: a[1] }
    });
  });
}
function Ed(e, t) {
  ft(e.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (r, a) => {
    t("WWS002", {
      path: e.path,
      location: Ze(e.content, a),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${r[1]}`,
      metadata: { reference: r[1] }
    });
  });
}
function Od(e) {
  return new Map(e.rules.map((t) => [t.ruleId, t]));
}
function Td(e, t, r) {
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
function Md(e) {
  const t = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(e)?.[1] || "";
  return new Set([...t.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((r) => r[1]));
}
function Cd(e, t) {
  return t?.$ref?.startsWith("#/$defs/") ? e.$defs?.[t.$ref.slice(8)] || t : t || {};
}
function Nd(e, t) {
  const r = String(t || "").split(/[?#]/, 1)[0];
  if (!r || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(r)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of r.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  return a.join("/");
}
function Ld(e) {
  return e.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (t) => t.replace(/[^\n]/g, " ")
  );
}
function ft(e, t, r) {
  for (const a of e.matchAll(t)) r(a, a.index || 0);
}
function Ze(e, t) {
  const r = e.slice(0, t).split(`
`);
  return { line: r.length, column: r.at(-1).length + 1 };
}
function Dd(e, t) {
  const r = /position\s+(\d+)/i.exec(t);
  return Ze(e, r ? Number(r[1]) : 0);
}
function Rd(e, t) {
  return `$${(e || (t ? `/${t}` : "")).split("/").slice(1).map((a) => /^\d+$/.test(a) ? `[${a}]` : `.${a.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}
function zd(e) {
  return !e || typeof e.id != "string" || typeof e.version != "string" ? null : {
    id: e.id,
    version: e.version,
    name: typeof e.name == "string" ? e.name : null,
    manifestVersion: At(e),
    sdkApiVersion: typeof e.sdk?.apiVersion == "string" ? e.sdk.apiVersion : null
  };
}
function Ln(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function Fd(e, t) {
  return e.ruleId.localeCompare(t.ruleId) || String(e.path || "").localeCompare(String(t.path || "")) || (e.location?.line || 0) - (t.location?.line || 0) || e.message.localeCompare(t.message);
}
function Wd(e) {
  return [
    e.ruleId,
    e.severity,
    e.path || "",
    e.location?.line || 0,
    e.location?.column || 0,
    e.message
  ].join("\0");
}
const er = "webwindows-studio-preview-control-v1", Vd = "webwindows-studio-preview-console-v1", Hd = "webwindows-studio-preview-console-init-v1", Bd = "webwindows-studio-preview-sdk-init-v1", Ud = "webwindows-studio-preview-session-v1", Kd = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'", Zd = 30 * 1024 * 1024;
function Ds(e = "preview") {
  const t = globalThis.crypto;
  if (!t?.getRandomValues) throw new Error("Web Crypto is required for Preview sessions.");
  const r = new Uint8Array(24);
  t.getRandomValues(r);
  const a = [...r].map((l) => l.toString(16).padStart(2, "0")).join("");
  return `${e}-${a}`;
}
function Wo(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class Jd {
  constructor({ onConsole: t, onState: r, onBroker: a } = {}) {
    this.onConsole = t || (() => {
    }), this.onState = r || (() => {
    }), this.onBroker = a || null, this.port = null, this.hostNonce = null, this.requests = /* @__PURE__ */ new Map();
  }
  async connect(t) {
    if (this.disconnect(), !t?.contentWindow) throw new Error("Developer Preview Host 尚未加载。");
    this.hostNonce = Ds("host");
    const r = new MessageChannel();
    this.port = r.port1, this.port.onmessage = (a) => this.#n(a.data), this.port.start(), t.contentWindow.postMessage({
      protocol: er,
      version: 1,
      type: "host.connect",
      hostNonce: this.hostNonce
    }, location.origin, [r.port2]), await this.#t("host.ping", {}, 5e3);
  }
  async start(t, r, a = { facadeEnabled: !1 }) {
    const l = new TextEncoder().encode(r).byteLength;
    if (l > Zd) throw new Error("Preview document 超过 30 MB 上限。");
    return this.#t("preview.start", {
      session: Gd(t),
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
    const l = Ds("request");
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
        protocol: er,
        version: 1,
        type: t,
        hostNonce: this.hostNonce,
        requestId: l,
        payload: r
      });
    });
  }
  #n(t) {
    if (!Wo(t) || t.protocol !== er || t.version !== 1 || t.hostNonce !== this.hostNonce || typeof t.type != "string") return;
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
          protocol: er,
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
function Gd(e) {
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
function Xd({ sessionId: e, snapshotId: t, token: r }) {
  const a = JSON.stringify({
    initProtocol: Hd,
    protocol: Vd,
    sessionId: e,
    snapshotId: t,
    token: r
  }).replace(/</g, "\\u003c");
  return `;(${Yd.toString()})(${a});`;
}
function Yd(e) {
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
function Qd(e, t, r) {
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
  return `;(${ep.toString()})(${a});`;
}
function ep(e) {
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
        const { params: M, ...C } = g;
        i({ ...C, type: "cancel" }), $(c(e.clientErrors?.["request-timeout"]));
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
function tp({ sessionId: e, snapshotId: t }, r) {
  return Qd({ sessionId: e, snapshotId: t }, r, Bd);
}
const pn = Object.freeze({
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8",
  ".svg": "image/svg+xml;charset=utf-8"
}), sp = /* @__PURE__ */ new Set([".html", ".htm", ...Object.keys(pn)]);
function rp(e, t, r = {}) {
  const a = vr(e, "manifest.json");
  if (!a) throw new Error("Preview Snapshot 缺少 manifest.json。");
  const l = JSON.parse(a.content), u = ce(l.entry), s = vr(e, u);
  if (!s || ![".html", ".htm"].includes(gs(u)))
    throw new Error("Preview Snapshot 的 HTML entry 不存在。");
  const c = (r.domParser || new DOMParser()).parseFromString(s.content, "text/html");
  if (c.querySelector('script[type="module"]')) throw new Error("Developer Preview 不支持 ES Module。");
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const f of e.files) {
    const g = gs(f.path);
    sp.has(g) && Object.prototype.hasOwnProperty.call(pn, g) && ![".css", ".js"].includes(g) && n.set(f.path, np(f.content, pn[g]));
  }
  for (const f of e.files) {
    const g = gs(f.path);
    g === ".js" && i.set(f.path, f.content), g === ".css" && i.set(f.path, xi(f.content, f.path, n));
  }
  const d = c.createElement("meta");
  d.httpEquiv = "Content-Security-Policy", d.content = Kd, c.head.prepend(d);
  const h = c.createElement("script");
  h.setAttribute("data-webwindows-preview-bootstrap", "v1"), h.textContent = Xd(t), c.head.insertBefore(h, d.nextSibling);
  const p = tp(t, r.sdkLaunch);
  if (p) {
    const f = c.createElement("script");
    f.setAttribute("data-webwindows-preview-sdk", "v1"), f.textContent = p, c.head.insertBefore(f, h.nextSibling);
  }
  return c.querySelectorAll("script[src]").forEach((f) => {
    const g = f.getAttribute("src"), k = Ps(u, g);
    if (!k || gs(k) !== ".js" || !i.has(k))
      throw new Error(`Preview 脚本必须来自 Snapshot：${g}`);
    f.removeAttribute("src"), f.textContent = i.get(k);
  }), c.querySelectorAll('link[rel~="stylesheet"][href]').forEach((f) => {
    const g = f.getAttribute("href"), k = Ps(u, g);
    if (!k || gs(k) !== ".css" || !i.has(k))
      throw new Error(`Preview 样式必须来自 Snapshot：${g}`);
    const $ = c.createElement("style");
    $.textContent = i.get(k), f.replaceWith($);
  }), c.querySelectorAll("style").forEach((f) => {
    f.textContent = xi(f.textContent, u, n);
  }), c.querySelectorAll("[src],[href],[poster]").forEach((f) => {
    for (const g of ["src", "href", "poster"]) {
      if (!f.hasAttribute(g)) continue;
      const k = Ps(u, f.getAttribute(g));
      k && n.has(k) && f.setAttribute(g, n.get(k));
    }
  }), c.querySelectorAll("[srcset]").forEach((f) => {
    const g = f.getAttribute("srcset").split(",").map((k) => {
      const $ = k.trim().split(/\s+/), O = Ps(u, $[0]);
      return O && n.has(O) && ($[0] = n.get(O)), $.join(" ");
    });
    f.setAttribute("srcset", g.join(", "));
  }), `<!DOCTYPE html>
` + c.documentElement.outerHTML;
}
function Ps(e, t) {
  const r = String(t || "").split(/[?#]/, 1)[0];
  if (!r || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(r)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of r.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  try {
    return ce(a.join("/"));
  } catch {
    return null;
  }
}
function xi(e, t, r) {
  return String(e).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (a, l, u) => {
    const s = Ps(t, u);
    return s && r.has(s) ? `url("${r.get(s)}")` : a;
  });
}
function np(e, t) {
  const r = new TextEncoder().encode(String(e));
  let a = "";
  for (let l = 0; l < r.length; l += 32768)
    a += String.fromCharCode(...r.subarray(l, l + 32768));
  return `data:${t};base64,${btoa(a)}`;
}
function gs(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function ip(e) {
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
const Ai = br, op = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "request" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, params: { type: "object", maxProperties: 64 } } }, Cr = Object.prototype.hasOwnProperty, V = ip, de = new RegExp("^[A-Za-z0-9._:-]+$", "u"), Ws = new RegExp("^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$", "u");
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
    if (e.params === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "params" }, message: "must have required property 'params'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!Cr.call(op.properties, n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 3) {
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
  return is.errors = s, o === 0;
}
is.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const ap = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !0 }, result: {} } };
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
    if (e.ok === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ok" }, message: "must have required property 'ok'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.result === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "result" }, message: "must have required property 'result'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!Cr.call(ap.properties, n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 3) {
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
  return os.errors = s, o === 0;
}
os.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const lp = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !1 }, error: { $ref: "#/$defs/publicError" } } }, up = new RegExp("^[a-z]+(?:-[a-z]+)*$", "u");
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
    if (e.ok === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ok" }, message: "must have required property 'ok'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    if (e.error === void 0) {
      const n = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "error" }, message: "must have required property 'error'" };
      s === null ? s = [n] : s.push(n), o++;
    }
    for (const n in e)
      if (!Cr.call(lp.properties, n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 3) {
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
            if (V(i) > 64) {
              const d = { instancePath: t + "/error/code", schemaPath: "#/$defs/publicError/properties/code/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (!up.test(i)) {
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
            if (V(i) > 240) {
              const d = { instancePath: t + "/error/message", schemaPath: "#/$defs/publicError/properties/message/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (V(i) < 1) {
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
  return as.errors = s, o === 0;
}
as.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function zt(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = zt.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const n = o;
  let i = !1, d = null;
  const h = o;
  os(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? os.errors : s.concat(os.errors), o = s.length);
  var g = h === o;
  if (g) {
    i = !0, d = 0;
    var p = !0;
  }
  const f = o;
  as(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? as.errors : s.concat(as.errors), o = s.length);
  var g = f === o;
  if (g && i ? (i = !1, d = [d, 1]) : g && (i = !0, d = 1, p !== !0 && (p = !0)), i)
    o = n, s !== null && (n ? s.length = n : s = null);
  else {
    const k = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [k] : s.push(k), o++;
  }
  return zt.errors = s, c.props = p, o === 0;
}
zt.evaluated = { dynamicProps: !0, dynamicItems: !1 };
function ls(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ls.evaluated;
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 3) {
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
  return ls.errors = s, o === 0;
}
ls.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const _i = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "event" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, event: { enum: ["snapshot.update", "capability.change"] }, detail: { type: "object", maxProperties: 64 } } };
function us(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = us.evaluated;
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
      if (!Cr.call(_i.properties, n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(n)) {
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
        if (V(n) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (V(n) < 3) {
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
        const i = { instancePath: t + "/event", schemaPath: "#/properties/event/enum", keyword: "enum", params: { allowedValues: _i.properties.event.enum }, message: "must be equal to one of the allowed values" };
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
  return us.errors = s, o === 0;
}
us.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function br(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = br.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const n = o;
  let i = !1, d = null;
  const h = o;
  is(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? is.errors : s.concat(is.errors), o = s.length);
  var k = h === o;
  if (k) {
    i = !0, d = 0;
    var p = !0;
  }
  const f = o;
  if (!zt(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }))
    s = s === null ? zt.errors : s.concat(zt.errors), o = s.length;
  else
    var g = zt.evaluated.props;
  var k = f === o;
  if (k && i)
    i = !1, d = [d, 1];
  else {
    k && (i = !0, d = 1, p !== !0 && g !== void 0 && (g === !0 ? p = !0 : (p = p || {}, Object.assign(p, g))));
    const $ = o;
    ls(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ls.errors : s.concat(ls.errors), o = s.length);
    var k = $ === o;
    if (k && i)
      i = !1, d = [d, 2];
    else {
      k && (i = !0, d = 2, p !== !0 && (p = !0));
      const M = o;
      us(e, { instancePath: t, parentData: r, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? us.errors : s.concat(us.errors), o = s.length);
      var k = M === o;
      k && i ? (i = !1, d = [d, 3]) : k && (i = !0, d = 3, p !== !0 && (p = !0));
    }
  }
  if (i)
    o = n, s !== null && (n ? s.length = n : s = null);
  else {
    const $ = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [$] : s.push($), o++;
  }
  return br.errors = s, c.props = p, o === 0;
}
br.evaluated = { dynamicProps: !0, dynamicItems: !1 };
const cp = Pr;
function Pr(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Pr.evaluated;
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
  return Pr.errors = s, o === 0;
}
Pr.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const dp = kr, ws = { properties: { present: { type: ["boolean", "null"] }, level: { type: ["number", "null"] }, charging: { type: ["boolean", "null"] }, connected: { type: ["boolean", "null"] }, source: { enum: ["browser", "runtime", "unsupported"] } } };
function kr(e, { instancePath: t = "", parentData: r, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = kr.evaluated;
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
        const i = { instancePath: t + "/present", schemaPath: "#/$defs/sanitizedBatteryState/properties/present/type", keyword: "type", params: { type: ws.properties.present.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.level !== void 0) {
      let n = e.level;
      if (typeof n != "number" && n !== null) {
        const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/type", keyword: "type", params: { type: ws.properties.level.type }, message: "must be number,null" };
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
        const i = { instancePath: t + "/charging", schemaPath: "#/$defs/sanitizedBatteryState/properties/charging/type", keyword: "type", params: { type: ws.properties.charging.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.connected !== void 0) {
      let n = e.connected;
      if (typeof n != "boolean" && n !== null) {
        const i = { instancePath: t + "/connected", schemaPath: "#/$defs/sanitizedBatteryState/properties/connected/type", keyword: "type", params: { type: ws.properties.connected.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.source !== void 0) {
      let n = e.source;
      if (!(n === "browser" || n === "runtime" || n === "unsupported")) {
        const i = { instancePath: t + "/source", schemaPath: "#/$defs/sanitizedBatteryState/properties/source/enum", keyword: "enum", params: { allowedValues: ws.properties.source.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const n = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [n] : s.push(n), o++;
  }
  return kr.errors = s, o === 0;
}
kr.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function pp({
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
    d = fp(t?.consent, k), d === "denied" ? p = "grant-denied" : (h = (typeof u == "function" ? u() : u) === !0 ? "supported" : "unsupported", h === "unsupported" ? p = "capability-unsupported" : n !== "enabled" && (p = "method-disabled"));
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
function fp(e, t) {
  if (t === !1 || t?.allowed === !1 || t?.state === "denied") return "denied";
  if (e === "no-consent") return "not-required";
  const r = t?.state;
  return t?.allowed === !0 && [
    "session-grant",
    "persistent-user-grant",
    "resource-scoped-grant"
  ].includes(r) ? r : "denied";
}
function ji(e) {
  return e?.effective ? null : e?.publicErrorCode || "permission-denied";
}
function hp(e, t) {
  if (fn(e) > t.maximumResponseBytes) throw tr("response-too-large");
  if (!yp(e)) throw tr("internal-error");
  const r = {
    supported: e.supported,
    present: e.present,
    level: e.level,
    charging: e.charging,
    connected: e.connected,
    source: mp(e.supported, e.source)
  };
  if (!dp(r)) throw tr("internal-error");
  if (fn(r) > t.maximumResponseBytes) throw tr("response-too-large");
  return Object.freeze(r);
}
function fn(e) {
  try {
    return new TextEncoder().encode(JSON.stringify(e)).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
function tr(e) {
  const t = new Error(e);
  return t.code = e, t;
}
function mp(e, t) {
  return !e || t === "unsupported" ? "unsupported" : t === "battery-status-api" || t === "browser" ? "browser" : "runtime";
}
function yp(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class gp {
  constructor(t) {
    this.session = t.session, this.manifest = t.manifest, this.contracts = t.contracts, this.publicApi = t.publicApi || null, this.platformPolicyPermits = t.platformPolicyPermits ?? !0, this.grantResolver = t.grantResolver || wp, this.now = t.now || (() => Date.now()), this.setTimer = t.setTimer || ((r, a) => setTimeout(r, a)), this.clearTimer = t.clearTimer || ((r) => clearTimeout(r)), this.onDiagnostic = typeof t.onDiagnostic == "function" ? t.onDiagnostic : null, this.channelId = t.channelId || Ds("broker"), this.methods = new Map(this.contracts.brokerMethods.methods.map((r) => [r.id, r])), this.errors = new Map(this.contracts.brokerErrors.errors.map((r) => [r.code, r])), this.seen = /* @__PURE__ */ new Set(), this.pending = /* @__PURE__ */ new Map(), this.requestTimes = [], this.audit = [], this.diagnostics = [], this.closed = !1;
  }
  async createLaunchDescriptor() {
    if (At(this.manifest) !== 2 || this.manifest.sdk?.apiVersion !== "1")
      return Object.freeze({ facadeEnabled: !1 });
    const t = this.methods.get("device.battery.getState"), r = this.#t(t), a = ji(r);
    let l;
    if (a)
      l = { ok: !1, error: this.#a(a) }, this.#s("handshake", t, "deny", a, 0, r);
    else {
      const o = this.now();
      try {
        const c = this.#i().getState();
        l = { ok: !0, result: this.#l(c, t) }, this.#s("handshake", t, "allow", "success", this.now() - o, r);
      } catch (c) {
        const n = Ei(c);
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
    if (this.seen.add(t.requestId), fn(t) > this.contracts.brokerPolicy.limits.maximumRequestBytes)
      return Promise.resolve(this.#e(t, "request-too-large"));
    const r = this.methods.get(t.method);
    if (!r || r.invocation !== "request-response" || r.previewAvailability !== "enabled")
      return Promise.resolve(this.#e(t, "method-not-allowed", r));
    const a = this.#t(r), l = ji(a);
    if (l) return Promise.resolve(this.#e(t, l, r, !0, a));
    if (!Ai(t) || !cp(t.params))
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
    return pp({
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
    if (!t) throw bp("capability-unsupported");
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
            this.#r(n, this.#e(t, Ei(d), r, !1));
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
    if (!Ai(t)) return null;
    const r = this.pending.get(t.requestId);
    return !r || r.message.method !== t.method || this.#r(r, this.#e(r.message, "request-cancelled", r.method, !1)), null;
  }
  #r(t, r) {
    if (t.settled) return;
    t.settled = !0, this.clearTimer(t.timer), this.pending.delete(t.message.requestId);
    const a = r.ok ? "success" : r.error.code;
    this.#s(t.message.requestId, t.method, r.ok ? "allow" : Pp(a), a, this.now() - t.startedAt, t.permissionDecision), t.resolve(r);
  }
  #l(t, r) {
    return hp(t, r);
  }
  #c(t) {
    return Wo(t) && t.sessionId === this.session.sessionId && t.snapshotId === this.session.snapshotId && t.channelId === this.channelId;
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
    const c = s?.denialReason || vp(l), n = Object.freeze({
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
function wp(e) {
  return e.consent === "no-consent";
}
function vp(e) {
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
function bp(e) {
  const t = new Error(e);
  return t.code = e, t;
}
function Ei(e) {
  return ["response-too-large", "capability-unsupported"].includes(e?.code) ? e.code : "internal-error";
}
function Pp(e) {
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
const kp = 1800 * 1e3;
class $p {
  constructor({
    hostClient: t,
    ttlMs: r = kp,
    now: a = () => Date.now(),
    publicApiProvider: l = Ip,
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
    const l = await dn(t, { contracts: r });
    if (!l.passed) return { started: !1, validationReport: l, session: null };
    this.activeSession && await this.stop(this.activeSession.sessionId);
    const u = this.#t(t);
    this.sessions.set(u.sessionId, u), this.activeSessionId = u.sessionId;
    try {
      const s = JSON.parse(vr(t, "manifest.json").content);
      u.broker = new gp({
        session: u,
        manifest: s,
        contracts: r,
        publicApi: this.publicApiProvider(),
        platformPolicyPermits: this.platformPolicyPermits,
        grantResolver: this.grantResolver,
        onDiagnostic: this.onBrokerDiagnostic,
        now: this.now
      }), u.brokerLaunch = await u.broker.createLaunchDescriptor();
      const o = rp(t, u, { domParser: a, sdkLaunch: u.brokerLaunch });
      return await this.hostClient.start(u, o, u.brokerLaunch), u.state = "running", u.expiryTimer = setTimeout(() => this.#i(u.sessionId).catch(() => {
      }), this.ttlMs), { started: !0, validationReport: l, session: Yr(u) };
    } catch (s) {
      throw u.state = "failed", u.failure = s?.message || String(s), this.#o(u), s;
    }
  }
  async reload(t, r = {}) {
    const a = this.activeSession;
    a && (a.state = "reloading");
    const l = await dn(t, { contracts: r.contracts });
    return l.passed ? (a && await this.stop(a.sessionId), this.run(t, r)) : (a && (a.state = "running"), { started: !1, validationReport: l, session: a ? Yr(a) : null });
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
    return Yr(r);
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
      contract: Ud,
      sessionId: Ds("session"),
      projectUuid: t.projectUuid,
      snapshotId: t.snapshotId,
      token: Ds("token"),
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
function Yr(e) {
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
function Ip() {
  return globalThis.top?.WebWindows || globalThis.WebWindows || null;
}
const qp = { class: "developer-studio" }, Sp = { class: "studio-toolbar" }, xp = { class: "toolbar-group project-actions" }, Ap = ["value"], _p = ["value"], jp = ["disabled"], Ep = ["disabled"], Op = { class: "toolbar-group run-actions" }, Tp = ["disabled"], Mp = ["disabled"], Cp = ["disabled"], Np = ["disabled"], Lp = ["disabled"], Dp = {
  key: 0,
  class: "studio-main"
}, Rp = { class: "explorer-panel" }, zp = { class: "panel-heading" }, Fp = { class: "panel-actions" }, Wp = ["disabled"], Vp = ["disabled"], Hp = { class: "file-tree" }, Bp = { class: "editor-workbench" }, Up = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, Kp = ["onClick"], Zp = {
  key: 0,
  class: "dirty-dot"
}, Jp = { class: "editor-host" }, Gp = {
  key: 1,
  class: "empty-editor"
}, Xp = { class: "editor-statusbar" }, Yp = { class: "status-path" }, Qp = { class: "inspector-panel" }, ef = { class: "panel-heading" }, tf = { class: "panel-switcher" }, sf = { class: "inspector-content" }, rf = { class: "project-uuid" }, nf = { class: "build-inspector" }, of = { key: 0 }, af = { key: 1 }, lf = {
  key: 0,
  class: "build-blocked"
}, uf = { key: 1 }, cf = { class: "hash-row" }, df = ["disabled"], pf = { class: "inspector-content" }, ff = { class: "preview-inspector" }, hf = { class: "preview-session-banner" }, mf = { key: 0 }, yf = { key: 1 }, gf = {
  key: 1,
  class: "empty-workspace studio-main"
}, wf = {
  key: 2,
  class: "storage-recovery",
  role: "alert"
}, vf = { class: "problems-panel" }, bf = { class: "bottom-tabs" }, Pf = {
  key: 0,
  class: "storage-mode-badge",
  title: "IndexedDB 不可用；项目正在使用容量受限的隔离 localStorage 工作区。"
}, kf = ["value"], $f = {
  key: 0,
  class: "problems-empty"
}, If = ["onClick"], qf = {
  key: 0,
  class: "problems-empty"
}, Sf = {
  key: 0,
  class: "problems-empty"
}, xf = { class: "studio-dialog-actions" }, Af = {
  class: "primary",
  type: "submit"
}, _f = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new rd(), r = K([]), a = K(null), l = K([]), u = K(""), s = K([]), o = K(""), c = K(""), n = K(/* @__PURE__ */ new Set()), i = K(null), d = K([]), h = K(null), p = K(null), f = K(null), g = K(null), k = K(null), $ = K(!1), O = K(null), M = K(!1), C = K(null), Q = K([]), he = K([]), oe = K("problems"), fe = K("manifest"), nt = K("all"), Oe = K(""), it = K(""), vt = K(!1), jt = K(t.getStorageStatus()), we = K(null);
    let bt = null, ae = 0, ee = 0, Z = null, me = null;
    const Wt = Re(() => cd(l.value)), ot = Re(() => l.value.find((P) => P.path === o.value)), Ce = Re(() => dd(o.value)), Vs = Re(() => o.value === "manifest.json" ? d.value : []), Hs = Re(() => At(i.value)), ds = Re(() => g.value?.diagnostics || d.value.map((P) => ({
      ruleId: "Manifest",
      severity: P.severity,
      path: P.path,
      message: P.message
    }))), Pt = Re(() => nt.value === "all" ? Q.value : Q.value.filter((P) => P.level === nt.value));
    jn(async () => {
      try {
        const P = await bs();
        h.value = P.permissionRegistry, p.value = P.brokerMethods, f.value = P.runtimeCompatibility, await Xe(), r.value.length && await Et(r.value[0].uuid);
      } catch (P) {
        R(P);
      }
    }), En(() => {
      clearTimeout(ae), me?.dispose().catch(() => {
      }), t.close();
    });
    async function Xe() {
      r.value = await t.listProjects(), jt.value = t.getStorageStatus();
    }
    async function Vt() {
      try {
        await _();
        const P = Uc(), v = await Ks("新建 WebWindows 功能", "项目名称", P.displayName);
        if (v == null) return;
        const q = await t.createProject({ ...P, displayName: v });
        await Xe(), await Et(q.uuid), z("Hello WebWindows 项目已创建。");
      } catch (P) {
        R(P);
      }
    }
    async function Et(P) {
      if (!P) return;
      C.value && await $e(), await _(), a.value = await t.getProject(P), l.value = await t.listEntries(P);
      const v = a.value.editorState || {};
      s.value = (v.openFiles || []).filter((q) => l.value.some((ne) => ne.path === q && ne.kind === "file")), o.value = l.value.some((q) => q.path === v.activeFile && q.kind === "file") ? v.activeFile : s.value[0] || "", u.value = o.value, n.value = /* @__PURE__ */ new Set(), ve(), await b(), await S(), await j();
    }
    async function Ot() {
      if (!a.value) return;
      const P = await Ks("重命名项目", "新的项目名称", a.value.displayName);
      if (P != null)
        try {
          a.value = await t.renameProject(a.value.uuid, P), await Xe(), z("项目已重命名。");
        } catch (v) {
          R(v);
        }
    }
    async function Dn() {
      if (a.value && await Nr("删除项目", `永久删除项目“${a.value.displayName}”及其全部文件吗？`))
        try {
          const P = a.value.uuid;
          await t.deleteProject(P), a.value = null, l.value = [], s.value = [], o.value = "", u.value = "", c.value = "", ve(), await Xe(), r.value.length && await Et(r.value[0].uuid), z("项目已删除。");
        } catch (P) {
          R(P);
        }
    }
    async function m(P) {
      u.value = P.path, P.kind === "file" && await w(P.path);
    }
    async function w(P) {
      if (!a.value) return;
      await _();
      const v = ce(P);
      s.value.includes(v) || s.value.push(v), o.value = v, u.value = v, await b(), await j();
    }
    async function b() {
      if (!a.value || !o.value) {
        c.value = "";
        return;
      }
      c.value = await t.readTextFile(a.value.uuid, o.value), o.value === "manifest.json" && await I(c.value), await xn();
    }
    function x(P) {
      c.value = P, o.value && (n.value = new Set(n.value).add(o.value), ve(), o.value === "manifest.json" && I(P).catch(R), clearTimeout(ae), ae = window.setTimeout(() => _().catch(R), 700));
    }
    async function I(P) {
      const v = ++ee, q = await Rc(P);
      v === ee && (i.value = q.manifest, d.value = q.diagnostics);
    }
    async function S() {
      if (!a.value || !l.value.some((v) => v.path === "manifest.json" && v.kind === "file")) {
        i.value = null, d.value = [];
        return;
      }
      const P = o.value === "manifest.json" ? c.value : await t.readTextFile(a.value.uuid, "manifest.json");
      await I(P);
    }
    async function E(P) {
      o.value !== "manifest.json" && await w("manifest.json"), x(`${JSON.stringify(P, null, 2)}
`);
    }
    async function _() {
      if (clearTimeout(ae), ae = 0, !a.value || !o.value || !n.value.has(o.value)) return;
      const P = o.value;
      await t.writeTextFile(a.value.uuid, P, c.value);
      const v = new Set(n.value);
      v.delete(P), n.value = v, a.value = await t.getProject(a.value.uuid);
    }
    async function j() {
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
      return P?.kind === "directory" ? P.path : P?.path ? Ls(P.path) : "";
    }
    async function W(P) {
      if (!a.value) return;
      const q = await Ks(P === "directory" ? "新建目录" : "新建文件", P === "directory" ? "目录名称" : "文件名称", P === "directory" ? "new-folder" : "new-file.js");
      if (q != null)
        try {
          const ne = qi(A(), q);
          P === "directory" ? await t.createDirectory(a.value.uuid, ne) : await t.createFile(a.value.uuid, ne, ""), ve(), l.value = await t.listEntries(a.value.uuid), u.value = ne, P === "file" && await w(ne);
        } catch (ne) {
          R(ne);
        }
    }
    async function T() {
      const P = l.value.find((q) => q.path === u.value);
      if (!P || !a.value) return;
      const v = await Ks("重命名", "新的名称", cn(P.path));
      if (v != null)
        try {
          await _();
          const q = qi(Ls(P.path), v);
          await t.renameEntry(a.value.uuid, P.path, q), ve(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = q, await b();
        } catch (q) {
          R(q);
        }
    }
    async function F() {
      const P = l.value.find((v) => v.path === u.value);
      if (!(!P || !a.value) && await Nr("删除文件或目录", `删除“${P.path}”${P.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(a.value.uuid, P.path), ve(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = o.value, await b();
        } catch (v) {
          R(v);
        }
    }
    function z(P) {
      Oe.value = P, it.value = "", window.setTimeout(() => {
        Oe.value === P && (Oe.value = "");
      }, 2400);
    }
    function R(P) {
      console.error("[DeveloperStudio]", P), vt.value = Nn(P) && P.recoverable !== !1, Oe.value = P?.message || "操作失败。", it.value = "error";
    }
    async function X() {
      if (await Nr(
        "修复 Developer Studio 项目存储",
        "这将永久删除当前浏览器中的所有 Developer Studio 项目和文件，并重新创建独立工作区。不会删除其他 WebWindows 数据。继续吗？"
      ))
        try {
          await t.resetStorage(), a.value = null, r.value = [], l.value = [], s.value = [], o.value = "", u.value = "", c.value = "", vt.value = !1, await Xe(), z("Developer Studio 项目存储已重建，可以重新创建功能。");
        } catch (v) {
          R(v);
        }
    }
    async function U() {
      if (!a.value) throw new Error("请先打开项目。");
      return await _(), pd(t, a.value.uuid);
    }
    async function Pe() {
      if (!$.value) {
        $.value = !0;
        try {
          const P = await U(), v = await bs();
          g.value = await dn(P, { contracts: v }), k.value = null, z(g.value.passed ? "项目验证通过。" : `验证发现 ${g.value.errorCount} 个错误。`);
        } catch (P) {
          R(P);
        } finally {
          $.value = !1;
        }
      }
    }
    async function ke() {
      if (!$.value) {
        $.value = !0;
        try {
          const P = await U(), v = await bs(), { buildProjectPackage: q } = await import("./deterministic-builder-CxlcHDXA.js");
          k.value = await q(P, { contracts: v }), g.value = k.value.validationReport, z(k.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
        } catch (P) {
          R(P);
        } finally {
          $.value = !1;
        }
      }
    }
    function We() {
      if (!k.value?.artifactReady || !k.value.zipBytes) return;
      const P = k.value.manifestIdentity, v = `${P?.id || "webwindows-function"}-${P?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-"), q = new Blob([k.value.zipBytes], { type: "application/zip" }), ne = URL.createObjectURL(q), Zs = document.createElement("a");
      Zs.href = ne, Zs.download = `${v}.zip`, Zs.click(), window.setTimeout(() => URL.revokeObjectURL(ne), 0);
    }
    function ve() {
      g.value = null, k.value = null;
    }
    async function Tt() {
      M.value = !1, me?.dispose().catch(() => {
      }), Z = new Jd({
        onConsole: (P) => {
          const v = C.value || me?.activeSession;
          !v || P?.sessionId !== v.sessionId || P?.snapshotId !== v.snapshotId || (Q.value = [...Q.value, P].slice(-1e3));
        },
        onState: (P) => {
          !C.value || P?.sessionId !== C.value.sessionId || (C.value = { ...C.value, state: P.state });
        }
      }), me = new $p({
        hostClient: Z,
        onBrokerDiagnostic: (P) => {
          he.value = [...he.value, P].slice(-500);
        }
      });
      try {
        await Z.connect(O.value), M.value = !0;
      } catch (P) {
        R(P);
      }
    }
    async function ps({ reload: P = !1 } = {}) {
      if (!($.value || !me || !M.value)) {
        $.value = !0;
        try {
          he.value = [];
          const v = await U(), q = await bs(), ne = P && C.value ? await me.reload(v, { contracts: q }) : await me.run(v, { contracts: q });
          if (g.value = ne.validationReport, k.value = null, oe.value = ne.started ? "console" : "problems", fe.value = "preview", !ne.started) {
            z(`Developer Preview 被 ${ne.validationReport.errorCount} 个验证错误阻止。`);
            return;
          }
          C.value = ne.session, z(P ? "Developer Preview 已从新 Snapshot 重新加载。" : "Developer Preview 已启动。");
        } catch (v) {
          R(v);
        } finally {
          $.value = !1;
        }
      }
    }
    async function $e() {
      if (!(!me || !C.value))
        try {
          await me.stop(C.value.sessionId), C.value = null, he.value = [], z("Developer Preview 已停止，会话凭据已撤销。");
        } catch (P) {
          R(P);
        }
    }
    function Ve() {
      Q.value = [];
    }
    function Bs() {
      me?.clearBrokerDiagnostics(), he.value = [];
    }
    function Us(P) {
      return P.arguments.map((v) => typeof v == "string" ? v : JSON.stringify(v)).join(" ");
    }
    function Vo(P) {
      const v = l.value.find((q) => q.kind === "file" && (P.path === q.path || P.path?.startsWith(`${q.path}$`)));
      v && w(v.path).catch(R);
    }
    function Ks(P, v, q) {
      return Rn({ kind: "text", title: P, message: v, value: q });
    }
    function Nr(P, v) {
      return Rn({ kind: "confirm", title: P, message: v, value: "" });
    }
    function Rn(P) {
      return bt && bt(null), we.value = { ...P }, new Promise((v) => {
        bt = v;
      });
    }
    function Lr(P) {
      const v = bt;
      bt = null, we.value = null, v?.(P);
    }
    return (P, v) => (L(), D("main", qp, [
      y("header", Sp, [
        v[20] || (v[20] = y("div", { class: "studio-brand" }, [
          y("strong", null, "Developer Studio"),
          y("span", null, "WebWindows Function IDE")
        ], -1)),
        y("div", xp, [
          y("button", {
            class: "primary",
            type: "button",
            onClick: Vt
          }, "＋ 新建功能"),
          y("select", {
            "aria-label": "打开项目",
            value: a.value?.uuid || "",
            onChange: v[0] || (v[0] = (q) => Et(q.target.value).catch(R))
          }, [
            v[19] || (v[19] = y("option", {
              value: "",
              disabled: ""
            }, "打开项目…", -1)),
            (L(!0), D(se, null, Ke(r.value, (q) => (L(), D("option", {
              key: q.uuid,
              value: q.uuid
            }, N(q.displayName), 9, _p))), 128))
          ], 40, Ap),
          y("button", {
            type: "button",
            disabled: !a.value,
            onClick: Ot
          }, "重命名", 8, jp),
          y("button", {
            type: "button",
            disabled: !a.value,
            onClick: Dn
          }, "删除", 8, Ep)
        ]),
        v[21] || (v[21] = y("span", { class: "toolbar-spacer" }, null, -1)),
        y("div", Op, [
          y("button", {
            type: "button",
            disabled: !a.value || $.value,
            onClick: Pe
          }, "✓ Validate", 8, Tp),
          y("button", {
            class: "build-button",
            type: "button",
            disabled: !a.value || $.value,
            onClick: ke
          }, "Build", 8, Mp),
          y("button", {
            class: "run-button",
            type: "button",
            disabled: !a.value || $.value || !M.value,
            onClick: v[1] || (v[1] = (q) => ps())
          }, "▶ Run", 8, Cp),
          y("button", {
            type: "button",
            disabled: !C.value || $.value,
            onClick: v[2] || (v[2] = (q) => ps({ reload: !0 }))
          }, "↻", 8, Np),
          y("button", {
            type: "button",
            disabled: !C.value,
            onClick: $e
          }, "■", 8, Lp)
        ])
      ]),
      a.value ? (L(), D("section", Dp, [
        y("aside", Rp, [
          y("div", zp, [
            y("span", null, "Project · " + N(a.value.displayName), 1),
            y("div", Fp, [
              y("button", {
                type: "button",
                title: "新建文件",
                onClick: v[3] || (v[3] = (q) => W("file"))
              }, "＋F"),
              y("button", {
                type: "button",
                title: "新建目录",
                onClick: v[4] || (v[4] = (q) => W("directory"))
              }, "＋D"),
              y("button", {
                type: "button",
                title: "重命名",
                disabled: !u.value,
                onClick: T
              }, "R", 8, Wp),
              y("button", {
                type: "button",
                title: "删除",
                disabled: !u.value,
                onClick: F
              }, "×", 8, Vp)
            ])
          ]),
          y("div", Hp, [
            (L(!0), D(se, null, Ke(Wt.value, (q) => (L(), fr(ku, {
              key: q.path,
              node: q,
              "selected-path": u.value,
              onSelect: m
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ]),
        y("section", Bp, [
          y("nav", Up, [
            (L(!0), D(se, null, Ke(s.value, (q) => (L(), D("button", {
              key: q,
              type: "button",
              class: ge(["editor-tab", { active: q === o.value }]),
              onClick: (ne) => w(q).catch(R)
            }, [
              y("span", null, N(to(cn)(q)), 1),
              n.value.has(q) ? (L(), D("span", Zp, "•")) : qe("", !0)
            ], 10, Kp))), 128))
          ]),
          y("div", Jp, [
            ot.value?.kind === "file" ? (L(), fr(qu, {
              key: `${a.value.uuid}:${o.value}`,
              "project-id": a.value.uuid,
              path: o.value,
              language: Ce.value,
              value: c.value,
              markers: Vs.value,
              "onUpdate:value": x,
              onSave: v[5] || (v[5] = (q) => _().then(() => z("已保存。")).catch(R)),
              onError: R
            }, null, 8, ["project-id", "path", "language", "value", "markers"])) : (L(), D("div", Gp, [...v[22] || (v[22] = [
              y("h2", null, "选择文件开始编辑", -1),
              y("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ]),
          y("footer", Xp, [
            y("span", Yp, N(o.value || "No file selected"), 1),
            v[23] || (v[23] = y("span", { class: "status-spacer" }, null, -1)),
            v[24] || (v[24] = y("span", null, "Spaces: 2", -1)),
            v[25] || (v[25] = y("span", null, "UTF-8", -1)),
            y("span", null, N(Ce.value), 1)
          ])
        ]),
        y("aside", Qp, [
          y("div", ef, [
            v[26] || (v[26] = y("span", null, "Inspector", -1)),
            y("div", tf, [
              y("button", {
                type: "button",
                class: ge({ active: fe.value === "manifest" }),
                onClick: v[6] || (v[6] = (q) => fe.value = "manifest")
              }, "Manifest", 2),
              y("button", {
                type: "button",
                class: ge({ active: fe.value === "permissions" }),
                onClick: v[7] || (v[7] = (q) => fe.value = "permissions")
              }, "Permissions", 2),
              y("button", {
                type: "button",
                class: ge({ active: fe.value === "preview" }),
                onClick: v[8] || (v[8] = (q) => fe.value = "preview")
              }, "Preview", 2)
            ])
          ]),
          hs(y("div", sf, [
            y("h2", null, "Manifest " + N(Hs.value === 2 ? "v2" : Hs.value === 1 ? "v1" : "unsupported"), 1),
            y("p", rf, "项目 UUID：" + N(a.value.uuid), 1),
            Ge(oc, {
              manifest: i.value,
              diagnostics: d.value,
              "permission-registry": h.value,
              "broker-methods": p.value,
              "onUpdate:manifest": v[9] || (v[9] = (q) => E(q).catch(R)),
              onOpenJson: v[10] || (v[10] = (q) => w("manifest.json").catch(R))
            }, null, 8, ["manifest", "diagnostics", "permission-registry", "broker-methods"]),
            y("section", nf, [
              v[36] || (v[36] = y("h3", null, "Validation", -1)),
              g.value ? (L(), D("dl", af, [
                y("div", null, [
                  v[27] || (v[27] = y("dt", null, "Result", -1)),
                  y("dd", null, N(g.value.passed ? "Passed" : "Blocked"), 1)
                ]),
                y("div", null, [
                  v[28] || (v[28] = y("dt", null, "Errors", -1)),
                  y("dd", null, N(g.value.errorCount), 1)
                ]),
                y("div", null, [
                  v[29] || (v[29] = y("dt", null, "Warnings", -1)),
                  y("dd", null, N(g.value.warningCount), 1)
                ]),
                y("div", null, [
                  v[30] || (v[30] = y("dt", null, "Files", -1)),
                  y("dd", null, N(g.value.packageFacts.fileCount), 1)
                ]),
                y("div", null, [
                  v[31] || (v[31] = y("dt", null, "Bytes", -1)),
                  y("dd", null, N(g.value.packageFacts.unpackedBytes), 1)
                ])
              ])) : (L(), D("p", of, "尚未创建 Snapshot 验证。")),
              k.value ? (L(), D(se, { key: 2 }, [
                v[35] || (v[35] = y("h3", null, "Build Result", -1)),
                k.value.artifactReady ? (L(), D("dl", uf, [
                  y("div", null, [
                    v[32] || (v[32] = y("dt", null, "Size", -1)),
                    y("dd", null, N(k.value.zipSize) + " bytes", 1)
                  ]),
                  y("div", null, [
                    v[33] || (v[33] = y("dt", null, "Files", -1)),
                    y("dd", null, N(k.value.fileCount), 1)
                  ]),
                  y("div", cf, [
                    v[34] || (v[34] = y("dt", null, "SHA-256", -1)),
                    y("dd", null, N(k.value.sha256), 1)
                  ])
                ])) : (L(), D("p", lf, "验证未通过，没有生成可发布 ZIP。")),
                y("button", {
                  type: "button",
                  disabled: !k.value.artifactReady,
                  onClick: We
                }, "Export ZIP", 8, df)
              ], 64)) : qe("", !0)
            ])
          ], 512), [
            [Ur, fe.value === "manifest"]
          ]),
          hs(y("div", pf, [
            v[37] || (v[37] = y("h2", null, "Permission Inspector", -1)),
            Ge(uc, {
              manifest: i.value,
              "permission-registry": h.value,
              "broker-methods": p.value,
              "runtime-compatibility": f.value,
              decisions: he.value
            }, null, 8, ["manifest", "permission-registry", "broker-methods", "runtime-compatibility", "decisions"])
          ], 512), [
            [Ur, fe.value === "permissions"]
          ]),
          hs(y("div", ff, [
            y("div", hf, [
              v[38] || (v[38] = y("strong", null, "Developer Preview", -1)),
              C.value ? (L(), D("span", mf, N(C.value.state) + " · " + N(C.value.snapshotId), 1)) : (L(), D("span", yf, "无活动会话"))
            ]),
            y("iframe", {
              ref_key: "previewHostFrame",
              ref: O,
              class: "preview-host-frame",
              src: "developer-preview-host.html?v=20260829-1",
              title: "Trusted Developer Preview Host",
              referrerpolicy: "no-referrer",
              onLoad: Tt
            }, null, 544)
          ], 512), [
            [Ur, fe.value === "preview"]
          ])
        ])
      ])) : (L(), D("section", gf, [
        v[39] || (v[39] = y("h2", null, "创建第一个 WebWindows 功能", -1)),
        v[40] || (v[40] = y("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        y("button", {
          class: "primary",
          type: "button",
          onClick: Vt
        }, "新建 Hello WebWindows")
      ])),
      vt.value ? (L(), D("section", wf, [
        v[41] || (v[41] = y("div", null, [
          y("strong", null, "项目存储需要修复"),
          y("span", null, "仅在错误持续出现时使用；修复会删除此浏览器中的 Developer Studio 项目。")
        ], -1)),
        y("button", {
          type: "button",
          onClick: X
        }, "修复项目存储")
      ])) : qe("", !0),
      y("section", vf, [
        y("div", bf, [
          y("button", {
            type: "button",
            class: ge({ active: oe.value === "problems" }),
            onClick: v[11] || (v[11] = (q) => oe.value = "problems")
          }, [
            v[42] || (v[42] = le("Problems ", -1)),
            y("span", null, N(ds.value.length), 1)
          ], 2),
          y("button", {
            type: "button",
            class: ge({ active: oe.value === "console" }),
            onClick: v[12] || (v[12] = (q) => oe.value = "console")
          }, [
            v[43] || (v[43] = le("Console ", -1)),
            y("span", null, N(Q.value.length), 1)
          ], 2),
          y("button", {
            type: "button",
            class: ge({ active: oe.value === "broker" }),
            onClick: v[13] || (v[13] = (q) => oe.value = "broker")
          }, [
            v[44] || (v[44] = le("Permissions ", -1)),
            y("span", null, N(he.value.length), 1)
          ], 2),
          v[46] || (v[46] = y("span", { class: "bottom-spacer" }, null, -1)),
          jt.value.degraded ? (L(), D("span", Pf, "⚠ Local fallback")) : qe("", !0),
          oe.value === "console" ? (L(), D(se, { key: 1 }, [
            hs(y("select", {
              "onUpdate:modelValue": v[14] || (v[14] = (q) => nt.value = q),
              "aria-label": "Console level"
            }, [
              v[45] || (v[45] = y("option", { value: "all" }, "All levels", -1)),
              (L(), D(se, null, Ke(["log", "info", "warn", "error", "debug"], (q) => y("option", {
                key: q,
                value: q
              }, N(q), 9, kf)), 64))
            ], 512), [
              [uu, nt.value]
            ]),
            y("button", {
              type: "button",
              onClick: Ve
            }, "Clear")
          ], 64)) : oe.value === "broker" ? (L(), D("button", {
            key: 2,
            type: "button",
            onClick: Bs
          }, "Clear")) : qe("", !0)
        ]),
        oe.value === "problems" ? (L(), D(se, { key: 0 }, [
          ds.value.length ? qe("", !0) : (L(), D("div", $f, "当前 Snapshot 未发现问题。")),
          (L(!0), D(se, null, Ke(ds.value, (q, ne) => (L(), D("button", {
            key: `${q.ruleId}:${q.path}:${ne}`,
            type: "button",
            class: "problem-row",
            onClick: (Zs) => Vo(q)
          }, [
            y("span", {
              class: ge(["problem-severity", q.severity])
            }, N(q.ruleId), 3),
            y("code", null, N(q.path), 1),
            y("span", null, N(q.message), 1)
          ], 8, If))), 128))
        ], 64)) : oe.value === "console" ? (L(), D(se, { key: 1 }, [
          Pt.value.length ? qe("", !0) : (L(), D("div", qf, "当前 Developer Preview 尚无 Console 输出。")),
          (L(!0), D(se, null, Ke(Pt.value, (q) => (L(), D("div", {
            key: `${q.sessionId}:${q.sequence}`,
            class: ge(["console-row", q.level])
          }, [
            y("time", null, N(q.timestamp), 1),
            y("strong", null, N(q.level), 1),
            y("span", null, N(Us(q)), 1),
            y("code", null, N(q.snapshotId), 1)
          ], 2))), 128))
        ], 64)) : (L(), D(se, { key: 2 }, [
          he.value.length ? qe("", !0) : (L(), D("div", Sf, "当前 Preview 尚无 Broker permission diagnostics。")),
          (L(!0), D(se, null, Ke(he.value, (q, ne) => (L(), D("div", {
            key: `${q.sessionId}:${q.requestId}:${ne}`,
            class: "broker-row"
          }, [
            y("time", null, N(q.timestamp), 1),
            y("code", null, N(q.method || "protocol"), 1),
            y("span", null, N(q.permission || "—"), 1),
            y("span", null, "declared: " + N(q.declared == null ? "n/a" : q.declared ? "yes" : "no"), 1),
            y("span", null, "policy: " + N(q.policyDecision), 1),
            y("span", null, "grant: " + N(q.grantState || "n/a"), 1),
            y("span", null, "capability: " + N(q.capabilityState), 1),
            y("strong", {
              class: ge(q.finalDecision)
            }, N(q.denialReason || q.resultCategory), 3)
          ]))), 128))
        ], 64))
      ]),
      Oe.value ? (L(), D("div", {
        key: 3,
        class: ge(["studio-status", it.value]),
        role: "status"
      }, N(Oe.value), 3)) : qe("", !0),
      we.value ? (L(), D("div", {
        key: 4,
        class: "studio-dialog-backdrop",
        onKeydown: v[18] || (v[18] = fu((q) => Lr(we.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        y("form", {
          class: "studio-dialog",
          onSubmit: v[17] || (v[17] = Cn((q) => Lr(we.value.kind === "confirm" ? !0 : we.value.value), ["prevent"]))
        }, [
          y("h2", null, N(we.value.title), 1),
          y("p", null, N(we.value.message), 1),
          we.value.kind === "text" ? hs((L(), D("input", {
            key: 0,
            "onUpdate:modelValue": v[15] || (v[15] = (q) => we.value.value = q),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [lu, we.value.value]
          ]) : qe("", !0),
          y("div", xf, [
            y("button", {
              type: "button",
              onClick: v[16] || (v[16] = (q) => Lr(we.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            y("button", Af, N(we.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : qe("", !0)
    ]));
  }
};
yu(_f).mount("#developer-studio-app");
export {
  At as a,
  vr as g,
  fd as s,
  dn as v
};
