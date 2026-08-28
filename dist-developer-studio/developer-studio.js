/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function an(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const B = {}, Ot = [], Ue = () => {
}, mr = () => !1, ks = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), un = (e) => e.startsWith("onUpdate:"), he = Object.assign, cn = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, xi = Object.prototype.hasOwnProperty, U = (e, t) => xi.call(e, t), I = Array.isArray, Mt = (e) => Es(e) === "[object Map]", gr = (e) => Es(e) === "[object Set]", q = (e) => typeof e == "function", ee = (e) => typeof e == "string", at = (e) => typeof e == "symbol", Z = (e) => e !== null && typeof e == "object", yr = (e) => (Z(e) || q(e)) && q(e.then) && q(e.catch), vr = Object.prototype.toString, Es = (e) => vr.call(e), Pi = (e) => Es(e).slice(8, -1), wr = (e) => Es(e) === "[object Object]", fn = (e) => ee(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, zt = /* @__PURE__ */ an(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ts = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((s) => t[s] || (t[s] = e(s)));
}, _i = /-\w/g, Ae = Ts(
  (e) => e.replace(_i, (t) => t.slice(1).toUpperCase())
), Si = /\B([A-Z])/g, ut = Ts(
  (e) => e.replace(Si, "-$1").toLowerCase()
), js = Ts((e) => e.charAt(0).toUpperCase() + e.slice(1)), Rs = Ts(
  (e) => e ? `on${js(e)}` : ""
), it = (e, t) => !Object.is(e, t), ds = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, br = (e, t, s, r = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: r,
    value: s
  });
}, Gs = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let On;
const Cs = () => On || (On = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function dn(e) {
  if (I(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const r = e[s], i = ee(r) ? Ti(r) : dn(r);
      if (i)
        for (const o in i)
          t[o] = i[o];
    }
    return t;
  } else if (ee(e) || Z(e))
    return e;
}
const $i = /;(?![^(]*\))/g, ki = /:([^]+)/, Ei = /\/\*[^]*?\*\//g;
function Ti(e) {
  const t = {};
  return e.replace(Ei, "").split($i).forEach((s) => {
    if (s) {
      const r = s.split(ki);
      r.length > 1 && (t[r[0].trim()] = r[1].trim());
    }
  }), t;
}
function Xe(e) {
  let t = "";
  if (ee(e))
    t = e;
  else if (I(e))
    for (let s = 0; s < e.length; s++) {
      const r = Xe(e[s]);
      r && (t += r + " ");
    }
  else if (Z(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const ji = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ci = /* @__PURE__ */ an(ji);
function xr(e) {
  return !!e || e === "";
}
const Pr = (e) => !!(e && e.__v_isRef === !0), ie = (e) => ee(e) ? e : e == null ? "" : I(e) || Z(e) && (e.toString === vr || !q(e.toString)) ? Pr(e) ? ie(e.value) : JSON.stringify(e, _r, 2) : String(e), _r = (e, t) => Pr(t) ? _r(e, t.value) : Mt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [r, i], o) => (s[qs(r, o) + " =>"] = i, s),
    {}
  )
} : gr(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => qs(s))
} : at(t) ? qs(t) : Z(t) && !I(t) && !wr(t) ? String(t) : t, qs = (e, t = "") => {
  var s;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    at(e) ? `Symbol(${(s = e.description) != null ? s : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ye;
class Ai {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = ye, !t && ye && (this.index = (ye.scopes || (ye.scopes = [])).push(
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
      const s = ye;
      try {
        return ye = this, t();
      } finally {
        ye = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = ye, ye = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (ye = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let s, r;
      for (s = 0, r = this.effects.length; s < r; s++)
        this.effects[s].stop();
      for (this.effects.length = 0, s = 0, r = this.cleanups.length; s < r; s++)
        this.cleanups[s]();
      if (this.cleanups.length = 0, this.scopes) {
        for (s = 0, r = this.scopes.length; s < r; s++)
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
function Oi() {
  return ye;
}
let J;
const Ds = /* @__PURE__ */ new WeakSet();
class Sr {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, ye && ye.active && ye.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ds.has(this) && (Ds.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || kr(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Mn(this), Er(this);
    const t = J, s = Me;
    J = this, Me = !0;
    try {
      return this.fn();
    } finally {
      Tr(this), J = t, Me = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        mn(t);
      this.deps = this.depsTail = void 0, Mn(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ds.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Ys(this) && this.run();
  }
  get dirty() {
    return Ys(this);
  }
}
let $r = 0, Bt, Kt;
function kr(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Kt, Kt = e;
    return;
  }
  e.next = Bt, Bt = e;
}
function pn() {
  $r++;
}
function hn() {
  if (--$r > 0)
    return;
  if (Kt) {
    let t = Kt;
    for (Kt = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; Bt; ) {
    let t = Bt;
    for (Bt = void 0; t; ) {
      const s = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (r) {
          e || (e = r);
        }
      t = s;
    }
  }
  if (e) throw e;
}
function Er(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Tr(e) {
  let t, s = e.depsTail, r = s;
  for (; r; ) {
    const i = r.prevDep;
    r.version === -1 ? (r === s && (s = i), mn(r), Mi(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = i;
  }
  e.deps = t, e.depsTail = s;
}
function Ys(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (jr(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function jr(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Qt) || (e.globalVersion = Qt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Ys(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = J, r = Me;
  J = e, Me = !0;
  try {
    Er(e);
    const i = e.fn(e._value);
    (t.version === 0 || it(i, e._value)) && (e.flags |= 128, e._value = i, t.version++);
  } catch (i) {
    throw t.version++, i;
  } finally {
    J = s, Me = r, Tr(e), e.flags &= -3;
  }
}
function mn(e, t = !1) {
  const { dep: s, prevSub: r, nextSub: i } = e;
  if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), s.subs === e && (s.subs = r, !r && s.computed)) {
    s.computed.flags &= -5;
    for (let o = s.computed.deps; o; o = o.nextDep)
      mn(o, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function Mi(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let Me = !0;
const Cr = [];
function et() {
  Cr.push(Me), Me = !1;
}
function tt() {
  const e = Cr.pop();
  Me = e === void 0 ? !0 : e;
}
function Mn(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const s = J;
    J = void 0;
    try {
      t();
    } finally {
      J = s;
    }
  }
}
let Qt = 0;
class Fi {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class gn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!J || !Me || J === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== J)
      s = this.activeLink = new Fi(J, this), J.deps ? (s.prevDep = J.depsTail, J.depsTail.nextDep = s, J.depsTail = s) : J.deps = J.depsTail = s, Ar(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const r = s.nextDep;
      r.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = r), s.prevDep = J.depsTail, s.nextDep = void 0, J.depsTail.nextDep = s, J.depsTail = s, J.deps === s && (J.deps = r);
    }
    return s;
  }
  trigger(t) {
    this.version++, Qt++, this.notify(t);
  }
  notify(t) {
    pn();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      hn();
    }
  }
}
function Ar(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let r = t.deps; r; r = r.nextDep)
        Ar(r);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const Zs = /* @__PURE__ */ new WeakMap(), wt = Symbol(
  ""
), Xs = Symbol(
  ""
), es = Symbol(
  ""
);
function ue(e, t, s) {
  if (Me && J) {
    let r = Zs.get(e);
    r || Zs.set(e, r = /* @__PURE__ */ new Map());
    let i = r.get(s);
    i || (r.set(s, i = new gn()), i.map = r, i.key = s), i.track();
  }
}
function Ye(e, t, s, r, i, o) {
  const n = Zs.get(e);
  if (!n) {
    Qt++;
    return;
  }
  const l = (c) => {
    c && c.trigger();
  };
  if (pn(), t === "clear")
    n.forEach(l);
  else {
    const c = I(e), u = c && fn(s);
    if (c && s === "length") {
      const a = Number(r);
      n.forEach((d, g) => {
        (g === "length" || g === es || !at(g) && g >= a) && l(d);
      });
    } else
      switch ((s !== void 0 || n.has(void 0)) && l(n.get(s)), u && l(n.get(es)), t) {
        case "add":
          c ? u && l(n.get("length")) : (l(n.get(wt)), Mt(e) && l(n.get(Xs)));
          break;
        case "delete":
          c || (l(n.get(wt)), Mt(e) && l(n.get(Xs)));
          break;
        case "set":
          Mt(e) && l(n.get(wt));
          break;
      }
  }
  hn();
}
function Et(e) {
  const t = W(e);
  return t === e ? t : (ue(t, "iterate", es), Ce(e) ? t : t.map(le));
}
function As(e) {
  return ue(e = W(e), "iterate", es), e;
}
const Ii = {
  __proto__: null,
  [Symbol.iterator]() {
    return Hs(this, Symbol.iterator, le);
  },
  concat(...e) {
    return Et(this).concat(
      ...e.map((t) => I(t) ? Et(t) : t)
    );
  },
  entries() {
    return Hs(this, "entries", (e) => (e[1] = le(e[1]), e));
  },
  every(e, t) {
    return Je(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Je(this, "filter", e, t, (s) => s.map(le), arguments);
  },
  find(e, t) {
    return Je(this, "find", e, t, le, arguments);
  },
  findIndex(e, t) {
    return Je(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Je(this, "findLast", e, t, le, arguments);
  },
  findLastIndex(e, t) {
    return Je(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Je(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Ls(this, "includes", e);
  },
  indexOf(...e) {
    return Ls(this, "indexOf", e);
  },
  join(e) {
    return Et(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Ls(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Je(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Lt(this, "pop");
  },
  push(...e) {
    return Lt(this, "push", e);
  },
  reduce(e, ...t) {
    return Fn(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Fn(this, "reduceRight", e, t);
  },
  shift() {
    return Lt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Je(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Lt(this, "splice", e);
  },
  toReversed() {
    return Et(this).toReversed();
  },
  toSorted(e) {
    return Et(this).toSorted(e);
  },
  toSpliced(...e) {
    return Et(this).toSpliced(...e);
  },
  unshift(...e) {
    return Lt(this, "unshift", e);
  },
  values() {
    return Hs(this, "values", le);
  }
};
function Hs(e, t, s) {
  const r = As(e), i = r[t]();
  return r !== e && !Ce(e) && (i._next = i.next, i.next = () => {
    const o = i._next();
    return o.value && (o.value = s(o.value)), o;
  }), i;
}
const Ni = Array.prototype;
function Je(e, t, s, r, i, o) {
  const n = As(e), l = n !== e && !Ce(e), c = n[t];
  if (c !== Ni[t]) {
    const d = c.apply(e, o);
    return l ? le(d) : d;
  }
  let u = s;
  n !== e && (l ? u = function(d, g) {
    return s.call(this, le(d), g, e);
  } : s.length > 2 && (u = function(d, g) {
    return s.call(this, d, g, e);
  }));
  const a = c.call(n, u, r);
  return l && i ? i(a) : a;
}
function Fn(e, t, s, r) {
  const i = As(e);
  let o = s;
  return i !== e && (Ce(e) ? s.length > 3 && (o = function(n, l, c) {
    return s.call(this, n, l, c, e);
  }) : o = function(n, l, c) {
    return s.call(this, n, le(l), c, e);
  }), i[t](o, ...r);
}
function Ls(e, t, s) {
  const r = W(e);
  ue(r, "iterate", es);
  const i = r[t](...s);
  return (i === -1 || i === !1) && bn(s[0]) ? (s[0] = W(s[0]), r[t](...s)) : i;
}
function Lt(e, t, s = []) {
  et(), pn();
  const r = W(e)[t].apply(e, s);
  return hn(), tt(), r;
}
const Ri = /* @__PURE__ */ an("__proto__,__v_isRef,__isVue"), Or = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(at)
);
function qi(e) {
  at(e) || (e = String(e));
  const t = W(this);
  return ue(t, "has", e), t.hasOwnProperty(e);
}
class Mr {
  constructor(t = !1, s = !1) {
    this._isReadonly = t, this._isShallow = s;
  }
  get(t, s, r) {
    if (s === "__v_skip") return t.__v_skip;
    const i = this._isReadonly, o = this._isShallow;
    if (s === "__v_isReactive")
      return !i;
    if (s === "__v_isReadonly")
      return i;
    if (s === "__v_isShallow")
      return o;
    if (s === "__v_raw")
      return r === (i ? o ? Ji : Rr : o ? Nr : Ir).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(r) ? t : void 0;
    const n = I(t);
    if (!i) {
      let c;
      if (n && (c = Ii[s]))
        return c;
      if (s === "hasOwnProperty")
        return qi;
    }
    const l = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      fe(t) ? t : r
    );
    return (at(s) ? Or.has(s) : Ri(s)) || (i || ue(t, "get", s), o) ? l : fe(l) ? n && fn(s) ? l : l.value : Z(l) ? i ? qr(l) : vn(l) : l;
  }
}
class Fr extends Mr {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, r, i) {
    let o = t[s];
    if (!this._isShallow) {
      const c = ot(o);
      if (!Ce(r) && !ot(r) && (o = W(o), r = W(r)), !I(t) && fe(o) && !fe(r))
        return c || (o.value = r), !0;
    }
    const n = I(t) && fn(s) ? Number(s) < t.length : U(t, s), l = Reflect.set(
      t,
      s,
      r,
      fe(t) ? t : i
    );
    return t === W(i) && (n ? it(r, o) && Ye(t, "set", s, r) : Ye(t, "add", s, r)), l;
  }
  deleteProperty(t, s) {
    const r = U(t, s);
    t[s];
    const i = Reflect.deleteProperty(t, s);
    return i && r && Ye(t, "delete", s, void 0), i;
  }
  has(t, s) {
    const r = Reflect.has(t, s);
    return (!at(s) || !Or.has(s)) && ue(t, "has", s), r;
  }
  ownKeys(t) {
    return ue(
      t,
      "iterate",
      I(t) ? "length" : wt
    ), Reflect.ownKeys(t);
  }
}
class Di extends Mr {
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
const Hi = /* @__PURE__ */ new Fr(), Li = /* @__PURE__ */ new Di(), Wi = /* @__PURE__ */ new Fr(!0);
const Qs = (e) => e, as = (e) => Reflect.getPrototypeOf(e);
function Ui(e, t, s) {
  return function(...r) {
    const i = this.__v_raw, o = W(i), n = Mt(o), l = e === "entries" || e === Symbol.iterator && n, c = e === "keys" && n, u = i[e](...r), a = s ? Qs : t ? gs : le;
    return !t && ue(
      o,
      "iterate",
      c ? Xs : wt
    ), {
      // iterator protocol
      next() {
        const { value: d, done: g } = u.next();
        return g ? { value: d, done: g } : {
          value: l ? [a(d[0]), a(d[1])] : a(d),
          done: g
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function us(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Vi(e, t) {
  const s = {
    get(i) {
      const o = this.__v_raw, n = W(o), l = W(i);
      e || (it(i, l) && ue(n, "get", i), ue(n, "get", l));
      const { has: c } = as(n), u = t ? Qs : e ? gs : le;
      if (c.call(n, i))
        return u(o.get(i));
      if (c.call(n, l))
        return u(o.get(l));
      o !== n && o.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !e && ue(W(i), "iterate", wt), i.size;
    },
    has(i) {
      const o = this.__v_raw, n = W(o), l = W(i);
      return e || (it(i, l) && ue(n, "has", i), ue(n, "has", l)), i === l ? o.has(i) : o.has(i) || o.has(l);
    },
    forEach(i, o) {
      const n = this, l = n.__v_raw, c = W(l), u = t ? Qs : e ? gs : le;
      return !e && ue(c, "iterate", wt), l.forEach((a, d) => i.call(o, u(a), u(d), n));
    }
  };
  return he(
    s,
    e ? {
      add: us("add"),
      set: us("set"),
      delete: us("delete"),
      clear: us("clear")
    } : {
      add(i) {
        !t && !Ce(i) && !ot(i) && (i = W(i));
        const o = W(this);
        return as(o).has.call(o, i) || (o.add(i), Ye(o, "add", i, i)), this;
      },
      set(i, o) {
        !t && !Ce(o) && !ot(o) && (o = W(o));
        const n = W(this), { has: l, get: c } = as(n);
        let u = l.call(n, i);
        u || (i = W(i), u = l.call(n, i));
        const a = c.call(n, i);
        return n.set(i, o), u ? it(o, a) && Ye(n, "set", i, o) : Ye(n, "add", i, o), this;
      },
      delete(i) {
        const o = W(this), { has: n, get: l } = as(o);
        let c = n.call(o, i);
        c || (i = W(i), c = n.call(o, i)), l && l.call(o, i);
        const u = o.delete(i);
        return c && Ye(o, "delete", i, void 0), u;
      },
      clear() {
        const i = W(this), o = i.size !== 0, n = i.clear();
        return o && Ye(
          i,
          "clear",
          void 0,
          void 0
        ), n;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((i) => {
    s[i] = Ui(i, e, t);
  }), s;
}
function yn(e, t) {
  const s = Vi(e, t);
  return (r, i, o) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? r : Reflect.get(
    U(s, i) && i in r ? s : r,
    i,
    o
  );
}
const zi = {
  get: /* @__PURE__ */ yn(!1, !1)
}, Bi = {
  get: /* @__PURE__ */ yn(!1, !0)
}, Ki = {
  get: /* @__PURE__ */ yn(!0, !1)
};
const Ir = /* @__PURE__ */ new WeakMap(), Nr = /* @__PURE__ */ new WeakMap(), Rr = /* @__PURE__ */ new WeakMap(), Ji = /* @__PURE__ */ new WeakMap();
function Gi(e) {
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
function Yi(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Gi(Pi(e));
}
function vn(e) {
  return ot(e) ? e : wn(
    e,
    !1,
    Hi,
    zi,
    Ir
  );
}
function Zi(e) {
  return wn(
    e,
    !1,
    Wi,
    Bi,
    Nr
  );
}
function qr(e) {
  return wn(
    e,
    !0,
    Li,
    Ki,
    Rr
  );
}
function wn(e, t, s, r, i) {
  if (!Z(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const o = Yi(e);
  if (o === 0)
    return e;
  const n = i.get(e);
  if (n)
    return n;
  const l = new Proxy(
    e,
    o === 2 ? r : s
  );
  return i.set(e, l), l;
}
function Ft(e) {
  return ot(e) ? Ft(e.__v_raw) : !!(e && e.__v_isReactive);
}
function ot(e) {
  return !!(e && e.__v_isReadonly);
}
function Ce(e) {
  return !!(e && e.__v_isShallow);
}
function bn(e) {
  return e ? !!e.__v_raw : !1;
}
function W(e) {
  const t = e && e.__v_raw;
  return t ? W(t) : e;
}
function Xi(e) {
  return !U(e, "__v_skip") && Object.isExtensible(e) && br(e, "__v_skip", !0), e;
}
const le = (e) => Z(e) ? vn(e) : e, gs = (e) => Z(e) ? qr(e) : e;
function fe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function re(e) {
  return Qi(e, !1);
}
function Qi(e, t) {
  return fe(e) ? e : new eo(e, t);
}
class eo {
  constructor(t, s) {
    this.dep = new gn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : W(t), this._value = s ? t : le(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, r = this.__v_isShallow || Ce(t) || ot(t);
    t = r ? t : W(t), it(t, s) && (this._rawValue = t, this._value = r ? t : le(t), this.dep.trigger());
  }
}
function Dr(e) {
  return fe(e) ? e.value : e;
}
const to = {
  get: (e, t, s) => t === "__v_raw" ? e : Dr(Reflect.get(e, t, s)),
  set: (e, t, s, r) => {
    const i = e[t];
    return fe(i) && !fe(s) ? (i.value = s, !0) : Reflect.set(e, t, s, r);
  }
};
function Hr(e) {
  return Ft(e) ? e : new Proxy(e, to);
}
class so {
  constructor(t, s, r) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new gn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Qt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = r;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    J !== this)
      return kr(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return jr(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function no(e, t, s = !1) {
  let r, i;
  return q(e) ? r = e : (r = e.get, i = e.set), new so(r, i, s);
}
const cs = {}, ys = /* @__PURE__ */ new WeakMap();
let gt;
function ro(e, t = !1, s = gt) {
  if (s) {
    let r = ys.get(s);
    r || ys.set(s, r = []), r.push(e);
  }
}
function io(e, t, s = B) {
  const { immediate: r, deep: i, once: o, scheduler: n, augmentJob: l, call: c } = s, u = (M) => i ? M : Ce(M) || i === !1 || i === 0 ? Ze(M, 1) : Ze(M);
  let a, d, g, m, P = !1, k = !1;
  if (fe(e) ? (d = () => e.value, P = Ce(e)) : Ft(e) ? (d = () => u(e), P = !0) : I(e) ? (k = !0, P = e.some((M) => Ft(M) || Ce(M)), d = () => e.map((M) => {
    if (fe(M))
      return M.value;
    if (Ft(M))
      return u(M);
    if (q(M))
      return c ? c(M, 2) : M();
  })) : q(e) ? t ? d = c ? () => c(e, 2) : e : d = () => {
    if (g) {
      et();
      try {
        g();
      } finally {
        tt();
      }
    }
    const M = gt;
    gt = a;
    try {
      return c ? c(e, 3, [m]) : e(m);
    } finally {
      gt = M;
    }
  } : d = Ue, t && i) {
    const M = d, X = i === !0 ? 1 / 0 : i;
    d = () => Ze(M(), X);
  }
  const L = Oi(), C = () => {
    a.stop(), L && L.active && cn(L.effects, a);
  };
  if (o && t) {
    const M = t;
    t = (...X) => {
      M(...X), C();
    };
  }
  let N = k ? new Array(e.length).fill(cs) : cs;
  const R = (M) => {
    if (!(!(a.flags & 1) || !a.dirty && !M))
      if (t) {
        const X = a.run();
        if (i || P || (k ? X.some((be, xe) => it(be, N[xe])) : it(X, N))) {
          g && g();
          const be = gt;
          gt = a;
          try {
            const xe = [
              X,
              // pass undefined as the old value when it's changed for the first time
              N === cs ? void 0 : k && N[0] === cs ? [] : N,
              m
            ];
            N = X, c ? c(t, 3, xe) : (
              // @ts-expect-error
              t(...xe)
            );
          } finally {
            gt = be;
          }
        }
      } else
        a.run();
  };
  return l && l(R), a = new Sr(d), a.scheduler = n ? () => n(R, !1) : R, m = (M) => ro(M, !1, a), g = a.onStop = () => {
    const M = ys.get(a);
    if (M) {
      if (c)
        c(M, 4);
      else
        for (const X of M) X();
      ys.delete(a);
    }
  }, t ? r ? R(!0) : N = a.run() : n ? n(R.bind(null, !0), !0) : a.run(), C.pause = a.pause.bind(a), C.resume = a.resume.bind(a), C.stop = C, C;
}
function Ze(e, t = 1 / 0, s) {
  if (t <= 0 || !Z(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, fe(e))
    Ze(e.value, t, s);
  else if (I(e))
    for (let r = 0; r < e.length; r++)
      Ze(e[r], t, s);
  else if (gr(e) || Mt(e))
    e.forEach((r) => {
      Ze(r, t, s);
    });
  else if (wr(e)) {
    for (const r in e)
      Ze(e[r], t, s);
    for (const r of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, r) && Ze(e[r], t, s);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function is(e, t, s, r) {
  try {
    return r ? e(...r) : e();
  } catch (i) {
    Os(i, t, s);
  }
}
function ze(e, t, s, r) {
  if (q(e)) {
    const i = is(e, t, s, r);
    return i && yr(i) && i.catch((o) => {
      Os(o, t, s);
    }), i;
  }
  if (I(e)) {
    const i = [];
    for (let o = 0; o < e.length; o++)
      i.push(ze(e[o], t, s, r));
    return i;
  }
}
function Os(e, t, s, r = !0) {
  const i = t ? t.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: n } = t && t.appContext.config || B;
  if (t) {
    let l = t.parent;
    const c = t.proxy, u = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; l; ) {
      const a = l.ec;
      if (a) {
        for (let d = 0; d < a.length; d++)
          if (a[d](e, c, u) === !1)
            return;
      }
      l = l.parent;
    }
    if (o) {
      et(), is(o, null, 10, [
        e,
        c,
        u
      ]), tt();
      return;
    }
  }
  oo(e, s, i, r, n);
}
function oo(e, t, s, r = !0, i = !1) {
  if (i)
    throw e;
  console.error(e);
}
const pe = [];
let Le = -1;
const It = [];
let nt = null, jt = 0;
const Lr = /* @__PURE__ */ Promise.resolve();
let vs = null;
function Wr(e) {
  const t = vs || Lr;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function lo(e) {
  let t = Le + 1, s = pe.length;
  for (; t < s; ) {
    const r = t + s >>> 1, i = pe[r], o = ts(i);
    o < e || o === e && i.flags & 2 ? t = r + 1 : s = r;
  }
  return t;
}
function xn(e) {
  if (!(e.flags & 1)) {
    const t = ts(e), s = pe[pe.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= ts(s) ? pe.push(e) : pe.splice(lo(t), 0, e), e.flags |= 1, Ur();
  }
}
function Ur() {
  vs || (vs = Lr.then(zr));
}
function ao(e) {
  I(e) ? It.push(...e) : nt && e.id === -1 ? nt.splice(jt + 1, 0, e) : e.flags & 1 || (It.push(e), e.flags |= 1), Ur();
}
function In(e, t, s = Le + 1) {
  for (; s < pe.length; s++) {
    const r = pe[s];
    if (r && r.flags & 2) {
      if (e && r.id !== e.uid)
        continue;
      pe.splice(s, 1), s--, r.flags & 4 && (r.flags &= -2), r(), r.flags & 4 || (r.flags &= -2);
    }
  }
}
function Vr(e) {
  if (It.length) {
    const t = [...new Set(It)].sort(
      (s, r) => ts(s) - ts(r)
    );
    if (It.length = 0, nt) {
      nt.push(...t);
      return;
    }
    for (nt = t, jt = 0; jt < nt.length; jt++) {
      const s = nt[jt];
      s.flags & 4 && (s.flags &= -2), s.flags & 8 || s(), s.flags &= -2;
    }
    nt = null, jt = 0;
  }
}
const ts = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function zr(e) {
  try {
    for (Le = 0; Le < pe.length; Le++) {
      const t = pe[Le];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), is(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Le < pe.length; Le++) {
      const t = pe[Le];
      t && (t.flags &= -2);
    }
    Le = -1, pe.length = 0, Vr(), vs = null, (pe.length || It.length) && zr();
  }
}
let ke = null, Br = null;
function ws(e) {
  const t = ke;
  return ke = e, Br = e && e.type.__scopeId || null, t;
}
function uo(e, t = ke, s) {
  if (!t || e._n)
    return e;
  const r = (...i) => {
    r._d && Bn(-1);
    const o = ws(t);
    let n;
    try {
      n = e(...i);
    } finally {
      ws(o), r._d && Bn(1);
    }
    return n;
  };
  return r._n = !0, r._c = !0, r._d = !0, r;
}
function co(e, t) {
  if (ke === null)
    return e;
  const s = Ns(ke), r = e.dirs || (e.dirs = []);
  for (let i = 0; i < t.length; i++) {
    let [o, n, l, c = B] = t[i];
    o && (q(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && Ze(n), r.push({
      dir: o,
      instance: s,
      value: n,
      oldValue: void 0,
      arg: l,
      modifiers: c
    }));
  }
  return e;
}
function dt(e, t, s, r) {
  const i = e.dirs, o = t && t.dirs;
  for (let n = 0; n < i.length; n++) {
    const l = i[n];
    o && (l.oldValue = o[n].value);
    let c = l.dir[r];
    c && (et(), ze(c, s, 8, [
      e.el,
      l,
      e,
      t
    ]), tt());
  }
}
const fo = Symbol("_vte"), po = (e) => e.__isTeleport, ho = Symbol("_leaveCb");
function Pn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Pn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function Kr(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const bs = /* @__PURE__ */ new WeakMap();
function Jt(e, t, s, r, i = !1) {
  if (I(e)) {
    e.forEach(
      (P, k) => Jt(
        P,
        t && (I(t) ? t[k] : t),
        s,
        r,
        i
      )
    );
    return;
  }
  if (Gt(r) && !i) {
    r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && Jt(e, t, s, r.component.subTree);
    return;
  }
  const o = r.shapeFlag & 4 ? Ns(r.component) : r.el, n = i ? null : o, { i: l, r: c } = e, u = t && t.r, a = l.refs === B ? l.refs = {} : l.refs, d = l.setupState, g = W(d), m = d === B ? mr : (P) => U(g, P);
  if (u != null && u !== c) {
    if (Nn(t), ee(u))
      a[u] = null, m(u) && (d[u] = null);
    else if (fe(u)) {
      u.value = null;
      const P = t;
      P.k && (a[P.k] = null);
    }
  }
  if (q(c))
    is(c, l, 12, [n, a]);
  else {
    const P = ee(c), k = fe(c);
    if (P || k) {
      const L = () => {
        if (e.f) {
          const C = P ? m(c) ? d[c] : a[c] : c.value;
          if (i)
            I(C) && cn(C, o);
          else if (I(C))
            C.includes(o) || C.push(o);
          else if (P)
            a[c] = [o], m(c) && (d[c] = a[c]);
          else {
            const N = [o];
            c.value = N, e.k && (a[e.k] = N);
          }
        } else P ? (a[c] = n, m(c) && (d[c] = n)) : k && (c.value = n, e.k && (a[e.k] = n));
      };
      if (n) {
        const C = () => {
          L(), bs.delete(e);
        };
        C.id = -1, bs.set(e, C), Se(C, s);
      } else
        Nn(e), L();
    }
  }
}
function Nn(e) {
  const t = bs.get(e);
  t && (t.flags |= 8, bs.delete(e));
}
Cs().requestIdleCallback;
Cs().cancelIdleCallback;
const Gt = (e) => !!e.type.__asyncLoader, Jr = (e) => e.type.__isKeepAlive;
function mo(e, t) {
  Gr(e, "a", t);
}
function go(e, t) {
  Gr(e, "da", t);
}
function Gr(e, t, s = ce) {
  const r = e.__wdc || (e.__wdc = () => {
    let i = s;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return e();
  });
  if (Ms(t, r, s), s) {
    let i = s.parent;
    for (; i && i.parent; )
      Jr(i.parent.vnode) && yo(r, t, s, i), i = i.parent;
  }
}
function yo(e, t, s, r) {
  const i = Ms(
    t,
    e,
    r,
    !0
    /* prepend */
  );
  Yr(() => {
    cn(r[t], i);
  }, s);
}
function Ms(e, t, s = ce, r = !1) {
  if (s) {
    const i = s[e] || (s[e] = []), o = t.__weh || (t.__weh = (...n) => {
      et();
      const l = os(s), c = ze(t, s, e, n);
      return l(), tt(), c;
    });
    return r ? i.unshift(o) : i.push(o), o;
  }
}
const st = (e) => (t, s = ce) => {
  (!ns || e === "sp") && Ms(e, (...r) => t(...r), s);
}, vo = st("bm"), _n = st("m"), wo = st(
  "bu"
), bo = st("u"), Sn = st(
  "bum"
), Yr = st("um"), xo = st(
  "sp"
), Po = st("rtg"), _o = st("rtc");
function So(e, t = ce) {
  Ms("ec", e, t);
}
const $o = "components";
function ko(e, t) {
  return To($o, e, !0, t) || e;
}
const Eo = Symbol.for("v-ndc");
function To(e, t, s = !0, r = !1) {
  const i = ke || ce;
  if (i) {
    const o = i.type;
    {
      const l = yl(
        o,
        !1
      );
      if (l && (l === t || l === Ae(t) || l === js(Ae(t))))
        return o;
    }
    const n = (
      // local registration
      // check instance[type] first which is resolved for options API
      Rn(i[e] || o[e], t) || // global registration
      Rn(i.appContext[e], t)
    );
    return !n && r ? o : n;
  }
}
function Rn(e, t) {
  return e && (e[t] || e[Ae(t)] || e[js(Ae(t))]);
}
function Ut(e, t, s, r) {
  let i;
  const o = s, n = I(e);
  if (n || ee(e)) {
    const l = n && Ft(e);
    let c = !1, u = !1;
    l && (c = !Ce(e), u = ot(e), e = As(e)), i = new Array(e.length);
    for (let a = 0, d = e.length; a < d; a++)
      i[a] = t(
        c ? u ? gs(le(e[a])) : le(e[a]) : e[a],
        a,
        void 0,
        o
      );
  } else if (typeof e == "number") {
    i = new Array(e);
    for (let l = 0; l < e; l++)
      i[l] = t(l + 1, l, void 0, o);
  } else if (Z(e))
    if (e[Symbol.iterator])
      i = Array.from(
        e,
        (l, c) => t(l, c, void 0, o)
      );
    else {
      const l = Object.keys(e);
      i = new Array(l.length);
      for (let c = 0, u = l.length; c < u; c++) {
        const a = l[c];
        i[c] = t(e[a], a, c, o);
      }
    }
  else
    i = [];
  return i;
}
const en = (e) => e ? yi(e) ? Ns(e) : en(e.parent) : null, Yt = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ he(/* @__PURE__ */ Object.create(null), {
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
    $options: (e) => Xr(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      xn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Wr.bind(e.proxy)),
    $watch: (e) => Yo.bind(e)
  })
), Ws = (e, t) => e !== B && !e.__isScriptSetup && U(e, t), jo = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: r, data: i, props: o, accessCache: n, type: l, appContext: c } = e;
    let u;
    if (t[0] !== "$") {
      const m = n[t];
      if (m !== void 0)
        switch (m) {
          case 1:
            return r[t];
          case 2:
            return i[t];
          case 4:
            return s[t];
          case 3:
            return o[t];
        }
      else {
        if (Ws(r, t))
          return n[t] = 1, r[t];
        if (i !== B && U(i, t))
          return n[t] = 2, i[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (u = e.propsOptions[0]) && U(u, t)
        )
          return n[t] = 3, o[t];
        if (s !== B && U(s, t))
          return n[t] = 4, s[t];
        tn && (n[t] = 0);
      }
    }
    const a = Yt[t];
    let d, g;
    if (a)
      return t === "$attrs" && ue(e.attrs, "get", ""), a(e);
    if (
      // css module (injected by vue-loader)
      (d = l.__cssModules) && (d = d[t])
    )
      return d;
    if (s !== B && U(s, t))
      return n[t] = 4, s[t];
    if (
      // global properties
      g = c.config.globalProperties, U(g, t)
    )
      return g[t];
  },
  set({ _: e }, t, s) {
    const { data: r, setupState: i, ctx: o } = e;
    return Ws(i, t) ? (i[t] = s, !0) : r !== B && U(r, t) ? (r[t] = s, !0) : U(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: r, appContext: i, propsOptions: o, type: n }
  }, l) {
    let c, u;
    return !!(s[l] || e !== B && l[0] !== "$" && U(e, l) || Ws(t, l) || (c = o[0]) && U(c, l) || U(r, l) || U(Yt, l) || U(i.config.globalProperties, l) || (u = n.__cssModules) && u[l]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : U(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function qn(e) {
  return I(e) ? e.reduce(
    (t, s) => (t[s] = null, t),
    {}
  ) : e;
}
let tn = !0;
function Co(e) {
  const t = Xr(e), s = e.proxy, r = e.ctx;
  tn = !1, t.beforeCreate && Dn(t.beforeCreate, e, "bc");
  const {
    // state
    data: i,
    computed: o,
    methods: n,
    watch: l,
    provide: c,
    inject: u,
    // lifecycle
    created: a,
    beforeMount: d,
    mounted: g,
    beforeUpdate: m,
    updated: P,
    activated: k,
    deactivated: L,
    beforeDestroy: C,
    beforeUnmount: N,
    destroyed: R,
    unmounted: M,
    render: X,
    renderTracked: be,
    renderTriggered: xe,
    errorCaptured: Pe,
    serverPrefetch: bt,
    // public API
    expose: Be,
    inheritAttrs: ct,
    // assets
    components: Oe,
    directives: Ke,
    filters: xt
  } = t;
  if (u && Ao(u, r, null), n)
    for (const G in n) {
      const H = n[G];
      q(H) && (r[G] = H.bind(s));
    }
  if (i) {
    const G = i.call(s, s);
    Z(G) && (e.data = vn(G));
  }
  if (tn = !0, o)
    for (const G in o) {
      const H = o[G], Fe = q(H) ? H.bind(s, s) : q(H.get) ? H.get.bind(s, s) : Ue, _t = !q(H) && q(H.set) ? H.set.bind(s) : Ue, Ie = At({
        get: Fe,
        set: _t
      });
      Object.defineProperty(r, G, {
        enumerable: !0,
        configurable: !0,
        get: () => Ie.value,
        set: (Te) => Ie.value = Te
      });
    }
  if (l)
    for (const G in l)
      Zr(l[G], r, s, G);
  if (c) {
    const G = q(c) ? c.call(s) : c;
    Reflect.ownKeys(G).forEach((H) => {
      Ro(H, G[H]);
    });
  }
  a && Dn(a, e, "c");
  function ne(G, H) {
    I(H) ? H.forEach((Fe) => G(Fe.bind(s))) : H && G(H.bind(s));
  }
  if (ne(vo, d), ne(_n, g), ne(wo, m), ne(bo, P), ne(mo, k), ne(go, L), ne(So, Pe), ne(_o, be), ne(Po, xe), ne(Sn, N), ne(Yr, M), ne(xo, bt), I(Be))
    if (Be.length) {
      const G = e.exposed || (e.exposed = {});
      Be.forEach((H) => {
        Object.defineProperty(G, H, {
          get: () => s[H],
          set: (Fe) => s[H] = Fe,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  X && e.render === Ue && (e.render = X), ct != null && (e.inheritAttrs = ct), Oe && (e.components = Oe), Ke && (e.directives = Ke), bt && Kr(e);
}
function Ao(e, t, s = Ue) {
  I(e) && (e = sn(e));
  for (const r in e) {
    const i = e[r];
    let o;
    Z(i) ? "default" in i ? o = ps(
      i.from || r,
      i.default,
      !0
    ) : o = ps(i.from || r) : o = ps(i), fe(o) ? Object.defineProperty(t, r, {
      enumerable: !0,
      configurable: !0,
      get: () => o.value,
      set: (n) => o.value = n
    }) : t[r] = o;
  }
}
function Dn(e, t, s) {
  ze(
    I(e) ? e.map((r) => r.bind(t.proxy)) : e.bind(t.proxy),
    t,
    s
  );
}
function Zr(e, t, s, r) {
  let i = r.includes(".") ? fi(s, r) : () => s[r];
  if (ee(e)) {
    const o = t[e];
    q(o) && Zt(i, o);
  } else if (q(e))
    Zt(i, e.bind(s));
  else if (Z(e))
    if (I(e))
      e.forEach((o) => Zr(o, t, s, r));
    else {
      const o = q(e.handler) ? e.handler.bind(s) : t[e.handler];
      q(o) && Zt(i, o, e);
    }
}
function Xr(e) {
  const t = e.type, { mixins: s, extends: r } = t, {
    mixins: i,
    optionsCache: o,
    config: { optionMergeStrategies: n }
  } = e.appContext, l = o.get(t);
  let c;
  return l ? c = l : !i.length && !s && !r ? c = t : (c = {}, i.length && i.forEach(
    (u) => xs(c, u, n, !0)
  ), xs(c, t, n)), Z(t) && o.set(t, c), c;
}
function xs(e, t, s, r = !1) {
  const { mixins: i, extends: o } = t;
  o && xs(e, o, s, !0), i && i.forEach(
    (n) => xs(e, n, s, !0)
  );
  for (const n in t)
    if (!(r && n === "expose")) {
      const l = Oo[n] || s && s[n];
      e[n] = l ? l(e[n], t[n]) : t[n];
    }
  return e;
}
const Oo = {
  data: Hn,
  props: Ln,
  emits: Ln,
  // objects
  methods: Vt,
  computed: Vt,
  // lifecycle
  beforeCreate: de,
  created: de,
  beforeMount: de,
  mounted: de,
  beforeUpdate: de,
  updated: de,
  beforeDestroy: de,
  beforeUnmount: de,
  destroyed: de,
  unmounted: de,
  activated: de,
  deactivated: de,
  errorCaptured: de,
  serverPrefetch: de,
  // assets
  components: Vt,
  directives: Vt,
  // watch
  watch: Fo,
  // provide / inject
  provide: Hn,
  inject: Mo
};
function Hn(e, t) {
  return t ? e ? function() {
    return he(
      q(e) ? e.call(this, this) : e,
      q(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Mo(e, t) {
  return Vt(sn(e), sn(t));
}
function sn(e) {
  if (I(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++)
      t[e[s]] = e[s];
    return t;
  }
  return e;
}
function de(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Vt(e, t) {
  return e ? he(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Ln(e, t) {
  return e ? I(e) && I(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : he(
    /* @__PURE__ */ Object.create(null),
    qn(e),
    qn(t ?? {})
  ) : t;
}
function Fo(e, t) {
  if (!e) return t;
  if (!t) return e;
  const s = he(/* @__PURE__ */ Object.create(null), e);
  for (const r in t)
    s[r] = de(e[r], t[r]);
  return s;
}
function Qr() {
  return {
    app: null,
    config: {
      isNativeTag: mr,
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
let Io = 0;
function No(e, t) {
  return function(r, i = null) {
    q(r) || (r = he({}, r)), i != null && !Z(i) && (i = null);
    const o = Qr(), n = /* @__PURE__ */ new WeakSet(), l = [];
    let c = !1;
    const u = o.app = {
      _uid: Io++,
      _component: r,
      _props: i,
      _container: null,
      _context: o,
      _instance: null,
      version: wl,
      get config() {
        return o.config;
      },
      set config(a) {
      },
      use(a, ...d) {
        return n.has(a) || (a && q(a.install) ? (n.add(a), a.install(u, ...d)) : q(a) && (n.add(a), a(u, ...d))), u;
      },
      mixin(a) {
        return o.mixins.includes(a) || o.mixins.push(a), u;
      },
      component(a, d) {
        return d ? (o.components[a] = d, u) : o.components[a];
      },
      directive(a, d) {
        return d ? (o.directives[a] = d, u) : o.directives[a];
      },
      mount(a, d, g) {
        if (!c) {
          const m = u._ceVNode || Ve(r, i);
          return m.appContext = o, g === !0 ? g = "svg" : g === !1 && (g = void 0), e(m, a, g), c = !0, u._container = a, a.__vue_app__ = u, Ns(m.component);
        }
      },
      onUnmount(a) {
        l.push(a);
      },
      unmount() {
        c && (ze(
          l,
          u._instance,
          16
        ), e(null, u._container), delete u._container.__vue_app__);
      },
      provide(a, d) {
        return o.provides[a] = d, u;
      },
      runWithContext(a) {
        const d = Nt;
        Nt = u;
        try {
          return a();
        } finally {
          Nt = d;
        }
      }
    };
    return u;
  };
}
let Nt = null;
function Ro(e, t) {
  if (ce) {
    let s = ce.provides;
    const r = ce.parent && ce.parent.provides;
    r === s && (s = ce.provides = Object.create(r)), s[e] = t;
  }
}
function ps(e, t, s = !1) {
  const r = dl();
  if (r || Nt) {
    let i = Nt ? Nt._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
    if (i && e in i)
      return i[e];
    if (arguments.length > 1)
      return s && q(t) ? t.call(r && r.proxy) : t;
  }
}
const ei = {}, ti = () => Object.create(ei), si = (e) => Object.getPrototypeOf(e) === ei;
function qo(e, t, s, r = !1) {
  const i = {}, o = ti();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), ni(e, t, i, o);
  for (const n in e.propsOptions[0])
    n in i || (i[n] = void 0);
  s ? e.props = r ? i : Zi(i) : e.type.props ? e.props = i : e.props = o, e.attrs = o;
}
function Do(e, t, s, r) {
  const {
    props: i,
    attrs: o,
    vnode: { patchFlag: n }
  } = e, l = W(i), [c] = e.propsOptions;
  let u = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (r || n > 0) && !(n & 16)
  ) {
    if (n & 8) {
      const a = e.vnode.dynamicProps;
      for (let d = 0; d < a.length; d++) {
        let g = a[d];
        if (Fs(e.emitsOptions, g))
          continue;
        const m = t[g];
        if (c)
          if (U(o, g))
            m !== o[g] && (o[g] = m, u = !0);
          else {
            const P = Ae(g);
            i[P] = nn(
              c,
              l,
              P,
              m,
              e,
              !1
            );
          }
        else
          m !== o[g] && (o[g] = m, u = !0);
      }
    }
  } else {
    ni(e, t, i, o) && (u = !0);
    let a;
    for (const d in l)
      (!t || // for camelCase
      !U(t, d) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((a = ut(d)) === d || !U(t, a))) && (c ? s && // for camelCase
      (s[d] !== void 0 || // for kebab-case
      s[a] !== void 0) && (i[d] = nn(
        c,
        l,
        d,
        void 0,
        e,
        !0
      )) : delete i[d]);
    if (o !== l)
      for (const d in o)
        (!t || !U(t, d)) && (delete o[d], u = !0);
  }
  u && Ye(e.attrs, "set", "");
}
function ni(e, t, s, r) {
  const [i, o] = e.propsOptions;
  let n = !1, l;
  if (t)
    for (let c in t) {
      if (zt(c))
        continue;
      const u = t[c];
      let a;
      i && U(i, a = Ae(c)) ? !o || !o.includes(a) ? s[a] = u : (l || (l = {}))[a] = u : Fs(e.emitsOptions, c) || (!(c in r) || u !== r[c]) && (r[c] = u, n = !0);
    }
  if (o) {
    const c = W(s), u = l || B;
    for (let a = 0; a < o.length; a++) {
      const d = o[a];
      s[d] = nn(
        i,
        c,
        d,
        u[d],
        e,
        !U(u, d)
      );
    }
  }
  return n;
}
function nn(e, t, s, r, i, o) {
  const n = e[s];
  if (n != null) {
    const l = U(n, "default");
    if (l && r === void 0) {
      const c = n.default;
      if (n.type !== Function && !n.skipFactory && q(c)) {
        const { propsDefaults: u } = i;
        if (s in u)
          r = u[s];
        else {
          const a = os(i);
          r = u[s] = c.call(
            null,
            t
          ), a();
        }
      } else
        r = c;
      i.ce && i.ce._setProp(s, r);
    }
    n[
      0
      /* shouldCast */
    ] && (o && !l ? r = !1 : n[
      1
      /* shouldCastTrue */
    ] && (r === "" || r === ut(s)) && (r = !0));
  }
  return r;
}
const Ho = /* @__PURE__ */ new WeakMap();
function ri(e, t, s = !1) {
  const r = s ? Ho : t.propsCache, i = r.get(e);
  if (i)
    return i;
  const o = e.props, n = {}, l = [];
  let c = !1;
  if (!q(e)) {
    const a = (d) => {
      c = !0;
      const [g, m] = ri(d, t, !0);
      he(n, g), m && l.push(...m);
    };
    !s && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  if (!o && !c)
    return Z(e) && r.set(e, Ot), Ot;
  if (I(o))
    for (let a = 0; a < o.length; a++) {
      const d = Ae(o[a]);
      Wn(d) && (n[d] = B);
    }
  else if (o)
    for (const a in o) {
      const d = Ae(a);
      if (Wn(d)) {
        const g = o[a], m = n[d] = I(g) || q(g) ? { type: g } : he({}, g), P = m.type;
        let k = !1, L = !0;
        if (I(P))
          for (let C = 0; C < P.length; ++C) {
            const N = P[C], R = q(N) && N.name;
            if (R === "Boolean") {
              k = !0;
              break;
            } else R === "String" && (L = !1);
          }
        else
          k = q(P) && P.name === "Boolean";
        m[
          0
          /* shouldCast */
        ] = k, m[
          1
          /* shouldCastTrue */
        ] = L, (k || U(m, "default")) && l.push(d);
      }
    }
  const u = [n, l];
  return Z(e) && r.set(e, u), u;
}
function Wn(e) {
  return e[0] !== "$" && !zt(e);
}
const $n = (e) => e === "_" || e === "_ctx" || e === "$stable", kn = (e) => I(e) ? e.map(We) : [We(e)], Lo = (e, t, s) => {
  if (t._n)
    return t;
  const r = uo((...i) => kn(t(...i)), s);
  return r._c = !1, r;
}, ii = (e, t, s) => {
  const r = e._ctx;
  for (const i in e) {
    if ($n(i)) continue;
    const o = e[i];
    if (q(o))
      t[i] = Lo(i, o, r);
    else if (o != null) {
      const n = kn(o);
      t[i] = () => n;
    }
  }
}, oi = (e, t) => {
  const s = kn(t);
  e.slots.default = () => s;
}, li = (e, t, s) => {
  for (const r in t)
    (s || !$n(r)) && (e[r] = t[r]);
}, Wo = (e, t, s) => {
  const r = e.slots = ti();
  if (e.vnode.shapeFlag & 32) {
    const i = t._;
    i ? (li(r, t, s), s && br(r, "_", i, !0)) : ii(t, r);
  } else t && oi(e, t);
}, Uo = (e, t, s) => {
  const { vnode: r, slots: i } = e;
  let o = !0, n = B;
  if (r.shapeFlag & 32) {
    const l = t._;
    l ? s && l === 1 ? o = !1 : li(i, t, s) : (o = !t.$stable, ii(t, i)), n = t;
  } else t && (oi(e, t), n = { default: 1 });
  if (o)
    for (const l in i)
      !$n(l) && n[l] == null && delete i[l];
}, Se = rl;
function Vo(e) {
  return zo(e);
}
function zo(e, t) {
  const s = Cs();
  s.__VUE__ = !0;
  const {
    insert: r,
    remove: i,
    patchProp: o,
    createElement: n,
    createText: l,
    createComment: c,
    setText: u,
    setElementText: a,
    parentNode: d,
    nextSibling: g,
    setScopeId: m = Ue,
    insertStaticContent: P
  } = e, k = (f, p, h, b = null, y = null, v = null, T = void 0, E = null, S = !!p.dynamicChildren) => {
    if (f === p)
      return;
    f && !Wt(f, p) && (b = ft(f), Te(f, y, v, !0), f = null), p.patchFlag === -2 && (S = !1, p.dynamicChildren = null);
    const { type: x, ref: O, shapeFlag: j } = p;
    switch (x) {
      case Is:
        L(f, p, h, b);
        break;
      case lt:
        C(f, p, h, b);
        break;
      case Vs:
        f == null && N(p, h, b, T);
        break;
      case ve:
        Oe(
          f,
          p,
          h,
          b,
          y,
          v,
          T,
          E,
          S
        );
        break;
      default:
        j & 1 ? X(
          f,
          p,
          h,
          b,
          y,
          v,
          T,
          E,
          S
        ) : j & 6 ? Ke(
          f,
          p,
          h,
          b,
          y,
          v,
          T,
          E,
          S
        ) : (j & 64 || j & 128) && x.process(
          f,
          p,
          h,
          b,
          y,
          v,
          T,
          E,
          S,
          $
        );
    }
    O != null && y ? Jt(O, f && f.ref, v, p || f, !p) : O == null && f && f.ref != null && Jt(f.ref, null, v, f, !0);
  }, L = (f, p, h, b) => {
    if (f == null)
      r(
        p.el = l(p.children),
        h,
        b
      );
    else {
      const y = p.el = f.el;
      p.children !== f.children && u(y, p.children);
    }
  }, C = (f, p, h, b) => {
    f == null ? r(
      p.el = c(p.children || ""),
      h,
      b
    ) : p.el = f.el;
  }, N = (f, p, h, b) => {
    [f.el, f.anchor] = P(
      f.children,
      p,
      h,
      b,
      f.el,
      f.anchor
    );
  }, R = ({ el: f, anchor: p }, h, b) => {
    let y;
    for (; f && f !== p; )
      y = g(f), r(f, h, b), f = y;
    r(p, h, b);
  }, M = ({ el: f, anchor: p }) => {
    let h;
    for (; f && f !== p; )
      h = g(f), i(f), f = h;
    i(p);
  }, X = (f, p, h, b, y, v, T, E, S) => {
    p.type === "svg" ? T = "svg" : p.type === "math" && (T = "mathml"), f == null ? be(
      p,
      h,
      b,
      y,
      v,
      T,
      E,
      S
    ) : bt(
      f,
      p,
      y,
      v,
      T,
      E,
      S
    );
  }, be = (f, p, h, b, y, v, T, E) => {
    let S, x;
    const { props: O, shapeFlag: j, transition: A, dirs: F } = f;
    if (S = f.el = n(
      f.type,
      v,
      O && O.is,
      O
    ), j & 8 ? a(S, f.children) : j & 16 && Pe(
      f.children,
      S,
      null,
      b,
      y,
      Us(f, v),
      T,
      E
    ), F && dt(f, null, b, "created"), xe(S, f, f.scopeId, T, b), O) {
      for (const K in O)
        K !== "value" && !zt(K) && o(S, K, null, O[K], v, b);
      "value" in O && o(S, "value", null, O.value, v), (x = O.onVnodeBeforeMount) && He(x, b, f);
    }
    F && dt(f, null, b, "beforeMount");
    const D = Bo(y, A);
    D && A.beforeEnter(S), r(S, p, h), ((x = O && O.onVnodeMounted) || D || F) && Se(() => {
      x && He(x, b, f), D && A.enter(S), F && dt(f, null, b, "mounted");
    }, y);
  }, xe = (f, p, h, b, y) => {
    if (h && m(f, h), b)
      for (let v = 0; v < b.length; v++)
        m(f, b[v]);
    if (y) {
      let v = y.subTree;
      if (p === v || pi(v.type) && (v.ssContent === p || v.ssFallback === p)) {
        const T = y.vnode;
        xe(
          f,
          T,
          T.scopeId,
          T.slotScopeIds,
          y.parent
        );
      }
    }
  }, Pe = (f, p, h, b, y, v, T, E, S = 0) => {
    for (let x = S; x < f.length; x++) {
      const O = f[x] = E ? rt(f[x]) : We(f[x]);
      k(
        null,
        O,
        p,
        h,
        b,
        y,
        v,
        T,
        E
      );
    }
  }, bt = (f, p, h, b, y, v, T) => {
    const E = p.el = f.el;
    let { patchFlag: S, dynamicChildren: x, dirs: O } = p;
    S |= f.patchFlag & 16;
    const j = f.props || B, A = p.props || B;
    let F;
    if (h && pt(h, !1), (F = A.onVnodeBeforeUpdate) && He(F, h, p, f), O && dt(p, f, h, "beforeUpdate"), h && pt(h, !0), (j.innerHTML && A.innerHTML == null || j.textContent && A.textContent == null) && a(E, ""), x ? Be(
      f.dynamicChildren,
      x,
      E,
      h,
      b,
      Us(p, y),
      v
    ) : T || H(
      f,
      p,
      E,
      null,
      h,
      b,
      Us(p, y),
      v,
      !1
    ), S > 0) {
      if (S & 16)
        ct(E, j, A, h, y);
      else if (S & 2 && j.class !== A.class && o(E, "class", null, A.class, y), S & 4 && o(E, "style", j.style, A.style, y), S & 8) {
        const D = p.dynamicProps;
        for (let K = 0; K < D.length; K++) {
          const V = D[K], me = j[V], ge = A[V];
          (ge !== me || V === "value") && o(E, V, me, ge, y, h);
        }
      }
      S & 1 && f.children !== p.children && a(E, p.children);
    } else !T && x == null && ct(E, j, A, h, y);
    ((F = A.onVnodeUpdated) || O) && Se(() => {
      F && He(F, h, p, f), O && dt(p, f, h, "updated");
    }, b);
  }, Be = (f, p, h, b, y, v, T) => {
    for (let E = 0; E < p.length; E++) {
      const S = f[E], x = p[E], O = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        S.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (S.type === ve || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Wt(S, x) || // - In the case of a component, it could contain anything.
        S.shapeFlag & 198) ? d(S.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          h
        )
      );
      k(
        S,
        x,
        O,
        null,
        b,
        y,
        v,
        T,
        !0
      );
    }
  }, ct = (f, p, h, b, y) => {
    if (p !== h) {
      if (p !== B)
        for (const v in p)
          !zt(v) && !(v in h) && o(
            f,
            v,
            p[v],
            null,
            y,
            b
          );
      for (const v in h) {
        if (zt(v)) continue;
        const T = h[v], E = p[v];
        T !== E && v !== "value" && o(f, v, E, T, y, b);
      }
      "value" in h && o(f, "value", p.value, h.value, y);
    }
  }, Oe = (f, p, h, b, y, v, T, E, S) => {
    const x = p.el = f ? f.el : l(""), O = p.anchor = f ? f.anchor : l("");
    let { patchFlag: j, dynamicChildren: A, slotScopeIds: F } = p;
    F && (E = E ? E.concat(F) : F), f == null ? (r(x, h, b), r(O, h, b), Pe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      p.children || [],
      h,
      O,
      y,
      v,
      T,
      E,
      S
    )) : j > 0 && j & 64 && A && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    f.dynamicChildren ? (Be(
      f.dynamicChildren,
      A,
      h,
      y,
      v,
      T,
      E
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (p.key != null || y && p === y.subTree) && ai(
      f,
      p,
      !0
      /* shallow */
    )) : H(
      f,
      p,
      h,
      O,
      y,
      v,
      T,
      E,
      S
    );
  }, Ke = (f, p, h, b, y, v, T, E, S) => {
    p.slotScopeIds = E, f == null ? p.shapeFlag & 512 ? y.ctx.activate(
      p,
      h,
      b,
      T,
      S
    ) : xt(
      p,
      h,
      b,
      y,
      v,
      T,
      S
    ) : Pt(f, p, S);
  }, xt = (f, p, h, b, y, v, T) => {
    const E = f.component = fl(
      f,
      b,
      y
    );
    if (Jr(f) && (E.ctx.renderer = $), pl(E, !1, T), E.asyncDep) {
      if (y && y.registerDep(E, ne, T), !f.el) {
        const S = E.subTree = Ve(lt);
        C(null, S, p, h), f.placeholder = S.el;
      }
    } else
      ne(
        E,
        f,
        p,
        h,
        y,
        v,
        T
      );
  }, Pt = (f, p, h) => {
    const b = p.component = f.component;
    if (sl(f, p, h))
      if (b.asyncDep && !b.asyncResolved) {
        G(b, p, h);
        return;
      } else
        b.next = p, b.update();
    else
      p.el = f.el, b.vnode = p;
  }, ne = (f, p, h, b, y, v, T) => {
    const E = () => {
      if (f.isMounted) {
        let { next: j, bu: A, u: F, parent: D, vnode: K } = f;
        {
          const qe = ui(f);
          if (qe) {
            j && (j.el = K.el, G(f, j, T)), qe.asyncDep.then(() => {
              f.isUnmounted || E();
            });
            return;
          }
        }
        let V = j, me;
        pt(f, !1), j ? (j.el = K.el, G(f, j, T)) : j = K, A && ds(A), (me = j.props && j.props.onVnodeBeforeUpdate) && He(me, D, j, K), pt(f, !0);
        const ge = Vn(f), Re = f.subTree;
        f.subTree = ge, k(
          Re,
          ge,
          // parent may have changed if it's in a teleport
          d(Re.el),
          // anchor may have changed if it's in a fragment
          ft(Re),
          f,
          y,
          v
        ), j.el = ge.el, V === null && nl(f, ge.el), F && Se(F, y), (me = j.props && j.props.onVnodeUpdated) && Se(
          () => He(me, D, j, K),
          y
        );
      } else {
        let j;
        const { el: A, props: F } = p, { bm: D, m: K, parent: V, root: me, type: ge } = f, Re = Gt(p);
        pt(f, !1), D && ds(D), !Re && (j = F && F.onVnodeBeforeMount) && He(j, V, p), pt(f, !0);
        {
          me.ce && // @ts-expect-error _def is private
          me.ce._def.shadowRoot !== !1 && me.ce._injectChildStyle(ge);
          const qe = f.subTree = Vn(f);
          k(
            null,
            qe,
            h,
            b,
            f,
            y,
            v
          ), p.el = qe.el;
        }
        if (K && Se(K, y), !Re && (j = F && F.onVnodeMounted)) {
          const qe = p;
          Se(
            () => He(j, V, qe),
            y
          );
        }
        (p.shapeFlag & 256 || V && Gt(V.vnode) && V.vnode.shapeFlag & 256) && f.a && Se(f.a, y), f.isMounted = !0, p = h = b = null;
      }
    };
    f.scope.on();
    const S = f.effect = new Sr(E);
    f.scope.off();
    const x = f.update = S.run.bind(S), O = f.job = S.runIfDirty.bind(S);
    O.i = f, O.id = f.uid, S.scheduler = () => xn(O), pt(f, !0), x();
  }, G = (f, p, h) => {
    p.component = f;
    const b = f.vnode.props;
    f.vnode = p, f.next = null, Do(f, p.props, b, h), Uo(f, p.children, h), et(), In(f), tt();
  }, H = (f, p, h, b, y, v, T, E, S = !1) => {
    const x = f && f.children, O = f ? f.shapeFlag : 0, j = p.children, { patchFlag: A, shapeFlag: F } = p;
    if (A > 0) {
      if (A & 128) {
        _t(
          x,
          j,
          h,
          b,
          y,
          v,
          T,
          E,
          S
        );
        return;
      } else if (A & 256) {
        Fe(
          x,
          j,
          h,
          b,
          y,
          v,
          T,
          E,
          S
        );
        return;
      }
    }
    F & 8 ? (O & 16 && Ne(x, y, v), j !== x && a(h, j)) : O & 16 ? F & 16 ? _t(
      x,
      j,
      h,
      b,
      y,
      v,
      T,
      E,
      S
    ) : Ne(x, y, v, !0) : (O & 8 && a(h, ""), F & 16 && Pe(
      j,
      h,
      b,
      y,
      v,
      T,
      E,
      S
    ));
  }, Fe = (f, p, h, b, y, v, T, E, S) => {
    f = f || Ot, p = p || Ot;
    const x = f.length, O = p.length, j = Math.min(x, O);
    let A;
    for (A = 0; A < j; A++) {
      const F = p[A] = S ? rt(p[A]) : We(p[A]);
      k(
        f[A],
        F,
        h,
        null,
        y,
        v,
        T,
        E,
        S
      );
    }
    x > O ? Ne(
      f,
      y,
      v,
      !0,
      !1,
      j
    ) : Pe(
      p,
      h,
      b,
      y,
      v,
      T,
      E,
      S,
      j
    );
  }, _t = (f, p, h, b, y, v, T, E, S) => {
    let x = 0;
    const O = p.length;
    let j = f.length - 1, A = O - 1;
    for (; x <= j && x <= A; ) {
      const F = f[x], D = p[x] = S ? rt(p[x]) : We(p[x]);
      if (Wt(F, D))
        k(
          F,
          D,
          h,
          null,
          y,
          v,
          T,
          E,
          S
        );
      else
        break;
      x++;
    }
    for (; x <= j && x <= A; ) {
      const F = f[j], D = p[A] = S ? rt(p[A]) : We(p[A]);
      if (Wt(F, D))
        k(
          F,
          D,
          h,
          null,
          y,
          v,
          T,
          E,
          S
        );
      else
        break;
      j--, A--;
    }
    if (x > j) {
      if (x <= A) {
        const F = A + 1, D = F < O ? p[F].el : b;
        for (; x <= A; )
          k(
            null,
            p[x] = S ? rt(p[x]) : We(p[x]),
            h,
            D,
            y,
            v,
            T,
            E,
            S
          ), x++;
      }
    } else if (x > A)
      for (; x <= j; )
        Te(f[x], y, v, !0), x++;
    else {
      const F = x, D = x, K = /* @__PURE__ */ new Map();
      for (x = D; x <= A; x++) {
        const _e = p[x] = S ? rt(p[x]) : We(p[x]);
        _e.key != null && K.set(_e.key, x);
      }
      let V, me = 0;
      const ge = A - D + 1;
      let Re = !1, qe = 0;
      const Ht = new Array(ge);
      for (x = 0; x < ge; x++) Ht[x] = 0;
      for (x = F; x <= j; x++) {
        const _e = f[x];
        if (me >= ge) {
          Te(_e, y, v, !0);
          continue;
        }
        let De;
        if (_e.key != null)
          De = K.get(_e.key);
        else
          for (V = D; V <= A; V++)
            if (Ht[V - D] === 0 && Wt(_e, p[V])) {
              De = V;
              break;
            }
        De === void 0 ? Te(_e, y, v, !0) : (Ht[De - D] = x + 1, De >= qe ? qe = De : Re = !0, k(
          _e,
          p[De],
          h,
          null,
          y,
          v,
          T,
          E,
          S
        ), me++);
      }
      const jn = Re ? Ko(Ht) : Ot;
      for (V = jn.length - 1, x = ge - 1; x >= 0; x--) {
        const _e = D + x, De = p[_e], Cn = p[_e + 1], An = _e + 1 < O ? (
          // #13559, fallback to el placeholder for unresolved async component
          Cn.el || Cn.placeholder
        ) : b;
        Ht[x] === 0 ? k(
          null,
          De,
          h,
          An,
          y,
          v,
          T,
          E,
          S
        ) : Re && (V < 0 || x !== jn[V] ? Ie(De, h, An, 2) : V--);
      }
    }
  }, Ie = (f, p, h, b, y = null) => {
    const { el: v, type: T, transition: E, children: S, shapeFlag: x } = f;
    if (x & 6) {
      Ie(f.component.subTree, p, h, b);
      return;
    }
    if (x & 128) {
      f.suspense.move(p, h, b);
      return;
    }
    if (x & 64) {
      T.move(f, p, h, $);
      return;
    }
    if (T === ve) {
      r(v, p, h);
      for (let j = 0; j < S.length; j++)
        Ie(S[j], p, h, b);
      r(f.anchor, p, h);
      return;
    }
    if (T === Vs) {
      R(f, p, h);
      return;
    }
    if (b !== 2 && x & 1 && E)
      if (b === 0)
        E.beforeEnter(v), r(v, p, h), Se(() => E.enter(v), y);
      else {
        const { leave: j, delayLeave: A, afterLeave: F } = E, D = () => {
          f.ctx.isUnmounted ? i(v) : r(v, p, h);
        }, K = () => {
          v._isLeaving && v[ho](
            !0
            /* cancelled */
          ), j(v, () => {
            D(), F && F();
          });
        };
        A ? A(v, D, K) : K();
      }
    else
      r(v, p, h);
  }, Te = (f, p, h, b = !1, y = !1) => {
    const {
      type: v,
      props: T,
      ref: E,
      children: S,
      dynamicChildren: x,
      shapeFlag: O,
      patchFlag: j,
      dirs: A,
      cacheIndex: F
    } = f;
    if (j === -2 && (y = !1), E != null && (et(), Jt(E, null, h, f, !0), tt()), F != null && (p.renderCache[F] = void 0), O & 256) {
      p.ctx.deactivate(f);
      return;
    }
    const D = O & 1 && A, K = !Gt(f);
    let V;
    if (K && (V = T && T.onVnodeBeforeUnmount) && He(V, p, f), O & 6)
      te(f.component, h, b);
    else {
      if (O & 128) {
        f.suspense.unmount(h, b);
        return;
      }
      D && dt(f, null, p, "beforeUnmount"), O & 64 ? f.type.remove(
        f,
        p,
        h,
        $,
        b
      ) : x && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !x.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (v !== ve || j > 0 && j & 64) ? Ne(
        x,
        p,
        h,
        !1,
        !0
      ) : (v === ve && j & 384 || !y && O & 16) && Ne(S, p, h), b && ls(f);
    }
    (K && (V = T && T.onVnodeUnmounted) || D) && Se(() => {
      V && He(V, p, f), D && dt(f, null, p, "unmounted");
    }, h);
  }, ls = (f) => {
    const { type: p, el: h, anchor: b, transition: y } = f;
    if (p === ve) {
      St(h, b);
      return;
    }
    if (p === Vs) {
      M(f);
      return;
    }
    const v = () => {
      i(h), y && !y.persisted && y.afterLeave && y.afterLeave();
    };
    if (f.shapeFlag & 1 && y && !y.persisted) {
      const { leave: T, delayLeave: E } = y, S = () => T(h, v);
      E ? E(f.el, v, S) : S();
    } else
      v();
  }, St = (f, p) => {
    let h;
    for (; f !== p; )
      h = g(f), i(f), f = h;
    i(p);
  }, te = (f, p, h) => {
    const { bum: b, scope: y, job: v, subTree: T, um: E, m: S, a: x } = f;
    Un(S), Un(x), b && ds(b), y.stop(), v && (v.flags |= 8, Te(T, f, p, h)), E && Se(E, p), Se(() => {
      f.isUnmounted = !0;
    }, p);
  }, Ne = (f, p, h, b = !1, y = !1, v = 0) => {
    for (let T = v; T < f.length; T++)
      Te(f[T], p, h, b, y);
  }, ft = (f) => {
    if (f.shapeFlag & 6)
      return ft(f.component.subTree);
    if (f.shapeFlag & 128)
      return f.suspense.next();
    const p = g(f.anchor || f.el), h = p && p[fo];
    return h ? g(h) : p;
  };
  let $t = !1;
  const kt = (f, p, h) => {
    f == null ? p._vnode && Te(p._vnode, null, null, !0) : k(
      p._vnode || null,
      f,
      p,
      null,
      null,
      null,
      h
    ), p._vnode = f, $t || ($t = !0, In(), Vr(), $t = !1);
  }, $ = {
    p: k,
    um: Te,
    m: Ie,
    r: ls,
    mt: xt,
    mc: Pe,
    pc: H,
    pbc: Be,
    n: ft,
    o: e
  };
  return {
    render: kt,
    hydrate: void 0,
    createApp: No(kt)
  };
}
function Us({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function pt({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Bo(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function ai(e, t, s = !1) {
  const r = e.children, i = t.children;
  if (I(r) && I(i))
    for (let o = 0; o < r.length; o++) {
      const n = r[o];
      let l = i[o];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = i[o] = rt(i[o]), l.el = n.el), !s && l.patchFlag !== -2 && ai(n, l)), l.type === Is && // avoid cached text nodes retaining detached dom nodes
      l.patchFlag !== -1 && (l.el = n.el), l.type === lt && !l.el && (l.el = n.el);
    }
}
function Ko(e) {
  const t = e.slice(), s = [0];
  let r, i, o, n, l;
  const c = e.length;
  for (r = 0; r < c; r++) {
    const u = e[r];
    if (u !== 0) {
      if (i = s[s.length - 1], e[i] < u) {
        t[r] = i, s.push(r);
        continue;
      }
      for (o = 0, n = s.length - 1; o < n; )
        l = o + n >> 1, e[s[l]] < u ? o = l + 1 : n = l;
      u < e[s[o]] && (o > 0 && (t[r] = s[o - 1]), s[o] = r);
    }
  }
  for (o = s.length, n = s[o - 1]; o-- > 0; )
    s[o] = n, n = t[n];
  return s;
}
function ui(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : ui(t);
}
function Un(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Jo = Symbol.for("v-scx"), Go = () => ps(Jo);
function Zt(e, t, s) {
  return ci(e, t, s);
}
function ci(e, t, s = B) {
  const { immediate: r, deep: i, flush: o, once: n } = s, l = he({}, s), c = t && r || !t && o !== "post";
  let u;
  if (ns) {
    if (o === "sync") {
      const m = Go();
      u = m.__watcherHandles || (m.__watcherHandles = []);
    } else if (!c) {
      const m = () => {
      };
      return m.stop = Ue, m.resume = Ue, m.pause = Ue, m;
    }
  }
  const a = ce;
  l.call = (m, P, k) => ze(m, a, P, k);
  let d = !1;
  o === "post" ? l.scheduler = (m) => {
    Se(m, a && a.suspense);
  } : o !== "sync" && (d = !0, l.scheduler = (m, P) => {
    P ? m() : xn(m);
  }), l.augmentJob = (m) => {
    t && (m.flags |= 4), d && (m.flags |= 2, a && (m.id = a.uid, m.i = a));
  };
  const g = io(e, t, l);
  return ns && (u ? u.push(g) : c && g()), g;
}
function Yo(e, t, s) {
  const r = this.proxy, i = ee(e) ? e.includes(".") ? fi(r, e) : () => r[e] : e.bind(r, r);
  let o;
  q(t) ? o = t : (o = t.handler, s = t);
  const n = os(this), l = ci(i, o.bind(r), s);
  return n(), l;
}
function fi(e, t) {
  const s = t.split(".");
  return () => {
    let r = e;
    for (let i = 0; i < s.length && r; i++)
      r = r[s[i]];
    return r;
  };
}
const Zo = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ae(t)}Modifiers`] || e[`${ut(t)}Modifiers`];
function Xo(e, t, ...s) {
  if (e.isUnmounted) return;
  const r = e.vnode.props || B;
  let i = s;
  const o = t.startsWith("update:"), n = o && Zo(r, t.slice(7));
  n && (n.trim && (i = s.map((a) => ee(a) ? a.trim() : a)), n.number && (i = s.map(Gs)));
  let l, c = r[l = Rs(t)] || // also try camelCase event handler (#2249)
  r[l = Rs(Ae(t))];
  !c && o && (c = r[l = Rs(ut(t))]), c && ze(
    c,
    e,
    6,
    i
  );
  const u = r[l + "Once"];
  if (u) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, ze(
      u,
      e,
      6,
      i
    );
  }
}
const Qo = /* @__PURE__ */ new WeakMap();
function di(e, t, s = !1) {
  const r = s ? Qo : t.emitsCache, i = r.get(e);
  if (i !== void 0)
    return i;
  const o = e.emits;
  let n = {}, l = !1;
  if (!q(e)) {
    const c = (u) => {
      const a = di(u, t, !0);
      a && (l = !0, he(n, a));
    };
    !s && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !o && !l ? (Z(e) && r.set(e, null), null) : (I(o) ? o.forEach((c) => n[c] = null) : he(n, o), Z(e) && r.set(e, n), n);
}
function Fs(e, t) {
  return !e || !ks(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), U(e, t[0].toLowerCase() + t.slice(1)) || U(e, ut(t)) || U(e, t));
}
function Vn(e) {
  const {
    type: t,
    vnode: s,
    proxy: r,
    withProxy: i,
    propsOptions: [o],
    slots: n,
    attrs: l,
    emit: c,
    render: u,
    renderCache: a,
    props: d,
    data: g,
    setupState: m,
    ctx: P,
    inheritAttrs: k
  } = e, L = ws(e);
  let C, N;
  try {
    if (s.shapeFlag & 4) {
      const M = i || r, X = M;
      C = We(
        u.call(
          X,
          M,
          a,
          d,
          m,
          g,
          P
        )
      ), N = l;
    } else {
      const M = t;
      C = We(
        M.length > 1 ? M(
          d,
          { attrs: l, slots: n, emit: c }
        ) : M(
          d,
          null
        )
      ), N = t.props ? l : el(l);
    }
  } catch (M) {
    Xt.length = 0, Os(M, e, 1), C = Ve(lt);
  }
  let R = C;
  if (N && k !== !1) {
    const M = Object.keys(N), { shapeFlag: X } = R;
    M.length && X & 7 && (o && M.some(un) && (N = tl(
      N,
      o
    )), R = Dt(R, N, !1, !0));
  }
  return s.dirs && (R = Dt(R, null, !1, !0), R.dirs = R.dirs ? R.dirs.concat(s.dirs) : s.dirs), s.transition && Pn(R, s.transition), C = R, ws(L), C;
}
const el = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || ks(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, tl = (e, t) => {
  const s = {};
  for (const r in e)
    (!un(r) || !(r.slice(9) in t)) && (s[r] = e[r]);
  return s;
};
function sl(e, t, s) {
  const { props: r, children: i, component: o } = e, { props: n, children: l, patchFlag: c } = t, u = o.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return r ? zn(r, n, u) : !!n;
    if (c & 8) {
      const a = t.dynamicProps;
      for (let d = 0; d < a.length; d++) {
        const g = a[d];
        if (n[g] !== r[g] && !Fs(u, g))
          return !0;
      }
    }
  } else
    return (i || l) && (!l || !l.$stable) ? !0 : r === n ? !1 : r ? n ? zn(r, n, u) : !0 : !!n;
  return !1;
}
function zn(e, t, s) {
  const r = Object.keys(t);
  if (r.length !== Object.keys(e).length)
    return !0;
  for (let i = 0; i < r.length; i++) {
    const o = r[i];
    if (t[o] !== e[o] && !Fs(s, o))
      return !0;
  }
  return !1;
}
function nl({ vnode: e, parent: t }, s) {
  for (; t; ) {
    const r = t.subTree;
    if (r.suspense && r.suspense.activeBranch === e && (r.el = e.el), r === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
}
const pi = (e) => e.__isSuspense;
function rl(e, t) {
  t && t.pendingBranch ? I(e) ? t.effects.push(...e) : t.effects.push(e) : ao(e);
}
const ve = Symbol.for("v-fgt"), Is = Symbol.for("v-txt"), lt = Symbol.for("v-cmt"), Vs = Symbol.for("v-stc"), Xt = [];
let Ee = null;
function z(e = !1) {
  Xt.push(Ee = e ? null : []);
}
function il() {
  Xt.pop(), Ee = Xt[Xt.length - 1] || null;
}
let ss = 1;
function Bn(e, t = !1) {
  ss += e, e < 0 && Ee && t && (Ee.hasOnce = !0);
}
function hi(e) {
  return e.dynamicChildren = ss > 0 ? Ee || Ot : null, il(), ss > 0 && Ee && Ee.push(e), e;
}
function Y(e, t, s, r, i, o) {
  return hi(
    w(
      e,
      t,
      s,
      r,
      i,
      o,
      !0
    )
  );
}
function Ps(e, t, s, r, i) {
  return hi(
    Ve(
      e,
      t,
      s,
      r,
      i,
      !0
    )
  );
}
function mi(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Wt(e, t) {
  return e.type === t.type && e.key === t.key;
}
const gi = ({ key: e }) => e ?? null, hs = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? ee(e) || fe(e) || q(e) ? { i: ke, r: e, k: t, f: !!s } : e : null);
function w(e, t = null, s = null, r = 0, i = null, o = e === ve ? 0 : 1, n = !1, l = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && gi(t),
    ref: t && hs(t),
    scopeId: Br,
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
    patchFlag: r,
    dynamicProps: i,
    dynamicChildren: null,
    appContext: null,
    ctx: ke
  };
  return l ? (En(c, s), o & 128 && e.normalize(c)) : s && (c.shapeFlag |= ee(s) ? 8 : 16), ss > 0 && // avoid a block node from tracking itself
  !n && // has current parent block
  Ee && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && Ee.push(c), c;
}
const Ve = ol;
function ol(e, t = null, s = null, r = 0, i = null, o = !1) {
  if ((!e || e === Eo) && (e = lt), mi(e)) {
    const l = Dt(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && En(l, s), ss > 0 && !o && Ee && (l.shapeFlag & 6 ? Ee[Ee.indexOf(e)] = l : Ee.push(l)), l.patchFlag = -2, l;
  }
  if (vl(e) && (e = e.__vccOpts), t) {
    t = ll(t);
    let { class: l, style: c } = t;
    l && !ee(l) && (t.class = Xe(l)), Z(c) && (bn(c) && !I(c) && (c = he({}, c)), t.style = dn(c));
  }
  const n = ee(e) ? 1 : pi(e) ? 128 : po(e) ? 64 : Z(e) ? 4 : q(e) ? 2 : 0;
  return w(
    e,
    t,
    s,
    r,
    i,
    n,
    o,
    !0
  );
}
function ll(e) {
  return e ? bn(e) || si(e) ? he({}, e) : e : null;
}
function Dt(e, t, s = !1, r = !1) {
  const { props: i, ref: o, patchFlag: n, children: l, transition: c } = e, u = t ? al(i || {}, t) : i, a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && gi(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && o ? I(o) ? o.concat(hs(t)) : [o, hs(t)] : hs(t)
    ) : o,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== ve ? n === -1 ? 16 : n | 16 : n,
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
    ssContent: e.ssContent && Dt(e.ssContent),
    ssFallback: e.ssFallback && Dt(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return c && r && Pn(
    a,
    c.clone(a)
  ), a;
}
function ae(e = " ", t = 0) {
  return Ve(Is, null, e, t);
}
function vt(e = "", t = !1) {
  return t ? (z(), Ps(lt, null, e)) : Ve(lt, null, e);
}
function We(e) {
  return e == null || typeof e == "boolean" ? Ve(lt) : I(e) ? Ve(
    ve,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : mi(e) ? rt(e) : Ve(Is, null, String(e));
}
function rt(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : Dt(e);
}
function En(e, t) {
  let s = 0;
  const { shapeFlag: r } = e;
  if (t == null)
    t = null;
  else if (I(t))
    s = 16;
  else if (typeof t == "object")
    if (r & 65) {
      const i = t.default;
      i && (i._c && (i._d = !1), En(e, i()), i._c && (i._d = !0));
      return;
    } else {
      s = 32;
      const i = t._;
      !i && !si(t) ? t._ctx = ke : i === 3 && ke && (ke.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else q(t) ? (t = { default: t, _ctx: ke }, s = 32) : (t = String(t), r & 64 ? (s = 16, t = [ae(t)]) : s = 8);
  e.children = t, e.shapeFlag |= s;
}
function al(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const r = e[s];
    for (const i in r)
      if (i === "class")
        t.class !== r.class && (t.class = Xe([t.class, r.class]));
      else if (i === "style")
        t.style = dn([t.style, r.style]);
      else if (ks(i)) {
        const o = t[i], n = r[i];
        n && o !== n && !(I(o) && o.includes(n)) && (t[i] = o ? [].concat(o, n) : n);
      } else i !== "" && (t[i] = r[i]);
  }
  return t;
}
function He(e, t, s, r = null) {
  ze(e, t, 7, [
    s,
    r
  ]);
}
const ul = Qr();
let cl = 0;
function fl(e, t, s) {
  const r = e.type, i = (t ? t.appContext : e.appContext) || ul, o = {
    uid: cl++,
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
    scope: new Ai(
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
    propsOptions: ri(r, i),
    emitsOptions: di(r, i),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: B,
    // inheritAttrs
    inheritAttrs: r.inheritAttrs,
    // state
    ctx: B,
    data: B,
    props: B,
    attrs: B,
    slots: B,
    refs: B,
    setupState: B,
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
  return o.ctx = { _: o }, o.root = t ? t.root : o, o.emit = Xo.bind(null, o), e.ce && e.ce(o), o;
}
let ce = null;
const dl = () => ce || ke;
let _s, rn;
{
  const e = Cs(), t = (s, r) => {
    let i;
    return (i = e[s]) || (i = e[s] = []), i.push(r), (o) => {
      i.length > 1 ? i.forEach((n) => n(o)) : i[0](o);
    };
  };
  _s = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => ce = s
  ), rn = t(
    "__VUE_SSR_SETTERS__",
    (s) => ns = s
  );
}
const os = (e) => {
  const t = ce;
  return _s(e), e.scope.on(), () => {
    e.scope.off(), _s(t);
  };
}, Kn = () => {
  ce && ce.scope.off(), _s(null);
};
function yi(e) {
  return e.vnode.shapeFlag & 4;
}
let ns = !1;
function pl(e, t = !1, s = !1) {
  t && rn(t);
  const { props: r, children: i } = e.vnode, o = yi(e);
  qo(e, r, o, t), Wo(e, i, s || t);
  const n = o ? hl(e, t) : void 0;
  return t && rn(!1), n;
}
function hl(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, jo);
  const { setup: r } = s;
  if (r) {
    et();
    const i = e.setupContext = r.length > 1 ? gl(e) : null, o = os(e), n = is(
      r,
      e,
      0,
      [
        e.props,
        i
      ]
    ), l = yr(n);
    if (tt(), o(), (l || e.sp) && !Gt(e) && Kr(e), l) {
      if (n.then(Kn, Kn), t)
        return n.then((c) => {
          Jn(e, c);
        }).catch((c) => {
          Os(c, e, 0);
        });
      e.asyncDep = n;
    } else
      Jn(e, n);
  } else
    vi(e);
}
function Jn(e, t, s) {
  q(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : Z(t) && (e.setupState = Hr(t)), vi(e);
}
function vi(e, t, s) {
  const r = e.type;
  e.render || (e.render = r.render || Ue);
  {
    const i = os(e);
    et();
    try {
      Co(e);
    } finally {
      tt(), i();
    }
  }
}
const ml = {
  get(e, t) {
    return ue(e, "get", ""), e[t];
  }
};
function gl(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, ml),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Ns(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Hr(Xi(e.exposed)), {
    get(t, s) {
      if (s in t)
        return t[s];
      if (s in Yt)
        return Yt[s](e);
    },
    has(t, s) {
      return s in t || s in Yt;
    }
  })) : e.proxy;
}
function yl(e, t = !0) {
  return q(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function vl(e) {
  return q(e) && "__vccOpts" in e;
}
const At = (e, t) => no(e, t, ns), wl = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let on;
const Gn = typeof window < "u" && window.trustedTypes;
if (Gn)
  try {
    on = /* @__PURE__ */ Gn.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const wi = on ? (e) => on.createHTML(e) : (e) => e, bl = "http://www.w3.org/2000/svg", xl = "http://www.w3.org/1998/Math/MathML", Ge = typeof document < "u" ? document : null, Yn = Ge && /* @__PURE__ */ Ge.createElement("template"), Pl = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, r) => {
    const i = t === "svg" ? Ge.createElementNS(bl, e) : t === "mathml" ? Ge.createElementNS(xl, e) : s ? Ge.createElement(e, { is: s }) : Ge.createElement(e);
    return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
  },
  createText: (e) => Ge.createTextNode(e),
  createComment: (e) => Ge.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Ge.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, s, r, i, o) {
    const n = s ? s.previousSibling : t.lastChild;
    if (i && (i === o || i.nextSibling))
      for (; t.insertBefore(i.cloneNode(!0), s), !(i === o || !(i = i.nextSibling)); )
        ;
    else {
      Yn.innerHTML = wi(
        r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e
      );
      const l = Yn.content;
      if (r === "svg" || r === "mathml") {
        const c = l.firstChild;
        for (; c.firstChild; )
          l.appendChild(c.firstChild);
        l.removeChild(c);
      }
      t.insertBefore(l, s);
    }
    return [
      // first
      n ? n.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, _l = Symbol("_vtc");
function Sl(e, t, s) {
  const r = e[_l];
  r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const Zn = Symbol("_vod"), $l = Symbol("_vsh"), kl = Symbol(""), El = /(?:^|;)\s*display\s*:/;
function Tl(e, t, s) {
  const r = e.style, i = ee(s);
  let o = !1;
  if (s && !i) {
    if (t)
      if (ee(t))
        for (const n of t.split(";")) {
          const l = n.slice(0, n.indexOf(":")).trim();
          s[l] == null && ms(r, l, "");
        }
      else
        for (const n in t)
          s[n] == null && ms(r, n, "");
    for (const n in s)
      n === "display" && (o = !0), ms(r, n, s[n]);
  } else if (i) {
    if (t !== s) {
      const n = r[kl];
      n && (s += ";" + n), r.cssText = s, o = El.test(s);
    }
  } else t && e.removeAttribute("style");
  Zn in e && (e[Zn] = o ? r.display : "", e[$l] && (r.display = "none"));
}
const Xn = /\s*!important$/;
function ms(e, t, s) {
  if (I(s))
    s.forEach((r) => ms(e, t, r));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const r = jl(e, t);
    Xn.test(s) ? e.setProperty(
      ut(r),
      s.replace(Xn, ""),
      "important"
    ) : e[r] = s;
  }
}
const Qn = ["Webkit", "Moz", "ms"], zs = {};
function jl(e, t) {
  const s = zs[t];
  if (s)
    return s;
  let r = Ae(t);
  if (r !== "filter" && r in e)
    return zs[t] = r;
  r = js(r);
  for (let i = 0; i < Qn.length; i++) {
    const o = Qn[i] + r;
    if (o in e)
      return zs[t] = o;
  }
  return t;
}
const er = "http://www.w3.org/1999/xlink";
function tr(e, t, s, r, i, o = Ci(t)) {
  r && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(er, t.slice(6, t.length)) : e.setAttributeNS(er, t, s) : s == null || o && !xr(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    o ? "" : at(s) ? String(s) : s
  );
}
function sr(e, t, s, r, i) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? wi(s) : s);
    return;
  }
  const o = e.tagName;
  if (t === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const l = o === "OPTION" ? e.getAttribute("value") || "" : e.value, c = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (l !== c || !("_value" in e)) && (e.value = c), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let n = !1;
  if (s === "" || s == null) {
    const l = typeof e[t];
    l === "boolean" ? s = xr(s) : s == null && l === "string" ? (s = "", n = !0) : l === "number" && (s = 0, n = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  n && e.removeAttribute(i || t);
}
function Ct(e, t, s, r) {
  e.addEventListener(t, s, r);
}
function Cl(e, t, s, r) {
  e.removeEventListener(t, s, r);
}
const nr = Symbol("_vei");
function Al(e, t, s, r, i = null) {
  const o = e[nr] || (e[nr] = {}), n = o[t];
  if (r && n)
    n.value = r;
  else {
    const [l, c] = Ol(t);
    if (r) {
      const u = o[t] = Il(
        r,
        i
      );
      Ct(e, l, u, c);
    } else n && (Cl(e, l, n, c), o[t] = void 0);
  }
}
const rr = /(?:Once|Passive|Capture)$/;
function Ol(e) {
  let t;
  if (rr.test(e)) {
    t = {};
    let r;
    for (; r = e.match(rr); )
      e = e.slice(0, e.length - r[0].length), t[r[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : ut(e.slice(2)), t];
}
let Bs = 0;
const Ml = /* @__PURE__ */ Promise.resolve(), Fl = () => Bs || (Ml.then(() => Bs = 0), Bs = Date.now());
function Il(e, t) {
  const s = (r) => {
    if (!r._vts)
      r._vts = Date.now();
    else if (r._vts <= s.attached)
      return;
    ze(
      Nl(r, s.value),
      t,
      5,
      [r]
    );
  };
  return s.value = e, s.attached = Fl(), s;
}
function Nl(e, t) {
  if (I(t)) {
    const s = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      s.call(e), e._stopped = !0;
    }, t.map(
      (r) => (i) => !i._stopped && r && r(i)
    );
  } else
    return t;
}
const ir = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Rl = (e, t, s, r, i, o) => {
  const n = i === "svg";
  t === "class" ? Sl(e, r, n) : t === "style" ? Tl(e, s, r) : ks(t) ? un(t) || Al(e, t, s, r, o) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : ql(e, t, r, n)) ? (sr(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && tr(e, t, r, n, o, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !ee(r)) ? sr(e, Ae(t), r, o, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), tr(e, t, r, n));
};
function ql(e, t, s, r) {
  if (r)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ir(t) && q(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const i = e.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return ir(t) && ee(s) ? !1 : t in e;
}
const or = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return I(t) ? (s) => ds(t, s) : t;
};
function Dl(e) {
  e.target.composing = !0;
}
function lr(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Ks = Symbol("_assign"), Hl = {
  created(e, { modifiers: { lazy: t, trim: s, number: r } }, i) {
    e[Ks] = or(i);
    const o = r || i.props && i.props.type === "number";
    Ct(e, t ? "change" : "input", (n) => {
      if (n.target.composing) return;
      let l = e.value;
      s && (l = l.trim()), o && (l = Gs(l)), e[Ks](l);
    }), s && Ct(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Ct(e, "compositionstart", Dl), Ct(e, "compositionend", lr), Ct(e, "change", lr));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: r, trim: i, number: o } }, n) {
    if (e[Ks] = or(n), e.composing) return;
    const l = (o || e.type === "number") && !/^0\d/.test(e.value) ? Gs(e.value) : e.value, c = t ?? "";
    l !== c && (document.activeElement === e && e.type !== "range" && (r && t === s || i && e.value.trim() === c) || (e.value = c));
  }
}, Ll = ["ctrl", "shift", "alt", "meta"], Wl = {
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
  exact: (e, t) => Ll.some((s) => e[`${s}Key`] && !t.includes(s))
}, Tn = (e, t) => {
  const s = e._withMods || (e._withMods = {}), r = t.join(".");
  return s[r] || (s[r] = ((i, ...o) => {
    for (let n = 0; n < t.length; n++) {
      const l = Wl[t[n]];
      if (l && l(i, t)) return;
    }
    return e(i, ...o);
  }));
}, Ul = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Vl = (e, t) => {
  const s = e._withKeys || (e._withKeys = {}), r = t.join(".");
  return s[r] || (s[r] = ((i) => {
    if (!("key" in i))
      return;
    const o = ut(i.key);
    if (t.some(
      (n) => n === o || Ul[n] === o
    ))
      return e(i);
  }));
}, zl = /* @__PURE__ */ he({ patchProp: Rl }, Pl);
let ar;
function Bl() {
  return ar || (ar = Vo(zl));
}
const Kl = ((...e) => {
  const t = Bl().createApp(...e), { mount: s } = t;
  return t.mount = (r) => {
    const i = Gl(r);
    if (!i) return;
    const o = t._component;
    !q(o) && !o.render && !o.template && (o.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const n = s(i, !1, Jl(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), n;
  }, t;
});
function Jl(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Gl(e) {
  return ee(e) ? document.querySelector(e) : e;
}
const Yl = { class: "tree-node" }, Zl = ["title"], Xl = { class: "tree-icon" }, Ql = {
  key: 0,
  class: "tree-children"
}, ea = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
  __name: "FileTreeNode",
  props: {
    node: { type: Object, required: !0 },
    selectedPath: { type: String, default: "" }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const s = t, r = re(!0);
    return (i, o) => {
      const n = ko("FileTreeNode", !0);
      return z(), Y("div", Yl, [
        w("div", {
          class: Xe(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: o[1] || (o[1] = (l) => s("select", e.node)),
          onDblclick: o[2] || (o[2] = (l) => e.node.kind === "directory" && (r.value = !r.value))
        }, [
          w("span", {
            class: "tree-toggle",
            onClick: o[0] || (o[0] = Tn((l) => e.node.kind === "directory" && (r.value = !r.value), ["stop"]))
          }, ie(e.node.kind === "directory" ? r.value ? "⌄" : "›" : ""), 1),
          w("span", Xl, ie(e.node.kind === "directory" ? "▰" : "·"), 1),
          w("span", null, ie(e.node.name), 1)
        ], 42, Zl),
        e.node.kind === "directory" && r.value ? (z(), Y("div", Ql, [
          (z(!0), Y(ve, null, Ut(e.node.children, (l) => (z(), Ps(n, {
            key: l.path,
            node: l,
            "selected-path": e.selectedPath,
            onSelect: o[3] || (o[3] = (c) => s("select", c))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : vt("", !0)
      ]);
    };
  }
}), ta = { class: "monaco-editor-shell" }, sa = {
  key: 0,
  class: "editor-loading"
}, na = {
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
    const s = e, r = t, i = re(null), o = re(!0);
    let n, l, c, u, a = !1;
    _n(async () => {
      try {
        ({ monaco: c } = await (await import("./assets/monaco-runtime-aHqeNiN2.js").then((P) => P.jz)).configureStudioMonaco()), l = d(), n = c.editor.create(i.value, {
          model: l,
          automaticLayout: !0,
          minimap: { enabled: !1 },
          fontSize: 13,
          tabSize: 2,
          insertSpaces: !0,
          scrollBeyondLastLine: !1,
          wordWrap: "off",
          renderWhitespace: "selection",
          accessibilityPageSize: 20
        }), u = n.onDidChangeModelContent(() => {
          a || r("update:value", l.getValue());
        }), n.addCommand(c.KeyMod.CtrlCmd | c.KeyCode.KeyS, () => r("save")), o.value = !1, g(), n.focus(), r("ready");
      } catch (m) {
        o.value = !1, r("error", m);
      }
    }), Zt(() => s.value, (m) => {
      !l || l.getValue() === m || (a = !0, l.setValue(m), a = !1);
    }), Zt(() => s.markers, g, { deep: !0 }), Sn(() => {
      u?.dispose(), n?.dispose();
    });
    function d() {
      const m = c.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(s.projectId)}/${s.path}`), P = c.editor.getModel(m);
      return P ? (c.editor.setModelLanguage(P, s.language), P.getValue() !== s.value && P.setValue(s.value), P) : c.editor.createModel(s.value, s.language, m);
    }
    function g() {
      !c || !l || c.editor.setModelMarkers(l, "webwindows-manifest", s.markers.map((m) => ({
        severity: m.severity === "warning" ? c.MarkerSeverity.Warning : c.MarkerSeverity.Error,
        message: `${m.path}: ${m.message}`,
        startLineNumber: m.line || 1,
        startColumn: m.column || 1,
        endLineNumber: m.endLine || m.line || 1,
        endColumn: m.endColumn || Math.max(2, (m.column || 1) + 1)
      })));
    }
    return (m, P) => (z(), Y("div", ta, [
      w("div", {
        ref_key: "host",
        ref: i,
        class: "monaco-editor-host"
      }, null, 512),
      o.value ? (z(), Y("div", sa, "正在载入本地编辑器…")) : vt("", !0)
    ]));
  }
}, ra = { class: "manifest-inspector" }, ia = { class: "inspector-mode-tabs" }, oa = {
  key: 0,
  class: "inspector-note"
}, la = {
  key: 1,
  class: "inspector-note error"
}, aa = ["value"], ua = ["value"], ca = ["value"], fa = ["value"], da = ["value"], pa = ["value"], ha = ["value"], ma = ["value"], ga = ["value"], ya = { class: "check" }, va = ["checked"], wa = { class: "check" }, ba = ["checked"], xa = { class: "check" }, Pa = ["checked"], _a = { class: "check" }, Sa = ["checked"], $a = { class: "check" }, ka = ["checked"], Ea = { class: "inspector-summary" }, Ta = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const s = e, r = t, i = re("form"), o = At(() => s.manifest && typeof s.manifest == "object" && !Array.isArray(s.manifest));
    function n(l, c) {
      if (!o.value) return;
      const u = JSON.parse(JSON.stringify(s.manifest));
      let a = u;
      l.slice(0, -1).forEach((d) => {
        (!a[d] || typeof a[d] != "object") && (a[d] = {}), a = a[d];
      }), a[l.at(-1)] = c, r("update:manifest", u);
    }
    return (l, c) => (z(), Y("div", ra, [
      w("div", ia, [
        w("button", {
          type: "button",
          class: Xe({ active: i.value === "form" }),
          onClick: c[0] || (c[0] = (u) => i.value = "form")
        }, "表单", 2),
        w("button", {
          type: "button",
          class: Xe({ active: i.value === "json" }),
          onClick: c[1] || (c[1] = (u) => {
            i.value = "json", r("open-json");
          })
        }, "JSON", 2)
      ]),
      i.value === "json" ? (z(), Y("div", oa, [
        c[18] || (c[18] = ae(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        w("button", {
          type: "button",
          onClick: c[2] || (c[2] = (u) => r("open-json"))
        }, "打开 manifest.json")
      ])) : o.value ? (z(), Y("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: c[17] || (c[17] = Tn(() => {
        }, ["prevent"]))
      }, [
        w("label", null, [
          c[19] || (c[19] = ae("ID", -1)),
          w("input", {
            value: e.manifest.id,
            onInput: c[3] || (c[3] = (u) => n(["id"], u.target.value))
          }, null, 40, aa)
        ]),
        w("label", null, [
          c[20] || (c[20] = ae("名称", -1)),
          w("input", {
            value: e.manifest.name,
            onInput: c[4] || (c[4] = (u) => n(["name"], u.target.value))
          }, null, 40, ua)
        ]),
        w("label", null, [
          c[21] || (c[21] = ae("版本", -1)),
          w("input", {
            value: e.manifest.version,
            onInput: c[5] || (c[5] = (u) => n(["version"], u.target.value))
          }, null, 40, ca)
        ]),
        w("label", null, [
          c[22] || (c[22] = ae("描述", -1)),
          w("textarea", {
            value: e.manifest.description,
            onInput: c[6] || (c[6] = (u) => n(["description"], u.target.value))
          }, null, 40, fa)
        ]),
        w("label", null, [
          c[23] || (c[23] = ae("分类", -1)),
          w("input", {
            value: e.manifest.category,
            onInput: c[7] || (c[7] = (u) => n(["category"], u.target.value))
          }, null, 40, da)
        ]),
        w("label", null, [
          c[24] || (c[24] = ae("入口", -1)),
          w("input", {
            value: e.manifest.entry,
            onInput: c[8] || (c[8] = (u) => n(["entry"], u.target.value))
          }, null, 40, pa)
        ]),
        w("label", null, [
          c[25] || (c[25] = ae("图标", -1)),
          w("input", {
            value: e.manifest.icon,
            onInput: c[9] || (c[9] = (u) => n(["icon"], u.target.value))
          }, null, 40, ha)
        ]),
        w("fieldset", null, [
          c[29] || (c[29] = w("legend", null, "Window", -1)),
          w("label", null, [
            c[26] || (c[26] = ae("宽度", -1)),
            w("input", {
              value: e.manifest.window?.width,
              onInput: c[10] || (c[10] = (u) => n(["window", "width"], u.target.value))
            }, null, 40, ma)
          ]),
          w("label", null, [
            c[27] || (c[27] = ae("高度", -1)),
            w("input", {
              value: e.manifest.window?.height,
              onInput: c[11] || (c[11] = (u) => n(["window", "height"], u.target.value))
            }, null, 40, ga)
          ]),
          w("label", ya, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: c[12] || (c[12] = (u) => n(["window", "singleton"], u.target.checked))
            }, null, 40, va),
            c[28] || (c[28] = ae(" 单实例", -1))
          ])
        ]),
        w("fieldset", null, [
          c[34] || (c[34] = w("legend", null, "Placement", -1)),
          w("label", wa, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: c[13] || (c[13] = (u) => n(["placement", "startMenu"], u.target.checked))
            }, null, 40, ba),
            c[30] || (c[30] = ae(" 开始菜单", -1))
          ]),
          w("label", xa, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: c[14] || (c[14] = (u) => n(["placement", "allFunctions"], u.target.checked))
            }, null, 40, Pa),
            c[31] || (c[31] = ae(" 全部功能", -1))
          ]),
          w("label", _a, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: c[15] || (c[15] = (u) => n(["placement", "desktop"], u.target.checked))
            }, null, 40, Sa),
            c[32] || (c[32] = ae(" 桌面", -1))
          ]),
          w("label", $a, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: c[16] || (c[16] = (u) => n(["placement", "taskbar"], u.target.checked))
            }, null, 40, ka),
            c[33] || (c[33] = ae(" 任务栏", -1))
          ])
        ]),
        c[35] || (c[35] = w("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (z(), Y("div", la, "修复 JSON 错误后才能使用可视化表单。")),
      w("div", Ea, ie(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
};
function ja(e) {
  let t = 0;
  for (let s = 0; s < e.length; s += 1) {
    const r = e.charCodeAt(s);
    if (r >= 55296 && r <= 56319 && s + 1 < e.length) {
      const i = e.charCodeAt(s + 1);
      i >= 56320 && i <= 57343 && (s += 1);
    }
    t += 1;
  }
  return t;
}
const Ca = { properties: { type: { enum: ["application", "system"] } } }, ur = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, Aa = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, Oa = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, Ma = { properties: { status: { enum: ["published", "disabled"] } } }, $e = ja, Fa = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), Ia = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), bi = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), Na = new RegExp("^\\.[a-z0-9]+$", "u"), Ra = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), qa = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function Qe(e, { instancePath: t = "", parentData: s, parentDataProperty: r, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let n = null, l = 0;
  const c = Qe.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if ($e(e) > 240) {
      const u = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if ($e(e) < 1) {
      const u = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (!bi.test(e)) {
      const u = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      n === null ? n = [u] : n.push(u), l++;
    }
  } else {
    const u = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    n === null ? n = [u] : n.push(u), l++;
  }
  if (typeof e == "string" && !qa.test(e)) {
    const u = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    n === null ? n = [u] : n.push(u), l++;
  }
  return Qe.errors = n, l === 0;
}
Qe.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const Da = new RegExp("^[a-f0-9]{64}$", "u"), Ha = new RegExp("^/api/function-package\\.asp\\?", "u");
function Rt(e, { instancePath: t = "", parentData: s, parentDataProperty: r, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let n = null, l = 0;
  const c = Rt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.size === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.sha256 === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.entry === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.downloadUrl === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const u = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.size !== void 0) {
      let u = e.size;
      if (!(typeof u == "number" && !(u % 1) && !isNaN(u))) {
        const a = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        n === null ? n = [a] : n.push(a), l++;
      }
      if (typeof u == "number" && (u < 0 || isNaN(u))) {
        const a = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.sha256 !== void 0) {
      let u = e.sha256;
      if (typeof u == "string") {
        if (!Da.test(u)) {
          const a = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.entry !== void 0 && (Qe(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: o }) || (n = n === null ? Qe.errors : n.concat(Qe.errors), l = n.length)), e.downloadUrl !== void 0) {
      let u = e.downloadUrl;
      if (typeof u == "string") {
        if (!Ha.test(u)) {
          const a = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
  } else {
    const u = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    n === null ? n = [u] : n.push(u), l++;
  }
  return Rt.errors = n, l === 0;
}
Rt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function qt(e, { instancePath: t = "", parentData: s, parentDataProperty: r, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let n = null, l = 0;
  const c = qt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.id === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.type === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.name === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.version === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.icon === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.entry === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.install === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.placement === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.window === void 0) {
      const u = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.id !== void 0) {
      let u = e.id;
      if (typeof u == "string") {
        if ($e(u) > 160) {
          const a = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (!Fa.test(u)) {
          const a = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.legacyIds !== void 0) {
      let u = e.legacyIds;
      if (Array.isArray(u)) {
        const a = u.length;
        for (let m = 0; m < a; m++) {
          let P = u[m];
          if (typeof P == "string") {
            if ($e(P) < 1) {
              const k = { instancePath: t + "/legacyIds/" + m, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              n === null ? n = [k] : n.push(k), l++;
            }
          } else {
            const k = { instancePath: t + "/legacyIds/" + m, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            n === null ? n = [k] : n.push(k), l++;
          }
        }
        let d = u.length, g;
        if (d > 1) {
          const m = {};
          for (; d--; ) {
            let P = u[d];
            if (typeof P == "string") {
              if (typeof m[P] == "number") {
                g = m[P];
                const k = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: g }, message: "must NOT have duplicate items (items ## " + g + " and " + d + " are identical)" };
                n === null ? n = [k] : n.push(k), l++;
                break;
              }
              m[P] = d;
            }
          }
        }
      } else {
        const a = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.type !== void 0) {
      let u = e.type;
      if (!(u === "application" || u === "system")) {
        const a = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: Ca.properties.type.enum }, message: "must be equal to one of the allowed values" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.name !== void 0) {
      let u = e.name;
      if (typeof u == "string") {
        if ($e(u) < 1) {
          const a = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const u = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const u = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      n === null ? n = [u] : n.push(u), l++;
    }
    if (e.version !== void 0) {
      let u = e.version;
      if (typeof u == "string") {
        if ($e(u) > 40) {
          const a = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (!Ia.test(u)) {
          const a = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.icon !== void 0) {
      let u = e.icon;
      if (typeof u == "string") {
        if ($e(u) > 240) {
          const a = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if ($e(u) < 1) {
          const a = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (!bi.test(u)) {
          const a = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.entry !== void 0 && (Qe(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: o }) || (n = n === null ? Qe.errors : n.concat(Qe.errors), l = n.length)), e.install !== void 0) {
      let u = e.install;
      if (u && typeof u == "object" && !Array.isArray(u)) {
        if (u.defaultState === void 0) {
          const a = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.source === void 0) {
          const a = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.uninstallable === void 0) {
          const a = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.defaultState !== void 0) {
          let a = u.defaultState;
          if (!(a === "available" || a === "installed")) {
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: ur.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
        if (u.source !== void 0) {
          let a = u.source;
          if (!(a === "repository" || a === "preinstalled" || a === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: ur.properties.source.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
        if (u.uninstallable !== void 0 && typeof u.uninstallable != "boolean") {
          const a = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.placement !== void 0) {
      let u = e.placement;
      if (u && typeof u == "object" && !Array.isArray(u)) {
        if (u.desktop === void 0) {
          const a = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.startMenu === void 0) {
          const a = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.allFunctions === void 0) {
          const a = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.taskbar === void 0) {
          const a = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.desktop !== void 0 && typeof u.desktop != "boolean") {
          const a = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.startMenu !== void 0 && typeof u.startMenu != "boolean") {
          const a = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.startMenuGroup !== void 0) {
          let a = u.startMenuGroup;
          if (!(a === "user" || a === "system")) {
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: Aa.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
        if (u.startMenuOrder !== void 0) {
          let a = u.startMenuOrder;
          if (!(typeof a == "number" && !(a % 1) && !isNaN(a))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            n === null ? n = [d] : n.push(d), l++;
          }
          if (typeof a == "number" && (a < 0 || isNaN(a))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
        if (u.allFunctions !== void 0 && typeof u.allFunctions != "boolean") {
          const a = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.taskbar !== void 0 && typeof u.taskbar != "boolean") {
          const a = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.window !== void 0) {
      let u = e.window;
      if (u && typeof u == "object" && !Array.isArray(u)) {
        if (u.mode === void 0) {
          const a = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.singleton === void 0) {
          const a = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.width === void 0) {
          const a = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.height === void 0) {
          const a = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.mode !== void 0) {
          let a = u.mode;
          if (!(a === "iframe" || a === "native" || a === "shell")) {
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: Oa.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
        if (u.singleton !== void 0 && typeof u.singleton != "boolean") {
          const a = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.width !== void 0) {
          let a = u.width;
          if (typeof a == "string") {
            if ($e(a) < 1) {
              const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              n === null ? n = [d] : n.push(d), l++;
            }
          } else {
            const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
        if (u.height !== void 0) {
          let a = u.height;
          if (typeof a == "string") {
            if ($e(a) < 1) {
              const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              n === null ? n = [d] : n.push(d), l++;
            }
          } else {
            const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
        if (u.className !== void 0 && typeof u.className != "string") {
          const a = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let u = e.fileHandlers;
      if (Array.isArray(u)) {
        const a = u.length;
        for (let d = 0; d < a; d++) {
          let g = u[d];
          if (g && typeof g == "object" && !Array.isArray(g)) {
            if (g.action === void 0) {
              const m = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              n === null ? n = [m] : n.push(m), l++;
            }
            if (g.adapter === void 0) {
              const m = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              n === null ? n = [m] : n.push(m), l++;
            }
            if (g.action !== void 0) {
              let m = g.action;
              if (typeof m == "string") {
                if ($e(m) < 1) {
                  const P = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  n === null ? n = [P] : n.push(P), l++;
                }
              } else {
                const P = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                n === null ? n = [P] : n.push(P), l++;
              }
            }
            if (g.adapter !== void 0) {
              let m = g.adapter;
              if (typeof m == "string") {
                if ($e(m) < 1) {
                  const P = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  n === null ? n = [P] : n.push(P), l++;
                }
              } else {
                const P = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                n === null ? n = [P] : n.push(P), l++;
              }
            }
            if (g.extensions !== void 0) {
              let m = g.extensions;
              if (Array.isArray(m)) {
                const P = m.length;
                for (let C = 0; C < P; C++) {
                  let N = m[C];
                  if (typeof N == "string") {
                    if (!Na.test(N)) {
                      const R = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + C, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      n === null ? n = [R] : n.push(R), l++;
                    }
                  } else {
                    const R = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + C, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    n === null ? n = [R] : n.push(R), l++;
                  }
                }
                let k = m.length, L;
                if (k > 1) {
                  const C = {};
                  for (; k--; ) {
                    let N = m[k];
                    if (typeof N == "string") {
                      if (typeof C[N] == "number") {
                        L = C[N];
                        const R = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: k, j: L }, message: "must NOT have duplicate items (items ## " + L + " and " + k + " are identical)" };
                        n === null ? n = [R] : n.push(R), l++;
                        break;
                      }
                      C[N] = k;
                    }
                  }
                }
              } else {
                const P = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                n === null ? n = [P] : n.push(P), l++;
              }
            }
            if (g.mimeTypes !== void 0) {
              let m = g.mimeTypes;
              if (Array.isArray(m)) {
                const P = m.length;
                for (let C = 0; C < P; C++) {
                  let N = m[C];
                  if (typeof N == "string") {
                    if (!Ra.test(N)) {
                      const R = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + C, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      n === null ? n = [R] : n.push(R), l++;
                    }
                  } else {
                    const R = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + C, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    n === null ? n = [R] : n.push(R), l++;
                  }
                }
                let k = m.length, L;
                if (k > 1) {
                  const C = {};
                  for (; k--; ) {
                    let N = m[k];
                    if (typeof N == "string") {
                      if (typeof C[N] == "number") {
                        L = C[N];
                        const R = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: k, j: L }, message: "must NOT have duplicate items (items ## " + L + " and " + k + " are identical)" };
                        n === null ? n = [R] : n.push(R), l++;
                        break;
                      }
                      C[N] = k;
                    }
                  }
                }
              } else {
                const P = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                n === null ? n = [P] : n.push(P), l++;
              }
            }
            if (g.priority !== void 0 && typeof g.priority != "number") {
              const m = { instancePath: t + "/fileHandlers/" + d + "/priority", schemaPath: "#/$defs/fileHandler/properties/priority/type", keyword: "type", params: { type: "number" }, message: "must be number" };
              n === null ? n = [m] : n.push(m), l++;
            }
          } else {
            const m = { instancePath: t + "/fileHandlers/" + d, schemaPath: "#/$defs/fileHandler/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            n === null ? n = [m] : n.push(m), l++;
          }
        }
      } else {
        const a = { instancePath: t + "/fileHandlers", schemaPath: "#/properties/fileHandlers/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.launch !== void 0) {
      let u = e.launch;
      if (u && typeof u == "object" && !Array.isArray(u)) {
        if (u.adapter !== void 0) {
          let a = u.adapter;
          if (typeof a == "string") {
            if ($e(a) < 1) {
              const d = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              n === null ? n = [d] : n.push(d), l++;
            }
          } else {
            const d = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
      } else {
        const a = { instancePath: t + "/launch", schemaPath: "#/$defs/launch/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.catalog !== void 0) {
      let u = e.catalog;
      if (u && typeof u == "object" && !Array.isArray(u)) {
        if (u.status !== void 0) {
          let a = u.status;
          if (!(a === "published" || a === "disabled")) {
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: Ma.properties.status.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [d] : n.push(d), l++;
          }
        }
      } else {
        const a = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
    if (e.package !== void 0 && (Rt(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: i, dynamicAnchors: o }) || (n = n === null ? Rt.errors : n.concat(Rt.errors), l = n.length)), e.runtime !== void 0) {
      let u = e.runtime;
      if (u && typeof u == "object" && !Array.isArray(u)) {
        if (u.model === void 0) {
          const a = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.network === void 0) {
          const a = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.sameOrigin === void 0) {
          const a = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.model !== void 0 && u.model !== "browser-zip-sandbox-v1") {
          const a = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.network !== void 0 && u.network !== "none") {
          const a = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          n === null ? n = [a] : n.push(a), l++;
        }
        if (u.sameOrigin !== void 0 && u.sameOrigin !== !1) {
          const a = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          n === null ? n = [a] : n.push(a), l++;
        }
      } else {
        const a = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [a] : n.push(a), l++;
      }
    }
  } else {
    const u = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    n === null ? n = [u] : n.push(u), l++;
  }
  return qt.errors = n, l === 0;
}
qt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ss(e, { instancePath: t = "", parentData: s, parentDataProperty: r, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let n = null, l = 0;
  const c = Ss.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), qt(e, { instancePath: t, parentData: s, parentDataProperty: r, rootData: i, dynamicAnchors: o }) || (n = n === null ? qt.errors : n.concat(qt.errors), l = n.length), Ss.errors = n, l === 0;
}
Ss.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let Js;
async function La() {
  return Js || (Js = Wa()), Js;
}
async function Wa() {
  const e = await fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" });
  if (!e.ok) throw new Error("无法载入 Manifest v1 Schema。");
  const t = await e.json(), s = t.$defs?.sourceManifest?.properties || {}, r = Object.entries(s).filter(([, i]) => i.readOnly === !0 || i.description?.includes("Reserved") || i.description?.includes("Platform-reserved")).map(([i]) => i);
  return { schema: t, validate: Ss, reservedProperties: r };
}
async function Ua(e) {
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
        ...za(e, o.message)
      }]
    };
  }
  const { validate: s, reservedProperties: r } = await La();
  s(t);
  const i = (s.errors || []).map((o) => ({
    severity: "error",
    path: Va(o.instancePath || o.params?.missingProperty || ""),
    message: o.message || o.keyword
  }));
  return r.forEach((o) => {
    Object.prototype.hasOwnProperty.call(t, o) && i.push({
      severity: "warning",
      path: `$.${o}`,
      message: `${o} 是平台保留或发布阶段只读字段，不应由 Source Manifest 编辑。`
    });
  }), { manifest: t, diagnostics: i };
}
function Va(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const s = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(s) ? `[${s}]` : `.${s}`;
  }).join("")}` : `$.${e}` : "$";
}
function za(e, t) {
  const s = /position\s+(\d+)/i.exec(t);
  if (!s) return { line: 1, column: 1 };
  const r = Math.min(Number(s[1]), e.length), i = e.slice(0, r).split(`
`);
  return { line: i.length, column: i.at(-1).length + 1 };
}
const Ba = {
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
function Ka() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(Ba, null, 2)}
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
const cr = 240;
function we(e, t = {}) {
  const s = String(e ?? "");
  if (s.includes("\0")) throw yt("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(s)) throw yt("项目路径不能使用盘符。", e);
  const r = s.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!r) {
    if (t.allowRoot === !0) return "";
    throw yt("项目路径不能为空。", e);
  }
  if (r.startsWith("/")) throw yt("项目路径必须是相对路径。", e);
  if (r.length > cr)
    throw yt(`项目路径不能超过 ${cr} 个字符。`, e);
  const i = r.split("/");
  if (i.some((o) => !o || o === "." || o === ".."))
    throw yt("项目路径包含不安全的路径段。", e);
  return i.join("/");
}
function rs(e) {
  const t = we(e), s = t.lastIndexOf("/");
  return s < 0 ? "" : t.slice(0, s);
}
function ln(e) {
  const t = we(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function Ja(e, t) {
  const s = we(e, { allowRoot: !0 }), r = String(t ?? "");
  if (!r || r.includes("/") || r.includes("\\"))
    throw yt("文件或目录名称必须是单个安全路径段。", t);
  return we(s ? `${s}/${r}` : r);
}
function yt(e, t) {
  const s = new TypeError(e);
  return s.code = "invalid-project-path", s.value = t, s;
}
const Ga = "webwindows-developer-studio-v1", fr = 1, Ya = 1, Q = "projects", se = "files", Tt = "projectId";
class Za {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || Ga, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, !this.indexedDB) throw new Error("IndexedDB is required by Developer Studio.");
  }
  async listProjects() {
    const t = await this.open();
    return (await je(
      t.transaction(Q, "readonly").objectStore(Q).getAll()
    )).sort((r, i) => String(i.updatedAt).localeCompare(String(r.updatedAt))).map(ht);
  }
  async createProject(t = {}) {
    const s = Qa(this.crypto), r = this.now(), i = {
      uuid: s,
      displayName: pr(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: Ya,
      storageVersion: fr,
      createdAt: r,
      updatedAt: r,
      editorState: $s(t.editorState)
    }, o = Xa(t.files || [], s, r), l = (await this.open()).transaction([Q, se], "readwrite");
    l.objectStore(Q).add(i);
    const c = l.objectStore(se);
    return o.forEach((u) => c.add(u)), await mt(l), ht(i);
  }
  async getProject(t) {
    const s = await this.open(), r = await je(
      s.transaction(Q, "readonly").objectStore(Q).get(t)
    );
    if (!r) throw oe("project-not-found", "找不到项目。");
    return ht(r);
  }
  async renameProject(t, s) {
    return this.updateProject(t, (r) => {
      r.displayName = pr(s);
    });
  }
  async saveEditorState(t, s) {
    return this.updateProject(t, (r) => {
      r.editorState = $s(s);
    });
  }
  async deleteProject(t) {
    const r = (await this.open()).transaction([Q, se], "readwrite"), i = r.objectStore(Q);
    if (!await je(i.get(t))) throw oe("project-not-found", "找不到项目。");
    const n = r.objectStore(se);
    (await je(n.index(Tt).getAll(t))).forEach((c) => n.delete([t, c.path])), i.delete(t), await mt(r);
  }
  async listEntries(t) {
    await this.getProject(t);
    const s = await this.open();
    return (await je(
      s.transaction(se, "readonly").objectStore(se).index(Tt).getAll(t)
    )).sort(su).map(ht);
  }
  async readTextFile(t, s) {
    const r = await this.getEntry(t, s);
    if (r.kind !== "file") throw oe("not-a-file", "目标不是文本文件。");
    return r.content;
  }
  async writeTextFile(t, s, r) {
    const i = we(s), n = (await this.open()).transaction([Q, se], "readwrite"), l = await fs(n, t), c = n.objectStore(se), u = await je(c.get([t, i]));
    if (!u) throw oe("file-not-found", "找不到文件。");
    if (u.kind !== "file") throw oe("not-a-file", "目标不是文本文件。");
    const a = this.now();
    c.put({ ...u, content: String(r), updatedAt: a }), l.updatedAt = a, n.objectStore(Q).put(l), await mt(n);
  }
  async createFile(t, s, r = "") {
    return this.createEntry(t, s, "file", String(r));
  }
  async createDirectory(t, s) {
    return this.createEntry(t, s, "directory", void 0);
  }
  async renameEntry(t, s, r) {
    const i = we(s), o = we(r);
    if (i === o) return this.getEntry(t, i);
    if (o.startsWith(`${i}/`))
      throw oe("invalid-project-path", "目录不能移动到自身内部。");
    const l = (await this.open()).transaction([Q, se], "readwrite"), c = await fs(l, t), u = l.objectStore(se), a = await je(u.index(Tt).getAll(t)), d = a.filter((k) => k.path === i || k.path.startsWith(`${i}/`));
    if (!d.length) throw oe("entry-not-found", "找不到文件或目录。");
    await dr(a, o);
    const g = new Set(d.map((k) => k.path)), m = new Set(d.map((k) => k.path === i ? o : `${o}${k.path.slice(i.length)}`));
    if (a.some((k) => !g.has(k.path) && m.has(k.path)))
      throw oe("entry-exists", "目标路径已经存在。");
    const P = this.now();
    return d.forEach((k) => {
      const L = k.path === i ? o : `${o}${k.path.slice(i.length)}`;
      u.delete([t, k.path]), u.add({ ...k, path: L, updatedAt: P });
    }), c.editorState = eu(c.editorState, i, o), c.updatedAt = P, l.objectStore(Q).put(c), await mt(l), this.getEntry(t, o);
  }
  async deleteEntry(t, s) {
    const r = we(s), o = (await this.open()).transaction([Q, se], "readwrite"), n = await fs(o, t), l = o.objectStore(se), u = (await je(l.index(Tt).getAll(t))).filter((d) => d.path === r || d.path.startsWith(`${r}/`));
    if (!u.length) throw oe("entry-not-found", "找不到文件或目录。");
    u.forEach((d) => l.delete([t, d.path]));
    const a = this.now();
    n.editorState = tu(n.editorState, r), n.updatedAt = a, o.objectStore(Q).put(n), await mt(o);
  }
  async getEntry(t, s) {
    const r = we(s);
    await this.getProject(t);
    const i = await this.open(), o = await je(
      i.transaction(se, "readonly").objectStore(se).get([t, r])
    );
    if (!o) throw oe("entry-not-found", "找不到文件或目录。");
    return ht(o);
  }
  async close() {
    if (!this.databasePromise) return;
    (await this.databasePromise).close(), this.databasePromise = null;
  }
  async open() {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((t, s) => {
      const r = this.indexedDB.open(this.databaseName, fr);
      r.onupgradeneeded = () => {
        const i = r.result;
        i.objectStoreNames.contains(Q) || i.createObjectStore(Q, { keyPath: "uuid" }), i.objectStoreNames.contains(se) || i.createObjectStore(se, { keyPath: ["projectId", "path"] }).createIndex(Tt, "projectId", { unique: !1 });
      }, r.onsuccess = () => t(r.result), r.onerror = () => s(r.error || new Error("Developer Studio database failed to open.")), r.onblocked = () => s(new Error("Developer Studio database upgrade is blocked."));
    });
    try {
      return await this.databasePromise;
    } catch (t) {
      throw this.databasePromise = null, t;
    }
  }
  async updateProject(t, s) {
    const i = (await this.open()).transaction(Q, "readwrite"), o = i.objectStore(Q), n = await je(o.get(t));
    if (!n) throw oe("project-not-found", "找不到项目。");
    return s(n), n.updatedAt = this.now(), o.put(n), await mt(i), ht(n);
  }
  async createEntry(t, s, r, i) {
    const o = we(s), l = (await this.open()).transaction([Q, se], "readwrite"), c = await fs(l, t), u = l.objectStore(se), a = await je(u.index(Tt).getAll(t));
    if (a.some((m) => m.path === o))
      throw oe("entry-exists", "目标路径已经存在。");
    await dr(a, o);
    const d = this.now(), g = {
      projectId: t,
      path: o,
      kind: r,
      ...r === "file" ? { content: String(i ?? "") } : {},
      createdAt: d,
      updatedAt: d
    };
    return u.add(g), c.updatedAt = d, l.objectStore(Q).put(c), await mt(l), ht(g);
  }
}
function Xa(e, t, s) {
  const r = /* @__PURE__ */ new Set(), i = e.map((o) => {
    const n = we(o.path);
    if (r.has(n)) throw oe("entry-exists", `模板包含重复路径：${n}`);
    r.add(n);
    const l = o.kind === "directory" ? "directory" : "file";
    return {
      projectId: t,
      path: n,
      kind: l,
      ...l === "file" ? { content: String(o.content ?? "") } : {},
      createdAt: s,
      updatedAt: s
    };
  });
  return i.forEach((o) => {
    const n = rs(o.path);
    if (!n) return;
    const l = i.find((c) => c.path === n);
    if (!l || l.kind !== "directory")
      throw oe("parent-directory-not-found", `模板缺少父目录：${n}`);
  }), i;
}
async function fs(e, t) {
  const s = await je(e.objectStore(Q).get(t));
  if (!s) throw oe("project-not-found", "找不到项目。");
  return s;
}
async function dr(e, t) {
  const s = rs(t);
  if (!s) return;
  const r = e.find((i) => i.path === s);
  if (!r || r.kind !== "directory")
    throw oe("parent-directory-not-found", "父目录不存在。");
}
function Qa(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const s = [...t].map((r) => r.toString(16).padStart(2, "0"));
  return `${s.slice(0, 4).join("")}-${s.slice(4, 6).join("")}-${s.slice(6, 8).join("")}-${s.slice(8, 10).join("")}-${s.slice(10).join("")}`;
}
function pr(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw oe("invalid-project-name", "项目名称不能为空。");
  return t;
}
function $s(e) {
  const t = e && typeof e == "object" ? e : {}, s = (o) => [...new Set((Array.isArray(o) ? o : []).map((n) => {
    try {
      return we(n);
    } catch {
      return null;
    }
  }).filter(Boolean))], r = s(t.openFiles), i = t.activeFile ? we(t.activeFile) : r[0] || null;
  return {
    openFiles: r,
    activeFile: i,
    recentFiles: s(t.recentFiles).slice(0, 20)
  };
}
function eu(e, t, s) {
  const r = (i) => i === t || i?.startsWith(`${t}/`) ? `${s}${i.slice(t.length)}` : i;
  return $s({
    openFiles: e?.openFiles?.map(r),
    activeFile: r(e?.activeFile),
    recentFiles: e?.recentFiles?.map(r)
  });
}
function tu(e, t) {
  const s = (i) => i !== t && !i.startsWith(`${t}/`), r = (e?.openFiles || []).filter(s);
  return $s({
    openFiles: r,
    activeFile: e?.activeFile && s(e.activeFile) ? e.activeFile : r[0] || null,
    recentFiles: (e?.recentFiles || []).filter(s)
  });
}
function su(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function ht(e) {
  return structuredClone(e);
}
function je(e) {
  return new Promise((t, s) => {
    e.onsuccess = () => t(e.result), e.onerror = () => s(e.error || new Error("IndexedDB request failed."));
  });
}
function mt(e) {
  return new Promise((t, s) => {
    e.oncomplete = () => t(), e.onerror = () => s(e.error || new Error("IndexedDB transaction failed.")), e.onabort = () => s(e.error || new Error("IndexedDB transaction was aborted."));
  });
}
function oe(e, t) {
  const s = new Error(t);
  return s.code = e, s;
}
function hr(e, t) {
  return Ja(e, t);
}
function nu(e) {
  const t = [], s = /* @__PURE__ */ new Map();
  e.forEach((i) => s.set(i.path, {
    ...i,
    name: ln(i.path),
    children: []
  })), s.forEach((i) => {
    const o = rs(i.path);
    o ? s.get(o)?.children.push(i) : t.push(i);
  });
  const r = (i) => i.sort((o, n) => o.kind !== n.kind ? o.kind === "directory" ? -1 : 1 : o.name.localeCompare(n.name)).forEach((o) => r(o.children));
  return r(t), t;
}
function ru(e) {
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
const iu = { class: "developer-studio" }, ou = { class: "studio-toolbar" }, lu = ["value"], au = ["value"], uu = ["disabled"], cu = ["disabled"], fu = {
  key: 0,
  class: "studio-main"
}, du = { class: "explorer-panel" }, pu = { class: "panel-heading" }, hu = { class: "panel-actions" }, mu = ["disabled"], gu = ["disabled"], yu = { class: "file-tree" }, vu = { class: "editor-workbench" }, wu = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, bu = ["onClick"], xu = {
  key: 0,
  class: "dirty-dot"
}, Pu = { class: "editor-host" }, _u = {
  key: 1,
  class: "empty-editor"
}, Su = { class: "inspector-panel" }, $u = { class: "inspector-content" }, ku = { class: "project-uuid" }, Eu = {
  key: 1,
  class: "empty-workspace studio-main"
}, Tu = { class: "problems-panel" }, ju = { class: "panel-heading" }, Cu = {
  key: 0,
  class: "problems-empty"
}, Au = { class: "studio-dialog-actions" }, Ou = {
  class: "primary",
  type: "submit"
}, Mu = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new Za(), s = re([]), r = re(null), i = re([]), o = re(""), n = re([]), l = re(""), c = re(""), u = re(/* @__PURE__ */ new Set()), a = re(null), d = re([]), g = re(""), m = re(""), P = re(null);
    let k = null, L = 0, C = 0;
    const N = At(() => nu(i.value)), R = At(() => i.value.find(($) => $.path === l.value)), M = At(() => ru(l.value)), X = At(() => l.value === "manifest.json" ? d.value : []);
    _n(async () => {
      try {
        await be(), s.value.length && await Pe(s.value[0].uuid);
      } catch ($) {
        te($);
      }
    }), Sn(() => {
      clearTimeout(L), t.close();
    });
    async function be() {
      s.value = await t.listProjects();
    }
    async function xe() {
      try {
        await H();
        const $ = Ka(), _ = await Ne("新建 WebWindows 功能", "项目名称", $.displayName);
        if (_ == null) return;
        const f = await t.createProject({ ...$, displayName: _ });
        await be(), await Pe(f.uuid), St("Hello WebWindows 项目已创建。");
      } catch ($) {
        te($);
      }
    }
    async function Pe($) {
      if (!$) return;
      await H(), r.value = await t.getProject($), i.value = await t.listEntries($);
      const _ = r.value.editorState || {};
      n.value = (_.openFiles || []).filter((f) => i.value.some((p) => p.path === f && p.kind === "file")), l.value = i.value.some((f) => f.path === _.activeFile && f.kind === "file") ? _.activeFile : n.value[0] || "", o.value = l.value, u.value = /* @__PURE__ */ new Set(), await Ke(), await ne(), await Fe();
    }
    async function bt() {
      if (!r.value) return;
      const $ = await Ne("重命名项目", "新的项目名称", r.value.displayName);
      if ($ != null)
        try {
          r.value = await t.renameProject(r.value.uuid, $), await be(), St("项目已重命名。");
        } catch (_) {
          te(_);
        }
    }
    async function Be() {
      if (r.value && await ft("删除项目", `永久删除项目“${r.value.displayName}”及其全部文件吗？`))
        try {
          const $ = r.value.uuid;
          await t.deleteProject($), r.value = null, i.value = [], n.value = [], l.value = "", o.value = "", c.value = "", await be(), s.value.length && await Pe(s.value[0].uuid), St("项目已删除。");
        } catch ($) {
          te($);
        }
    }
    async function ct($) {
      o.value = $.path, $.kind === "file" && await Oe($.path);
    }
    async function Oe($) {
      if (!r.value) return;
      await H();
      const _ = we($);
      n.value.includes(_) || n.value.push(_), l.value = _, o.value = _, await Ke(), await Fe();
    }
    async function Ke() {
      if (!r.value || !l.value) {
        c.value = "";
        return;
      }
      c.value = await t.readTextFile(r.value.uuid, l.value), l.value === "manifest.json" && await Pt(c.value), await Wr();
    }
    function xt($) {
      c.value = $, l.value && (u.value = new Set(u.value).add(l.value), l.value === "manifest.json" && Pt($).catch(te), clearTimeout(L), L = window.setTimeout(() => H().catch(te), 700));
    }
    async function Pt($) {
      const _ = ++C, f = await Ua($);
      _ === C && (a.value = f.manifest, d.value = f.diagnostics);
    }
    async function ne() {
      if (!r.value || !i.value.some((_) => _.path === "manifest.json" && _.kind === "file")) {
        a.value = null, d.value = [];
        return;
      }
      const $ = l.value === "manifest.json" ? c.value : await t.readTextFile(r.value.uuid, "manifest.json");
      await Pt($);
    }
    async function G($) {
      l.value !== "manifest.json" && await Oe("manifest.json"), xt(`${JSON.stringify($, null, 2)}
`);
    }
    async function H() {
      if (clearTimeout(L), L = 0, !r.value || !l.value || !u.value.has(l.value)) return;
      const $ = l.value;
      await t.writeTextFile(r.value.uuid, $, c.value);
      const _ = new Set(u.value);
      _.delete($), u.value = _, r.value = await t.getProject(r.value.uuid);
    }
    async function Fe() {
      if (!r.value) return;
      const $ = [l.value, ...r.value.editorState?.recentFiles || []].filter(Boolean);
      r.value = await t.saveEditorState(r.value.uuid, {
        openFiles: n.value,
        activeFile: l.value || null,
        recentFiles: [...new Set($)].slice(0, 20)
      });
    }
    function _t() {
      const $ = i.value.find((_) => _.path === o.value);
      return $?.kind === "directory" ? $.path : $?.path ? rs($.path) : "";
    }
    async function Ie($) {
      if (!r.value) return;
      const f = await Ne($ === "directory" ? "新建目录" : "新建文件", $ === "directory" ? "目录名称" : "文件名称", $ === "directory" ? "new-folder" : "new-file.js");
      if (f != null)
        try {
          const p = hr(_t(), f);
          $ === "directory" ? await t.createDirectory(r.value.uuid, p) : await t.createFile(r.value.uuid, p, ""), i.value = await t.listEntries(r.value.uuid), o.value = p, $ === "file" && await Oe(p);
        } catch (p) {
          te(p);
        }
    }
    async function Te() {
      const $ = i.value.find((f) => f.path === o.value);
      if (!$ || !r.value) return;
      const _ = await Ne("重命名", "新的名称", ln($.path));
      if (_ != null)
        try {
          await H();
          const f = hr(rs($.path), _);
          await t.renameEntry(r.value.uuid, $.path, f), i.value = await t.listEntries(r.value.uuid), r.value = await t.getProject(r.value.uuid), n.value = r.value.editorState.openFiles, l.value = r.value.editorState.activeFile || "", o.value = f, await Ke();
        } catch (f) {
          te(f);
        }
    }
    async function ls() {
      const $ = i.value.find((_) => _.path === o.value);
      if (!(!$ || !r.value) && await ft("删除文件或目录", `删除“${$.path}”${$.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(r.value.uuid, $.path), i.value = await t.listEntries(r.value.uuid), r.value = await t.getProject(r.value.uuid), n.value = r.value.editorState.openFiles, l.value = r.value.editorState.activeFile || "", o.value = l.value, await Ke();
        } catch (_) {
          te(_);
        }
    }
    function St($) {
      g.value = $, m.value = "", window.setTimeout(() => {
        g.value === $ && (g.value = "");
      }, 2400);
    }
    function te($) {
      g.value = $?.message || "操作失败。", m.value = "error";
    }
    function Ne($, _, f) {
      return $t({ kind: "text", title: $, message: _, value: f });
    }
    function ft($, _) {
      return $t({ kind: "confirm", title: $, message: _, value: "" });
    }
    function $t($) {
      return k && k(null), P.value = { ...$ }, new Promise((_) => {
        k = _;
      });
    }
    function kt($) {
      const _ = k;
      k = null, P.value = null, _?.($);
    }
    return ($, _) => (z(), Y("main", iu, [
      w("header", ou, [
        _[12] || (_[12] = w("div", { class: "studio-brand" }, [
          w("strong", null, "Developer Studio"),
          w("span", null, "WebWindows Function IDE")
        ], -1)),
        w("button", {
          class: "primary",
          type: "button",
          onClick: xe
        }, "新建功能"),
        w("select", {
          "aria-label": "打开项目",
          value: r.value?.uuid || "",
          onChange: _[0] || (_[0] = (f) => Pe(f.target.value).catch(te))
        }, [
          _[11] || (_[11] = w("option", {
            value: "",
            disabled: ""
          }, "打开项目…", -1)),
          (z(!0), Y(ve, null, Ut(s.value, (f) => (z(), Y("option", {
            key: f.uuid,
            value: f.uuid
          }, ie(f.displayName), 9, au))), 128))
        ], 40, lu),
        w("button", {
          type: "button",
          disabled: !r.value,
          onClick: bt
        }, "重命名项目", 8, uu),
        w("button", {
          type: "button",
          disabled: !r.value,
          onClick: Be
        }, "删除项目", 8, cu),
        _[13] || (_[13] = w("span", { class: "toolbar-spacer" }, null, -1)),
        _[14] || (_[14] = w("button", {
          type: "button",
          disabled: "",
          title: "Phase 1B 提供 Run"
        }, "Run available in next phase", -1))
      ]),
      r.value ? (z(), Y("section", fu, [
        w("aside", du, [
          w("div", pu, [
            w("span", null, "Project · " + ie(r.value.displayName), 1),
            w("div", hu, [
              w("button", {
                type: "button",
                title: "新建文件",
                onClick: _[1] || (_[1] = (f) => Ie("file"))
              }, "＋F"),
              w("button", {
                type: "button",
                title: "新建目录",
                onClick: _[2] || (_[2] = (f) => Ie("directory"))
              }, "＋D"),
              w("button", {
                type: "button",
                title: "重命名",
                disabled: !o.value,
                onClick: Te
              }, "R", 8, mu),
              w("button", {
                type: "button",
                title: "删除",
                disabled: !o.value,
                onClick: ls
              }, "×", 8, gu)
            ])
          ]),
          w("div", yu, [
            (z(!0), Y(ve, null, Ut(N.value, (f) => (z(), Ps(ea, {
              key: f.path,
              node: f,
              "selected-path": o.value,
              onSelect: ct
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ]),
        w("section", vu, [
          w("nav", wu, [
            (z(!0), Y(ve, null, Ut(n.value, (f) => (z(), Y("button", {
              key: f,
              type: "button",
              class: Xe(["editor-tab", { active: f === l.value }]),
              onClick: (p) => Oe(f).catch(te)
            }, [
              w("span", null, ie(Dr(ln)(f)), 1),
              u.value.has(f) ? (z(), Y("span", xu, "•")) : vt("", !0)
            ], 10, bu))), 128))
          ]),
          w("div", Pu, [
            R.value?.kind === "file" ? (z(), Ps(na, {
              key: `${r.value.uuid}:${l.value}`,
              "project-id": r.value.uuid,
              path: l.value,
              language: M.value,
              value: c.value,
              markers: X.value,
              "onUpdate:value": xt,
              onSave: _[3] || (_[3] = (f) => H().then(() => St("已保存。")).catch(te)),
              onError: te
            }, null, 8, ["project-id", "path", "language", "value", "markers"])) : (z(), Y("div", _u, [..._[15] || (_[15] = [
              w("h2", null, "选择文件开始编辑", -1),
              w("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ])
        ]),
        w("aside", Su, [
          _[17] || (_[17] = w("div", { class: "panel-heading" }, [
            w("span", null, "Manifest / Inspector")
          ], -1)),
          w("div", $u, [
            _[16] || (_[16] = w("h2", null, "Manifest v1", -1)),
            w("p", ku, "项目 UUID：" + ie(r.value.uuid), 1),
            Ve(Ta, {
              manifest: a.value,
              diagnostics: d.value,
              "onUpdate:manifest": _[4] || (_[4] = (f) => G(f).catch(te)),
              onOpenJson: _[5] || (_[5] = (f) => Oe("manifest.json").catch(te))
            }, null, 8, ["manifest", "diagnostics"])
          ])
        ])
      ])) : (z(), Y("section", Eu, [
        _[18] || (_[18] = w("h2", null, "创建第一个 WebWindows 功能", -1)),
        _[19] || (_[19] = w("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        w("button", {
          class: "primary",
          type: "button",
          onClick: xe
        }, "新建 Hello WebWindows")
      ])),
      w("section", Tu, [
        w("div", ju, [
          _[20] || (_[20] = w("span", null, "Problems", -1)),
          w("span", null, ie(d.value.length), 1)
        ]),
        d.value.length ? vt("", !0) : (z(), Y("div", Cu, "Manifest v1 Schema 未发现问题。")),
        (z(!0), Y(ve, null, Ut(d.value, (f, p) => (z(), Y("button", {
          key: `${f.path}:${p}`,
          type: "button",
          class: "problem-row",
          onClick: _[6] || (_[6] = (h) => Oe("manifest.json").catch(te))
        }, [
          w("span", {
            class: Xe(["problem-severity", f.severity])
          }, ie(f.severity), 3),
          w("code", null, ie(f.path), 1),
          w("span", null, ie(f.message), 1)
        ]))), 128))
      ]),
      g.value ? (z(), Y("div", {
        key: 2,
        class: Xe(["studio-status", m.value]),
        role: "status"
      }, ie(g.value), 3)) : vt("", !0),
      P.value ? (z(), Y("div", {
        key: 3,
        class: "studio-dialog-backdrop",
        onKeydown: _[10] || (_[10] = Vl((f) => kt(P.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        w("form", {
          class: "studio-dialog",
          onSubmit: _[9] || (_[9] = Tn((f) => kt(P.value.kind === "confirm" ? !0 : P.value.value), ["prevent"]))
        }, [
          w("h2", null, ie(P.value.title), 1),
          w("p", null, ie(P.value.message), 1),
          P.value.kind === "text" ? co((z(), Y("input", {
            key: 0,
            "onUpdate:modelValue": _[7] || (_[7] = (f) => P.value.value = f),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [Hl, P.value.value]
          ]) : vt("", !0),
          w("div", Au, [
            w("button", {
              type: "button",
              onClick: _[8] || (_[8] = (f) => kt(P.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            w("button", Ou, ie(P.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : vt("", !0)
    ]));
  }
};
Kl(Mu).mount("#developer-studio-app");
