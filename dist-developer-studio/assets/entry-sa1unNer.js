/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function pn(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const B = {}, Ct = [], He = () => {
}, _r = () => !1, Es = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), hn = (e) => e.startsWith("onUpdate:"), me = Object.assign, mn = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, Ai = Object.prototype.hasOwnProperty, H = (e, t) => Ai.call(e, t), F = Array.isArray, Tt = (e) => Cs(e) === "[object Map]", kr = (e) => Cs(e) === "[object Set]", R = (e) => typeof e == "function", ne = (e) => typeof e == "string", pt = (e) => typeof e == "symbol", Y = (e) => e !== null && typeof e == "object", $r = (e) => (Y(e) || R(e)) && R(e.then) && R(e.catch), jr = Object.prototype.toString, Cs = (e) => jr.call(e), Oi = (e) => Cs(e).slice(8, -1), Er = (e) => Cs(e) === "[object Object]", gn = (e) => ne(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Bt = /* @__PURE__ */ pn(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ts = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((s) => t[s] || (t[s] = e(s)));
}, Mi = /-\w/g, Ee = Ts(
  (e) => e.replace(Mi, (t) => t.slice(1).toUpperCase())
), Ii = /\B([A-Z])/g, ht = Ts(
  (e) => e.replace(Ii, "-$1").toLowerCase()
), As = Ts((e) => e.charAt(0).toUpperCase() + e.slice(1)), qs = Ts(
  (e) => e ? `on${As(e)}` : ""
), ct = (e, t) => !Object.is(e, t), ms = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, Cr = (e, t, s, r = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: r,
    value: s
  });
}, Qs = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Dn;
const Os = () => Dn || (Dn = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function yn(e) {
  if (F(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const r = e[s], i = ne(r) ? Wi(r) : yn(r);
      if (i)
        for (const o in i)
          t[o] = i[o];
    }
    return t;
  } else if (ne(e) || Y(e))
    return e;
}
const Fi = /;(?![^(]*\))/g, Ri = /:([^]+)/, Ni = /\/\*[^]*?\*\//g;
function Wi(e) {
  const t = {};
  return e.replace(Ni, "").split(Fi).forEach((s) => {
    if (s) {
      const r = s.split(Ri);
      r.length > 1 && (t[r[0].trim()] = r[1].trim());
    }
  }), t;
}
function Xe(e) {
  let t = "";
  if (ne(e))
    t = e;
  else if (F(e))
    for (let s = 0; s < e.length; s++) {
      const r = Xe(e[s]);
      r && (t += r + " ");
    }
  else if (Y(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const Di = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", qi = /* @__PURE__ */ pn(Di);
function Tr(e) {
  return !!e || e === "";
}
const Ar = (e) => !!(e && e.__v_isRef === !0), G = (e) => ne(e) ? e : e == null ? "" : F(e) || Y(e) && (e.toString === jr || !R(e.toString)) ? Ar(e) ? G(e.value) : JSON.stringify(e, Or, 2) : String(e), Or = (e, t) => Ar(t) ? Or(e, t.value) : Tt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [r, i], o) => (s[Hs(r, o) + " =>"] = i, s),
    {}
  )
} : kr(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => Hs(s))
} : pt(t) ? Hs(t) : Y(t) && !F(t) && !Er(t) ? String(t) : t, Hs = (e, t = "") => {
  var s;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    pt(e) ? `Symbol(${(s = e.description) != null ? s : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let we;
class Hi {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = we, !t && we && (this.index = (we.scopes || (we.scopes = [])).push(
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
      const s = we;
      try {
        return we = this, t();
      } finally {
        we = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = we, we = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (we = this.prevScope, this.prevScope = void 0);
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
function Li() {
  return we;
}
let J;
const Ls = /* @__PURE__ */ new WeakSet();
class Mr {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, we && we.active && we.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ls.has(this) && (Ls.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Fr(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, qn(this), Rr(this);
    const t = J, s = Te;
    J = this, Te = !0;
    try {
      return this.fn();
    } finally {
      Nr(this), J = t, Te = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        bn(t);
      this.deps = this.depsTail = void 0, qn(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ls.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    en(this) && this.run();
  }
  get dirty() {
    return en(this);
  }
}
let Ir = 0, Kt, Jt;
function Fr(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Jt, Jt = e;
    return;
  }
  e.next = Kt, Kt = e;
}
function vn() {
  Ir++;
}
function wn() {
  if (--Ir > 0)
    return;
  if (Jt) {
    let t = Jt;
    for (Jt = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; Kt; ) {
    let t = Kt;
    for (Kt = void 0; t; ) {
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
function Rr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Nr(e) {
  let t, s = e.depsTail, r = s;
  for (; r; ) {
    const i = r.prevDep;
    r.version === -1 ? (r === s && (s = i), bn(r), Ui(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = i;
  }
  e.deps = t, e.depsTail = s;
}
function en(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Wr(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Wr(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === es) || (e.globalVersion = es, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !en(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = J, r = Te;
  J = e, Te = !0;
  try {
    Rr(e);
    const i = e.fn(e._value);
    (t.version === 0 || ct(i, e._value)) && (e.flags |= 128, e._value = i, t.version++);
  } catch (i) {
    throw t.version++, i;
  } finally {
    J = s, Te = r, Nr(e), e.flags &= -3;
  }
}
function bn(e, t = !1) {
  const { dep: s, prevSub: r, nextSub: i } = e;
  if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), s.subs === e && (s.subs = r, !r && s.computed)) {
    s.computed.flags &= -5;
    for (let o = s.computed.deps; o; o = o.nextDep)
      bn(o, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function Ui(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let Te = !0;
const Dr = [];
function et() {
  Dr.push(Te), Te = !1;
}
function tt() {
  const e = Dr.pop();
  Te = e === void 0 ? !0 : e;
}
function qn(e) {
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
let es = 0;
class Vi {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Pn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!J || !Te || J === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== J)
      s = this.activeLink = new Vi(J, this), J.deps ? (s.prevDep = J.depsTail, J.depsTail.nextDep = s, J.depsTail = s) : J.deps = J.depsTail = s, qr(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const r = s.nextDep;
      r.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = r), s.prevDep = J.depsTail, s.nextDep = void 0, J.depsTail.nextDep = s, J.depsTail = s, J.deps === s && (J.deps = r);
    }
    return s;
  }
  trigger(t) {
    this.version++, es++, this.notify(t);
  }
  notify(t) {
    vn();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      wn();
    }
  }
}
function qr(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let r = t.deps; r; r = r.nextDep)
        qr(r);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const tn = /* @__PURE__ */ new WeakMap(), xt = Symbol(
  ""
), sn = Symbol(
  ""
), ts = Symbol(
  ""
);
function ue(e, t, s) {
  if (Te && J) {
    let r = tn.get(e);
    r || tn.set(e, r = /* @__PURE__ */ new Map());
    let i = r.get(s);
    i || (r.set(s, i = new Pn()), i.map = r, i.key = s), i.track();
  }
}
function Ge(e, t, s, r, i, o) {
  const n = tn.get(e);
  if (!n) {
    es++;
    return;
  }
  const a = (c) => {
    c && c.trigger();
  };
  if (vn(), t === "clear")
    n.forEach(a);
  else {
    const c = F(e), l = c && gn(s);
    if (c && s === "length") {
      const u = Number(r);
      n.forEach((p, w) => {
        (w === "length" || w === ts || !pt(w) && w >= u) && a(p);
      });
    } else
      switch ((s !== void 0 || n.has(void 0)) && a(n.get(s)), l && a(n.get(ts)), t) {
        case "add":
          c ? l && a(n.get("length")) : (a(n.get(xt)), Tt(e) && a(n.get(sn)));
          break;
        case "delete":
          c || (a(n.get(xt)), Tt(e) && a(n.get(sn)));
          break;
        case "set":
          Tt(e) && a(n.get(xt));
          break;
      }
  }
  wn();
}
function $t(e) {
  const t = q(e);
  return t === e ? t : (ue(t, "iterate", ts), je(e) ? t : t.map(ae));
}
function Ms(e) {
  return ue(e = q(e), "iterate", ts), e;
}
const zi = {
  __proto__: null,
  [Symbol.iterator]() {
    return Us(this, Symbol.iterator, ae);
  },
  concat(...e) {
    return $t(this).concat(
      ...e.map((t) => F(t) ? $t(t) : t)
    );
  },
  entries() {
    return Us(this, "entries", (e) => (e[1] = ae(e[1]), e));
  },
  every(e, t) {
    return Be(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Be(this, "filter", e, t, (s) => s.map(ae), arguments);
  },
  find(e, t) {
    return Be(this, "find", e, t, ae, arguments);
  },
  findIndex(e, t) {
    return Be(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Be(this, "findLast", e, t, ae, arguments);
  },
  findLastIndex(e, t) {
    return Be(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Be(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Vs(this, "includes", e);
  },
  indexOf(...e) {
    return Vs(this, "indexOf", e);
  },
  join(e) {
    return $t(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Vs(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Be(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Lt(this, "pop");
  },
  push(...e) {
    return Lt(this, "push", e);
  },
  reduce(e, ...t) {
    return Hn(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Hn(this, "reduceRight", e, t);
  },
  shift() {
    return Lt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Be(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Lt(this, "splice", e);
  },
  toReversed() {
    return $t(this).toReversed();
  },
  toSorted(e) {
    return $t(this).toSorted(e);
  },
  toSpliced(...e) {
    return $t(this).toSpliced(...e);
  },
  unshift(...e) {
    return Lt(this, "unshift", e);
  },
  values() {
    return Us(this, "values", ae);
  }
};
function Us(e, t, s) {
  const r = Ms(e), i = r[t]();
  return r !== e && !je(e) && (i._next = i.next, i.next = () => {
    const o = i._next();
    return o.value && (o.value = s(o.value)), o;
  }), i;
}
const Bi = Array.prototype;
function Be(e, t, s, r, i, o) {
  const n = Ms(e), a = n !== e && !je(e), c = n[t];
  if (c !== Bi[t]) {
    const p = c.apply(e, o);
    return a ? ae(p) : p;
  }
  let l = s;
  n !== e && (a ? l = function(p, w) {
    return s.call(this, ae(p), w, e);
  } : s.length > 2 && (l = function(p, w) {
    return s.call(this, p, w, e);
  }));
  const u = c.call(n, l, r);
  return a && i ? i(u) : u;
}
function Hn(e, t, s, r) {
  const i = Ms(e);
  let o = s;
  return i !== e && (je(e) ? s.length > 3 && (o = function(n, a, c) {
    return s.call(this, n, a, c, e);
  }) : o = function(n, a, c) {
    return s.call(this, n, ae(a), c, e);
  }), i[t](o, ...r);
}
function Vs(e, t, s) {
  const r = q(e);
  ue(r, "iterate", ts);
  const i = r[t](...s);
  return (i === -1 || i === !1) && kn(s[0]) ? (s[0] = q(s[0]), r[t](...s)) : i;
}
function Lt(e, t, s = []) {
  et(), vn();
  const r = q(e)[t].apply(e, s);
  return wn(), tt(), r;
}
const Ki = /* @__PURE__ */ pn("__proto__,__v_isRef,__isVue"), Hr = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(pt)
);
function Ji(e) {
  pt(e) || (e = String(e));
  const t = q(this);
  return ue(t, "has", e), t.hasOwnProperty(e);
}
class Lr {
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
      return r === (i ? o ? ro : Br : o ? zr : Vr).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(r) ? t : void 0;
    const n = F(t);
    if (!i) {
      let c;
      if (n && (c = zi[s]))
        return c;
      if (s === "hasOwnProperty")
        return Ji;
    }
    const a = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      fe(t) ? t : r
    );
    return (pt(s) ? Hr.has(s) : Ki(s)) || (i || ue(t, "get", s), o) ? a : fe(a) ? n && gn(s) ? a : a.value : Y(a) ? i ? Kr(a) : Sn(a) : a;
  }
}
class Ur extends Lr {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, r, i) {
    let o = t[s];
    if (!this._isShallow) {
      const c = ft(o);
      if (!je(r) && !ft(r) && (o = q(o), r = q(r)), !F(t) && fe(o) && !fe(r))
        return c || (o.value = r), !0;
    }
    const n = F(t) && gn(s) ? Number(s) < t.length : H(t, s), a = Reflect.set(
      t,
      s,
      r,
      fe(t) ? t : i
    );
    return t === q(i) && (n ? ct(r, o) && Ge(t, "set", s, r) : Ge(t, "add", s, r)), a;
  }
  deleteProperty(t, s) {
    const r = H(t, s);
    t[s];
    const i = Reflect.deleteProperty(t, s);
    return i && r && Ge(t, "delete", s, void 0), i;
  }
  has(t, s) {
    const r = Reflect.has(t, s);
    return (!pt(s) || !Hr.has(s)) && ue(t, "has", s), r;
  }
  ownKeys(t) {
    return ue(
      t,
      "iterate",
      F(t) ? "length" : xt
    ), Reflect.ownKeys(t);
  }
}
class Gi extends Lr {
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
const Zi = /* @__PURE__ */ new Ur(), Yi = /* @__PURE__ */ new Gi(), Xi = /* @__PURE__ */ new Ur(!0);
const nn = (e) => e, cs = (e) => Reflect.getPrototypeOf(e);
function Qi(e, t, s) {
  return function(...r) {
    const i = this.__v_raw, o = q(i), n = Tt(o), a = e === "entries" || e === Symbol.iterator && n, c = e === "keys" && n, l = i[e](...r), u = s ? nn : t ? ws : ae;
    return !t && ue(
      o,
      "iterate",
      c ? sn : xt
    ), {
      // iterator protocol
      next() {
        const { value: p, done: w } = l.next();
        return w ? { value: p, done: w } : {
          value: a ? [u(p[0]), u(p[1])] : u(p),
          done: w
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function fs(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function eo(e, t) {
  const s = {
    get(i) {
      const o = this.__v_raw, n = q(o), a = q(i);
      e || (ct(i, a) && ue(n, "get", i), ue(n, "get", a));
      const { has: c } = cs(n), l = t ? nn : e ? ws : ae;
      if (c.call(n, i))
        return l(o.get(i));
      if (c.call(n, a))
        return l(o.get(a));
      o !== n && o.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !e && ue(q(i), "iterate", xt), i.size;
    },
    has(i) {
      const o = this.__v_raw, n = q(o), a = q(i);
      return e || (ct(i, a) && ue(n, "has", i), ue(n, "has", a)), i === a ? o.has(i) : o.has(i) || o.has(a);
    },
    forEach(i, o) {
      const n = this, a = n.__v_raw, c = q(a), l = t ? nn : e ? ws : ae;
      return !e && ue(c, "iterate", xt), a.forEach((u, p) => i.call(o, l(u), l(p), n));
    }
  };
  return me(
    s,
    e ? {
      add: fs("add"),
      set: fs("set"),
      delete: fs("delete"),
      clear: fs("clear")
    } : {
      add(i) {
        !t && !je(i) && !ft(i) && (i = q(i));
        const o = q(this);
        return cs(o).has.call(o, i) || (o.add(i), Ge(o, "add", i, i)), this;
      },
      set(i, o) {
        !t && !je(o) && !ft(o) && (o = q(o));
        const n = q(this), { has: a, get: c } = cs(n);
        let l = a.call(n, i);
        l || (i = q(i), l = a.call(n, i));
        const u = c.call(n, i);
        return n.set(i, o), l ? ct(o, u) && Ge(n, "set", i, o) : Ge(n, "add", i, o), this;
      },
      delete(i) {
        const o = q(this), { has: n, get: a } = cs(o);
        let c = n.call(o, i);
        c || (i = q(i), c = n.call(o, i)), a && a.call(o, i);
        const l = o.delete(i);
        return c && Ge(o, "delete", i, void 0), l;
      },
      clear() {
        const i = q(this), o = i.size !== 0, n = i.clear();
        return o && Ge(
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
    s[i] = Qi(i, e, t);
  }), s;
}
function xn(e, t) {
  const s = eo(e, t);
  return (r, i, o) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? r : Reflect.get(
    H(s, i) && i in r ? s : r,
    i,
    o
  );
}
const to = {
  get: /* @__PURE__ */ xn(!1, !1)
}, so = {
  get: /* @__PURE__ */ xn(!1, !0)
}, no = {
  get: /* @__PURE__ */ xn(!0, !1)
};
const Vr = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), Br = /* @__PURE__ */ new WeakMap(), ro = /* @__PURE__ */ new WeakMap();
function io(e) {
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
function oo(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : io(Oi(e));
}
function Sn(e) {
  return ft(e) ? e : _n(
    e,
    !1,
    Zi,
    to,
    Vr
  );
}
function ao(e) {
  return _n(
    e,
    !1,
    Xi,
    so,
    zr
  );
}
function Kr(e) {
  return _n(
    e,
    !0,
    Yi,
    no,
    Br
  );
}
function _n(e, t, s, r, i) {
  if (!Y(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const o = oo(e);
  if (o === 0)
    return e;
  const n = i.get(e);
  if (n)
    return n;
  const a = new Proxy(
    e,
    o === 2 ? r : s
  );
  return i.set(e, a), a;
}
function At(e) {
  return ft(e) ? At(e.__v_raw) : !!(e && e.__v_isReactive);
}
function ft(e) {
  return !!(e && e.__v_isReadonly);
}
function je(e) {
  return !!(e && e.__v_isShallow);
}
function kn(e) {
  return e ? !!e.__v_raw : !1;
}
function q(e) {
  const t = e && e.__v_raw;
  return t ? q(t) : e;
}
function lo(e) {
  return !H(e, "__v_skip") && Object.isExtensible(e) && Cr(e, "__v_skip", !0), e;
}
const ae = (e) => Y(e) ? Sn(e) : e, ws = (e) => Y(e) ? Kr(e) : e;
function fe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function se(e) {
  return uo(e, !1);
}
function uo(e, t) {
  return fe(e) ? e : new co(e, t);
}
class co {
  constructor(t, s) {
    this.dep = new Pn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : q(t), this._value = s ? t : ae(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, r = this.__v_isShallow || je(t) || ft(t);
    t = r ? t : q(t), ct(t, s) && (this._rawValue = t, this._value = r ? t : ae(t), this.dep.trigger());
  }
}
function Jr(e) {
  return fe(e) ? e.value : e;
}
const fo = {
  get: (e, t, s) => t === "__v_raw" ? e : Jr(Reflect.get(e, t, s)),
  set: (e, t, s, r) => {
    const i = e[t];
    return fe(i) && !fe(s) ? (i.value = s, !0) : Reflect.set(e, t, s, r);
  }
};
function Gr(e) {
  return At(e) ? e : new Proxy(e, fo);
}
class po {
  constructor(t, s, r) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new Pn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = es - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = r;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    J !== this)
      return Fr(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Wr(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function ho(e, t, s = !1) {
  let r, i;
  return R(e) ? r = e : (r = e.get, i = e.set), new po(r, i, s);
}
const ds = {}, bs = /* @__PURE__ */ new WeakMap();
let wt;
function mo(e, t = !1, s = wt) {
  if (s) {
    let r = bs.get(s);
    r || bs.set(s, r = []), r.push(e);
  }
}
function go(e, t, s = B) {
  const { immediate: r, deep: i, once: o, scheduler: n, augmentJob: a, call: c } = s, l = (A) => i ? A : je(A) || i === !1 || i === 0 ? Ze(A, 1) : Ze(A);
  let u, p, w, g, _ = !1, j = !1;
  if (fe(e) ? (p = () => e.value, _ = je(e)) : At(e) ? (p = () => l(e), _ = !0) : F(e) ? (j = !0, _ = e.some((A) => At(A) || je(A)), p = () => e.map((A) => {
    if (fe(A))
      return A.value;
    if (At(A))
      return l(A);
    if (R(A))
      return c ? c(A, 2) : A();
  })) : R(e) ? t ? p = c ? () => c(e, 2) : e : p = () => {
    if (w) {
      et();
      try {
        w();
      } finally {
        tt();
      }
    }
    const A = wt;
    wt = u;
    try {
      return c ? c(e, 3, [g]) : e(g);
    } finally {
      wt = A;
    }
  } : p = He, t && i) {
    const A = p, Q = i === !0 ? 1 / 0 : i;
    p = () => Ze(A(), Q);
  }
  const L = Li(), C = () => {
    u.stop(), L && L.active && mn(L.effects, u);
  };
  if (o && t) {
    const A = t;
    t = (...Q) => {
      A(...Q), C();
    };
  }
  let O = j ? new Array(e.length).fill(ds) : ds;
  const M = (A) => {
    if (!(!(u.flags & 1) || !u.dirty && !A))
      if (t) {
        const Q = u.run();
        if (i || _ || (j ? Q.some((Ae, ke) => ct(Ae, O[ke])) : ct(Q, O))) {
          w && w();
          const Ae = wt;
          wt = u;
          try {
            const ke = [
              Q,
              // pass undefined as the old value when it's changed for the first time
              O === ds ? void 0 : j && O[0] === ds ? [] : O,
              g
            ];
            O = Q, c ? c(t, 3, ke) : (
              // @ts-expect-error
              t(...ke)
            );
          } finally {
            wt = Ae;
          }
        }
      } else
        u.run();
  };
  return a && a(M), u = new Mr(p), u.scheduler = n ? () => n(M, !1) : M, g = (A) => mo(A, !1, u), w = u.onStop = () => {
    const A = bs.get(u);
    if (A) {
      if (c)
        c(A, 4);
      else
        for (const Q of A) Q();
      bs.delete(u);
    }
  }, t ? r ? M(!0) : O = u.run() : n ? n(M.bind(null, !0), !0) : u.run(), C.pause = u.pause.bind(u), C.resume = u.resume.bind(u), C.stop = C, C;
}
function Ze(e, t = 1 / 0, s) {
  if (t <= 0 || !Y(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, fe(e))
    Ze(e.value, t, s);
  else if (F(e))
    for (let r = 0; r < e.length; r++)
      Ze(e[r], t, s);
  else if (kr(e) || Tt(e))
    e.forEach((r) => {
      Ze(r, t, s);
    });
  else if (Er(e)) {
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
function os(e, t, s, r) {
  try {
    return r ? e(...r) : e();
  } catch (i) {
    Is(i, t, s);
  }
}
function Ue(e, t, s, r) {
  if (R(e)) {
    const i = os(e, t, s, r);
    return i && $r(i) && i.catch((o) => {
      Is(o, t, s);
    }), i;
  }
  if (F(e)) {
    const i = [];
    for (let o = 0; o < e.length; o++)
      i.push(Ue(e[o], t, s, r));
    return i;
  }
}
function Is(e, t, s, r = !0) {
  const i = t ? t.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: n } = t && t.appContext.config || B;
  if (t) {
    let a = t.parent;
    const c = t.proxy, l = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; a; ) {
      const u = a.ec;
      if (u) {
        for (let p = 0; p < u.length; p++)
          if (u[p](e, c, l) === !1)
            return;
      }
      a = a.parent;
    }
    if (o) {
      et(), os(o, null, 10, [
        e,
        c,
        l
      ]), tt();
      return;
    }
  }
  yo(e, s, i, r, n);
}
function yo(e, t, s, r = !0, i = !1) {
  if (i)
    throw e;
  console.error(e);
}
const pe = [];
let We = -1;
const Ot = [];
let at = null, jt = 0;
const Zr = /* @__PURE__ */ Promise.resolve();
let Ps = null;
function Yr(e) {
  const t = Ps || Zr;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function vo(e) {
  let t = We + 1, s = pe.length;
  for (; t < s; ) {
    const r = t + s >>> 1, i = pe[r], o = ss(i);
    o < e || o === e && i.flags & 2 ? t = r + 1 : s = r;
  }
  return t;
}
function $n(e) {
  if (!(e.flags & 1)) {
    const t = ss(e), s = pe[pe.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= ss(s) ? pe.push(e) : pe.splice(vo(t), 0, e), e.flags |= 1, Xr();
  }
}
function Xr() {
  Ps || (Ps = Zr.then(ei));
}
function wo(e) {
  F(e) ? Ot.push(...e) : at && e.id === -1 ? at.splice(jt + 1, 0, e) : e.flags & 1 || (Ot.push(e), e.flags |= 1), Xr();
}
function Ln(e, t, s = We + 1) {
  for (; s < pe.length; s++) {
    const r = pe[s];
    if (r && r.flags & 2) {
      if (e && r.id !== e.uid)
        continue;
      pe.splice(s, 1), s--, r.flags & 4 && (r.flags &= -2), r(), r.flags & 4 || (r.flags &= -2);
    }
  }
}
function Qr(e) {
  if (Ot.length) {
    const t = [...new Set(Ot)].sort(
      (s, r) => ss(s) - ss(r)
    );
    if (Ot.length = 0, at) {
      at.push(...t);
      return;
    }
    for (at = t, jt = 0; jt < at.length; jt++) {
      const s = at[jt];
      s.flags & 4 && (s.flags &= -2), s.flags & 8 || s(), s.flags &= -2;
    }
    at = null, jt = 0;
  }
}
const ss = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function ei(e) {
  try {
    for (We = 0; We < pe.length; We++) {
      const t = pe[We];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), os(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; We < pe.length; We++) {
      const t = pe[We];
      t && (t.flags &= -2);
    }
    We = -1, pe.length = 0, Qr(), Ps = null, (pe.length || Ot.length) && ei();
  }
}
let Se = null, ti = null;
function xs(e) {
  const t = Se;
  return Se = e, ti = e && e.type.__scopeId || null, t;
}
function bo(e, t = Se, s) {
  if (!t || e._n)
    return e;
  const r = (...i) => {
    r._d && Qn(-1);
    const o = xs(t);
    let n;
    try {
      n = e(...i);
    } finally {
      xs(o), r._d && Qn(1);
    }
    return n;
  };
  return r._n = !0, r._c = !0, r._d = !0, r;
}
function Po(e, t) {
  if (Se === null)
    return e;
  const s = Ws(Se), r = e.dirs || (e.dirs = []);
  for (let i = 0; i < t.length; i++) {
    let [o, n, a, c = B] = t[i];
    o && (R(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && Ze(n), r.push({
      dir: o,
      instance: s,
      value: n,
      oldValue: void 0,
      arg: a,
      modifiers: c
    }));
  }
  return e;
}
function gt(e, t, s, r) {
  const i = e.dirs, o = t && t.dirs;
  for (let n = 0; n < i.length; n++) {
    const a = i[n];
    o && (a.oldValue = o[n].value);
    let c = a.dir[r];
    c && (et(), Ue(c, s, 8, [
      e.el,
      a,
      e,
      t
    ]), tt());
  }
}
const xo = Symbol("_vte"), So = (e) => e.__isTeleport, _o = Symbol("_leaveCb");
function jn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, jn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function si(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const Ss = /* @__PURE__ */ new WeakMap();
function Gt(e, t, s, r, i = !1) {
  if (F(e)) {
    e.forEach(
      (_, j) => Gt(
        _,
        t && (F(t) ? t[j] : t),
        s,
        r,
        i
      )
    );
    return;
  }
  if (Zt(r) && !i) {
    r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && Gt(e, t, s, r.component.subTree);
    return;
  }
  const o = r.shapeFlag & 4 ? Ws(r.component) : r.el, n = i ? null : o, { i: a, r: c } = e, l = t && t.r, u = a.refs === B ? a.refs = {} : a.refs, p = a.setupState, w = q(p), g = p === B ? _r : (_) => H(w, _);
  if (l != null && l !== c) {
    if (Un(t), ne(l))
      u[l] = null, g(l) && (p[l] = null);
    else if (fe(l)) {
      l.value = null;
      const _ = t;
      _.k && (u[_.k] = null);
    }
  }
  if (R(c))
    os(c, a, 12, [n, u]);
  else {
    const _ = ne(c), j = fe(c);
    if (_ || j) {
      const L = () => {
        if (e.f) {
          const C = _ ? g(c) ? p[c] : u[c] : c.value;
          if (i)
            F(C) && mn(C, o);
          else if (F(C))
            C.includes(o) || C.push(o);
          else if (_)
            u[c] = [o], g(c) && (p[c] = u[c]);
          else {
            const O = [o];
            c.value = O, e.k && (u[e.k] = O);
          }
        } else _ ? (u[c] = n, g(c) && (p[c] = n)) : j && (c.value = n, e.k && (u[e.k] = n));
      };
      if (n) {
        const C = () => {
          L(), Ss.delete(e);
        };
        C.id = -1, Ss.set(e, C), Pe(C, s);
      } else
        Un(e), L();
    }
  }
}
function Un(e) {
  const t = Ss.get(e);
  t && (t.flags |= 8, Ss.delete(e));
}
Os().requestIdleCallback;
Os().cancelIdleCallback;
const Zt = (e) => !!e.type.__asyncLoader, ni = (e) => e.type.__isKeepAlive;
function ko(e, t) {
  ri(e, "a", t);
}
function $o(e, t) {
  ri(e, "da", t);
}
function ri(e, t, s = ce) {
  const r = e.__wdc || (e.__wdc = () => {
    let i = s;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return e();
  });
  if (Fs(t, r, s), s) {
    let i = s.parent;
    for (; i && i.parent; )
      ni(i.parent.vnode) && jo(r, t, s, i), i = i.parent;
  }
}
function jo(e, t, s, r) {
  const i = Fs(
    t,
    e,
    r,
    !0
    /* prepend */
  );
  ii(() => {
    mn(r[t], i);
  }, s);
}
function Fs(e, t, s = ce, r = !1) {
  if (s) {
    const i = s[e] || (s[e] = []), o = t.__weh || (t.__weh = (...n) => {
      et();
      const a = as(s), c = Ue(t, s, e, n);
      return a(), tt(), c;
    });
    return r ? i.unshift(o) : i.push(o), o;
  }
}
const st = (e) => (t, s = ce) => {
  (!rs || e === "sp") && Fs(e, (...r) => t(...r), s);
}, Eo = st("bm"), En = st("m"), Co = st(
  "bu"
), To = st("u"), Cn = st(
  "bum"
), ii = st("um"), Ao = st(
  "sp"
), Oo = st("rtg"), Mo = st("rtc");
function Io(e, t = ce) {
  Fs("ec", e, t);
}
const Fo = "components";
function Ro(e, t) {
  return Wo(Fo, e, !0, t) || e;
}
const No = Symbol.for("v-ndc");
function Wo(e, t, s = !0, r = !1) {
  const i = Se || ce;
  if (i) {
    const o = i.type;
    {
      const a = ja(
        o,
        !1
      );
      if (a && (a === t || a === Ee(t) || a === As(Ee(t))))
        return o;
    }
    const n = (
      // local registration
      // check instance[type] first which is resolved for options API
      Vn(i[e] || o[e], t) || // global registration
      Vn(i.appContext[e], t)
    );
    return !n && r ? o : n;
  }
}
function Vn(e, t) {
  return e && (e[t] || e[Ee(t)] || e[As(Ee(t))]);
}
function Vt(e, t, s, r) {
  let i;
  const o = s, n = F(e);
  if (n || ne(e)) {
    const a = n && At(e);
    let c = !1, l = !1;
    a && (c = !je(e), l = ft(e), e = Ms(e)), i = new Array(e.length);
    for (let u = 0, p = e.length; u < p; u++)
      i[u] = t(
        c ? l ? ws(ae(e[u])) : ae(e[u]) : e[u],
        u,
        void 0,
        o
      );
  } else if (typeof e == "number") {
    i = new Array(e);
    for (let a = 0; a < e; a++)
      i[a] = t(a + 1, a, void 0, o);
  } else if (Y(e))
    if (e[Symbol.iterator])
      i = Array.from(
        e,
        (a, c) => t(a, c, void 0, o)
      );
    else {
      const a = Object.keys(e);
      i = new Array(a.length);
      for (let c = 0, l = a.length; c < l; c++) {
        const u = a[c];
        i[c] = t(e[u], u, c, o);
      }
    }
  else
    i = [];
  return i;
}
const rn = (e) => e ? $i(e) ? Ws(e) : rn(e.parent) : null, Yt = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ me(/* @__PURE__ */ Object.create(null), {
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
    $options: (e) => ai(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      $n(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Yr.bind(e.proxy)),
    $watch: (e) => oa.bind(e)
  })
), zs = (e, t) => e !== B && !e.__isScriptSetup && H(e, t), Do = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: r, data: i, props: o, accessCache: n, type: a, appContext: c } = e;
    let l;
    if (t[0] !== "$") {
      const g = n[t];
      if (g !== void 0)
        switch (g) {
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
        if (zs(r, t))
          return n[t] = 1, r[t];
        if (i !== B && H(i, t))
          return n[t] = 2, i[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (l = e.propsOptions[0]) && H(l, t)
        )
          return n[t] = 3, o[t];
        if (s !== B && H(s, t))
          return n[t] = 4, s[t];
        on && (n[t] = 0);
      }
    }
    const u = Yt[t];
    let p, w;
    if (u)
      return t === "$attrs" && ue(e.attrs, "get", ""), u(e);
    if (
      // css module (injected by vue-loader)
      (p = a.__cssModules) && (p = p[t])
    )
      return p;
    if (s !== B && H(s, t))
      return n[t] = 4, s[t];
    if (
      // global properties
      w = c.config.globalProperties, H(w, t)
    )
      return w[t];
  },
  set({ _: e }, t, s) {
    const { data: r, setupState: i, ctx: o } = e;
    return zs(i, t) ? (i[t] = s, !0) : r !== B && H(r, t) ? (r[t] = s, !0) : H(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: r, appContext: i, propsOptions: o, type: n }
  }, a) {
    let c, l;
    return !!(s[a] || e !== B && a[0] !== "$" && H(e, a) || zs(t, a) || (c = o[0]) && H(c, a) || H(r, a) || H(Yt, a) || H(i.config.globalProperties, a) || (l = n.__cssModules) && l[a]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : H(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function zn(e) {
  return F(e) ? e.reduce(
    (t, s) => (t[s] = null, t),
    {}
  ) : e;
}
let on = !0;
function qo(e) {
  const t = ai(e), s = e.proxy, r = e.ctx;
  on = !1, t.beforeCreate && Bn(t.beforeCreate, e, "bc");
  const {
    // state
    data: i,
    computed: o,
    methods: n,
    watch: a,
    provide: c,
    inject: l,
    // lifecycle
    created: u,
    beforeMount: p,
    mounted: w,
    beforeUpdate: g,
    updated: _,
    activated: j,
    deactivated: L,
    beforeDestroy: C,
    beforeUnmount: O,
    destroyed: M,
    unmounted: A,
    render: Q,
    renderTracked: Ae,
    renderTriggered: ke,
    errorCaptured: Oe,
    serverPrefetch: nt,
    // public API
    expose: $e,
    inheritAttrs: rt,
    // assets
    components: Ve,
    directives: St,
    filters: Dt
  } = t;
  if (l && Ho(l, r, null), n)
    for (const z in n) {
      const U = n[z];
      R(U) && (r[z] = U.bind(s));
    }
  if (i) {
    const z = i.call(s, s);
    Y(z) && (e.data = Sn(z));
  }
  if (on = !0, o)
    for (const z in o) {
      const U = o[z], Ce = R(U) ? U.bind(s, s) : R(U.get) ? U.get.bind(s, s) : He, _t = !R(U) && R(U.set) ? U.set.bind(s) : He, ze = Pt({
        get: Ce,
        set: _t
      });
      Object.defineProperty(r, z, {
        enumerable: !0,
        configurable: !0,
        get: () => ze.value,
        set: (re) => ze.value = re
      });
    }
  if (a)
    for (const z in a)
      oi(a[z], r, s, z);
  if (c) {
    const z = R(c) ? c.call(s) : c;
    Reflect.ownKeys(z).forEach((U) => {
      Ko(U, z[U]);
    });
  }
  u && Bn(u, e, "c");
  function X(z, U) {
    F(U) ? U.forEach((Ce) => z(Ce.bind(s))) : U && z(U.bind(s));
  }
  if (X(Eo, p), X(En, w), X(Co, g), X(To, _), X(ko, j), X($o, L), X(Io, Oe), X(Mo, Ae), X(Oo, ke), X(Cn, O), X(ii, A), X(Ao, nt), F($e))
    if ($e.length) {
      const z = e.exposed || (e.exposed = {});
      $e.forEach((U) => {
        Object.defineProperty(z, U, {
          get: () => s[U],
          set: (Ce) => s[U] = Ce,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  Q && e.render === He && (e.render = Q), rt != null && (e.inheritAttrs = rt), Ve && (e.components = Ve), St && (e.directives = St), nt && si(e);
}
function Ho(e, t, s = He) {
  F(e) && (e = an(e));
  for (const r in e) {
    const i = e[r];
    let o;
    Y(i) ? "default" in i ? o = gs(
      i.from || r,
      i.default,
      !0
    ) : o = gs(i.from || r) : o = gs(i), fe(o) ? Object.defineProperty(t, r, {
      enumerable: !0,
      configurable: !0,
      get: () => o.value,
      set: (n) => o.value = n
    }) : t[r] = o;
  }
}
function Bn(e, t, s) {
  Ue(
    F(e) ? e.map((r) => r.bind(t.proxy)) : e.bind(t.proxy),
    t,
    s
  );
}
function oi(e, t, s, r) {
  let i = r.includes(".") ? bi(s, r) : () => s[r];
  if (ne(e)) {
    const o = t[e];
    R(o) && Xt(i, o);
  } else if (R(e))
    Xt(i, e.bind(s));
  else if (Y(e))
    if (F(e))
      e.forEach((o) => oi(o, t, s, r));
    else {
      const o = R(e.handler) ? e.handler.bind(s) : t[e.handler];
      R(o) && Xt(i, o, e);
    }
}
function ai(e) {
  const t = e.type, { mixins: s, extends: r } = t, {
    mixins: i,
    optionsCache: o,
    config: { optionMergeStrategies: n }
  } = e.appContext, a = o.get(t);
  let c;
  return a ? c = a : !i.length && !s && !r ? c = t : (c = {}, i.length && i.forEach(
    (l) => _s(c, l, n, !0)
  ), _s(c, t, n)), Y(t) && o.set(t, c), c;
}
function _s(e, t, s, r = !1) {
  const { mixins: i, extends: o } = t;
  o && _s(e, o, s, !0), i && i.forEach(
    (n) => _s(e, n, s, !0)
  );
  for (const n in t)
    if (!(r && n === "expose")) {
      const a = Lo[n] || s && s[n];
      e[n] = a ? a(e[n], t[n]) : t[n];
    }
  return e;
}
const Lo = {
  data: Kn,
  props: Jn,
  emits: Jn,
  // objects
  methods: zt,
  computed: zt,
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
  components: zt,
  directives: zt,
  // watch
  watch: Vo,
  // provide / inject
  provide: Kn,
  inject: Uo
};
function Kn(e, t) {
  return t ? e ? function() {
    return me(
      R(e) ? e.call(this, this) : e,
      R(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Uo(e, t) {
  return zt(an(e), an(t));
}
function an(e) {
  if (F(e)) {
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
function zt(e, t) {
  return e ? me(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Jn(e, t) {
  return e ? F(e) && F(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : me(
    /* @__PURE__ */ Object.create(null),
    zn(e),
    zn(t ?? {})
  ) : t;
}
function Vo(e, t) {
  if (!e) return t;
  if (!t) return e;
  const s = me(/* @__PURE__ */ Object.create(null), e);
  for (const r in t)
    s[r] = de(e[r], t[r]);
  return s;
}
function li() {
  return {
    app: null,
    config: {
      isNativeTag: _r,
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
let zo = 0;
function Bo(e, t) {
  return function(r, i = null) {
    R(r) || (r = me({}, r)), i != null && !Y(i) && (i = null);
    const o = li(), n = /* @__PURE__ */ new WeakSet(), a = [];
    let c = !1;
    const l = o.app = {
      _uid: zo++,
      _component: r,
      _props: i,
      _container: null,
      _context: o,
      _instance: null,
      version: Ca,
      get config() {
        return o.config;
      },
      set config(u) {
      },
      use(u, ...p) {
        return n.has(u) || (u && R(u.install) ? (n.add(u), u.install(l, ...p)) : R(u) && (n.add(u), u(l, ...p))), l;
      },
      mixin(u) {
        return o.mixins.includes(u) || o.mixins.push(u), l;
      },
      component(u, p) {
        return p ? (o.components[u] = p, l) : o.components[u];
      },
      directive(u, p) {
        return p ? (o.directives[u] = p, l) : o.directives[u];
      },
      mount(u, p, w) {
        if (!c) {
          const g = l._ceVNode || Le(r, i);
          return g.appContext = o, w === !0 ? w = "svg" : w === !1 && (w = void 0), e(g, u, w), c = !0, l._container = u, u.__vue_app__ = l, Ws(g.component);
        }
      },
      onUnmount(u) {
        a.push(u);
      },
      unmount() {
        c && (Ue(
          a,
          l._instance,
          16
        ), e(null, l._container), delete l._container.__vue_app__);
      },
      provide(u, p) {
        return o.provides[u] = p, l;
      },
      runWithContext(u) {
        const p = Mt;
        Mt = l;
        try {
          return u();
        } finally {
          Mt = p;
        }
      }
    };
    return l;
  };
}
let Mt = null;
function Ko(e, t) {
  if (ce) {
    let s = ce.provides;
    const r = ce.parent && ce.parent.provides;
    r === s && (s = ce.provides = Object.create(r)), s[e] = t;
  }
}
function gs(e, t, s = !1) {
  const r = xa();
  if (r || Mt) {
    let i = Mt ? Mt._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
    if (i && e in i)
      return i[e];
    if (arguments.length > 1)
      return s && R(t) ? t.call(r && r.proxy) : t;
  }
}
const ui = {}, ci = () => Object.create(ui), fi = (e) => Object.getPrototypeOf(e) === ui;
function Jo(e, t, s, r = !1) {
  const i = {}, o = ci();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), di(e, t, i, o);
  for (const n in e.propsOptions[0])
    n in i || (i[n] = void 0);
  s ? e.props = r ? i : ao(i) : e.type.props ? e.props = i : e.props = o, e.attrs = o;
}
function Go(e, t, s, r) {
  const {
    props: i,
    attrs: o,
    vnode: { patchFlag: n }
  } = e, a = q(i), [c] = e.propsOptions;
  let l = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (r || n > 0) && !(n & 16)
  ) {
    if (n & 8) {
      const u = e.vnode.dynamicProps;
      for (let p = 0; p < u.length; p++) {
        let w = u[p];
        if (Rs(e.emitsOptions, w))
          continue;
        const g = t[w];
        if (c)
          if (H(o, w))
            g !== o[w] && (o[w] = g, l = !0);
          else {
            const _ = Ee(w);
            i[_] = ln(
              c,
              a,
              _,
              g,
              e,
              !1
            );
          }
        else
          g !== o[w] && (o[w] = g, l = !0);
      }
    }
  } else {
    di(e, t, i, o) && (l = !0);
    let u;
    for (const p in a)
      (!t || // for camelCase
      !H(t, p) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((u = ht(p)) === p || !H(t, u))) && (c ? s && // for camelCase
      (s[p] !== void 0 || // for kebab-case
      s[u] !== void 0) && (i[p] = ln(
        c,
        a,
        p,
        void 0,
        e,
        !0
      )) : delete i[p]);
    if (o !== a)
      for (const p in o)
        (!t || !H(t, p)) && (delete o[p], l = !0);
  }
  l && Ge(e.attrs, "set", "");
}
function di(e, t, s, r) {
  const [i, o] = e.propsOptions;
  let n = !1, a;
  if (t)
    for (let c in t) {
      if (Bt(c))
        continue;
      const l = t[c];
      let u;
      i && H(i, u = Ee(c)) ? !o || !o.includes(u) ? s[u] = l : (a || (a = {}))[u] = l : Rs(e.emitsOptions, c) || (!(c in r) || l !== r[c]) && (r[c] = l, n = !0);
    }
  if (o) {
    const c = q(s), l = a || B;
    for (let u = 0; u < o.length; u++) {
      const p = o[u];
      s[p] = ln(
        i,
        c,
        p,
        l[p],
        e,
        !H(l, p)
      );
    }
  }
  return n;
}
function ln(e, t, s, r, i, o) {
  const n = e[s];
  if (n != null) {
    const a = H(n, "default");
    if (a && r === void 0) {
      const c = n.default;
      if (n.type !== Function && !n.skipFactory && R(c)) {
        const { propsDefaults: l } = i;
        if (s in l)
          r = l[s];
        else {
          const u = as(i);
          r = l[s] = c.call(
            null,
            t
          ), u();
        }
      } else
        r = c;
      i.ce && i.ce._setProp(s, r);
    }
    n[
      0
      /* shouldCast */
    ] && (o && !a ? r = !1 : n[
      1
      /* shouldCastTrue */
    ] && (r === "" || r === ht(s)) && (r = !0));
  }
  return r;
}
const Zo = /* @__PURE__ */ new WeakMap();
function pi(e, t, s = !1) {
  const r = s ? Zo : t.propsCache, i = r.get(e);
  if (i)
    return i;
  const o = e.props, n = {}, a = [];
  let c = !1;
  if (!R(e)) {
    const u = (p) => {
      c = !0;
      const [w, g] = pi(p, t, !0);
      me(n, w), g && a.push(...g);
    };
    !s && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  if (!o && !c)
    return Y(e) && r.set(e, Ct), Ct;
  if (F(o))
    for (let u = 0; u < o.length; u++) {
      const p = Ee(o[u]);
      Gn(p) && (n[p] = B);
    }
  else if (o)
    for (const u in o) {
      const p = Ee(u);
      if (Gn(p)) {
        const w = o[u], g = n[p] = F(w) || R(w) ? { type: w } : me({}, w), _ = g.type;
        let j = !1, L = !0;
        if (F(_))
          for (let C = 0; C < _.length; ++C) {
            const O = _[C], M = R(O) && O.name;
            if (M === "Boolean") {
              j = !0;
              break;
            } else M === "String" && (L = !1);
          }
        else
          j = R(_) && _.name === "Boolean";
        g[
          0
          /* shouldCast */
        ] = j, g[
          1
          /* shouldCastTrue */
        ] = L, (j || H(g, "default")) && a.push(p);
      }
    }
  const l = [n, a];
  return Y(e) && r.set(e, l), l;
}
function Gn(e) {
  return e[0] !== "$" && !Bt(e);
}
const Tn = (e) => e === "_" || e === "_ctx" || e === "$stable", An = (e) => F(e) ? e.map(De) : [De(e)], Yo = (e, t, s) => {
  if (t._n)
    return t;
  const r = bo((...i) => An(t(...i)), s);
  return r._c = !1, r;
}, hi = (e, t, s) => {
  const r = e._ctx;
  for (const i in e) {
    if (Tn(i)) continue;
    const o = e[i];
    if (R(o))
      t[i] = Yo(i, o, r);
    else if (o != null) {
      const n = An(o);
      t[i] = () => n;
    }
  }
}, mi = (e, t) => {
  const s = An(t);
  e.slots.default = () => s;
}, gi = (e, t, s) => {
  for (const r in t)
    (s || !Tn(r)) && (e[r] = t[r]);
}, Xo = (e, t, s) => {
  const r = e.slots = ci();
  if (e.vnode.shapeFlag & 32) {
    const i = t._;
    i ? (gi(r, t, s), s && Cr(r, "_", i, !0)) : hi(t, r);
  } else t && mi(e, t);
}, Qo = (e, t, s) => {
  const { vnode: r, slots: i } = e;
  let o = !0, n = B;
  if (r.shapeFlag & 32) {
    const a = t._;
    a ? s && a === 1 ? o = !1 : gi(i, t, s) : (o = !t.$stable, hi(t, i)), n = t;
  } else t && (mi(e, t), n = { default: 1 });
  if (o)
    for (const a in i)
      !Tn(a) && n[a] == null && delete i[a];
}, Pe = ha;
function ea(e) {
  return ta(e);
}
function ta(e, t) {
  const s = Os();
  s.__VUE__ = !0;
  const {
    insert: r,
    remove: i,
    patchProp: o,
    createElement: n,
    createText: a,
    createComment: c,
    setText: l,
    setElementText: u,
    parentNode: p,
    nextSibling: w,
    setScopeId: g = He,
    insertStaticContent: _
  } = e, j = (f, h, y, S = null, P = null, x = null, E = void 0, $ = null, m = !!h.dynamicChildren) => {
    if (f === h)
      return;
    f && !Ut(f, h) && (S = kt(f), re(f, P, x, !0), f = null), h.patchFlag === -2 && (m = !1, h.dynamicChildren = null);
    const { type: d, ref: b, shapeFlag: k } = h;
    switch (d) {
      case Ns:
        L(f, h, y, S);
        break;
      case dt:
        C(f, h, y, S);
        break;
      case Ks:
        f == null && O(h, y, S, E);
        break;
      case he:
        Ve(
          f,
          h,
          y,
          S,
          P,
          x,
          E,
          $,
          m
        );
        break;
      default:
        k & 1 ? Q(
          f,
          h,
          y,
          S,
          P,
          x,
          E,
          $,
          m
        ) : k & 6 ? St(
          f,
          h,
          y,
          S,
          P,
          x,
          E,
          $,
          m
        ) : (k & 64 || k & 128) && d.process(
          f,
          h,
          y,
          S,
          P,
          x,
          E,
          $,
          m,
          it
        );
    }
    b != null && P ? Gt(b, f && f.ref, x, h || f, !h) : b == null && f && f.ref != null && Gt(f.ref, null, x, f, !0);
  }, L = (f, h, y, S) => {
    if (f == null)
      r(
        h.el = a(h.children),
        y,
        S
      );
    else {
      const P = h.el = f.el;
      h.children !== f.children && l(P, h.children);
    }
  }, C = (f, h, y, S) => {
    f == null ? r(
      h.el = c(h.children || ""),
      y,
      S
    ) : h.el = f.el;
  }, O = (f, h, y, S) => {
    [f.el, f.anchor] = _(
      f.children,
      h,
      y,
      S,
      f.el,
      f.anchor
    );
  }, M = ({ el: f, anchor: h }, y, S) => {
    let P;
    for (; f && f !== h; )
      P = w(f), r(f, y, S), f = P;
    r(h, y, S);
  }, A = ({ el: f, anchor: h }) => {
    let y;
    for (; f && f !== h; )
      y = w(f), i(f), f = y;
    i(h);
  }, Q = (f, h, y, S, P, x, E, $, m) => {
    h.type === "svg" ? E = "svg" : h.type === "math" && (E = "mathml"), f == null ? Ae(
      h,
      y,
      S,
      P,
      x,
      E,
      $,
      m
    ) : nt(
      f,
      h,
      P,
      x,
      E,
      $,
      m
    );
  }, Ae = (f, h, y, S, P, x, E, $) => {
    let m, d;
    const { props: b, shapeFlag: k, transition: T, dirs: I } = f;
    if (m = f.el = n(
      f.type,
      x,
      b && b.is,
      b
    ), k & 8 ? u(m, f.children) : k & 16 && Oe(
      f.children,
      m,
      null,
      S,
      P,
      Bs(f, x),
      E,
      $
    ), I && gt(f, null, S, "created"), ke(m, f, f.scopeId, E, S), b) {
      for (const K in b)
        K !== "value" && !Bt(K) && o(m, K, null, b[K], x, S);
      "value" in b && o(m, "value", null, b.value, x), (d = b.onVnodeBeforeMount) && Ne(d, S, f);
    }
    I && gt(f, null, S, "beforeMount");
    const N = sa(P, T);
    N && T.beforeEnter(m), r(m, h, y), ((d = b && b.onVnodeMounted) || N || I) && Pe(() => {
      d && Ne(d, S, f), N && T.enter(m), I && gt(f, null, S, "mounted");
    }, P);
  }, ke = (f, h, y, S, P) => {
    if (y && g(f, y), S)
      for (let x = 0; x < S.length; x++)
        g(f, S[x]);
    if (P) {
      let x = P.subTree;
      if (h === x || xi(x.type) && (x.ssContent === h || x.ssFallback === h)) {
        const E = P.vnode;
        ke(
          f,
          E,
          E.scopeId,
          E.slotScopeIds,
          P.parent
        );
      }
    }
  }, Oe = (f, h, y, S, P, x, E, $, m = 0) => {
    for (let d = m; d < f.length; d++) {
      const b = f[d] = $ ? ut(f[d]) : De(f[d]);
      j(
        null,
        b,
        h,
        y,
        S,
        P,
        x,
        E,
        $
      );
    }
  }, nt = (f, h, y, S, P, x, E) => {
    const $ = h.el = f.el;
    let { patchFlag: m, dynamicChildren: d, dirs: b } = h;
    m |= f.patchFlag & 16;
    const k = f.props || B, T = h.props || B;
    let I;
    if (y && yt(y, !1), (I = T.onVnodeBeforeUpdate) && Ne(I, y, h, f), b && gt(h, f, y, "beforeUpdate"), y && yt(y, !0), (k.innerHTML && T.innerHTML == null || k.textContent && T.textContent == null) && u($, ""), d ? $e(
      f.dynamicChildren,
      d,
      $,
      y,
      S,
      Bs(h, P),
      x
    ) : E || U(
      f,
      h,
      $,
      null,
      y,
      S,
      Bs(h, P),
      x,
      !1
    ), m > 0) {
      if (m & 16)
        rt($, k, T, y, P);
      else if (m & 2 && k.class !== T.class && o($, "class", null, T.class, P), m & 4 && o($, "style", k.style, T.style, P), m & 8) {
        const N = h.dynamicProps;
        for (let K = 0; K < N.length; K++) {
          const V = N[K], ge = k[V], ye = T[V];
          (ye !== ge || V === "value") && o($, V, ge, ye, P, y);
        }
      }
      m & 1 && f.children !== h.children && u($, h.children);
    } else !E && d == null && rt($, k, T, y, P);
    ((I = T.onVnodeUpdated) || b) && Pe(() => {
      I && Ne(I, y, h, f), b && gt(h, f, y, "updated");
    }, S);
  }, $e = (f, h, y, S, P, x, E) => {
    for (let $ = 0; $ < h.length; $++) {
      const m = f[$], d = h[$], b = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        m.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (m.type === he || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Ut(m, d) || // - In the case of a component, it could contain anything.
        m.shapeFlag & 198) ? p(m.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          y
        )
      );
      j(
        m,
        d,
        b,
        null,
        S,
        P,
        x,
        E,
        !0
      );
    }
  }, rt = (f, h, y, S, P) => {
    if (h !== y) {
      if (h !== B)
        for (const x in h)
          !Bt(x) && !(x in y) && o(
            f,
            x,
            h[x],
            null,
            P,
            S
          );
      for (const x in y) {
        if (Bt(x)) continue;
        const E = y[x], $ = h[x];
        E !== $ && x !== "value" && o(f, x, $, E, P, S);
      }
      "value" in y && o(f, "value", h.value, y.value, P);
    }
  }, Ve = (f, h, y, S, P, x, E, $, m) => {
    const d = h.el = f ? f.el : a(""), b = h.anchor = f ? f.anchor : a("");
    let { patchFlag: k, dynamicChildren: T, slotScopeIds: I } = h;
    I && ($ = $ ? $.concat(I) : I), f == null ? (r(d, y, S), r(b, y, S), Oe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      h.children || [],
      y,
      b,
      P,
      x,
      E,
      $,
      m
    )) : k > 0 && k & 64 && T && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    f.dynamicChildren ? ($e(
      f.dynamicChildren,
      T,
      y,
      P,
      x,
      E,
      $
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (h.key != null || P && h === P.subTree) && yi(
      f,
      h,
      !0
      /* shallow */
    )) : U(
      f,
      h,
      y,
      b,
      P,
      x,
      E,
      $,
      m
    );
  }, St = (f, h, y, S, P, x, E, $, m) => {
    h.slotScopeIds = $, f == null ? h.shapeFlag & 512 ? P.ctx.activate(
      h,
      y,
      S,
      E,
      m
    ) : Dt(
      h,
      y,
      S,
      P,
      x,
      E,
      m
    ) : ls(f, h, m);
  }, Dt = (f, h, y, S, P, x, E) => {
    const $ = f.component = Pa(
      f,
      S,
      P
    );
    if (ni(f) && ($.ctx.renderer = it), Sa($, !1, E), $.asyncDep) {
      if (P && P.registerDep($, X, E), !f.el) {
        const m = $.subTree = Le(dt);
        C(null, m, h, y), f.placeholder = m.el;
      }
    } else
      X(
        $,
        f,
        h,
        y,
        P,
        x,
        E
      );
  }, ls = (f, h, y) => {
    const S = h.component = f.component;
    if (da(f, h, y))
      if (S.asyncDep && !S.asyncResolved) {
        z(S, h, y);
        return;
      } else
        S.next = h, S.update();
    else
      h.el = f.el, S.vnode = h;
  }, X = (f, h, y, S, P, x, E) => {
    const $ = () => {
      if (f.isMounted) {
        let { next: k, bu: T, u: I, parent: N, vnode: K } = f;
        {
          const Fe = vi(f);
          if (Fe) {
            k && (k.el = K.el, z(f, k, E)), Fe.asyncDep.then(() => {
              f.isUnmounted || $();
            });
            return;
          }
        }
        let V = k, ge;
        yt(f, !1), k ? (k.el = K.el, z(f, k, E)) : k = K, T && ms(T), (ge = k.props && k.props.onVnodeBeforeUpdate) && Ne(ge, N, k, K), yt(f, !0);
        const ye = Yn(f), Ie = f.subTree;
        f.subTree = ye, j(
          Ie,
          ye,
          // parent may have changed if it's in a teleport
          p(Ie.el),
          // anchor may have changed if it's in a fragment
          kt(Ie),
          f,
          P,
          x
        ), k.el = ye.el, V === null && pa(f, ye.el), I && Pe(I, P), (ge = k.props && k.props.onVnodeUpdated) && Pe(
          () => Ne(ge, N, k, K),
          P
        );
      } else {
        let k;
        const { el: T, props: I } = h, { bm: N, m: K, parent: V, root: ge, type: ye } = f, Ie = Zt(h);
        yt(f, !1), N && ms(N), !Ie && (k = I && I.onVnodeBeforeMount) && Ne(k, V, h), yt(f, !0);
        {
          ge.ce && // @ts-expect-error _def is private
          ge.ce._def.shadowRoot !== !1 && ge.ce._injectChildStyle(ye);
          const Fe = f.subTree = Yn(f);
          j(
            null,
            Fe,
            y,
            S,
            f,
            P,
            x
          ), h.el = Fe.el;
        }
        if (K && Pe(K, P), !Ie && (k = I && I.onVnodeMounted)) {
          const Fe = h;
          Pe(
            () => Ne(k, V, Fe),
            P
          );
        }
        (h.shapeFlag & 256 || V && Zt(V.vnode) && V.vnode.shapeFlag & 256) && f.a && Pe(f.a, P), f.isMounted = !0, h = y = S = null;
      }
    };
    f.scope.on();
    const m = f.effect = new Mr($);
    f.scope.off();
    const d = f.update = m.run.bind(m), b = f.job = m.runIfDirty.bind(m);
    b.i = f, b.id = f.uid, m.scheduler = () => $n(b), yt(f, !0), d();
  }, z = (f, h, y) => {
    h.component = f;
    const S = f.vnode.props;
    f.vnode = h, f.next = null, Go(f, h.props, S, y), Qo(f, h.children, y), et(), Ln(f), tt();
  }, U = (f, h, y, S, P, x, E, $, m = !1) => {
    const d = f && f.children, b = f ? f.shapeFlag : 0, k = h.children, { patchFlag: T, shapeFlag: I } = h;
    if (T > 0) {
      if (T & 128) {
        _t(
          d,
          k,
          y,
          S,
          P,
          x,
          E,
          $,
          m
        );
        return;
      } else if (T & 256) {
        Ce(
          d,
          k,
          y,
          S,
          P,
          x,
          E,
          $,
          m
        );
        return;
      }
    }
    I & 8 ? (b & 16 && mt(d, P, x), k !== d && u(y, k)) : b & 16 ? I & 16 ? _t(
      d,
      k,
      y,
      S,
      P,
      x,
      E,
      $,
      m
    ) : mt(d, P, x, !0) : (b & 8 && u(y, ""), I & 16 && Oe(
      k,
      y,
      S,
      P,
      x,
      E,
      $,
      m
    ));
  }, Ce = (f, h, y, S, P, x, E, $, m) => {
    f = f || Ct, h = h || Ct;
    const d = f.length, b = h.length, k = Math.min(d, b);
    let T;
    for (T = 0; T < k; T++) {
      const I = h[T] = m ? ut(h[T]) : De(h[T]);
      j(
        f[T],
        I,
        y,
        null,
        P,
        x,
        E,
        $,
        m
      );
    }
    d > b ? mt(
      f,
      P,
      x,
      !0,
      !1,
      k
    ) : Oe(
      h,
      y,
      S,
      P,
      x,
      E,
      $,
      m,
      k
    );
  }, _t = (f, h, y, S, P, x, E, $, m) => {
    let d = 0;
    const b = h.length;
    let k = f.length - 1, T = b - 1;
    for (; d <= k && d <= T; ) {
      const I = f[d], N = h[d] = m ? ut(h[d]) : De(h[d]);
      if (Ut(I, N))
        j(
          I,
          N,
          y,
          null,
          P,
          x,
          E,
          $,
          m
        );
      else
        break;
      d++;
    }
    for (; d <= k && d <= T; ) {
      const I = f[k], N = h[T] = m ? ut(h[T]) : De(h[T]);
      if (Ut(I, N))
        j(
          I,
          N,
          y,
          null,
          P,
          x,
          E,
          $,
          m
        );
      else
        break;
      k--, T--;
    }
    if (d > k) {
      if (d <= T) {
        const I = T + 1, N = I < b ? h[I].el : S;
        for (; d <= T; )
          j(
            null,
            h[d] = m ? ut(h[d]) : De(h[d]),
            y,
            N,
            P,
            x,
            E,
            $,
            m
          ), d++;
      }
    } else if (d > T)
      for (; d <= k; )
        re(f[d], P, x, !0), d++;
    else {
      const I = d, N = d, K = /* @__PURE__ */ new Map();
      for (d = N; d <= T; d++) {
        const be = h[d] = m ? ut(h[d]) : De(h[d]);
        be.key != null && K.set(be.key, d);
      }
      let V, ge = 0;
      const ye = T - N + 1;
      let Ie = !1, Fe = 0;
      const Ht = new Array(ye);
      for (d = 0; d < ye; d++) Ht[d] = 0;
      for (d = I; d <= k; d++) {
        const be = f[d];
        if (ge >= ye) {
          re(be, P, x, !0);
          continue;
        }
        let Re;
        if (be.key != null)
          Re = K.get(be.key);
        else
          for (V = N; V <= T; V++)
            if (Ht[V - N] === 0 && Ut(be, h[V])) {
              Re = V;
              break;
            }
        Re === void 0 ? re(be, P, x, !0) : (Ht[Re - N] = d + 1, Re >= Fe ? Fe = Re : Ie = !0, j(
          be,
          h[Re],
          y,
          null,
          P,
          x,
          E,
          $,
          m
        ), ge++);
      }
      const Rn = Ie ? na(Ht) : Ct;
      for (V = Rn.length - 1, d = ye - 1; d >= 0; d--) {
        const be = N + d, Re = h[be], Nn = h[be + 1], Wn = be + 1 < b ? (
          // #13559, fallback to el placeholder for unresolved async component
          Nn.el || Nn.placeholder
        ) : S;
        Ht[d] === 0 ? j(
          null,
          Re,
          y,
          Wn,
          P,
          x,
          E,
          $,
          m
        ) : Ie && (V < 0 || d !== Rn[V] ? ze(Re, y, Wn, 2) : V--);
      }
    }
  }, ze = (f, h, y, S, P = null) => {
    const { el: x, type: E, transition: $, children: m, shapeFlag: d } = f;
    if (d & 6) {
      ze(f.component.subTree, h, y, S);
      return;
    }
    if (d & 128) {
      f.suspense.move(h, y, S);
      return;
    }
    if (d & 64) {
      E.move(f, h, y, it);
      return;
    }
    if (E === he) {
      r(x, h, y);
      for (let k = 0; k < m.length; k++)
        ze(m[k], h, y, S);
      r(f.anchor, h, y);
      return;
    }
    if (E === Ks) {
      M(f, h, y);
      return;
    }
    if (S !== 2 && d & 1 && $)
      if (S === 0)
        $.beforeEnter(x), r(x, h, y), Pe(() => $.enter(x), P);
      else {
        const { leave: k, delayLeave: T, afterLeave: I } = $, N = () => {
          f.ctx.isUnmounted ? i(x) : r(x, h, y);
        }, K = () => {
          x._isLeaving && x[_o](
            !0
            /* cancelled */
          ), k(x, () => {
            N(), I && I();
          });
        };
        T ? T(x, N, K) : K();
      }
    else
      r(x, h, y);
  }, re = (f, h, y, S = !1, P = !1) => {
    const {
      type: x,
      props: E,
      ref: $,
      children: m,
      dynamicChildren: d,
      shapeFlag: b,
      patchFlag: k,
      dirs: T,
      cacheIndex: I
    } = f;
    if (k === -2 && (P = !1), $ != null && (et(), Gt($, null, y, f, !0), tt()), I != null && (h.renderCache[I] = void 0), b & 256) {
      h.ctx.deactivate(f);
      return;
    }
    const N = b & 1 && T, K = !Zt(f);
    let V;
    if (K && (V = E && E.onVnodeBeforeUnmount) && Ne(V, h, f), b & 6)
      us(f.component, y, S);
    else {
      if (b & 128) {
        f.suspense.unmount(y, S);
        return;
      }
      N && gt(f, null, h, "beforeUnmount"), b & 64 ? f.type.remove(
        f,
        h,
        y,
        it,
        S
      ) : d && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !d.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (x !== he || k > 0 && k & 64) ? mt(
        d,
        h,
        y,
        !1,
        !0
      ) : (x === he && k & 384 || !P && b & 16) && mt(m, h, y), S && qt(f);
    }
    (K && (V = E && E.onVnodeUnmounted) || N) && Pe(() => {
      V && Ne(V, h, f), N && gt(f, null, h, "unmounted");
    }, y);
  }, qt = (f) => {
    const { type: h, el: y, anchor: S, transition: P } = f;
    if (h === he) {
      Ds(y, S);
      return;
    }
    if (h === Ks) {
      A(f);
      return;
    }
    const x = () => {
      i(y), P && !P.persisted && P.afterLeave && P.afterLeave();
    };
    if (f.shapeFlag & 1 && P && !P.persisted) {
      const { leave: E, delayLeave: $ } = P, m = () => E(y, x);
      $ ? $(f.el, x, m) : m();
    } else
      x();
  }, Ds = (f, h) => {
    let y;
    for (; f !== h; )
      y = w(f), i(f), f = y;
    i(h);
  }, us = (f, h, y) => {
    const { bum: S, scope: P, job: x, subTree: E, um: $, m, a: d } = f;
    Zn(m), Zn(d), S && ms(S), P.stop(), x && (x.flags |= 8, re(E, f, h, y)), $ && Pe($, h), Pe(() => {
      f.isUnmounted = !0;
    }, h);
  }, mt = (f, h, y, S = !1, P = !1, x = 0) => {
    for (let E = x; E < f.length; E++)
      re(f[E], h, y, S, P);
  }, kt = (f) => {
    if (f.shapeFlag & 6)
      return kt(f.component.subTree);
    if (f.shapeFlag & 128)
      return f.suspense.next();
    const h = w(f.anchor || f.el), y = h && h[xo];
    return y ? w(y) : h;
  };
  let Me = !1;
  const ee = (f, h, y) => {
    f == null ? h._vnode && re(h._vnode, null, null, !0) : j(
      h._vnode || null,
      f,
      h,
      null,
      null,
      null,
      y
    ), h._vnode = f, Me || (Me = !0, Ln(), Qr(), Me = !1);
  }, it = {
    p: j,
    um: re,
    m: ze,
    r: qt,
    mt: Dt,
    mc: Oe,
    pc: U,
    pbc: $e,
    n: kt,
    o: e
  };
  return {
    render: ee,
    hydrate: void 0,
    createApp: Bo(ee)
  };
}
function Bs({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function yt({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function sa(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function yi(e, t, s = !1) {
  const r = e.children, i = t.children;
  if (F(r) && F(i))
    for (let o = 0; o < r.length; o++) {
      const n = r[o];
      let a = i[o];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[o] = ut(i[o]), a.el = n.el), !s && a.patchFlag !== -2 && yi(n, a)), a.type === Ns && // avoid cached text nodes retaining detached dom nodes
      a.patchFlag !== -1 && (a.el = n.el), a.type === dt && !a.el && (a.el = n.el);
    }
}
function na(e) {
  const t = e.slice(), s = [0];
  let r, i, o, n, a;
  const c = e.length;
  for (r = 0; r < c; r++) {
    const l = e[r];
    if (l !== 0) {
      if (i = s[s.length - 1], e[i] < l) {
        t[r] = i, s.push(r);
        continue;
      }
      for (o = 0, n = s.length - 1; o < n; )
        a = o + n >> 1, e[s[a]] < l ? o = a + 1 : n = a;
      l < e[s[o]] && (o > 0 && (t[r] = s[o - 1]), s[o] = r);
    }
  }
  for (o = s.length, n = s[o - 1]; o-- > 0; )
    s[o] = n, n = t[n];
  return s;
}
function vi(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : vi(t);
}
function Zn(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const ra = Symbol.for("v-scx"), ia = () => gs(ra);
function Xt(e, t, s) {
  return wi(e, t, s);
}
function wi(e, t, s = B) {
  const { immediate: r, deep: i, flush: o, once: n } = s, a = me({}, s), c = t && r || !t && o !== "post";
  let l;
  if (rs) {
    if (o === "sync") {
      const g = ia();
      l = g.__watcherHandles || (g.__watcherHandles = []);
    } else if (!c) {
      const g = () => {
      };
      return g.stop = He, g.resume = He, g.pause = He, g;
    }
  }
  const u = ce;
  a.call = (g, _, j) => Ue(g, u, _, j);
  let p = !1;
  o === "post" ? a.scheduler = (g) => {
    Pe(g, u && u.suspense);
  } : o !== "sync" && (p = !0, a.scheduler = (g, _) => {
    _ ? g() : $n(g);
  }), a.augmentJob = (g) => {
    t && (g.flags |= 4), p && (g.flags |= 2, u && (g.id = u.uid, g.i = u));
  };
  const w = go(e, t, a);
  return rs && (l ? l.push(w) : c && w()), w;
}
function oa(e, t, s) {
  const r = this.proxy, i = ne(e) ? e.includes(".") ? bi(r, e) : () => r[e] : e.bind(r, r);
  let o;
  R(t) ? o = t : (o = t.handler, s = t);
  const n = as(this), a = wi(i, o.bind(r), s);
  return n(), a;
}
function bi(e, t) {
  const s = t.split(".");
  return () => {
    let r = e;
    for (let i = 0; i < s.length && r; i++)
      r = r[s[i]];
    return r;
  };
}
const aa = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ee(t)}Modifiers`] || e[`${ht(t)}Modifiers`];
function la(e, t, ...s) {
  if (e.isUnmounted) return;
  const r = e.vnode.props || B;
  let i = s;
  const o = t.startsWith("update:"), n = o && aa(r, t.slice(7));
  n && (n.trim && (i = s.map((u) => ne(u) ? u.trim() : u)), n.number && (i = s.map(Qs)));
  let a, c = r[a = qs(t)] || // also try camelCase event handler (#2249)
  r[a = qs(Ee(t))];
  !c && o && (c = r[a = qs(ht(t))]), c && Ue(
    c,
    e,
    6,
    i
  );
  const l = r[a + "Once"];
  if (l) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[a])
      return;
    e.emitted[a] = !0, Ue(
      l,
      e,
      6,
      i
    );
  }
}
const ua = /* @__PURE__ */ new WeakMap();
function Pi(e, t, s = !1) {
  const r = s ? ua : t.emitsCache, i = r.get(e);
  if (i !== void 0)
    return i;
  const o = e.emits;
  let n = {}, a = !1;
  if (!R(e)) {
    const c = (l) => {
      const u = Pi(l, t, !0);
      u && (a = !0, me(n, u));
    };
    !s && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !o && !a ? (Y(e) && r.set(e, null), null) : (F(o) ? o.forEach((c) => n[c] = null) : me(n, o), Y(e) && r.set(e, n), n);
}
function Rs(e, t) {
  return !e || !Es(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), H(e, t[0].toLowerCase() + t.slice(1)) || H(e, ht(t)) || H(e, t));
}
function Yn(e) {
  const {
    type: t,
    vnode: s,
    proxy: r,
    withProxy: i,
    propsOptions: [o],
    slots: n,
    attrs: a,
    emit: c,
    render: l,
    renderCache: u,
    props: p,
    data: w,
    setupState: g,
    ctx: _,
    inheritAttrs: j
  } = e, L = xs(e);
  let C, O;
  try {
    if (s.shapeFlag & 4) {
      const A = i || r, Q = A;
      C = De(
        l.call(
          Q,
          A,
          u,
          p,
          g,
          w,
          _
        )
      ), O = a;
    } else {
      const A = t;
      C = De(
        A.length > 1 ? A(
          p,
          { attrs: a, slots: n, emit: c }
        ) : A(
          p,
          null
        )
      ), O = t.props ? a : ca(a);
    }
  } catch (A) {
    Qt.length = 0, Is(A, e, 1), C = Le(dt);
  }
  let M = C;
  if (O && j !== !1) {
    const A = Object.keys(O), { shapeFlag: Q } = M;
    A.length && Q & 7 && (o && A.some(hn) && (O = fa(
      O,
      o
    )), M = Nt(M, O, !1, !0));
  }
  return s.dirs && (M = Nt(M, null, !1, !0), M.dirs = M.dirs ? M.dirs.concat(s.dirs) : s.dirs), s.transition && jn(M, s.transition), C = M, xs(L), C;
}
const ca = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || Es(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, fa = (e, t) => {
  const s = {};
  for (const r in e)
    (!hn(r) || !(r.slice(9) in t)) && (s[r] = e[r]);
  return s;
};
function da(e, t, s) {
  const { props: r, children: i, component: o } = e, { props: n, children: a, patchFlag: c } = t, l = o.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return r ? Xn(r, n, l) : !!n;
    if (c & 8) {
      const u = t.dynamicProps;
      for (let p = 0; p < u.length; p++) {
        const w = u[p];
        if (n[w] !== r[w] && !Rs(l, w))
          return !0;
      }
    }
  } else
    return (i || a) && (!a || !a.$stable) ? !0 : r === n ? !1 : r ? n ? Xn(r, n, l) : !0 : !!n;
  return !1;
}
function Xn(e, t, s) {
  const r = Object.keys(t);
  if (r.length !== Object.keys(e).length)
    return !0;
  for (let i = 0; i < r.length; i++) {
    const o = r[i];
    if (t[o] !== e[o] && !Rs(s, o))
      return !0;
  }
  return !1;
}
function pa({ vnode: e, parent: t }, s) {
  for (; t; ) {
    const r = t.subTree;
    if (r.suspense && r.suspense.activeBranch === e && (r.el = e.el), r === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
}
const xi = (e) => e.__isSuspense;
function ha(e, t) {
  t && t.pendingBranch ? F(e) ? t.effects.push(...e) : t.effects.push(e) : wo(e);
}
const he = Symbol.for("v-fgt"), Ns = Symbol.for("v-txt"), dt = Symbol.for("v-cmt"), Ks = Symbol.for("v-stc"), Qt = [];
let _e = null;
function W(e = !1) {
  Qt.push(_e = e ? null : []);
}
function ma() {
  Qt.pop(), _e = Qt[Qt.length - 1] || null;
}
let ns = 1;
function Qn(e, t = !1) {
  ns += e, e < 0 && _e && t && (_e.hasOnce = !0);
}
function Si(e) {
  return e.dynamicChildren = ns > 0 ? _e || Ct : null, ma(), ns > 0 && _e && _e.push(e), e;
}
function D(e, t, s, r, i, o) {
  return Si(
    v(
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
function ks(e, t, s, r, i) {
  return Si(
    Le(
      e,
      t,
      s,
      r,
      i,
      !0
    )
  );
}
function _i(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Ut(e, t) {
  return e.type === t.type && e.key === t.key;
}
const ki = ({ key: e }) => e ?? null, ys = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? ne(e) || fe(e) || R(e) ? { i: Se, r: e, k: t, f: !!s } : e : null);
function v(e, t = null, s = null, r = 0, i = null, o = e === he ? 0 : 1, n = !1, a = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && ki(t),
    ref: t && ys(t),
    scopeId: ti,
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
    ctx: Se
  };
  return a ? (On(c, s), o & 128 && e.normalize(c)) : s && (c.shapeFlag |= ne(s) ? 8 : 16), ns > 0 && // avoid a block node from tracking itself
  !n && // has current parent block
  _e && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && _e.push(c), c;
}
const Le = ga;
function ga(e, t = null, s = null, r = 0, i = null, o = !1) {
  if ((!e || e === No) && (e = dt), _i(e)) {
    const a = Nt(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && On(a, s), ns > 0 && !o && _e && (a.shapeFlag & 6 ? _e[_e.indexOf(e)] = a : _e.push(a)), a.patchFlag = -2, a;
  }
  if (Ea(e) && (e = e.__vccOpts), t) {
    t = ya(t);
    let { class: a, style: c } = t;
    a && !ne(a) && (t.class = Xe(a)), Y(c) && (kn(c) && !F(c) && (c = me({}, c)), t.style = yn(c));
  }
  const n = ne(e) ? 1 : xi(e) ? 128 : So(e) ? 64 : Y(e) ? 4 : R(e) ? 2 : 0;
  return v(
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
function ya(e) {
  return e ? kn(e) || fi(e) ? me({}, e) : e : null;
}
function Nt(e, t, s = !1, r = !1) {
  const { props: i, ref: o, patchFlag: n, children: a, transition: c } = e, l = t ? va(i || {}, t) : i, u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: l,
    key: l && ki(l),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && o ? F(o) ? o.concat(ys(t)) : [o, ys(t)] : ys(t)
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
    patchFlag: t && e.type !== he ? n === -1 ? 16 : n | 16 : n,
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
    ssContent: e.ssContent && Nt(e.ssContent),
    ssFallback: e.ssFallback && Nt(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return c && r && jn(
    u,
    c.clone(u)
  ), u;
}
function le(e = " ", t = 0) {
  return Le(Ns, null, e, t);
}
function lt(e = "", t = !1) {
  return t ? (W(), ks(dt, null, e)) : Le(dt, null, e);
}
function De(e) {
  return e == null || typeof e == "boolean" ? Le(dt) : F(e) ? Le(
    he,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : _i(e) ? ut(e) : Le(Ns, null, String(e));
}
function ut(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : Nt(e);
}
function On(e, t) {
  let s = 0;
  const { shapeFlag: r } = e;
  if (t == null)
    t = null;
  else if (F(t))
    s = 16;
  else if (typeof t == "object")
    if (r & 65) {
      const i = t.default;
      i && (i._c && (i._d = !1), On(e, i()), i._c && (i._d = !0));
      return;
    } else {
      s = 32;
      const i = t._;
      !i && !fi(t) ? t._ctx = Se : i === 3 && Se && (Se.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else R(t) ? (t = { default: t, _ctx: Se }, s = 32) : (t = String(t), r & 64 ? (s = 16, t = [le(t)]) : s = 8);
  e.children = t, e.shapeFlag |= s;
}
function va(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const r = e[s];
    for (const i in r)
      if (i === "class")
        t.class !== r.class && (t.class = Xe([t.class, r.class]));
      else if (i === "style")
        t.style = yn([t.style, r.style]);
      else if (Es(i)) {
        const o = t[i], n = r[i];
        n && o !== n && !(F(o) && o.includes(n)) && (t[i] = o ? [].concat(o, n) : n);
      } else i !== "" && (t[i] = r[i]);
  }
  return t;
}
function Ne(e, t, s, r = null) {
  Ue(e, t, 7, [
    s,
    r
  ]);
}
const wa = li();
let ba = 0;
function Pa(e, t, s) {
  const r = e.type, i = (t ? t.appContext : e.appContext) || wa, o = {
    uid: ba++,
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
    scope: new Hi(
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
    propsOptions: pi(r, i),
    emitsOptions: Pi(r, i),
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
  return o.ctx = { _: o }, o.root = t ? t.root : o, o.emit = la.bind(null, o), e.ce && e.ce(o), o;
}
let ce = null;
const xa = () => ce || Se;
let $s, un;
{
  const e = Os(), t = (s, r) => {
    let i;
    return (i = e[s]) || (i = e[s] = []), i.push(r), (o) => {
      i.length > 1 ? i.forEach((n) => n(o)) : i[0](o);
    };
  };
  $s = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => ce = s
  ), un = t(
    "__VUE_SSR_SETTERS__",
    (s) => rs = s
  );
}
const as = (e) => {
  const t = ce;
  return $s(e), e.scope.on(), () => {
    e.scope.off(), $s(t);
  };
}, er = () => {
  ce && ce.scope.off(), $s(null);
};
function $i(e) {
  return e.vnode.shapeFlag & 4;
}
let rs = !1;
function Sa(e, t = !1, s = !1) {
  t && un(t);
  const { props: r, children: i } = e.vnode, o = $i(e);
  Jo(e, r, o, t), Xo(e, i, s || t);
  const n = o ? _a(e, t) : void 0;
  return t && un(!1), n;
}
function _a(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Do);
  const { setup: r } = s;
  if (r) {
    et();
    const i = e.setupContext = r.length > 1 ? $a(e) : null, o = as(e), n = os(
      r,
      e,
      0,
      [
        e.props,
        i
      ]
    ), a = $r(n);
    if (tt(), o(), (a || e.sp) && !Zt(e) && si(e), a) {
      if (n.then(er, er), t)
        return n.then((c) => {
          tr(e, c);
        }).catch((c) => {
          Is(c, e, 0);
        });
      e.asyncDep = n;
    } else
      tr(e, n);
  } else
    ji(e);
}
function tr(e, t, s) {
  R(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : Y(t) && (e.setupState = Gr(t)), ji(e);
}
function ji(e, t, s) {
  const r = e.type;
  e.render || (e.render = r.render || He);
  {
    const i = as(e);
    et();
    try {
      qo(e);
    } finally {
      tt(), i();
    }
  }
}
const ka = {
  get(e, t) {
    return ue(e, "get", ""), e[t];
  }
};
function $a(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, ka),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Ws(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Gr(lo(e.exposed)), {
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
function ja(e, t = !0) {
  return R(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Ea(e) {
  return R(e) && "__vccOpts" in e;
}
const Pt = (e, t) => ho(e, t, rs), Ca = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let cn;
const sr = typeof window < "u" && window.trustedTypes;
if (sr)
  try {
    cn = /* @__PURE__ */ sr.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Ei = cn ? (e) => cn.createHTML(e) : (e) => e, Ta = "http://www.w3.org/2000/svg", Aa = "http://www.w3.org/1998/Math/MathML", Je = typeof document < "u" ? document : null, nr = Je && /* @__PURE__ */ Je.createElement("template"), Oa = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, r) => {
    const i = t === "svg" ? Je.createElementNS(Ta, e) : t === "mathml" ? Je.createElementNS(Aa, e) : s ? Je.createElement(e, { is: s }) : Je.createElement(e);
    return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
  },
  createText: (e) => Je.createTextNode(e),
  createComment: (e) => Je.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Je.querySelector(e),
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
      nr.innerHTML = Ei(
        r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e
      );
      const a = nr.content;
      if (r === "svg" || r === "mathml") {
        const c = a.firstChild;
        for (; c.firstChild; )
          a.appendChild(c.firstChild);
        a.removeChild(c);
      }
      t.insertBefore(a, s);
    }
    return [
      // first
      n ? n.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, Ma = Symbol("_vtc");
function Ia(e, t, s) {
  const r = e[Ma];
  r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const rr = Symbol("_vod"), Fa = Symbol("_vsh"), Ra = Symbol(""), Na = /(?:^|;)\s*display\s*:/;
function Wa(e, t, s) {
  const r = e.style, i = ne(s);
  let o = !1;
  if (s && !i) {
    if (t)
      if (ne(t))
        for (const n of t.split(";")) {
          const a = n.slice(0, n.indexOf(":")).trim();
          s[a] == null && vs(r, a, "");
        }
      else
        for (const n in t)
          s[n] == null && vs(r, n, "");
    for (const n in s)
      n === "display" && (o = !0), vs(r, n, s[n]);
  } else if (i) {
    if (t !== s) {
      const n = r[Ra];
      n && (s += ";" + n), r.cssText = s, o = Na.test(s);
    }
  } else t && e.removeAttribute("style");
  rr in e && (e[rr] = o ? r.display : "", e[Fa] && (r.display = "none"));
}
const ir = /\s*!important$/;
function vs(e, t, s) {
  if (F(s))
    s.forEach((r) => vs(e, t, r));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const r = Da(e, t);
    ir.test(s) ? e.setProperty(
      ht(r),
      s.replace(ir, ""),
      "important"
    ) : e[r] = s;
  }
}
const or = ["Webkit", "Moz", "ms"], Js = {};
function Da(e, t) {
  const s = Js[t];
  if (s)
    return s;
  let r = Ee(t);
  if (r !== "filter" && r in e)
    return Js[t] = r;
  r = As(r);
  for (let i = 0; i < or.length; i++) {
    const o = or[i] + r;
    if (o in e)
      return Js[t] = o;
  }
  return t;
}
const ar = "http://www.w3.org/1999/xlink";
function lr(e, t, s, r, i, o = qi(t)) {
  r && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(ar, t.slice(6, t.length)) : e.setAttributeNS(ar, t, s) : s == null || o && !Tr(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    o ? "" : pt(s) ? String(s) : s
  );
}
function ur(e, t, s, r, i) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? Ei(s) : s);
    return;
  }
  const o = e.tagName;
  if (t === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const a = o === "OPTION" ? e.getAttribute("value") || "" : e.value, c = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (a !== c || !("_value" in e)) && (e.value = c), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let n = !1;
  if (s === "" || s == null) {
    const a = typeof e[t];
    a === "boolean" ? s = Tr(s) : s == null && a === "string" ? (s = "", n = !0) : a === "number" && (s = 0, n = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  n && e.removeAttribute(i || t);
}
function Et(e, t, s, r) {
  e.addEventListener(t, s, r);
}
function qa(e, t, s, r) {
  e.removeEventListener(t, s, r);
}
const cr = Symbol("_vei");
function Ha(e, t, s, r, i = null) {
  const o = e[cr] || (e[cr] = {}), n = o[t];
  if (r && n)
    n.value = r;
  else {
    const [a, c] = La(t);
    if (r) {
      const l = o[t] = za(
        r,
        i
      );
      Et(e, a, l, c);
    } else n && (qa(e, a, n, c), o[t] = void 0);
  }
}
const fr = /(?:Once|Passive|Capture)$/;
function La(e) {
  let t;
  if (fr.test(e)) {
    t = {};
    let r;
    for (; r = e.match(fr); )
      e = e.slice(0, e.length - r[0].length), t[r[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : ht(e.slice(2)), t];
}
let Gs = 0;
const Ua = /* @__PURE__ */ Promise.resolve(), Va = () => Gs || (Ua.then(() => Gs = 0), Gs = Date.now());
function za(e, t) {
  const s = (r) => {
    if (!r._vts)
      r._vts = Date.now();
    else if (r._vts <= s.attached)
      return;
    Ue(
      Ba(r, s.value),
      t,
      5,
      [r]
    );
  };
  return s.value = e, s.attached = Va(), s;
}
function Ba(e, t) {
  if (F(t)) {
    const s = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      s.call(e), e._stopped = !0;
    }, t.map(
      (r) => (i) => !i._stopped && r && r(i)
    );
  } else
    return t;
}
const dr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Ka = (e, t, s, r, i, o) => {
  const n = i === "svg";
  t === "class" ? Ia(e, r, n) : t === "style" ? Wa(e, s, r) : Es(t) ? hn(t) || Ha(e, t, s, r, o) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Ja(e, t, r, n)) ? (ur(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && lr(e, t, r, n, o, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !ne(r)) ? ur(e, Ee(t), r, o, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), lr(e, t, r, n));
};
function Ja(e, t, s, r) {
  if (r)
    return !!(t === "innerHTML" || t === "textContent" || t in e && dr(t) && R(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const i = e.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return dr(t) && ne(s) ? !1 : t in e;
}
const pr = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return F(t) ? (s) => ms(t, s) : t;
};
function Ga(e) {
  e.target.composing = !0;
}
function hr(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Zs = Symbol("_assign"), Za = {
  created(e, { modifiers: { lazy: t, trim: s, number: r } }, i) {
    e[Zs] = pr(i);
    const o = r || i.props && i.props.type === "number";
    Et(e, t ? "change" : "input", (n) => {
      if (n.target.composing) return;
      let a = e.value;
      s && (a = a.trim()), o && (a = Qs(a)), e[Zs](a);
    }), s && Et(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Et(e, "compositionstart", Ga), Et(e, "compositionend", hr), Et(e, "change", hr));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: r, trim: i, number: o } }, n) {
    if (e[Zs] = pr(n), e.composing) return;
    const a = (o || e.type === "number") && !/^0\d/.test(e.value) ? Qs(e.value) : e.value, c = t ?? "";
    a !== c && (document.activeElement === e && e.type !== "range" && (r && t === s || i && e.value.trim() === c) || (e.value = c));
  }
}, Ya = ["ctrl", "shift", "alt", "meta"], Xa = {
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
  exact: (e, t) => Ya.some((s) => e[`${s}Key`] && !t.includes(s))
}, Mn = (e, t) => {
  const s = e._withMods || (e._withMods = {}), r = t.join(".");
  return s[r] || (s[r] = ((i, ...o) => {
    for (let n = 0; n < t.length; n++) {
      const a = Xa[t[n]];
      if (a && a(i, t)) return;
    }
    return e(i, ...o);
  }));
}, Qa = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, el = (e, t) => {
  const s = e._withKeys || (e._withKeys = {}), r = t.join(".");
  return s[r] || (s[r] = ((i) => {
    if (!("key" in i))
      return;
    const o = ht(i.key);
    if (t.some(
      (n) => n === o || Qa[n] === o
    ))
      return e(i);
  }));
}, tl = /* @__PURE__ */ me({ patchProp: Ka }, Oa);
let mr;
function sl() {
  return mr || (mr = ea(tl));
}
const nl = ((...e) => {
  const t = sl().createApp(...e), { mount: s } = t;
  return t.mount = (r) => {
    const i = il(r);
    if (!i) return;
    const o = t._component;
    !R(o) && !o.render && !o.template && (o.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const n = s(i, !1, rl(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), n;
  }, t;
});
function rl(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function il(e) {
  return ne(e) ? document.querySelector(e) : e;
}
const ol = { class: "tree-node" }, al = ["title"], ll = { class: "tree-icon" }, ul = {
  key: 0,
  class: "tree-children"
}, cl = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
  __name: "FileTreeNode",
  props: {
    node: { type: Object, required: !0 },
    selectedPath: { type: String, default: "" }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const s = t, r = se(!0);
    return (i, o) => {
      const n = Ro("FileTreeNode", !0);
      return W(), D("div", ol, [
        v("div", {
          class: Xe(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: o[1] || (o[1] = (a) => s("select", e.node)),
          onDblclick: o[2] || (o[2] = (a) => e.node.kind === "directory" && (r.value = !r.value))
        }, [
          v("span", {
            class: "tree-toggle",
            onClick: o[0] || (o[0] = Mn((a) => e.node.kind === "directory" && (r.value = !r.value), ["stop"]))
          }, G(e.node.kind === "directory" ? r.value ? "⌄" : "›" : ""), 1),
          v("span", ll, G(e.node.kind === "directory" ? "▰" : "·"), 1),
          v("span", null, G(e.node.name), 1)
        ], 42, al),
        e.node.kind === "directory" && r.value ? (W(), D("div", ul, [
          (W(!0), D(he, null, Vt(e.node.children, (a) => (W(), ks(n, {
            key: a.path,
            node: a,
            "selected-path": e.selectedPath,
            onSelect: o[3] || (o[3] = (c) => s("select", c))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : lt("", !0)
      ]);
    };
  }
}), fl = { class: "monaco-editor-shell" }, dl = {
  key: 0,
  class: "editor-loading"
}, pl = {
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
    const s = e, r = t, i = se(null), o = se(!0);
    let n, a, c, l, u = !1;
    En(async () => {
      try {
        ({ monaco: c } = await (await import("./monaco-runtime-aHqeNiN2.js").then((_) => _.jz)).configureStudioMonaco()), a = p(), n = c.editor.create(i.value, {
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
        }), l = n.onDidChangeModelContent(() => {
          u || r("update:value", a.getValue());
        }), n.addCommand(c.KeyMod.CtrlCmd | c.KeyCode.KeyS, () => r("save")), o.value = !1, w(), n.focus(), r("ready");
      } catch (g) {
        o.value = !1, r("error", g);
      }
    }), Xt(() => s.value, (g) => {
      !a || a.getValue() === g || (u = !0, a.setValue(g), u = !1);
    }), Xt(() => s.markers, w, { deep: !0 }), Cn(() => {
      l?.dispose(), n?.dispose();
    });
    function p() {
      const g = c.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(s.projectId)}/${s.path}`), _ = c.editor.getModel(g);
      return _ ? (c.editor.setModelLanguage(_, s.language), _.getValue() !== s.value && _.setValue(s.value), _) : c.editor.createModel(s.value, s.language, g);
    }
    function w() {
      !c || !a || c.editor.setModelMarkers(a, "webwindows-manifest", s.markers.map((g) => ({
        severity: g.severity === "warning" ? c.MarkerSeverity.Warning : c.MarkerSeverity.Error,
        message: `${g.path}: ${g.message}`,
        startLineNumber: g.line || 1,
        startColumn: g.column || 1,
        endLineNumber: g.endLine || g.line || 1,
        endColumn: g.endColumn || Math.max(2, (g.column || 1) + 1)
      })));
    }
    return (g, _) => (W(), D("div", fl, [
      v("div", {
        ref_key: "host",
        ref: i,
        class: "monaco-editor-host"
      }, null, 512),
      o.value ? (W(), D("div", dl, "正在载入本地编辑器…")) : lt("", !0)
    ]));
  }
}, hl = { class: "manifest-inspector" }, ml = { class: "inspector-mode-tabs" }, gl = {
  key: 0,
  class: "inspector-note"
}, yl = {
  key: 1,
  class: "inspector-note error"
}, vl = ["value"], wl = ["value"], bl = ["value"], Pl = ["value"], xl = ["value"], Sl = ["value"], _l = ["value"], kl = ["value"], $l = ["value"], jl = { class: "check" }, El = ["checked"], Cl = { class: "check" }, Tl = ["checked"], Al = { class: "check" }, Ol = ["checked"], Ml = { class: "check" }, Il = ["checked"], Fl = { class: "check" }, Rl = ["checked"], Nl = { class: "inspector-summary" }, Wl = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const s = e, r = t, i = se("form"), o = Pt(() => s.manifest && typeof s.manifest == "object" && !Array.isArray(s.manifest));
    function n(a, c) {
      if (!o.value) return;
      const l = JSON.parse(JSON.stringify(s.manifest));
      let u = l;
      a.slice(0, -1).forEach((p) => {
        (!u[p] || typeof u[p] != "object") && (u[p] = {}), u = u[p];
      }), u[a.at(-1)] = c, r("update:manifest", l);
    }
    return (a, c) => (W(), D("div", hl, [
      v("div", ml, [
        v("button", {
          type: "button",
          class: Xe({ active: i.value === "form" }),
          onClick: c[0] || (c[0] = (l) => i.value = "form")
        }, "表单", 2),
        v("button", {
          type: "button",
          class: Xe({ active: i.value === "json" }),
          onClick: c[1] || (c[1] = (l) => {
            i.value = "json", r("open-json");
          })
        }, "JSON", 2)
      ]),
      i.value === "json" ? (W(), D("div", gl, [
        c[18] || (c[18] = le(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        v("button", {
          type: "button",
          onClick: c[2] || (c[2] = (l) => r("open-json"))
        }, "打开 manifest.json")
      ])) : o.value ? (W(), D("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: c[17] || (c[17] = Mn(() => {
        }, ["prevent"]))
      }, [
        v("label", null, [
          c[19] || (c[19] = le("ID", -1)),
          v("input", {
            value: e.manifest.id,
            onInput: c[3] || (c[3] = (l) => n(["id"], l.target.value))
          }, null, 40, vl)
        ]),
        v("label", null, [
          c[20] || (c[20] = le("名称", -1)),
          v("input", {
            value: e.manifest.name,
            onInput: c[4] || (c[4] = (l) => n(["name"], l.target.value))
          }, null, 40, wl)
        ]),
        v("label", null, [
          c[21] || (c[21] = le("版本", -1)),
          v("input", {
            value: e.manifest.version,
            onInput: c[5] || (c[5] = (l) => n(["version"], l.target.value))
          }, null, 40, bl)
        ]),
        v("label", null, [
          c[22] || (c[22] = le("描述", -1)),
          v("textarea", {
            value: e.manifest.description,
            onInput: c[6] || (c[6] = (l) => n(["description"], l.target.value))
          }, null, 40, Pl)
        ]),
        v("label", null, [
          c[23] || (c[23] = le("分类", -1)),
          v("input", {
            value: e.manifest.category,
            onInput: c[7] || (c[7] = (l) => n(["category"], l.target.value))
          }, null, 40, xl)
        ]),
        v("label", null, [
          c[24] || (c[24] = le("入口", -1)),
          v("input", {
            value: e.manifest.entry,
            onInput: c[8] || (c[8] = (l) => n(["entry"], l.target.value))
          }, null, 40, Sl)
        ]),
        v("label", null, [
          c[25] || (c[25] = le("图标", -1)),
          v("input", {
            value: e.manifest.icon,
            onInput: c[9] || (c[9] = (l) => n(["icon"], l.target.value))
          }, null, 40, _l)
        ]),
        v("fieldset", null, [
          c[29] || (c[29] = v("legend", null, "Window", -1)),
          v("label", null, [
            c[26] || (c[26] = le("宽度", -1)),
            v("input", {
              value: e.manifest.window?.width,
              onInput: c[10] || (c[10] = (l) => n(["window", "width"], l.target.value))
            }, null, 40, kl)
          ]),
          v("label", null, [
            c[27] || (c[27] = le("高度", -1)),
            v("input", {
              value: e.manifest.window?.height,
              onInput: c[11] || (c[11] = (l) => n(["window", "height"], l.target.value))
            }, null, 40, $l)
          ]),
          v("label", jl, [
            v("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: c[12] || (c[12] = (l) => n(["window", "singleton"], l.target.checked))
            }, null, 40, El),
            c[28] || (c[28] = le(" 单实例", -1))
          ])
        ]),
        v("fieldset", null, [
          c[34] || (c[34] = v("legend", null, "Placement", -1)),
          v("label", Cl, [
            v("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: c[13] || (c[13] = (l) => n(["placement", "startMenu"], l.target.checked))
            }, null, 40, Tl),
            c[30] || (c[30] = le(" 开始菜单", -1))
          ]),
          v("label", Al, [
            v("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: c[14] || (c[14] = (l) => n(["placement", "allFunctions"], l.target.checked))
            }, null, 40, Ol),
            c[31] || (c[31] = le(" 全部功能", -1))
          ]),
          v("label", Ml, [
            v("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: c[15] || (c[15] = (l) => n(["placement", "desktop"], l.target.checked))
            }, null, 40, Il),
            c[32] || (c[32] = le(" 桌面", -1))
          ]),
          v("label", Fl, [
            v("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: c[16] || (c[16] = (l) => n(["placement", "taskbar"], l.target.checked))
            }, null, 40, Rl),
            c[33] || (c[33] = le(" 任务栏", -1))
          ])
        ]),
        c[35] || (c[35] = v("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (W(), D("div", yl, "修复 JSON 错误后才能使用可视化表单。")),
      v("div", Nl, G(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
};
function Dl(e) {
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
const ql = { properties: { type: { enum: ["application", "system"] } } }, gr = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, Hl = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, Ll = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, Ul = { properties: { status: { enum: ["published", "disabled"] } } }, xe = Dl, Vl = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), zl = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), Ci = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), Bl = new RegExp("^\\.[a-z0-9]+$", "u"), Kl = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), Jl = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function Qe(e, { instancePath: t = "", parentData: s, parentDataProperty: r, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let n = null, a = 0;
  const c = Qe.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (xe(e) > 240) {
      const l = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (xe(e) < 1) {
      const l = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (!Ci.test(e)) {
      const l = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      n === null ? n = [l] : n.push(l), a++;
    }
  } else {
    const l = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    n === null ? n = [l] : n.push(l), a++;
  }
  if (typeof e == "string" && !Jl.test(e)) {
    const l = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    n === null ? n = [l] : n.push(l), a++;
  }
  return Qe.errors = n, a === 0;
}
Qe.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const Gl = new RegExp("^[a-f0-9]{64}$", "u"), Zl = new RegExp("^/api/function-package\\.asp\\?", "u");
function It(e, { instancePath: t = "", parentData: s, parentDataProperty: r, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let n = null, a = 0;
  const c = It.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.size === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.sha256 === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.entry === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.downloadUrl === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const l = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.size !== void 0) {
      let l = e.size;
      if (!(typeof l == "number" && !(l % 1) && !isNaN(l))) {
        const u = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        n === null ? n = [u] : n.push(u), a++;
      }
      if (typeof l == "number" && (l < 0 || isNaN(l))) {
        const u = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.sha256 !== void 0) {
      let l = e.sha256;
      if (typeof l == "string") {
        if (!Gl.test(l)) {
          const u = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.entry !== void 0 && (Qe(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: o }) || (n = n === null ? Qe.errors : n.concat(Qe.errors), a = n.length)), e.downloadUrl !== void 0) {
      let l = e.downloadUrl;
      if (typeof l == "string") {
        if (!Zl.test(l)) {
          const u = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
  } else {
    const l = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    n === null ? n = [l] : n.push(l), a++;
  }
  return It.errors = n, a === 0;
}
It.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ft(e, { instancePath: t = "", parentData: s, parentDataProperty: r, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let n = null, a = 0;
  const c = Ft.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.id === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.type === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.name === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.version === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.icon === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.entry === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.install === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.placement === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.window === void 0) {
      const l = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.id !== void 0) {
      let l = e.id;
      if (typeof l == "string") {
        if (xe(l) > 160) {
          const u = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (!Vl.test(l)) {
          const u = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.legacyIds !== void 0) {
      let l = e.legacyIds;
      if (Array.isArray(l)) {
        const u = l.length;
        for (let g = 0; g < u; g++) {
          let _ = l[g];
          if (typeof _ == "string") {
            if (xe(_) < 1) {
              const j = { instancePath: t + "/legacyIds/" + g, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              n === null ? n = [j] : n.push(j), a++;
            }
          } else {
            const j = { instancePath: t + "/legacyIds/" + g, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            n === null ? n = [j] : n.push(j), a++;
          }
        }
        let p = l.length, w;
        if (p > 1) {
          const g = {};
          for (; p--; ) {
            let _ = l[p];
            if (typeof _ == "string") {
              if (typeof g[_] == "number") {
                w = g[_];
                const j = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: p, j: w }, message: "must NOT have duplicate items (items ## " + w + " and " + p + " are identical)" };
                n === null ? n = [j] : n.push(j), a++;
                break;
              }
              g[_] = p;
            }
          }
        }
      } else {
        const u = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.type !== void 0) {
      let l = e.type;
      if (!(l === "application" || l === "system")) {
        const u = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: ql.properties.type.enum }, message: "must be equal to one of the allowed values" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.name !== void 0) {
      let l = e.name;
      if (typeof l == "string") {
        if (xe(l) < 1) {
          const u = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const l = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const l = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      n === null ? n = [l] : n.push(l), a++;
    }
    if (e.version !== void 0) {
      let l = e.version;
      if (typeof l == "string") {
        if (xe(l) > 40) {
          const u = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (!zl.test(l)) {
          const u = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.icon !== void 0) {
      let l = e.icon;
      if (typeof l == "string") {
        if (xe(l) > 240) {
          const u = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (xe(l) < 1) {
          const u = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (!Ci.test(l)) {
          const u = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.entry !== void 0 && (Qe(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: i, dynamicAnchors: o }) || (n = n === null ? Qe.errors : n.concat(Qe.errors), a = n.length)), e.install !== void 0) {
      let l = e.install;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.defaultState === void 0) {
          const u = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.source === void 0) {
          const u = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.uninstallable === void 0) {
          const u = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.defaultState !== void 0) {
          let u = l.defaultState;
          if (!(u === "available" || u === "installed")) {
            const p = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: gr.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
        if (l.source !== void 0) {
          let u = l.source;
          if (!(u === "repository" || u === "preinstalled" || u === "system")) {
            const p = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: gr.properties.source.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
        if (l.uninstallable !== void 0 && typeof l.uninstallable != "boolean") {
          const u = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.placement !== void 0) {
      let l = e.placement;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.desktop === void 0) {
          const u = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.startMenu === void 0) {
          const u = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.allFunctions === void 0) {
          const u = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.taskbar === void 0) {
          const u = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.desktop !== void 0 && typeof l.desktop != "boolean") {
          const u = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.startMenu !== void 0 && typeof l.startMenu != "boolean") {
          const u = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.startMenuGroup !== void 0) {
          let u = l.startMenuGroup;
          if (!(u === "user" || u === "system")) {
            const p = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: Hl.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
        if (l.startMenuOrder !== void 0) {
          let u = l.startMenuOrder;
          if (!(typeof u == "number" && !(u % 1) && !isNaN(u))) {
            const p = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            n === null ? n = [p] : n.push(p), a++;
          }
          if (typeof u == "number" && (u < 0 || isNaN(u))) {
            const p = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
        if (l.allFunctions !== void 0 && typeof l.allFunctions != "boolean") {
          const u = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.taskbar !== void 0 && typeof l.taskbar != "boolean") {
          const u = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.window !== void 0) {
      let l = e.window;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.mode === void 0) {
          const u = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.singleton === void 0) {
          const u = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.width === void 0) {
          const u = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.height === void 0) {
          const u = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.mode !== void 0) {
          let u = l.mode;
          if (!(u === "iframe" || u === "native" || u === "shell")) {
            const p = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: Ll.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
        if (l.singleton !== void 0 && typeof l.singleton != "boolean") {
          const u = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.width !== void 0) {
          let u = l.width;
          if (typeof u == "string") {
            if (xe(u) < 1) {
              const p = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              n === null ? n = [p] : n.push(p), a++;
            }
          } else {
            const p = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
        if (l.height !== void 0) {
          let u = l.height;
          if (typeof u == "string") {
            if (xe(u) < 1) {
              const p = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              n === null ? n = [p] : n.push(p), a++;
            }
          } else {
            const p = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
        if (l.className !== void 0 && typeof l.className != "string") {
          const u = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let l = e.fileHandlers;
      if (Array.isArray(l)) {
        const u = l.length;
        for (let p = 0; p < u; p++) {
          let w = l[p];
          if (w && typeof w == "object" && !Array.isArray(w)) {
            if (w.action === void 0) {
              const g = { instancePath: t + "/fileHandlers/" + p, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property 'action'" };
              n === null ? n = [g] : n.push(g), a++;
            }
            if (w.adapter === void 0) {
              const g = { instancePath: t + "/fileHandlers/" + p, schemaPath: "#/$defs/fileHandler/required", keyword: "required", params: { missingProperty: "adapter" }, message: "must have required property 'adapter'" };
              n === null ? n = [g] : n.push(g), a++;
            }
            if (w.action !== void 0) {
              let g = w.action;
              if (typeof g == "string") {
                if (xe(g) < 1) {
                  const _ = { instancePath: t + "/fileHandlers/" + p + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  n === null ? n = [_] : n.push(_), a++;
                }
              } else {
                const _ = { instancePath: t + "/fileHandlers/" + p + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                n === null ? n = [_] : n.push(_), a++;
              }
            }
            if (w.adapter !== void 0) {
              let g = w.adapter;
              if (typeof g == "string") {
                if (xe(g) < 1) {
                  const _ = { instancePath: t + "/fileHandlers/" + p + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  n === null ? n = [_] : n.push(_), a++;
                }
              } else {
                const _ = { instancePath: t + "/fileHandlers/" + p + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                n === null ? n = [_] : n.push(_), a++;
              }
            }
            if (w.extensions !== void 0) {
              let g = w.extensions;
              if (Array.isArray(g)) {
                const _ = g.length;
                for (let C = 0; C < _; C++) {
                  let O = g[C];
                  if (typeof O == "string") {
                    if (!Bl.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + p + "/extensions/" + C, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      n === null ? n = [M] : n.push(M), a++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + p + "/extensions/" + C, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    n === null ? n = [M] : n.push(M), a++;
                  }
                }
                let j = g.length, L;
                if (j > 1) {
                  const C = {};
                  for (; j--; ) {
                    let O = g[j];
                    if (typeof O == "string") {
                      if (typeof C[O] == "number") {
                        L = C[O];
                        const M = { instancePath: t + "/fileHandlers/" + p + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: j, j: L }, message: "must NOT have duplicate items (items ## " + L + " and " + j + " are identical)" };
                        n === null ? n = [M] : n.push(M), a++;
                        break;
                      }
                      C[O] = j;
                    }
                  }
                }
              } else {
                const _ = { instancePath: t + "/fileHandlers/" + p + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                n === null ? n = [_] : n.push(_), a++;
              }
            }
            if (w.mimeTypes !== void 0) {
              let g = w.mimeTypes;
              if (Array.isArray(g)) {
                const _ = g.length;
                for (let C = 0; C < _; C++) {
                  let O = g[C];
                  if (typeof O == "string") {
                    if (!Kl.test(O)) {
                      const M = { instancePath: t + "/fileHandlers/" + p + "/mimeTypes/" + C, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      n === null ? n = [M] : n.push(M), a++;
                    }
                  } else {
                    const M = { instancePath: t + "/fileHandlers/" + p + "/mimeTypes/" + C, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    n === null ? n = [M] : n.push(M), a++;
                  }
                }
                let j = g.length, L;
                if (j > 1) {
                  const C = {};
                  for (; j--; ) {
                    let O = g[j];
                    if (typeof O == "string") {
                      if (typeof C[O] == "number") {
                        L = C[O];
                        const M = { instancePath: t + "/fileHandlers/" + p + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: j, j: L }, message: "must NOT have duplicate items (items ## " + L + " and " + j + " are identical)" };
                        n === null ? n = [M] : n.push(M), a++;
                        break;
                      }
                      C[O] = j;
                    }
                  }
                }
              } else {
                const _ = { instancePath: t + "/fileHandlers/" + p + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                n === null ? n = [_] : n.push(_), a++;
              }
            }
            if (w.priority !== void 0 && typeof w.priority != "number") {
              const g = { instancePath: t + "/fileHandlers/" + p + "/priority", schemaPath: "#/$defs/fileHandler/properties/priority/type", keyword: "type", params: { type: "number" }, message: "must be number" };
              n === null ? n = [g] : n.push(g), a++;
            }
          } else {
            const g = { instancePath: t + "/fileHandlers/" + p, schemaPath: "#/$defs/fileHandler/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            n === null ? n = [g] : n.push(g), a++;
          }
        }
      } else {
        const u = { instancePath: t + "/fileHandlers", schemaPath: "#/properties/fileHandlers/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.launch !== void 0) {
      let l = e.launch;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.adapter !== void 0) {
          let u = l.adapter;
          if (typeof u == "string") {
            if (xe(u) < 1) {
              const p = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              n === null ? n = [p] : n.push(p), a++;
            }
          } else {
            const p = { instancePath: t + "/launch/adapter", schemaPath: "#/$defs/launch/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
      } else {
        const u = { instancePath: t + "/launch", schemaPath: "#/$defs/launch/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.catalog !== void 0) {
      let l = e.catalog;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.status !== void 0) {
          let u = l.status;
          if (!(u === "published" || u === "disabled")) {
            const p = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: Ul.properties.status.enum }, message: "must be equal to one of the allowed values" };
            n === null ? n = [p] : n.push(p), a++;
          }
        }
      } else {
        const u = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
    if (e.package !== void 0 && (It(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: i, dynamicAnchors: o }) || (n = n === null ? It.errors : n.concat(It.errors), a = n.length)), e.runtime !== void 0) {
      let l = e.runtime;
      if (l && typeof l == "object" && !Array.isArray(l)) {
        if (l.model === void 0) {
          const u = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.network === void 0) {
          const u = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.sameOrigin === void 0) {
          const u = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.model !== void 0 && l.model !== "browser-zip-sandbox-v1") {
          const u = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.network !== void 0 && l.network !== "none") {
          const u = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          n === null ? n = [u] : n.push(u), a++;
        }
        if (l.sameOrigin !== void 0 && l.sameOrigin !== !1) {
          const u = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          n === null ? n = [u] : n.push(u), a++;
        }
      } else {
        const u = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        n === null ? n = [u] : n.push(u), a++;
      }
    }
  } else {
    const l = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    n === null ? n = [l] : n.push(l), a++;
  }
  return Ft.errors = n, a === 0;
}
Ft.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Wt(e, { instancePath: t = "", parentData: s, parentDataProperty: r, rootData: i = e, dynamicAnchors: o = {} } = {}) {
  let n = null, a = 0;
  const c = Wt.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Ft(e, { instancePath: t, parentData: s, parentDataProperty: r, rootData: i, dynamicAnchors: o }) || (n = n === null ? Ft.errors : n.concat(Ft.errors), a = n.length), Wt.errors = n, a === 0;
}
Wt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let Ys;
async function Yl() {
  return Ys || (Ys = Xl()), Ys;
}
async function Xl() {
  const e = await fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" });
  if (!e.ok) throw new Error("无法载入 Manifest v1 Schema。");
  const t = await e.json(), s = t.$defs?.sourceManifest?.properties || {}, r = Object.entries(s).filter(([, i]) => i.readOnly === !0 || i.description?.includes("Reserved") || i.description?.includes("Platform-reserved")).map(([i]) => i);
  return { schema: t, validate: Wt, reservedProperties: r };
}
async function Ql(e) {
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
        ...tu(e, o.message)
      }]
    };
  }
  const { validate: s, reservedProperties: r } = await Yl();
  s(t);
  const i = (s.errors || []).map((o) => ({
    severity: "error",
    path: eu(o.instancePath || o.params?.missingProperty || ""),
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
function eu(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const s = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(s) ? `[${s}]` : `.${s}`;
  }).join("")}` : `$.${e}` : "$";
}
function tu(e, t) {
  const s = /position\s+(\d+)/i.exec(t);
  if (!s) return { line: 1, column: 1 };
  const r = Math.min(Number(s[1]), e.length), i = e.slice(0, r).split(`
`);
  return { line: i.length, column: i.at(-1).length + 1 };
}
const su = {
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
function nu() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(su, null, 2)}
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
const yr = 240;
function oe(e, t = {}) {
  const s = String(e ?? "");
  if (s.includes("\0")) throw bt("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(s)) throw bt("项目路径不能使用盘符。", e);
  const r = s.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!r) {
    if (t.allowRoot === !0) return "";
    throw bt("项目路径不能为空。", e);
  }
  if (r.startsWith("/")) throw bt("项目路径必须是相对路径。", e);
  if (r.length > yr)
    throw bt(`项目路径不能超过 ${yr} 个字符。`, e);
  const i = r.split("/");
  if (i.some((o) => !o || o === "." || o === ".."))
    throw bt("项目路径包含不安全的路径段。", e);
  return i.join("/");
}
function is(e) {
  const t = oe(e), s = t.lastIndexOf("/");
  return s < 0 ? "" : t.slice(0, s);
}
function fn(e) {
  const t = oe(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function ru(e, t) {
  const s = oe(e, { allowRoot: !0 }), r = String(t ?? "");
  if (!r || r.includes("/") || r.includes("\\"))
    throw bt("文件或目录名称必须是单个安全路径段。", t);
  return oe(s ? `${s}/${r}` : r);
}
function bt(e, t) {
  const s = new TypeError(e);
  return s.code = "invalid-project-path", s.value = t, s;
}
const iu = "webwindows-developer-studio-v1", vr = 1, ou = 1, Z = "projects", te = "files", vt = "projectId";
class au {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || iu, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, !this.indexedDB) throw new Error("IndexedDB is required by Developer Studio.");
  }
  async listProjects() {
    const t = await this.open();
    return (await ve(
      t.transaction(Z, "readonly").objectStore(Z).getAll()
    )).sort((r, i) => String(i.updatedAt).localeCompare(String(r.updatedAt))).map(Ke);
  }
  async createProject(t = {}) {
    const s = uu(this.crypto), r = this.now(), i = {
      uuid: s,
      displayName: br(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: ou,
      storageVersion: vr,
      createdAt: r,
      updatedAt: r,
      editorState: js(t.editorState)
    }, o = lu(t.files || [], s, r), a = (await this.open()).transaction([Z, te], "readwrite");
    a.objectStore(Z).add(i);
    const c = a.objectStore(te);
    return o.forEach((l) => c.add(l)), await ot(a), Ke(i);
  }
  async getProject(t) {
    const s = await this.open(), r = await ve(
      s.transaction(Z, "readonly").objectStore(Z).get(t)
    );
    if (!r) throw ie("project-not-found", "找不到项目。");
    return Ke(r);
  }
  async renameProject(t, s) {
    return this.updateProject(t, (r) => {
      r.displayName = br(s);
    });
  }
  async saveEditorState(t, s) {
    return this.updateProject(t, (r) => {
      r.editorState = js(s);
    });
  }
  async deleteProject(t) {
    const r = (await this.open()).transaction([Z, te], "readwrite"), i = r.objectStore(Z);
    if (!await ve(i.get(t))) throw ie("project-not-found", "找不到项目。");
    const n = r.objectStore(te);
    (await ve(n.index(vt).getAll(t))).forEach((c) => n.delete([t, c.path])), i.delete(t), await ot(r);
  }
  async listEntries(t) {
    await this.getProject(t);
    const s = await this.open();
    return (await ve(
      s.transaction(te, "readonly").objectStore(te).index(vt).getAll(t)
    )).sort(Pr).map(Ke);
  }
  async readProjectState(t) {
    const r = (await this.open()).transaction([Z, te], "readonly"), i = await ve(r.objectStore(Z).get(t));
    if (!i) throw ie("project-not-found", "找不到项目。");
    const o = await ve(
      r.objectStore(te).index(vt).getAll(t)
    );
    return await ot(r), {
      project: Ke(i),
      entries: o.sort(Pr).map(Ke)
    };
  }
  async readTextFile(t, s) {
    const r = await this.getEntry(t, s);
    if (r.kind !== "file") throw ie("not-a-file", "目标不是文本文件。");
    return r.content;
  }
  async writeTextFile(t, s, r) {
    const i = oe(s), n = (await this.open()).transaction([Z, te], "readwrite"), a = await ps(n, t), c = n.objectStore(te), l = await ve(c.get([t, i]));
    if (!l) throw ie("file-not-found", "找不到文件。");
    if (l.kind !== "file") throw ie("not-a-file", "目标不是文本文件。");
    const u = this.now();
    c.put({ ...l, content: String(r), updatedAt: u }), a.updatedAt = u, n.objectStore(Z).put(a), await ot(n);
  }
  async createFile(t, s, r = "") {
    return this.createEntry(t, s, "file", String(r));
  }
  async createDirectory(t, s) {
    return this.createEntry(t, s, "directory", void 0);
  }
  async renameEntry(t, s, r) {
    const i = oe(s), o = oe(r);
    if (i === o) return this.getEntry(t, i);
    if (o.startsWith(`${i}/`))
      throw ie("invalid-project-path", "目录不能移动到自身内部。");
    const a = (await this.open()).transaction([Z, te], "readwrite"), c = await ps(a, t), l = a.objectStore(te), u = await ve(l.index(vt).getAll(t)), p = u.filter((j) => j.path === i || j.path.startsWith(`${i}/`));
    if (!p.length) throw ie("entry-not-found", "找不到文件或目录。");
    await wr(u, o);
    const w = new Set(p.map((j) => j.path)), g = new Set(p.map((j) => j.path === i ? o : `${o}${j.path.slice(i.length)}`));
    if (u.some((j) => !w.has(j.path) && g.has(j.path)))
      throw ie("entry-exists", "目标路径已经存在。");
    const _ = this.now();
    return p.forEach((j) => {
      const L = j.path === i ? o : `${o}${j.path.slice(i.length)}`;
      l.delete([t, j.path]), l.add({ ...j, path: L, updatedAt: _ });
    }), c.editorState = cu(c.editorState, i, o), c.updatedAt = _, a.objectStore(Z).put(c), await ot(a), this.getEntry(t, o);
  }
  async deleteEntry(t, s) {
    const r = oe(s), o = (await this.open()).transaction([Z, te], "readwrite"), n = await ps(o, t), a = o.objectStore(te), l = (await ve(a.index(vt).getAll(t))).filter((p) => p.path === r || p.path.startsWith(`${r}/`));
    if (!l.length) throw ie("entry-not-found", "找不到文件或目录。");
    l.forEach((p) => a.delete([t, p.path]));
    const u = this.now();
    n.editorState = fu(n.editorState, r), n.updatedAt = u, o.objectStore(Z).put(n), await ot(o);
  }
  async getEntry(t, s) {
    const r = oe(s);
    await this.getProject(t);
    const i = await this.open(), o = await ve(
      i.transaction(te, "readonly").objectStore(te).get([t, r])
    );
    if (!o) throw ie("entry-not-found", "找不到文件或目录。");
    return Ke(o);
  }
  async close() {
    if (!this.databasePromise) return;
    (await this.databasePromise).close(), this.databasePromise = null;
  }
  async open() {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((t, s) => {
      const r = this.indexedDB.open(this.databaseName, vr);
      r.onupgradeneeded = () => {
        const i = r.result;
        i.objectStoreNames.contains(Z) || i.createObjectStore(Z, { keyPath: "uuid" }), i.objectStoreNames.contains(te) || i.createObjectStore(te, { keyPath: ["projectId", "path"] }).createIndex(vt, "projectId", { unique: !1 });
      }, r.onsuccess = () => t(r.result), r.onerror = () => s(r.error || new Error("Developer Studio database failed to open.")), r.onblocked = () => s(new Error("Developer Studio database upgrade is blocked."));
    });
    try {
      return await this.databasePromise;
    } catch (t) {
      throw this.databasePromise = null, t;
    }
  }
  async updateProject(t, s) {
    const i = (await this.open()).transaction(Z, "readwrite"), o = i.objectStore(Z), n = await ve(o.get(t));
    if (!n) throw ie("project-not-found", "找不到项目。");
    return s(n), n.updatedAt = this.now(), o.put(n), await ot(i), Ke(n);
  }
  async createEntry(t, s, r, i) {
    const o = oe(s), a = (await this.open()).transaction([Z, te], "readwrite"), c = await ps(a, t), l = a.objectStore(te), u = await ve(l.index(vt).getAll(t));
    if (u.some((g) => g.path === o))
      throw ie("entry-exists", "目标路径已经存在。");
    await wr(u, o);
    const p = this.now(), w = {
      projectId: t,
      path: o,
      kind: r,
      ...r === "file" ? { content: String(i ?? "") } : {},
      createdAt: p,
      updatedAt: p
    };
    return l.add(w), c.updatedAt = p, a.objectStore(Z).put(c), await ot(a), Ke(w);
  }
}
function lu(e, t, s) {
  const r = /* @__PURE__ */ new Set(), i = e.map((o) => {
    const n = oe(o.path);
    if (r.has(n)) throw ie("entry-exists", `模板包含重复路径：${n}`);
    r.add(n);
    const a = o.kind === "directory" ? "directory" : "file";
    return {
      projectId: t,
      path: n,
      kind: a,
      ...a === "file" ? { content: String(o.content ?? "") } : {},
      createdAt: s,
      updatedAt: s
    };
  });
  return i.forEach((o) => {
    const n = is(o.path);
    if (!n) return;
    const a = i.find((c) => c.path === n);
    if (!a || a.kind !== "directory")
      throw ie("parent-directory-not-found", `模板缺少父目录：${n}`);
  }), i;
}
async function ps(e, t) {
  const s = await ve(e.objectStore(Z).get(t));
  if (!s) throw ie("project-not-found", "找不到项目。");
  return s;
}
async function wr(e, t) {
  const s = is(t);
  if (!s) return;
  const r = e.find((i) => i.path === s);
  if (!r || r.kind !== "directory")
    throw ie("parent-directory-not-found", "父目录不存在。");
}
function uu(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const s = [...t].map((r) => r.toString(16).padStart(2, "0"));
  return `${s.slice(0, 4).join("")}-${s.slice(4, 6).join("")}-${s.slice(6, 8).join("")}-${s.slice(8, 10).join("")}-${s.slice(10).join("")}`;
}
function br(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw ie("invalid-project-name", "项目名称不能为空。");
  return t;
}
function js(e) {
  const t = e && typeof e == "object" ? e : {}, s = (o) => [...new Set((Array.isArray(o) ? o : []).map((n) => {
    try {
      return oe(n);
    } catch {
      return null;
    }
  }).filter(Boolean))], r = s(t.openFiles), i = t.activeFile ? oe(t.activeFile) : r[0] || null;
  return {
    openFiles: r,
    activeFile: i,
    recentFiles: s(t.recentFiles).slice(0, 20)
  };
}
function cu(e, t, s) {
  const r = (i) => i === t || i?.startsWith(`${t}/`) ? `${s}${i.slice(t.length)}` : i;
  return js({
    openFiles: e?.openFiles?.map(r),
    activeFile: r(e?.activeFile),
    recentFiles: e?.recentFiles?.map(r)
  });
}
function fu(e, t) {
  const s = (i) => i !== t && !i.startsWith(`${t}/`), r = (e?.openFiles || []).filter(s);
  return js({
    openFiles: r,
    activeFile: e?.activeFile && s(e.activeFile) ? e.activeFile : r[0] || null,
    recentFiles: (e?.recentFiles || []).filter(s)
  });
}
function Pr(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function Ke(e) {
  return structuredClone(e);
}
function ve(e) {
  return new Promise((t, s) => {
    e.onsuccess = () => t(e.result), e.onerror = () => s(e.error || new Error("IndexedDB request failed."));
  });
}
function ot(e) {
  return new Promise((t, s) => {
    e.oncomplete = () => t(), e.onerror = () => s(e.error || new Error("IndexedDB transaction failed.")), e.onabort = () => s(e.error || new Error("IndexedDB transaction was aborted."));
  });
}
function ie(e, t) {
  const s = new Error(t);
  return s.code = e, s;
}
function xr(e, t) {
  return ru(e, t);
}
function du(e) {
  const t = [], s = /* @__PURE__ */ new Map();
  e.forEach((i) => s.set(i.path, {
    ...i,
    name: fn(i.path),
    children: []
  })), s.forEach((i) => {
    const o = is(i.path);
    o ? s.get(o)?.children.push(i) : t.push(i);
  });
  const r = (i) => i.sort((o, n) => o.kind !== n.kind ? o.kind === "directory" ? -1 : 1 : o.name.localeCompare(n.name)).forEach((o) => r(o.children));
  return r(t), t;
}
function pu(e) {
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
const Ti = "webwindows-project-snapshot-v1";
async function hu(e, t, s = {}) {
  if (!e || typeof e.readProjectState != "function")
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  const r = await e.readProjectState(t), i = r.entries.filter((l) => l.kind === "file").map((l) => Object.freeze({
    path: oe(l.path),
    content: String(l.content ?? ""),
    byteLength: Rt(l.content ?? "").byteLength
  })).sort((l, u) => vu(l.path, u.path)), o = /* @__PURE__ */ new Set();
  for (const l of i) {
    if (o.has(l.path)) throw new Error(`Snapshot contains duplicate path: ${l.path}`);
    o.add(l.path);
  }
  const n = i.reduce((l, u) => l + u.byteLength, 0), a = await gu(yu(r.project.uuid, i)), c = {
    contract: Ti,
    schemaVersion: 1,
    projectUuid: r.project.uuid,
    projectDisplayName: r.project.displayName,
    snapshotId: `wws1-${a}`,
    revisionHash: a,
    createdAt: s.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    manifestPath: "manifest.json",
    fileCount: i.length,
    totalBytes: n,
    files: Object.freeze(i)
  };
  return Object.freeze(c);
}
function mu(e, t) {
  const s = oe(t);
  return e.files.find((r) => r.path === s) || null;
}
async function gu(e) {
  const t = globalThis.crypto;
  if (!t?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const s = await t.subtle.digest("SHA-256", e);
  return [...new Uint8Array(s)].map((r) => r.toString(16).padStart(2, "0")).join("");
}
function yu(e, t) {
  const s = [Rt(`${Ti}\0${e}\0`)];
  for (const n of t) {
    const a = Rt(n.path), c = Rt(n.content);
    s.push(Sr(a.byteLength), a, Sr(c.byteLength), c);
  }
  const r = s.reduce((n, a) => n + a.byteLength, 0), i = new Uint8Array(r);
  let o = 0;
  for (const n of s)
    i.set(n, o), o += n.byteLength;
  return i;
}
function Sr(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e, !1), t;
}
function Rt(e) {
  return new TextEncoder().encode(String(e));
}
function vu(e, t) {
  const s = Rt(e), r = Rt(t), i = Math.min(s.length, r.length);
  for (let o = 0; o < i; o += 1)
    if (s[o] !== r[o]) return s[o] - r[o];
  return s.length - r.length;
}
let Xs;
async function dn() {
  return Xs || (Xs = wu()), Xs;
}
async function wu() {
  const e = await Promise.all([
    hs("/data/sdk/manifest-v1.schema.json"),
    hs("/data/sdk/package-runtime-policy-v1.json"),
    hs("/data/sdk/runtime-compatibility-v1.json"),
    hs("/data/sdk/studio-validator-rules-v1.json"),
    bu("/data/sdk/webwindows-public-api-v1.d.ts")
  ]);
  return Object.freeze({
    manifestSchema: e[0],
    packagePolicy: e[1],
    runtimeCompatibility: e[2],
    ruleCatalog: e[3],
    publicApiText: e[4]
  });
}
async function hs(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.json();
}
async function bu(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.text();
}
const Pu = "webwindows-studio-validation-report-v1";
async function xu(e, t = {}) {
  const s = t.contracts || await dn(), r = Au(s.ruleCatalog), i = [], o = (w, g = {}) => i.push(Ou(r, w, g));
  Su(s, o), _u(e, s.packagePolicy, o);
  const n = e.files.find((w) => w.path === "manifest.json");
  let a = null;
  if (!n)
    o("WWP001", { path: "manifest.json", message: "ZIP root 必须包含 manifest.json。" });
  else
    try {
      a = JSON.parse(n.content);
    } catch (w) {
      o("WWM001", {
        path: "manifest.json",
        location: Nu(n.content, w.message),
        message: w.message
      });
    }
  a && (ku(a, s.manifestSchema, o), $u(e, a, s.packagePolicy, o)), ju(e, a, s, o);
  const c = [...new Map(i.map((w) => [Hu(w), w])).values()].sort(qu), l = c.filter((w) => w.severity === "error").length, u = c.filter((w) => w.severity === "warning").length, p = typeof a?.entry == "string" ? a.entry : null;
  return {
    contract: Pu,
    schemaVersion: 1,
    validatorVersion: s.ruleCatalog.validatorVersion,
    snapshotId: e.snapshotId,
    projectUuid: e.projectUuid,
    manifestIdentity: Du(a),
    passed: l === 0,
    errorCount: l,
    warningCount: u,
    diagnostics: c,
    packageFacts: {
      fileCount: e.fileCount,
      unpackedBytes: e.totalBytes,
      entry: p,
      runtimeModel: s.packagePolicy.runtimeModel
    },
    scannerLimitations: [
      "Source diagnostics are conservative static checks, not a complete JavaScript security analysis.",
      "Dynamic URLs and computed property access may require future server/admin review."
    ]
  };
}
function Su(e, t) {
  const s = e.runtimeCompatibility.packageRuntime;
  (s?.status !== "supported" || s?.model !== e.packagePolicy.runtimeModel) && t("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
}
function _u(e, t, s) {
  (!e.files.length || e.fileCount !== e.files.length || e.fileCount > t.limits.maxFiles) && s("WWP003", {
    message: `文件数量必须为 1-${t.limits.maxFiles}，当前为 ${e.fileCount}。`,
    metadata: { limit: t.limits.maxFiles, actual: e.fileCount }
  }), e.totalBytes > t.limits.maxUnpackedBytes && s("WWP004", {
    message: `项目解压后不能超过 ${t.limits.maxUnpackedBytes} bytes。`,
    metadata: { limit: t.limits.maxUnpackedBytes, actual: e.totalBytes }
  });
  const r = new Set(t.allowedExtensions);
  for (const i of e.files) {
    try {
      const n = oe(i.path);
      if (n !== i.path || n.length > t.limits.maxPathCharacters)
        throw new Error("not canonical");
    } catch {
      s("WWP002", { path: i.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const o = In(i.path);
    r.has(o) || s("WWP005", {
      path: i.path,
      message: `Package Runtime 不允许文件类型 ${o || "(none)"}。`,
      metadata: { extension: o }
    });
  }
}
function ku(e, t, s) {
  if (!Wt(e))
    for (const o of Wt.errors || [])
      s("WWM002", {
        path: `manifest.json${Wu(o.instancePath, o.params?.missingProperty)}`,
        message: o.message || o.keyword,
        metadata: { keyword: o.keyword, schemaPath: o.schemaPath }
      });
  const r = t.$defs?.sourceManifest?.properties || {};
  for (const [o, n] of Object.entries(r)) {
    if (!Object.prototype.hasOwnProperty.call(e, o)) continue;
    const a = Iu(t, n), c = `${n.description || ""} ${a.description || ""}`;
    a.readOnly === !0 || /server-(?:managed|generated)|published catalog/i.test(c) ? s("WWM003", {
      path: `manifest.json$.${o}`,
      message: `${o} 是发布端生成的只读字段，不能进入 Source Manifest。`
    }) : /platform-reserved/i.test(c) && s("WWM004", {
      path: `manifest.json$.${o}`,
      message: `${o} 是平台保留字段。`
    });
  }
  const i = [
    [e.type === "system", "$.type", "system 类型属于第一方平台能力。"],
    [e.install?.source && e.install.source !== "repository", "$.install.source", "第三方 Source Manifest 应使用 repository source。"],
    [e.window?.mode && e.window.mode !== "iframe", "$.window.mode", "第三方功能当前仅兼容 iframe window mode。"]
  ];
  for (const [o, n, a] of i)
    o && s("WWM004", { path: `manifest.json${n}`, message: a });
}
function $u(e, t, s, r) {
  if (typeof t.entry != "string") return;
  let i;
  try {
    i = oe(t.entry);
  } catch {
    r("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  (!s.entryExtensions.includes(In(i)) || !mu(e, i)) && r("WWP006", {
    path: "manifest.json$.entry",
    message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
    metadata: { entry: i }
  });
}
function ju(e, t, s, r) {
  const i = Mu(s.publicApiText), o = new Set(e.files.map((n) => n.path));
  for (const n of e.files) {
    const a = In(n.path);
    a === ".js" && Eu(n, i, r), (a === ".html" || a === ".htm") && Cu(n, o, r), a === ".css" && Tu(n, r);
  }
  (s.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported" || s.runtimeCompatibility.packageRuntime.execution.network !== "none") && r("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
}
function Eu(e, t, s) {
  const r = Ru(e.content);
  Ye(r, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (i, o) => {
    s("WWS001", { path: e.path, location: qe(e.content, o), message: "Package Runtime 仅支持 classic JavaScript。" });
  }), Ye(r, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (i, o) => {
    s("WWS003", { path: e.path, location: qe(e.content, o), message: "功能代码不能引用私有 Native API。" });
  }), Ye(r, /\bparent\s*\.\s*WebWindows\b/g, (i, o) => {
    s("WWS004", { path: e.path, location: qe(e.content, o), message: "功能代码不能访问 parent.WebWindows。" });
  }), Ye(r, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (i, o) => {
    const n = i[1];
    t.has(n) || s("WWS004", {
      path: e.path,
      location: qe(e.content, o),
      message: `WebWindows.${n} 不属于 Public API v1。`,
      metadata: { namespace: n }
    });
  }), Ye(r, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (i, o) => {
    s("WWS005", {
      path: e.path,
      location: qe(e.content, o),
      message: `${i[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
}
function Cu(e, t, s) {
  Ye(e.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (r, i) => {
    s("WWS001", { path: e.path, location: qe(e.content, i), message: "Package Runtime 不支持 script type=module。" });
  }), Ye(e.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (r, i) => {
    const o = r[2], n = Fu(e.path, o);
    (!n || !t.has(n)) && s("WWS002", {
      path: e.path,
      location: qe(e.content, i),
      message: `脚本或样式依赖必须包含在功能包内：${o}`,
      metadata: { reference: o }
    });
  }), Ye(e.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (r, i) => {
    s("WWS002", {
      path: e.path,
      location: qe(e.content, i),
      message: `外部资源在无网络 Runtime 中不可用：${r[1]}`,
      metadata: { reference: r[1] }
    });
  });
}
function Tu(e, t) {
  Ye(e.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (s, r) => {
    t("WWS002", {
      path: e.path,
      location: qe(e.content, r),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${s[1]}`,
      metadata: { reference: s[1] }
    });
  });
}
function Au(e) {
  return new Map(e.rules.map((t) => [t.ruleId, t]));
}
function Ou(e, t, s) {
  const r = e.get(t);
  if (!r) throw new Error(`Unknown validator rule: ${t}`);
  return {
    ruleId: t,
    category: r.category,
    severity: s.severity || r.defaultSeverity,
    path: s.path || null,
    location: s.location || null,
    message: s.message || r.title,
    ...s.metadata ? { metadata: s.metadata } : {}
  };
}
function Mu(e) {
  const t = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(e)?.[1] || "";
  return new Set([...t.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((s) => s[1]));
}
function Iu(e, t) {
  return t?.$ref?.startsWith("#/$defs/") ? e.$defs?.[t.$ref.slice(8)] || t : t || {};
}
function Fu(e, t) {
  const s = String(t || "").split(/[?#]/, 1)[0];
  if (!s || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(s)) return null;
  const r = e.split("/").slice(0, -1);
  for (const i of s.replace(/\\/g, "/").split("/"))
    !i || i === "." || (i === ".." ? r.pop() : r.push(i));
  return r.join("/");
}
function Ru(e) {
  return e.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (t) => t.replace(/[^\n]/g, " ")
  );
}
function Ye(e, t, s) {
  for (const r of e.matchAll(t)) s(r, r.index || 0);
}
function qe(e, t) {
  const s = e.slice(0, t).split(`
`);
  return { line: s.length, column: s.at(-1).length + 1 };
}
function Nu(e, t) {
  const s = /position\s+(\d+)/i.exec(t);
  return qe(e, s ? Number(s[1]) : 0);
}
function Wu(e, t) {
  return `$${(e || (t ? `/${t}` : "")).split("/").slice(1).map((r) => /^\d+$/.test(r) ? `[${r}]` : `.${r.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}
function Du(e) {
  return !e || typeof e.id != "string" || typeof e.version != "string" ? null : { id: e.id, version: e.version, name: typeof e.name == "string" ? e.name : null };
}
function In(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function qu(e, t) {
  return e.ruleId.localeCompare(t.ruleId) || String(e.path || "").localeCompare(String(t.path || "")) || (e.location?.line || 0) - (t.location?.line || 0) || e.message.localeCompare(t.message);
}
function Hu(e) {
  return [
    e.ruleId,
    e.severity,
    e.path || "",
    e.location?.line || 0,
    e.location?.column || 0,
    e.message
  ].join("\0");
}
const Lu = { class: "developer-studio" }, Uu = { class: "studio-toolbar" }, Vu = ["value"], zu = ["value"], Bu = ["disabled"], Ku = ["disabled"], Ju = ["disabled"], Gu = ["disabled"], Zu = {
  key: 0,
  class: "studio-main"
}, Yu = { class: "explorer-panel" }, Xu = { class: "panel-heading" }, Qu = { class: "panel-actions" }, ec = ["disabled"], tc = ["disabled"], sc = { class: "file-tree" }, nc = { class: "editor-workbench" }, rc = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, ic = ["onClick"], oc = {
  key: 0,
  class: "dirty-dot"
}, ac = { class: "editor-host" }, lc = {
  key: 1,
  class: "empty-editor"
}, uc = { class: "inspector-panel" }, cc = { class: "inspector-content" }, fc = { class: "project-uuid" }, dc = { class: "build-inspector" }, pc = { key: 0 }, hc = { key: 1 }, mc = {
  key: 0,
  class: "build-blocked"
}, gc = { key: 1 }, yc = { class: "hash-row" }, vc = ["disabled"], wc = {
  key: 1,
  class: "empty-workspace studio-main"
}, bc = { class: "problems-panel" }, Pc = { class: "panel-heading" }, xc = {
  key: 0,
  class: "problems-empty"
}, Sc = ["onClick"], _c = { class: "studio-dialog-actions" }, kc = {
  class: "primary",
  type: "submit"
}, $c = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new au(), s = se([]), r = se(null), i = se([]), o = se(""), n = se([]), a = se(""), c = se(""), l = se(/* @__PURE__ */ new Set()), u = se(null), p = se([]), w = se(null), g = se(null), _ = se(!1), j = se(""), L = se(""), C = se(null);
    let O = null, M = 0, A = 0;
    const Q = Pt(() => du(i.value)), Ae = Pt(() => i.value.find((m) => m.path === a.value)), ke = Pt(() => pu(a.value)), Oe = Pt(() => a.value === "manifest.json" ? p.value : []), nt = Pt(() => w.value?.diagnostics || p.value.map((m) => ({
      ruleId: "Manifest",
      severity: m.severity,
      path: m.path,
      message: m.message
    })));
    En(async () => {
      try {
        await $e(), s.value.length && await Ve(s.value[0].uuid);
      } catch (m) {
        ee(m);
      }
    }), Cn(() => {
      clearTimeout(M), t.close();
    });
    async function $e() {
      s.value = await t.listProjects();
    }
    async function rt() {
      try {
        await re();
        const m = nu(), d = await P("新建 WebWindows 功能", "项目名称", m.displayName);
        if (d == null) return;
        const b = await t.createProject({ ...m, displayName: d });
        await $e(), await Ve(b.uuid), Me("Hello WebWindows 项目已创建。");
      } catch (m) {
        ee(m);
      }
    }
    async function Ve(m) {
      if (!m) return;
      await re(), r.value = await t.getProject(m), i.value = await t.listEntries(m);
      const d = r.value.editorState || {};
      n.value = (d.openFiles || []).filter((b) => i.value.some((k) => k.path === b && k.kind === "file")), a.value = i.value.some((b) => b.path === d.activeFile && b.kind === "file") ? d.activeFile : n.value[0] || "", o.value = a.value, l.value = /* @__PURE__ */ new Set(), y(), await z(), await _t(), await qt();
    }
    async function St() {
      if (!r.value) return;
      const m = await P("重命名项目", "新的项目名称", r.value.displayName);
      if (m != null)
        try {
          r.value = await t.renameProject(r.value.uuid, m), await $e(), Me("项目已重命名。");
        } catch (d) {
          ee(d);
        }
    }
    async function Dt() {
      if (r.value && await x("删除项目", `永久删除项目“${r.value.displayName}”及其全部文件吗？`))
        try {
          const m = r.value.uuid;
          await t.deleteProject(m), r.value = null, i.value = [], n.value = [], a.value = "", o.value = "", c.value = "", y(), await $e(), s.value.length && await Ve(s.value[0].uuid), Me("项目已删除。");
        } catch (m) {
          ee(m);
        }
    }
    async function ls(m) {
      o.value = m.path, m.kind === "file" && await X(m.path);
    }
    async function X(m) {
      if (!r.value) return;
      await re();
      const d = oe(m);
      n.value.includes(d) || n.value.push(d), a.value = d, o.value = d, await z(), await qt();
    }
    async function z() {
      if (!r.value || !a.value) {
        c.value = "";
        return;
      }
      c.value = await t.readTextFile(r.value.uuid, a.value), a.value === "manifest.json" && await Ce(c.value), await Yr();
    }
    function U(m) {
      c.value = m, a.value && (l.value = new Set(l.value).add(a.value), y(), a.value === "manifest.json" && Ce(m).catch(ee), clearTimeout(M), M = window.setTimeout(() => re().catch(ee), 700));
    }
    async function Ce(m) {
      const d = ++A, b = await Ql(m);
      d === A && (u.value = b.manifest, p.value = b.diagnostics);
    }
    async function _t() {
      if (!r.value || !i.value.some((d) => d.path === "manifest.json" && d.kind === "file")) {
        u.value = null, p.value = [];
        return;
      }
      const m = a.value === "manifest.json" ? c.value : await t.readTextFile(r.value.uuid, "manifest.json");
      await Ce(m);
    }
    async function ze(m) {
      a.value !== "manifest.json" && await X("manifest.json"), U(`${JSON.stringify(m, null, 2)}
`);
    }
    async function re() {
      if (clearTimeout(M), M = 0, !r.value || !a.value || !l.value.has(a.value)) return;
      const m = a.value;
      await t.writeTextFile(r.value.uuid, m, c.value);
      const d = new Set(l.value);
      d.delete(m), l.value = d, r.value = await t.getProject(r.value.uuid);
    }
    async function qt() {
      if (!r.value) return;
      const m = [a.value, ...r.value.editorState?.recentFiles || []].filter(Boolean);
      r.value = await t.saveEditorState(r.value.uuid, {
        openFiles: n.value,
        activeFile: a.value || null,
        recentFiles: [...new Set(m)].slice(0, 20)
      });
    }
    function Ds() {
      const m = i.value.find((d) => d.path === o.value);
      return m?.kind === "directory" ? m.path : m?.path ? is(m.path) : "";
    }
    async function us(m) {
      if (!r.value) return;
      const b = await P(m === "directory" ? "新建目录" : "新建文件", m === "directory" ? "目录名称" : "文件名称", m === "directory" ? "new-folder" : "new-file.js");
      if (b != null)
        try {
          const k = xr(Ds(), b);
          m === "directory" ? await t.createDirectory(r.value.uuid, k) : await t.createFile(r.value.uuid, k, ""), y(), i.value = await t.listEntries(r.value.uuid), o.value = k, m === "file" && await X(k);
        } catch (k) {
          ee(k);
        }
    }
    async function mt() {
      const m = i.value.find((b) => b.path === o.value);
      if (!m || !r.value) return;
      const d = await P("重命名", "新的名称", fn(m.path));
      if (d != null)
        try {
          await re();
          const b = xr(is(m.path), d);
          await t.renameEntry(r.value.uuid, m.path, b), y(), i.value = await t.listEntries(r.value.uuid), r.value = await t.getProject(r.value.uuid), n.value = r.value.editorState.openFiles, a.value = r.value.editorState.activeFile || "", o.value = b, await z();
        } catch (b) {
          ee(b);
        }
    }
    async function kt() {
      const m = i.value.find((d) => d.path === o.value);
      if (!(!m || !r.value) && await x("删除文件或目录", `删除“${m.path}”${m.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(r.value.uuid, m.path), y(), i.value = await t.listEntries(r.value.uuid), r.value = await t.getProject(r.value.uuid), n.value = r.value.editorState.openFiles, a.value = r.value.editorState.activeFile || "", o.value = a.value, await z();
        } catch (d) {
          ee(d);
        }
    }
    function Me(m) {
      j.value = m, L.value = "", window.setTimeout(() => {
        j.value === m && (j.value = "");
      }, 2400);
    }
    function ee(m) {
      j.value = m?.message || "操作失败。", L.value = "error";
    }
    async function it() {
      if (!r.value) throw new Error("请先打开项目。");
      return await re(), hu(t, r.value.uuid);
    }
    async function Fn() {
      if (!_.value) {
        _.value = !0;
        try {
          const m = await it(), d = await dn();
          w.value = await xu(m, { contracts: d }), g.value = null, Me(w.value.passed ? "项目验证通过。" : `验证发现 ${w.value.errorCount} 个错误。`);
        } catch (m) {
          ee(m);
        } finally {
          _.value = !1;
        }
      }
    }
    async function f() {
      if (!_.value) {
        _.value = !0;
        try {
          const m = await it(), d = await dn(), { buildProjectPackage: b } = await import("./deterministic-builder-DJVs3sh1.js");
          g.value = await b(m, { contracts: d }), w.value = g.value.validationReport, Me(g.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
        } catch (m) {
          ee(m);
        } finally {
          _.value = !1;
        }
      }
    }
    function h() {
      if (!g.value?.artifactReady || !g.value.zipBytes) return;
      const m = g.value.manifestIdentity, d = `${m?.id || "webwindows-function"}-${m?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-"), b = new Blob([g.value.zipBytes], { type: "application/zip" }), k = URL.createObjectURL(b), T = document.createElement("a");
      T.href = k, T.download = `${d}.zip`, T.click(), window.setTimeout(() => URL.revokeObjectURL(k), 0);
    }
    function y() {
      w.value = null, g.value = null;
    }
    function S(m) {
      const d = i.value.find((b) => b.kind === "file" && (m.path === b.path || m.path?.startsWith(`${b.path}$`)));
      d && X(d.path).catch(ee);
    }
    function P(m, d, b) {
      return E({ kind: "text", title: m, message: d, value: b });
    }
    function x(m, d) {
      return E({ kind: "confirm", title: m, message: d, value: "" });
    }
    function E(m) {
      return O && O(null), C.value = { ...m }, new Promise((d) => {
        O = d;
      });
    }
    function $(m) {
      const d = O;
      O = null, C.value = null, d?.(m);
    }
    return (m, d) => (W(), D("main", Lu, [
      v("header", Uu, [
        d[11] || (d[11] = v("div", { class: "studio-brand" }, [
          v("strong", null, "Developer Studio"),
          v("span", null, "WebWindows Function IDE")
        ], -1)),
        v("button", {
          class: "primary",
          type: "button",
          onClick: rt
        }, "新建功能"),
        v("select", {
          "aria-label": "打开项目",
          value: r.value?.uuid || "",
          onChange: d[0] || (d[0] = (b) => Ve(b.target.value).catch(ee))
        }, [
          d[10] || (d[10] = v("option", {
            value: "",
            disabled: ""
          }, "打开项目…", -1)),
          (W(!0), D(he, null, Vt(s.value, (b) => (W(), D("option", {
            key: b.uuid,
            value: b.uuid
          }, G(b.displayName), 9, zu))), 128))
        ], 40, Vu),
        v("button", {
          type: "button",
          disabled: !r.value,
          onClick: St
        }, "重命名项目", 8, Bu),
        v("button", {
          type: "button",
          disabled: !r.value,
          onClick: Dt
        }, "删除项目", 8, Ku),
        d[12] || (d[12] = v("span", { class: "toolbar-spacer" }, null, -1)),
        v("button", {
          type: "button",
          disabled: !r.value || _.value,
          onClick: Fn
        }, "Validate", 8, Ju),
        v("button", {
          class: "primary",
          type: "button",
          disabled: !r.value || _.value,
          onClick: f
        }, "Build", 8, Gu),
        d[13] || (d[13] = v("button", {
          type: "button",
          disabled: "",
          title: "Phase 1C 提供 Run/Preview"
        }, "Run available in next phase", -1))
      ]),
      r.value ? (W(), D("section", Zu, [
        v("aside", Yu, [
          v("div", Xu, [
            v("span", null, "Project · " + G(r.value.displayName), 1),
            v("div", Qu, [
              v("button", {
                type: "button",
                title: "新建文件",
                onClick: d[1] || (d[1] = (b) => us("file"))
              }, "＋F"),
              v("button", {
                type: "button",
                title: "新建目录",
                onClick: d[2] || (d[2] = (b) => us("directory"))
              }, "＋D"),
              v("button", {
                type: "button",
                title: "重命名",
                disabled: !o.value,
                onClick: mt
              }, "R", 8, ec),
              v("button", {
                type: "button",
                title: "删除",
                disabled: !o.value,
                onClick: kt
              }, "×", 8, tc)
            ])
          ]),
          v("div", sc, [
            (W(!0), D(he, null, Vt(Q.value, (b) => (W(), ks(cl, {
              key: b.path,
              node: b,
              "selected-path": o.value,
              onSelect: ls
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ]),
        v("section", nc, [
          v("nav", rc, [
            (W(!0), D(he, null, Vt(n.value, (b) => (W(), D("button", {
              key: b,
              type: "button",
              class: Xe(["editor-tab", { active: b === a.value }]),
              onClick: (k) => X(b).catch(ee)
            }, [
              v("span", null, G(Jr(fn)(b)), 1),
              l.value.has(b) ? (W(), D("span", oc, "•")) : lt("", !0)
            ], 10, ic))), 128))
          ]),
          v("div", ac, [
            Ae.value?.kind === "file" ? (W(), ks(pl, {
              key: `${r.value.uuid}:${a.value}`,
              "project-id": r.value.uuid,
              path: a.value,
              language: ke.value,
              value: c.value,
              markers: Oe.value,
              "onUpdate:value": U,
              onSave: d[3] || (d[3] = (b) => re().then(() => Me("已保存。")).catch(ee)),
              onError: ee
            }, null, 8, ["project-id", "path", "language", "value", "markers"])) : (W(), D("div", lc, [...d[14] || (d[14] = [
              v("h2", null, "选择文件开始编辑", -1),
              v("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ])
        ]),
        v("aside", uc, [
          d[26] || (d[26] = v("div", { class: "panel-heading" }, [
            v("span", null, "Manifest / Inspector")
          ], -1)),
          v("div", cc, [
            d[25] || (d[25] = v("h2", null, "Manifest v1", -1)),
            v("p", fc, "项目 UUID：" + G(r.value.uuid), 1),
            Le(Wl, {
              manifest: u.value,
              diagnostics: p.value,
              "onUpdate:manifest": d[4] || (d[4] = (b) => ze(b).catch(ee)),
              onOpenJson: d[5] || (d[5] = (b) => X("manifest.json").catch(ee))
            }, null, 8, ["manifest", "diagnostics"]),
            v("section", dc, [
              d[24] || (d[24] = v("h3", null, "Validation", -1)),
              w.value ? (W(), D("dl", hc, [
                v("div", null, [
                  d[15] || (d[15] = v("dt", null, "Result", -1)),
                  v("dd", null, G(w.value.passed ? "Passed" : "Blocked"), 1)
                ]),
                v("div", null, [
                  d[16] || (d[16] = v("dt", null, "Errors", -1)),
                  v("dd", null, G(w.value.errorCount), 1)
                ]),
                v("div", null, [
                  d[17] || (d[17] = v("dt", null, "Warnings", -1)),
                  v("dd", null, G(w.value.warningCount), 1)
                ]),
                v("div", null, [
                  d[18] || (d[18] = v("dt", null, "Files", -1)),
                  v("dd", null, G(w.value.packageFacts.fileCount), 1)
                ]),
                v("div", null, [
                  d[19] || (d[19] = v("dt", null, "Bytes", -1)),
                  v("dd", null, G(w.value.packageFacts.unpackedBytes), 1)
                ])
              ])) : (W(), D("p", pc, "尚未创建 Snapshot 验证。")),
              g.value ? (W(), D(he, { key: 2 }, [
                d[23] || (d[23] = v("h3", null, "Build Result", -1)),
                g.value.artifactReady ? (W(), D("dl", gc, [
                  v("div", null, [
                    d[20] || (d[20] = v("dt", null, "Size", -1)),
                    v("dd", null, G(g.value.zipSize) + " bytes", 1)
                  ]),
                  v("div", null, [
                    d[21] || (d[21] = v("dt", null, "Files", -1)),
                    v("dd", null, G(g.value.fileCount), 1)
                  ]),
                  v("div", yc, [
                    d[22] || (d[22] = v("dt", null, "SHA-256", -1)),
                    v("dd", null, G(g.value.sha256), 1)
                  ])
                ])) : (W(), D("p", mc, "验证未通过，没有生成可发布 ZIP。")),
                v("button", {
                  type: "button",
                  disabled: !g.value.artifactReady,
                  onClick: h
                }, "Export ZIP", 8, vc)
              ], 64)) : lt("", !0)
            ])
          ])
        ])
      ])) : (W(), D("section", wc, [
        d[27] || (d[27] = v("h2", null, "创建第一个 WebWindows 功能", -1)),
        d[28] || (d[28] = v("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        v("button", {
          class: "primary",
          type: "button",
          onClick: rt
        }, "新建 Hello WebWindows")
      ])),
      v("section", bc, [
        v("div", Pc, [
          d[29] || (d[29] = v("span", null, "Problems", -1)),
          v("span", null, G(nt.value.length), 1)
        ]),
        nt.value.length ? lt("", !0) : (W(), D("div", xc, "当前 Snapshot 未发现问题。")),
        (W(!0), D(he, null, Vt(nt.value, (b, k) => (W(), D("button", {
          key: `${b.ruleId}:${b.path}:${k}`,
          type: "button",
          class: "problem-row",
          onClick: (T) => S(b)
        }, [
          v("span", {
            class: Xe(["problem-severity", b.severity])
          }, G(b.ruleId), 3),
          v("code", null, G(b.path), 1),
          v("span", null, G(b.message), 1)
        ], 8, Sc))), 128))
      ]),
      j.value ? (W(), D("div", {
        key: 2,
        class: Xe(["studio-status", L.value]),
        role: "status"
      }, G(j.value), 3)) : lt("", !0),
      C.value ? (W(), D("div", {
        key: 3,
        class: "studio-dialog-backdrop",
        onKeydown: d[9] || (d[9] = el((b) => $(C.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        v("form", {
          class: "studio-dialog",
          onSubmit: d[8] || (d[8] = Mn((b) => $(C.value.kind === "confirm" ? !0 : C.value.value), ["prevent"]))
        }, [
          v("h2", null, G(C.value.title), 1),
          v("p", null, G(C.value.message), 1),
          C.value.kind === "text" ? Po((W(), D("input", {
            key: 0,
            "onUpdate:modelValue": d[6] || (d[6] = (b) => C.value.value = b),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [Za, C.value.value]
          ]) : lt("", !0),
          v("div", _c, [
            v("button", {
              type: "button",
              onClick: d[7] || (d[7] = (b) => $(C.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            v("button", kc, G(C.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : lt("", !0)
    ]));
  }
};
nl($c).mount("#developer-studio-app");
export {
  mu as g,
  gu as s,
  xu as v
};
