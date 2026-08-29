/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function an(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Q = {}, Zt = [], et = () => {
}, ki = () => !1, gr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), ln = (e) => e.startsWith("onUpdate:"), xe = Object.assign, un = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, jo = Object.prototype.hasOwnProperty, J = (e, t) => jo.call(e, t), D = Array.isArray, Kt = (e) => zs(e) === "[object Map]", wr = (e) => zs(e) === "[object Set]", jn = (e) => zs(e) === "[object Date]", V = (e) => typeof e == "function", de = (e) => typeof e == "string", st = (e) => typeof e == "symbol", se = (e) => e !== null && typeof e == "object", $i = (e) => (se(e) || V(e)) && V(e.then) && V(e.catch), Ii = Object.prototype.toString, zs = (e) => Ii.call(e), To = (e) => zs(e).slice(8, -1), qi = (e) => zs(e) === "[object Object]", cn = (e) => de(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Ps = /* @__PURE__ */ an(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), vr = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((n) => t[n] || (t[n] = e(n)));
}, Eo = /-\w/g, Ve = vr(
  (e) => e.replace(Eo, (t) => t.slice(1).toUpperCase())
), Oo = /\B([A-Z])/g, xt = vr(
  (e) => e.replace(Oo, "-$1").toLowerCase()
), br = vr((e) => e.charAt(0).toUpperCase() + e.slice(1)), Tr = vr(
  (e) => e ? `on${br(e)}` : ""
), kt = (e, t) => !Object.is(e, t), Gs = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, xi = (e, t, n, a = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: a,
    value: n
  });
}, er = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Tn;
const Pr = () => Tn || (Tn = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function dn(e) {
  if (D(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const a = e[n], l = de(a) ? Lo(a) : dn(a);
      if (l)
        for (const u in l)
          t[u] = l[u];
    }
    return t;
  } else if (de(e) || se(e))
    return e;
}
const Mo = /;(?![^(]*\))/g, Co = /:([^]+)/, No = /\/\*[^]*?\*\//g;
function Lo(e) {
  const t = {};
  return e.replace(No, "").split(Mo).forEach((n) => {
    if (n) {
      const a = n.split(Co);
      a.length > 1 && (t[a[0].trim()] = a[1].trim());
    }
  }), t;
}
function Ae(e) {
  let t = "";
  if (de(e))
    t = e;
  else if (D(e))
    for (let n = 0; n < e.length; n++) {
      const a = Ae(e[n]);
      a && (t += a + " ");
    }
  else if (se(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const zo = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ro = /* @__PURE__ */ an(zo);
function Si(e) {
  return !!e || e === "";
}
function Wo(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let a = 0; n && a < e.length; a++)
    n = kr(e[a], t[a]);
  return n;
}
function kr(e, t) {
  if (e === t) return !0;
  let n = jn(e), a = jn(t);
  if (n || a)
    return n && a ? e.getTime() === t.getTime() : !1;
  if (n = st(e), a = st(t), n || a)
    return e === t;
  if (n = D(e), a = D(t), n || a)
    return n && a ? Wo(e, t) : !1;
  if (n = se(e), a = se(t), n || a) {
    if (!n || !a)
      return !1;
    const l = Object.keys(e).length, u = Object.keys(t).length;
    if (l !== u)
      return !1;
    for (const s in e) {
      const o = e.hasOwnProperty(s), c = t.hasOwnProperty(s);
      if (o && !c || !o && c || !kr(e[s], t[s]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function Do(e, t) {
  return e.findIndex((n) => kr(n, t));
}
const _i = (e) => !!(e && e.__v_isRef === !0), H = (e) => de(e) ? e : e == null ? "" : D(e) || se(e) && (e.toString === Ii || !V(e.toString)) ? _i(e) ? H(e.value) : JSON.stringify(e, Ai, 2) : String(e), Ai = (e, t) => _i(t) ? Ai(e, t.value) : Kt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [a, l], u) => (n[Er(a, u) + " =>"] = l, n),
    {}
  )
} : wr(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Er(n))
} : st(t) ? Er(t) : se(t) && !D(t) && !qi(t) ? String(t) : t, Er = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    st(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let _e;
class Fo {
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
      let n, a;
      for (n = 0, a = this.effects.length; n < a; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, a = this.cleanups.length; n < a; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, a = this.scopes.length; n < a; n++)
          this.scopes[n].stop(!0);
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
function Vo() {
  return _e;
}
let ee;
const Or = /* @__PURE__ */ new WeakSet();
class ji {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, _e && _e.active && _e.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Or.has(this) && (Or.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ei(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, En(this), Oi(this);
    const t = ee, n = Ze;
    ee = this, Ze = !0;
    try {
      return this.fn();
    } finally {
      Mi(this), ee = t, Ze = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        mn(t);
      this.deps = this.depsTail = void 0, En(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Or.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Br(this) && this.run();
  }
  get dirty() {
    return Br(this);
  }
}
let Ti = 0, ks, $s;
function Ei(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = $s, $s = e;
    return;
  }
  e.next = ks, ks = e;
}
function pn() {
  Ti++;
}
function fn() {
  if (--Ti > 0)
    return;
  if ($s) {
    let t = $s;
    for ($s = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; ks; ) {
    let t = ks;
    for (ks = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (a) {
          e || (e = a);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function Oi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Mi(e) {
  let t, n = e.depsTail, a = n;
  for (; a; ) {
    const l = a.prevDep;
    a.version === -1 ? (a === n && (n = l), mn(a), Ho(a)) : t = a, a.dep.activeLink = a.prevActiveLink, a.prevActiveLink = void 0, a = l;
  }
  e.deps = t, e.depsTail = n;
}
function Br(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Ci(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Ci(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === As) || (e.globalVersion = As, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Br(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = ee, a = Ze;
  ee = e, Ze = !0;
  try {
    Oi(e);
    const l = e.fn(e._value);
    (t.version === 0 || kt(l, e._value)) && (e.flags |= 128, e._value = l, t.version++);
  } catch (l) {
    throw t.version++, l;
  } finally {
    ee = n, Ze = a, Mi(e), e.flags &= -3;
  }
}
function mn(e, t = !1) {
  const { dep: n, prevSub: a, nextSub: l } = e;
  if (a && (a.nextSub = l, e.prevSub = void 0), l && (l.prevSub = a, e.nextSub = void 0), n.subs === e && (n.subs = a, !a && n.computed)) {
    n.computed.flags &= -5;
    for (let u = n.computed.deps; u; u = u.nextDep)
      mn(u, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Ho(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let Ze = !0;
const Ni = [];
function mt() {
  Ni.push(Ze), Ze = !1;
}
function ht() {
  const e = Ni.pop();
  Ze = e === void 0 ? !0 : e;
}
function En(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = ee;
    ee = void 0;
    try {
      t();
    } finally {
      ee = n;
    }
  }
}
let As = 0;
class Uo {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class hn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!ee || !Ze || ee === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== ee)
      n = this.activeLink = new Uo(ee, this), ee.deps ? (n.prevDep = ee.depsTail, ee.depsTail.nextDep = n, ee.depsTail = n) : ee.deps = ee.depsTail = n, Li(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const a = n.nextDep;
      a.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = a), n.prevDep = ee.depsTail, n.nextDep = void 0, ee.depsTail.nextDep = n, ee.depsTail = n, ee.deps === n && (ee.deps = a);
    }
    return n;
  }
  trigger(t) {
    this.version++, As++, this.notify(t);
  }
  notify(t) {
    pn();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      fn();
    }
  }
}
function Li(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let a = t.deps; a; a = a.nextDep)
        Li(a);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Zr = /* @__PURE__ */ new WeakMap(), Dt = Symbol(
  ""
), Kr = Symbol(
  ""
), js = Symbol(
  ""
);
function ve(e, t, n) {
  if (Ze && ee) {
    let a = Zr.get(e);
    a || Zr.set(e, a = /* @__PURE__ */ new Map());
    let l = a.get(n);
    l || (a.set(n, l = new hn()), l.map = a, l.key = n), l.track();
  }
}
function ut(e, t, n, a, l, u) {
  const s = Zr.get(e);
  if (!s) {
    As++;
    return;
  }
  const o = (c) => {
    c && c.trigger();
  };
  if (pn(), t === "clear")
    s.forEach(o);
  else {
    const c = D(e), r = c && cn(n);
    if (c && n === "length") {
      const i = Number(a);
      s.forEach((d, y) => {
        (y === "length" || y === js || !st(y) && y >= i) && o(d);
      });
    } else
      switch ((n !== void 0 || s.has(void 0)) && o(s.get(n)), r && o(s.get(js)), t) {
        case "add":
          c ? r && o(s.get("length")) : (o(s.get(Dt)), Kt(e) && o(s.get(Kr)));
          break;
        case "delete":
          c || (o(s.get(Dt)), Kt(e) && o(s.get(Kr)));
          break;
        case "set":
          Kt(e) && o(s.get(Dt));
          break;
      }
  }
  fn();
}
function Ut(e) {
  const t = K(e);
  return t === e ? t : (ve(t, "iterate", js), Fe(e) ? t : t.map(ye));
}
function $r(e) {
  return ve(e = K(e), "iterate", js), e;
}
const Bo = {
  __proto__: null,
  [Symbol.iterator]() {
    return Mr(this, Symbol.iterator, ye);
  },
  concat(...e) {
    return Ut(this).concat(
      ...e.map((t) => D(t) ? Ut(t) : t)
    );
  },
  entries() {
    return Mr(this, "entries", (e) => (e[1] = ye(e[1]), e));
  },
  every(e, t) {
    return ot(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return ot(this, "filter", e, t, (n) => n.map(ye), arguments);
  },
  find(e, t) {
    return ot(this, "find", e, t, ye, arguments);
  },
  findIndex(e, t) {
    return ot(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return ot(this, "findLast", e, t, ye, arguments);
  },
  findLastIndex(e, t) {
    return ot(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return ot(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Cr(this, "includes", e);
  },
  indexOf(...e) {
    return Cr(this, "indexOf", e);
  },
  join(e) {
    return Ut(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Cr(this, "lastIndexOf", e);
  },
  map(e, t) {
    return ot(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return ps(this, "pop");
  },
  push(...e) {
    return ps(this, "push", e);
  },
  reduce(e, ...t) {
    return On(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return On(this, "reduceRight", e, t);
  },
  shift() {
    return ps(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return ot(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return ps(this, "splice", e);
  },
  toReversed() {
    return Ut(this).toReversed();
  },
  toSorted(e) {
    return Ut(this).toSorted(e);
  },
  toSpliced(...e) {
    return Ut(this).toSpliced(...e);
  },
  unshift(...e) {
    return ps(this, "unshift", e);
  },
  values() {
    return Mr(this, "values", ye);
  }
};
function Mr(e, t, n) {
  const a = $r(e), l = a[t]();
  return a !== e && !Fe(e) && (l._next = l.next, l.next = () => {
    const u = l._next();
    return u.value && (u.value = n(u.value)), u;
  }), l;
}
const Zo = Array.prototype;
function ot(e, t, n, a, l, u) {
  const s = $r(e), o = s !== e && !Fe(e), c = s[t];
  if (c !== Zo[t]) {
    const d = c.apply(e, u);
    return o ? ye(d) : d;
  }
  let r = n;
  s !== e && (o ? r = function(d, y) {
    return n.call(this, ye(d), y, e);
  } : n.length > 2 && (r = function(d, y) {
    return n.call(this, d, y, e);
  }));
  const i = c.call(s, r, a);
  return o && l ? l(i) : i;
}
function On(e, t, n, a) {
  const l = $r(e);
  let u = n;
  return l !== e && (Fe(e) ? n.length > 3 && (u = function(s, o, c) {
    return n.call(this, s, o, c, e);
  }) : u = function(s, o, c) {
    return n.call(this, s, ye(o), c, e);
  }), l[t](u, ...a);
}
function Cr(e, t, n) {
  const a = K(e);
  ve(a, "iterate", js);
  const l = a[t](...n);
  return (l === -1 || l === !1) && vn(n[0]) ? (n[0] = K(n[0]), a[t](...n)) : l;
}
function ps(e, t, n = []) {
  mt(), pn();
  const a = K(e)[t].apply(e, n);
  return fn(), ht(), a;
}
const Ko = /* @__PURE__ */ an("__proto__,__v_isRef,__isVue"), zi = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(st)
);
function Jo(e) {
  st(e) || (e = String(e));
  const t = K(this);
  return ve(t, "has", e), t.hasOwnProperty(e);
}
class Ri {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, a) {
    if (n === "__v_skip") return t.__v_skip;
    const l = this._isReadonly, u = this._isShallow;
    if (n === "__v_isReactive")
      return !l;
    if (n === "__v_isReadonly")
      return l;
    if (n === "__v_isShallow")
      return u;
    if (n === "__v_raw")
      return a === (l ? u ? ia : Vi : u ? Fi : Di).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(a) ? t : void 0;
    const s = D(t);
    if (!l) {
      let c;
      if (s && (c = Bo[n]))
        return c;
      if (n === "hasOwnProperty")
        return Jo;
    }
    const o = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Pe(t) ? t : a
    );
    return (st(n) ? zi.has(n) : Ko(n)) || (l || ve(t, "get", n), u) ? o : Pe(o) ? s && cn(n) ? o : o.value : se(o) ? l ? Hi(o) : gn(o) : o;
  }
}
class Wi extends Ri {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, a, l) {
    let u = t[n];
    if (!this._isShallow) {
      const c = $t(u);
      if (!Fe(a) && !$t(a) && (u = K(u), a = K(a)), !D(t) && Pe(u) && !Pe(a))
        return c || (u.value = a), !0;
    }
    const s = D(t) && cn(n) ? Number(n) < t.length : J(t, n), o = Reflect.set(
      t,
      n,
      a,
      Pe(t) ? t : l
    );
    return t === K(l) && (s ? kt(a, u) && ut(t, "set", n, a) : ut(t, "add", n, a)), o;
  }
  deleteProperty(t, n) {
    const a = J(t, n);
    t[n];
    const l = Reflect.deleteProperty(t, n);
    return l && a && ut(t, "delete", n, void 0), l;
  }
  has(t, n) {
    const a = Reflect.has(t, n);
    return (!st(n) || !zi.has(n)) && ve(t, "has", n), a;
  }
  ownKeys(t) {
    return ve(
      t,
      "iterate",
      D(t) ? "length" : Dt
    ), Reflect.ownKeys(t);
  }
}
class Go extends Ri {
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
const Xo = /* @__PURE__ */ new Wi(), Yo = /* @__PURE__ */ new Go(), Qo = /* @__PURE__ */ new Wi(!0);
const Jr = (e) => e, Hs = (e) => Reflect.getPrototypeOf(e);
function ea(e, t, n) {
  return function(...a) {
    const l = this.__v_raw, u = K(l), s = Kt(u), o = e === "entries" || e === Symbol.iterator && s, c = e === "keys" && s, r = l[e](...a), i = n ? Jr : t ? tr : ye;
    return !t && ve(
      u,
      "iterate",
      c ? Kr : Dt
    ), {
      // iterator protocol
      next() {
        const { value: d, done: y } = r.next();
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
function Us(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function ta(e, t) {
  const n = {
    get(l) {
      const u = this.__v_raw, s = K(u), o = K(l);
      e || (kt(l, o) && ve(s, "get", l), ve(s, "get", o));
      const { has: c } = Hs(s), r = t ? Jr : e ? tr : ye;
      if (c.call(s, l))
        return r(u.get(l));
      if (c.call(s, o))
        return r(u.get(o));
      u !== s && u.get(l);
    },
    get size() {
      const l = this.__v_raw;
      return !e && ve(K(l), "iterate", Dt), l.size;
    },
    has(l) {
      const u = this.__v_raw, s = K(u), o = K(l);
      return e || (kt(l, o) && ve(s, "has", l), ve(s, "has", o)), l === o ? u.has(l) : u.has(l) || u.has(o);
    },
    forEach(l, u) {
      const s = this, o = s.__v_raw, c = K(o), r = t ? Jr : e ? tr : ye;
      return !e && ve(c, "iterate", Dt), o.forEach((i, d) => l.call(u, r(i), r(d), s));
    }
  };
  return xe(
    n,
    e ? {
      add: Us("add"),
      set: Us("set"),
      delete: Us("delete"),
      clear: Us("clear")
    } : {
      add(l) {
        !t && !Fe(l) && !$t(l) && (l = K(l));
        const u = K(this);
        return Hs(u).has.call(u, l) || (u.add(l), ut(u, "add", l, l)), this;
      },
      set(l, u) {
        !t && !Fe(u) && !$t(u) && (u = K(u));
        const s = K(this), { has: o, get: c } = Hs(s);
        let r = o.call(s, l);
        r || (l = K(l), r = o.call(s, l));
        const i = c.call(s, l);
        return s.set(l, u), r ? kt(u, i) && ut(s, "set", l, u) : ut(s, "add", l, u), this;
      },
      delete(l) {
        const u = K(this), { has: s, get: o } = Hs(u);
        let c = s.call(u, l);
        c || (l = K(l), c = s.call(u, l)), o && o.call(u, l);
        const r = u.delete(l);
        return c && ut(u, "delete", l, void 0), r;
      },
      clear() {
        const l = K(this), u = l.size !== 0, s = l.clear();
        return u && ut(
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
    n[l] = ea(l, e, t);
  }), n;
}
function yn(e, t) {
  const n = ta(e, t);
  return (a, l, u) => l === "__v_isReactive" ? !e : l === "__v_isReadonly" ? e : l === "__v_raw" ? a : Reflect.get(
    J(n, l) && l in a ? n : a,
    l,
    u
  );
}
const sa = {
  get: /* @__PURE__ */ yn(!1, !1)
}, ra = {
  get: /* @__PURE__ */ yn(!1, !0)
}, na = {
  get: /* @__PURE__ */ yn(!0, !1)
};
const Di = /* @__PURE__ */ new WeakMap(), Fi = /* @__PURE__ */ new WeakMap(), Vi = /* @__PURE__ */ new WeakMap(), ia = /* @__PURE__ */ new WeakMap();
function oa(e) {
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
function aa(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : oa(To(e));
}
function gn(e) {
  return $t(e) ? e : wn(
    e,
    !1,
    Xo,
    sa,
    Di
  );
}
function la(e) {
  return wn(
    e,
    !1,
    Qo,
    ra,
    Fi
  );
}
function Hi(e) {
  return wn(
    e,
    !0,
    Yo,
    na,
    Vi
  );
}
function wn(e, t, n, a, l) {
  if (!se(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const u = aa(e);
  if (u === 0)
    return e;
  const s = l.get(e);
  if (s)
    return s;
  const o = new Proxy(
    e,
    u === 2 ? a : n
  );
  return l.set(e, o), o;
}
function Jt(e) {
  return $t(e) ? Jt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function $t(e) {
  return !!(e && e.__v_isReadonly);
}
function Fe(e) {
  return !!(e && e.__v_isShallow);
}
function vn(e) {
  return e ? !!e.__v_raw : !1;
}
function K(e) {
  const t = e && e.__v_raw;
  return t ? K(t) : e;
}
function ua(e) {
  return !J(e, "__v_skip") && Object.isExtensible(e) && xi(e, "__v_skip", !0), e;
}
const ye = (e) => se(e) ? gn(e) : e, tr = (e) => se(e) ? Hi(e) : e;
function Pe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function X(e) {
  return ca(e, !1);
}
function ca(e, t) {
  return Pe(e) ? e : new da(e, t);
}
class da {
  constructor(t, n) {
    this.dep = new hn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : K(t), this._value = n ? t : ye(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, a = this.__v_isShallow || Fe(t) || $t(t);
    t = a ? t : K(t), kt(t, n) && (this._rawValue = t, this._value = a ? t : ye(t), this.dep.trigger());
  }
}
function Ui(e) {
  return Pe(e) ? e.value : e;
}
const pa = {
  get: (e, t, n) => t === "__v_raw" ? e : Ui(Reflect.get(e, t, n)),
  set: (e, t, n, a) => {
    const l = e[t];
    return Pe(l) && !Pe(n) ? (l.value = n, !0) : Reflect.set(e, t, n, a);
  }
};
function Bi(e) {
  return Jt(e) ? e : new Proxy(e, pa);
}
class fa {
  constructor(t, n, a) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new hn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = As - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = a;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    ee !== this)
      return Ei(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Ci(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function ma(e, t, n = !1) {
  let a, l;
  return V(e) ? a = e : (a = e.get, l = e.set), new fa(a, l, n);
}
const Bs = {}, sr = /* @__PURE__ */ new WeakMap();
let Lt;
function ha(e, t = !1, n = Lt) {
  if (n) {
    let a = sr.get(n);
    a || sr.set(n, a = []), a.push(e);
  }
}
function ya(e, t, n = Q) {
  const { immediate: a, deep: l, once: u, scheduler: s, augmentJob: o, call: c } = n, r = (L) => l ? L : Fe(L) || l === !1 || l === 0 ? ct(L, 1) : ct(L);
  let i, d, y, p, f = !1, h = !1;
  if (Pe(e) ? (d = () => e.value, f = Fe(e)) : Jt(e) ? (d = () => r(e), f = !0) : D(e) ? (h = !0, f = e.some((L) => Jt(L) || Fe(L)), d = () => e.map((L) => {
    if (Pe(L))
      return L.value;
    if (Jt(L))
      return r(L);
    if (V(L))
      return c ? c(L, 2) : L();
  })) : V(e) ? t ? d = c ? () => c(e, 2) : e : d = () => {
    if (y) {
      mt();
      try {
        y();
      } finally {
        ht();
      }
    }
    const L = Lt;
    Lt = i;
    try {
      return c ? c(e, 3, [p]) : e(p);
    } finally {
      Lt = L;
    }
  } : d = et, t && l) {
    const L = d, G = l === !0 ? 1 / 0 : l;
    d = () => ct(L(), G);
  }
  const P = Vo(), $ = () => {
    i.stop(), P && P.active && un(P.effects, i);
  };
  if (u && t) {
    const L = t;
    t = (...G) => {
      L(...G), $();
    };
  }
  let E = h ? new Array(e.length).fill(Bs) : Bs;
  const T = (L) => {
    if (!(!(i.flags & 1) || !i.dirty && !L))
      if (t) {
        const G = i.run();
        if (l || f || (h ? G.some((ge, ke) => kt(ge, E[ke])) : kt(G, E))) {
          y && y();
          const ge = Lt;
          Lt = i;
          try {
            const ke = [
              G,
              // pass undefined as the old value when it's changed for the first time
              E === Bs ? void 0 : h && E[0] === Bs ? [] : E,
              p
            ];
            E = G, c ? c(t, 3, ke) : (
              // @ts-expect-error
              t(...ke)
            );
          } finally {
            Lt = ge;
          }
        }
      } else
        i.run();
  };
  return o && o(T), i = new ji(d), i.scheduler = s ? () => s(T, !1) : T, p = (L) => ha(L, !1, i), y = i.onStop = () => {
    const L = sr.get(i);
    if (L) {
      if (c)
        c(L, 4);
      else
        for (const G of L) G();
      sr.delete(i);
    }
  }, t ? a ? T(!0) : E = i.run() : s ? s(T.bind(null, !0), !0) : i.run(), $.pause = i.pause.bind(i), $.resume = i.resume.bind(i), $.stop = $, $;
}
function ct(e, t = 1 / 0, n) {
  if (t <= 0 || !se(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t))
    return e;
  if (n.set(e, t), t--, Pe(e))
    ct(e.value, t, n);
  else if (D(e))
    for (let a = 0; a < e.length; a++)
      ct(e[a], t, n);
  else if (wr(e) || Kt(e))
    e.forEach((a) => {
      ct(a, t, n);
    });
  else if (qi(e)) {
    for (const a in e)
      ct(e[a], t, n);
    for (const a of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, a) && ct(e[a], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Rs(e, t, n, a) {
  try {
    return a ? e(...a) : e();
  } catch (l) {
    Ir(l, t, n);
  }
}
function rt(e, t, n, a) {
  if (V(e)) {
    const l = Rs(e, t, n, a);
    return l && $i(l) && l.catch((u) => {
      Ir(u, t, n);
    }), l;
  }
  if (D(e)) {
    const l = [];
    for (let u = 0; u < e.length; u++)
      l.push(rt(e[u], t, n, a));
    return l;
  }
}
function Ir(e, t, n, a = !0) {
  const l = t ? t.vnode : null, { errorHandler: u, throwUnhandledErrorInProduction: s } = t && t.appContext.config || Q;
  if (t) {
    let o = t.parent;
    const c = t.proxy, r = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; o; ) {
      const i = o.ec;
      if (i) {
        for (let d = 0; d < i.length; d++)
          if (i[d](e, c, r) === !1)
            return;
      }
      o = o.parent;
    }
    if (u) {
      mt(), Rs(u, null, 10, [
        e,
        c,
        r
      ]), ht();
      return;
    }
  }
  ga(e, n, l, a, s);
}
function ga(e, t, n, a = !0, l = !1) {
  if (l)
    throw e;
  console.error(e);
}
const qe = [];
let Ye = -1;
const Gt = [];
let vt = null, Bt = 0;
const Zi = /* @__PURE__ */ Promise.resolve();
let rr = null;
function bn(e) {
  const t = rr || Zi;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function wa(e) {
  let t = Ye + 1, n = qe.length;
  for (; t < n; ) {
    const a = t + n >>> 1, l = qe[a], u = Ts(l);
    u < e || u === e && l.flags & 2 ? t = a + 1 : n = a;
  }
  return t;
}
function Pn(e) {
  if (!(e.flags & 1)) {
    const t = Ts(e), n = qe[qe.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Ts(n) ? qe.push(e) : qe.splice(wa(t), 0, e), e.flags |= 1, Ki();
  }
}
function Ki() {
  rr || (rr = Zi.then(Gi));
}
function va(e) {
  D(e) ? Gt.push(...e) : vt && e.id === -1 ? vt.splice(Bt + 1, 0, e) : e.flags & 1 || (Gt.push(e), e.flags |= 1), Ki();
}
function Mn(e, t, n = Ye + 1) {
  for (; n < qe.length; n++) {
    const a = qe[n];
    if (a && a.flags & 2) {
      if (e && a.id !== e.uid)
        continue;
      qe.splice(n, 1), n--, a.flags & 4 && (a.flags &= -2), a(), a.flags & 4 || (a.flags &= -2);
    }
  }
}
function Ji(e) {
  if (Gt.length) {
    const t = [...new Set(Gt)].sort(
      (n, a) => Ts(n) - Ts(a)
    );
    if (Gt.length = 0, vt) {
      vt.push(...t);
      return;
    }
    for (vt = t, Bt = 0; Bt < vt.length; Bt++) {
      const n = vt[Bt];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    vt = null, Bt = 0;
  }
}
const Ts = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Gi(e) {
  try {
    for (Ye = 0; Ye < qe.length; Ye++) {
      const t = qe[Ye];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Rs(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ye < qe.length; Ye++) {
      const t = qe[Ye];
      t && (t.flags &= -2);
    }
    Ye = -1, qe.length = 0, Ji(), rr = null, (qe.length || Gt.length) && Gi();
  }
}
let Ce = null, Xi = null;
function nr(e) {
  const t = Ce;
  return Ce = e, Xi = e && e.type.__scopeId || null, t;
}
function ba(e, t = Ce, n) {
  if (!t || e._n)
    return e;
  const a = (...l) => {
    a._d && Un(-1);
    const u = nr(t);
    let s;
    try {
      s = e(...l);
    } finally {
      nr(u), a._d && Un(1);
    }
    return s;
  };
  return a._n = !0, a._c = !0, a._d = !0, a;
}
function Zs(e, t) {
  if (Ce === null)
    return e;
  const n = _r(Ce), a = e.dirs || (e.dirs = []);
  for (let l = 0; l < t.length; l++) {
    let [u, s, o, c = Q] = t[l];
    u && (V(u) && (u = {
      mounted: u,
      updated: u
    }), u.deep && ct(s), a.push({
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
function Mt(e, t, n, a) {
  const l = e.dirs, u = t && t.dirs;
  for (let s = 0; s < l.length; s++) {
    const o = l[s];
    u && (o.oldValue = u[s].value);
    let c = o.dir[a];
    c && (mt(), rt(c, n, 8, [
      e.el,
      o,
      e,
      t
    ]), ht());
  }
}
const Pa = Symbol("_vte"), ka = (e) => e.__isTeleport, $a = Symbol("_leaveCb");
function kn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, kn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function Yi(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const ir = /* @__PURE__ */ new WeakMap();
function Is(e, t, n, a, l = !1) {
  if (D(e)) {
    e.forEach(
      (f, h) => Is(
        f,
        t && (D(t) ? t[h] : t),
        n,
        a,
        l
      )
    );
    return;
  }
  if (qs(a) && !l) {
    a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && Is(e, t, n, a.component.subTree);
    return;
  }
  const u = a.shapeFlag & 4 ? _r(a.component) : a.el, s = l ? null : u, { i: o, r: c } = e, r = t && t.r, i = o.refs === Q ? o.refs = {} : o.refs, d = o.setupState, y = K(d), p = d === Q ? ki : (f) => J(y, f);
  if (r != null && r !== c) {
    if (Cn(t), de(r))
      i[r] = null, p(r) && (d[r] = null);
    else if (Pe(r)) {
      r.value = null;
      const f = t;
      f.k && (i[f.k] = null);
    }
  }
  if (V(c))
    Rs(c, o, 12, [s, i]);
  else {
    const f = de(c), h = Pe(c);
    if (f || h) {
      const P = () => {
        if (e.f) {
          const $ = f ? p(c) ? d[c] : i[c] : c.value;
          if (l)
            D($) && un($, u);
          else if (D($))
            $.includes(u) || $.push(u);
          else if (f)
            i[c] = [u], p(c) && (d[c] = i[c]);
          else {
            const E = [u];
            c.value = E, e.k && (i[e.k] = E);
          }
        } else f ? (i[c] = s, p(c) && (d[c] = s)) : h && (c.value = s, e.k && (i[e.k] = s));
      };
      if (s) {
        const $ = () => {
          P(), ir.delete(e);
        };
        $.id = -1, ir.set(e, $), Ee($, n);
      } else
        Cn(e), P();
    }
  }
}
function Cn(e) {
  const t = ir.get(e);
  t && (t.flags |= 8, ir.delete(e));
}
Pr().requestIdleCallback;
Pr().cancelIdleCallback;
const qs = (e) => !!e.type.__asyncLoader, Qi = (e) => e.type.__isKeepAlive;
function Ia(e, t) {
  eo(e, "a", t);
}
function qa(e, t) {
  eo(e, "da", t);
}
function eo(e, t, n = be) {
  const a = e.__wdc || (e.__wdc = () => {
    let l = n;
    for (; l; ) {
      if (l.isDeactivated)
        return;
      l = l.parent;
    }
    return e();
  });
  if (qr(t, a, n), n) {
    let l = n.parent;
    for (; l && l.parent; )
      Qi(l.parent.vnode) && xa(a, t, n, l), l = l.parent;
  }
}
function xa(e, t, n, a) {
  const l = qr(
    t,
    e,
    a,
    !0
    /* prepend */
  );
  to(() => {
    un(a[t], l);
  }, n);
}
function qr(e, t, n = be, a = !1) {
  if (n) {
    const l = n[e] || (n[e] = []), u = t.__weh || (t.__weh = (...s) => {
      mt();
      const o = Ws(n), c = rt(t, n, e, s);
      return o(), ht(), c;
    });
    return a ? l.unshift(u) : l.push(u), u;
  }
}
const yt = (e) => (t, n = be) => {
  (!Os || e === "sp") && qr(e, (...a) => t(...a), n);
}, Sa = yt("bm"), $n = yt("m"), _a = yt(
  "bu"
), Aa = yt("u"), In = yt(
  "bum"
), to = yt("um"), ja = yt(
  "sp"
), Ta = yt("rtg"), Ea = yt("rtc");
function Oa(e, t = be) {
  qr("ec", e, t);
}
const Ma = "components";
function Ca(e, t) {
  return La(Ma, e, !0, t) || e;
}
const Na = Symbol.for("v-ndc");
function La(e, t, n = !0, a = !1) {
  const l = Ce || be;
  if (l) {
    const u = l.type;
    {
      const o = xl(
        u,
        !1
      );
      if (o && (o === t || o === Ve(t) || o === br(Ve(t))))
        return u;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      Nn(l[e] || u[e], t) || // global registration
      Nn(l.appContext[e], t)
    );
    return !s && a ? u : s;
  }
}
function Nn(e, t) {
  return e && (e[t] || e[Ve(t)] || e[br(Ve(t))]);
}
function bt(e, t, n, a) {
  let l;
  const u = n, s = D(e);
  if (s || de(e)) {
    const o = s && Jt(e);
    let c = !1, r = !1;
    o && (c = !Fe(e), r = $t(e), e = $r(e)), l = new Array(e.length);
    for (let i = 0, d = e.length; i < d; i++)
      l[i] = t(
        c ? r ? tr(ye(e[i])) : ye(e[i]) : e[i],
        i,
        void 0,
        u
      );
  } else if (typeof e == "number") {
    l = new Array(e);
    for (let o = 0; o < e; o++)
      l[o] = t(o + 1, o, void 0, u);
  } else if (se(e))
    if (e[Symbol.iterator])
      l = Array.from(
        e,
        (o, c) => t(o, c, void 0, u)
      );
    else {
      const o = Object.keys(e);
      l = new Array(o.length);
      for (let c = 0, r = o.length; c < r; c++) {
        const i = o[c];
        l[c] = t(e[i], i, c, u);
      }
    }
  else
    l = [];
  return l;
}
const Gr = (e) => e ? $o(e) ? _r(e) : Gr(e.parent) : null, xs = (
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
    $parent: (e) => Gr(e.parent),
    $root: (e) => Gr(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => ro(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Pn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = bn.bind(e.proxy)),
    $watch: (e) => il.bind(e)
  })
), Nr = (e, t) => e !== Q && !e.__isScriptSetup && J(e, t), za = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: a, data: l, props: u, accessCache: s, type: o, appContext: c } = e;
    let r;
    if (t[0] !== "$") {
      const p = s[t];
      if (p !== void 0)
        switch (p) {
          case 1:
            return a[t];
          case 2:
            return l[t];
          case 4:
            return n[t];
          case 3:
            return u[t];
        }
      else {
        if (Nr(a, t))
          return s[t] = 1, a[t];
        if (l !== Q && J(l, t))
          return s[t] = 2, l[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (r = e.propsOptions[0]) && J(r, t)
        )
          return s[t] = 3, u[t];
        if (n !== Q && J(n, t))
          return s[t] = 4, n[t];
        Xr && (s[t] = 0);
      }
    }
    const i = xs[t];
    let d, y;
    if (i)
      return t === "$attrs" && ve(e.attrs, "get", ""), i(e);
    if (
      // css module (injected by vue-loader)
      (d = o.__cssModules) && (d = d[t])
    )
      return d;
    if (n !== Q && J(n, t))
      return s[t] = 4, n[t];
    if (
      // global properties
      y = c.config.globalProperties, J(y, t)
    )
      return y[t];
  },
  set({ _: e }, t, n) {
    const { data: a, setupState: l, ctx: u } = e;
    return Nr(l, t) ? (l[t] = n, !0) : a !== Q && J(a, t) ? (a[t] = n, !0) : J(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (u[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: a, appContext: l, propsOptions: u, type: s }
  }, o) {
    let c, r;
    return !!(n[o] || e !== Q && o[0] !== "$" && J(e, o) || Nr(t, o) || (c = u[0]) && J(c, o) || J(a, o) || J(xs, o) || J(l.config.globalProperties, o) || (r = s.__cssModules) && r[o]);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : J(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Ln(e) {
  return D(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let Xr = !0;
function Ra(e) {
  const t = ro(e), n = e.proxy, a = e.ctx;
  Xr = !1, t.beforeCreate && zn(t.beforeCreate, e, "bc");
  const {
    // state
    data: l,
    computed: u,
    methods: s,
    watch: o,
    provide: c,
    inject: r,
    // lifecycle
    created: i,
    beforeMount: d,
    mounted: y,
    beforeUpdate: p,
    updated: f,
    activated: h,
    deactivated: P,
    beforeDestroy: $,
    beforeUnmount: E,
    destroyed: T,
    unmounted: L,
    render: G,
    renderTracked: ge,
    renderTriggered: ke,
    errorCaptured: $e,
    serverPrefetch: gt,
    // public API
    expose: ne,
    inheritAttrs: He,
    // assets
    components: Ke,
    directives: St,
    filters: _t
  } = t;
  if (r && Wa(r, a, null), s)
    for (const te in s) {
      const Y = s[te];
      V(Y) && (a[te] = Y.bind(n));
    }
  if (l) {
    const te = l.call(n, n);
    se(te) && (e.data = gn(te));
  }
  if (Xr = !0, u)
    for (const te in u) {
      const Y = u[te], nt = V(Y) ? Y.bind(n, n) : V(Y.get) ? Y.get.bind(n, n) : et, At = !V(Y) && V(Y.set) ? Y.set.bind(n) : et, Ue = De({
        get: nt,
        set: At
      });
      Object.defineProperty(a, te, {
        enumerable: !0,
        configurable: !0,
        get: () => Ue.value,
        set: (je) => Ue.value = je
      });
    }
  if (o)
    for (const te in o)
      so(o[te], a, n, te);
  if (c) {
    const te = V(c) ? c.call(n) : c;
    Reflect.ownKeys(te).forEach((Y) => {
      Ba(Y, te[Y]);
    });
  }
  i && zn(i, e, "c");
  function fe(te, Y) {
    D(Y) ? Y.forEach((nt) => te(nt.bind(n))) : Y && te(Y.bind(n));
  }
  if (fe(Sa, d), fe($n, y), fe(_a, p), fe(Aa, f), fe(Ia, h), fe(qa, P), fe(Oa, $e), fe(Ea, ge), fe(Ta, ke), fe(In, E), fe(to, L), fe(ja, gt), D(ne))
    if (ne.length) {
      const te = e.exposed || (e.exposed = {});
      ne.forEach((Y) => {
        Object.defineProperty(te, Y, {
          get: () => n[Y],
          set: (nt) => n[Y] = nt,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  G && e.render === et && (e.render = G), He != null && (e.inheritAttrs = He), Ke && (e.components = Ke), St && (e.directives = St), gt && Yi(e);
}
function Wa(e, t, n = et) {
  D(e) && (e = Yr(e));
  for (const a in e) {
    const l = e[a];
    let u;
    se(l) ? "default" in l ? u = Xs(
      l.from || a,
      l.default,
      !0
    ) : u = Xs(l.from || a) : u = Xs(l), Pe(u) ? Object.defineProperty(t, a, {
      enumerable: !0,
      configurable: !0,
      get: () => u.value,
      set: (s) => u.value = s
    }) : t[a] = u;
  }
}
function zn(e, t, n) {
  rt(
    D(e) ? e.map((a) => a.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function so(e, t, n, a) {
  let l = a.includes(".") ? go(n, a) : () => n[a];
  if (de(e)) {
    const u = t[e];
    V(u) && Ss(l, u);
  } else if (V(e))
    Ss(l, e.bind(n));
  else if (se(e))
    if (D(e))
      e.forEach((u) => so(u, t, n, a));
    else {
      const u = V(e.handler) ? e.handler.bind(n) : t[e.handler];
      V(u) && Ss(l, u, e);
    }
}
function ro(e) {
  const t = e.type, { mixins: n, extends: a } = t, {
    mixins: l,
    optionsCache: u,
    config: { optionMergeStrategies: s }
  } = e.appContext, o = u.get(t);
  let c;
  return o ? c = o : !l.length && !n && !a ? c = t : (c = {}, l.length && l.forEach(
    (r) => or(c, r, s, !0)
  ), or(c, t, s)), se(t) && u.set(t, c), c;
}
function or(e, t, n, a = !1) {
  const { mixins: l, extends: u } = t;
  u && or(e, u, n, !0), l && l.forEach(
    (s) => or(e, s, n, !0)
  );
  for (const s in t)
    if (!(a && s === "expose")) {
      const o = Da[s] || n && n[s];
      e[s] = o ? o(e[s], t[s]) : t[s];
    }
  return e;
}
const Da = {
  data: Rn,
  props: Wn,
  emits: Wn,
  // objects
  methods: ws,
  computed: ws,
  // lifecycle
  beforeCreate: Ie,
  created: Ie,
  beforeMount: Ie,
  mounted: Ie,
  beforeUpdate: Ie,
  updated: Ie,
  beforeDestroy: Ie,
  beforeUnmount: Ie,
  destroyed: Ie,
  unmounted: Ie,
  activated: Ie,
  deactivated: Ie,
  errorCaptured: Ie,
  serverPrefetch: Ie,
  // assets
  components: ws,
  directives: ws,
  // watch
  watch: Va,
  // provide / inject
  provide: Rn,
  inject: Fa
};
function Rn(e, t) {
  return t ? e ? function() {
    return xe(
      V(e) ? e.call(this, this) : e,
      V(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Fa(e, t) {
  return ws(Yr(e), Yr(t));
}
function Yr(e) {
  if (D(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Ie(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function ws(e, t) {
  return e ? xe(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Wn(e, t) {
  return e ? D(e) && D(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : xe(
    /* @__PURE__ */ Object.create(null),
    Ln(e),
    Ln(t ?? {})
  ) : t;
}
function Va(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = xe(/* @__PURE__ */ Object.create(null), e);
  for (const a in t)
    n[a] = Ie(e[a], t[a]);
  return n;
}
function no() {
  return {
    app: null,
    config: {
      isNativeTag: ki,
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
let Ha = 0;
function Ua(e, t) {
  return function(a, l = null) {
    V(a) || (a = xe({}, a)), l != null && !se(l) && (l = null);
    const u = no(), s = /* @__PURE__ */ new WeakSet(), o = [];
    let c = !1;
    const r = u.app = {
      _uid: Ha++,
      _component: a,
      _props: l,
      _container: null,
      _context: u,
      _instance: null,
      version: _l,
      get config() {
        return u.config;
      },
      set config(i) {
      },
      use(i, ...d) {
        return s.has(i) || (i && V(i.install) ? (s.add(i), i.install(r, ...d)) : V(i) && (s.add(i), i(r, ...d))), r;
      },
      mixin(i) {
        return u.mixins.includes(i) || u.mixins.push(i), r;
      },
      component(i, d) {
        return d ? (u.components[i] = d, r) : u.components[i];
      },
      directive(i, d) {
        return d ? (u.directives[i] = d, r) : u.directives[i];
      },
      mount(i, d, y) {
        if (!c) {
          const p = r._ceVNode || tt(a, l);
          return p.appContext = u, y === !0 ? y = "svg" : y === !1 && (y = void 0), e(p, i, y), c = !0, r._container = i, i.__vue_app__ = r, _r(p.component);
        }
      },
      onUnmount(i) {
        o.push(i);
      },
      unmount() {
        c && (rt(
          o,
          r._instance,
          16
        ), e(null, r._container), delete r._container.__vue_app__);
      },
      provide(i, d) {
        return u.provides[i] = d, r;
      },
      runWithContext(i) {
        const d = Xt;
        Xt = r;
        try {
          return i();
        } finally {
          Xt = d;
        }
      }
    };
    return r;
  };
}
let Xt = null;
function Ba(e, t) {
  if (be) {
    let n = be.provides;
    const a = be.parent && be.parent.provides;
    a === n && (n = be.provides = Object.create(a)), n[e] = t;
  }
}
function Xs(e, t, n = !1) {
  const a = Pl();
  if (a || Xt) {
    let l = Xt ? Xt._context.provides : a ? a.parent == null || a.ce ? a.vnode.appContext && a.vnode.appContext.provides : a.parent.provides : void 0;
    if (l && e in l)
      return l[e];
    if (arguments.length > 1)
      return n && V(t) ? t.call(a && a.proxy) : t;
  }
}
const io = {}, oo = () => Object.create(io), ao = (e) => Object.getPrototypeOf(e) === io;
function Za(e, t, n, a = !1) {
  const l = {}, u = oo();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), lo(e, t, l, u);
  for (const s in e.propsOptions[0])
    s in l || (l[s] = void 0);
  n ? e.props = a ? l : la(l) : e.type.props ? e.props = l : e.props = u, e.attrs = u;
}
function Ka(e, t, n, a) {
  const {
    props: l,
    attrs: u,
    vnode: { patchFlag: s }
  } = e, o = K(l), [c] = e.propsOptions;
  let r = !1;
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
        if (xr(e.emitsOptions, y))
          continue;
        const p = t[y];
        if (c)
          if (J(u, y))
            p !== u[y] && (u[y] = p, r = !0);
          else {
            const f = Ve(y);
            l[f] = Qr(
              c,
              o,
              f,
              p,
              e,
              !1
            );
          }
        else
          p !== u[y] && (u[y] = p, r = !0);
      }
    }
  } else {
    lo(e, t, l, u) && (r = !0);
    let i;
    for (const d in o)
      (!t || // for camelCase
      !J(t, d) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((i = xt(d)) === d || !J(t, i))) && (c ? n && // for camelCase
      (n[d] !== void 0 || // for kebab-case
      n[i] !== void 0) && (l[d] = Qr(
        c,
        o,
        d,
        void 0,
        e,
        !0
      )) : delete l[d]);
    if (u !== o)
      for (const d in u)
        (!t || !J(t, d)) && (delete u[d], r = !0);
  }
  r && ut(e.attrs, "set", "");
}
function lo(e, t, n, a) {
  const [l, u] = e.propsOptions;
  let s = !1, o;
  if (t)
    for (let c in t) {
      if (Ps(c))
        continue;
      const r = t[c];
      let i;
      l && J(l, i = Ve(c)) ? !u || !u.includes(i) ? n[i] = r : (o || (o = {}))[i] = r : xr(e.emitsOptions, c) || (!(c in a) || r !== a[c]) && (a[c] = r, s = !0);
    }
  if (u) {
    const c = K(n), r = o || Q;
    for (let i = 0; i < u.length; i++) {
      const d = u[i];
      n[d] = Qr(
        l,
        c,
        d,
        r[d],
        e,
        !J(r, d)
      );
    }
  }
  return s;
}
function Qr(e, t, n, a, l, u) {
  const s = e[n];
  if (s != null) {
    const o = J(s, "default");
    if (o && a === void 0) {
      const c = s.default;
      if (s.type !== Function && !s.skipFactory && V(c)) {
        const { propsDefaults: r } = l;
        if (n in r)
          a = r[n];
        else {
          const i = Ws(l);
          a = r[n] = c.call(
            null,
            t
          ), i();
        }
      } else
        a = c;
      l.ce && l.ce._setProp(n, a);
    }
    s[
      0
      /* shouldCast */
    ] && (u && !o ? a = !1 : s[
      1
      /* shouldCastTrue */
    ] && (a === "" || a === xt(n)) && (a = !0));
  }
  return a;
}
const Ja = /* @__PURE__ */ new WeakMap();
function uo(e, t, n = !1) {
  const a = n ? Ja : t.propsCache, l = a.get(e);
  if (l)
    return l;
  const u = e.props, s = {}, o = [];
  let c = !1;
  if (!V(e)) {
    const i = (d) => {
      c = !0;
      const [y, p] = uo(d, t, !0);
      xe(s, y), p && o.push(...p);
    };
    !n && t.mixins.length && t.mixins.forEach(i), e.extends && i(e.extends), e.mixins && e.mixins.forEach(i);
  }
  if (!u && !c)
    return se(e) && a.set(e, Zt), Zt;
  if (D(u))
    for (let i = 0; i < u.length; i++) {
      const d = Ve(u[i]);
      Dn(d) && (s[d] = Q);
    }
  else if (u)
    for (const i in u) {
      const d = Ve(i);
      if (Dn(d)) {
        const y = u[i], p = s[d] = D(y) || V(y) ? { type: y } : xe({}, y), f = p.type;
        let h = !1, P = !0;
        if (D(f))
          for (let $ = 0; $ < f.length; ++$) {
            const E = f[$], T = V(E) && E.name;
            if (T === "Boolean") {
              h = !0;
              break;
            } else T === "String" && (P = !1);
          }
        else
          h = V(f) && f.name === "Boolean";
        p[
          0
          /* shouldCast */
        ] = h, p[
          1
          /* shouldCastTrue */
        ] = P, (h || J(p, "default")) && o.push(d);
      }
    }
  const r = [s, o];
  return se(e) && a.set(e, r), r;
}
function Dn(e) {
  return e[0] !== "$" && !Ps(e);
}
const qn = (e) => e === "_" || e === "_ctx" || e === "$stable", xn = (e) => D(e) ? e.map(Qe) : [Qe(e)], Ga = (e, t, n) => {
  if (t._n)
    return t;
  const a = ba((...l) => xn(t(...l)), n);
  return a._c = !1, a;
}, co = (e, t, n) => {
  const a = e._ctx;
  for (const l in e) {
    if (qn(l)) continue;
    const u = e[l];
    if (V(u))
      t[l] = Ga(l, u, a);
    else if (u != null) {
      const s = xn(u);
      t[l] = () => s;
    }
  }
}, po = (e, t) => {
  const n = xn(t);
  e.slots.default = () => n;
}, fo = (e, t, n) => {
  for (const a in t)
    (n || !qn(a)) && (e[a] = t[a]);
}, Xa = (e, t, n) => {
  const a = e.slots = oo();
  if (e.vnode.shapeFlag & 32) {
    const l = t._;
    l ? (fo(a, t, n), n && xi(a, "_", l, !0)) : co(t, a);
  } else t && po(e, t);
}, Ya = (e, t, n) => {
  const { vnode: a, slots: l } = e;
  let u = !0, s = Q;
  if (a.shapeFlag & 32) {
    const o = t._;
    o ? n && o === 1 ? u = !1 : fo(l, t, n) : (u = !t.$stable, co(t, l)), s = t;
  } else t && (po(e, t), s = { default: 1 });
  if (u)
    for (const o in l)
      !qn(o) && s[o] == null && delete l[o];
}, Ee = fl;
function Qa(e) {
  return el(e);
}
function el(e, t) {
  const n = Pr();
  n.__VUE__ = !0;
  const {
    insert: a,
    remove: l,
    patchProp: u,
    createElement: s,
    createText: o,
    createComment: c,
    setText: r,
    setElementText: i,
    parentNode: d,
    nextSibling: y,
    setScopeId: p = et,
    insertStaticContent: f
  } = e, h = (m, g, b, x = null, I = null, S = null, O = void 0, j = null, A = !!g.dynamicChildren) => {
    if (m === g)
      return;
    m && !fs(m, g) && (x = Vt(m), je(m, I, S, !0), m = null), g.patchFlag === -2 && (A = !1, g.dynamicChildren = null);
    const { type: q, ref: C, shapeFlag: M } = g;
    switch (q) {
      case Sr:
        P(m, g, b, x);
        break;
      case It:
        $(m, g, b, x);
        break;
      case zr:
        m == null && E(g, b, x, O);
        break;
      case oe:
        Ke(
          m,
          g,
          b,
          x,
          I,
          S,
          O,
          j,
          A
        );
        break;
      default:
        M & 1 ? G(
          m,
          g,
          b,
          x,
          I,
          S,
          O,
          j,
          A
        ) : M & 6 ? St(
          m,
          g,
          b,
          x,
          I,
          S,
          O,
          j,
          A
        ) : (M & 64 || M & 128) && q.process(
          m,
          g,
          b,
          x,
          I,
          S,
          O,
          j,
          A,
          Je
        );
    }
    C != null && I ? Is(C, m && m.ref, S, g || m, !g) : C == null && m && m.ref != null && Is(m.ref, null, S, m, !0);
  }, P = (m, g, b, x) => {
    if (m == null)
      a(
        g.el = o(g.children),
        b,
        x
      );
    else {
      const I = g.el = m.el;
      g.children !== m.children && r(I, g.children);
    }
  }, $ = (m, g, b, x) => {
    m == null ? a(
      g.el = c(g.children || ""),
      b,
      x
    ) : g.el = m.el;
  }, E = (m, g, b, x) => {
    [m.el, m.anchor] = f(
      m.children,
      g,
      b,
      x,
      m.el,
      m.anchor
    );
  }, T = ({ el: m, anchor: g }, b, x) => {
    let I;
    for (; m && m !== g; )
      I = y(m), a(m, b, x), m = I;
    a(g, b, x);
  }, L = ({ el: m, anchor: g }) => {
    let b;
    for (; m && m !== g; )
      b = y(m), l(m), m = b;
    l(g);
  }, G = (m, g, b, x, I, S, O, j, A) => {
    g.type === "svg" ? O = "svg" : g.type === "math" && (O = "mathml"), m == null ? ge(
      g,
      b,
      x,
      I,
      S,
      O,
      j,
      A
    ) : gt(
      m,
      g,
      I,
      S,
      O,
      j,
      A
    );
  }, ge = (m, g, b, x, I, S, O, j) => {
    let A, q;
    const { props: C, shapeFlag: M, transition: N, dirs: W } = m;
    if (A = m.el = s(
      m.type,
      S,
      C && C.is,
      C
    ), M & 8 ? i(A, m.children) : M & 16 && $e(
      m.children,
      A,
      null,
      x,
      I,
      Lr(m, S),
      O,
      j
    ), W && Mt(m, null, x, "created"), ke(A, m, m.scopeId, O, x), C) {
      for (const B in C)
        B !== "value" && !Ps(B) && u(A, B, null, C[B], S, x);
      "value" in C && u(A, "value", null, C.value, S), (q = C.onVnodeBeforeMount) && Ge(q, x, m);
    }
    W && Mt(m, null, x, "beforeMount");
    const U = tl(I, N);
    U && N.beforeEnter(A), a(A, g, b), ((q = C && C.onVnodeMounted) || U || W) && Ee(() => {
      q && Ge(q, x, m), U && N.enter(A), W && Mt(m, null, x, "mounted");
    }, I);
  }, ke = (m, g, b, x, I) => {
    if (b && p(m, b), x)
      for (let S = 0; S < x.length; S++)
        p(m, x[S]);
    if (I) {
      let S = I.subTree;
      if (g === S || vo(S.type) && (S.ssContent === g || S.ssFallback === g)) {
        const O = I.vnode;
        ke(
          m,
          O,
          O.scopeId,
          O.slotScopeIds,
          I.parent
        );
      }
    }
  }, $e = (m, g, b, x, I, S, O, j, A = 0) => {
    for (let q = A; q < m.length; q++) {
      const C = m[q] = j ? Pt(m[q]) : Qe(m[q]);
      h(
        null,
        C,
        g,
        b,
        x,
        I,
        S,
        O,
        j
      );
    }
  }, gt = (m, g, b, x, I, S, O) => {
    const j = g.el = m.el;
    let { patchFlag: A, dynamicChildren: q, dirs: C } = g;
    A |= m.patchFlag & 16;
    const M = m.props || Q, N = g.props || Q;
    let W;
    if (b && Ct(b, !1), (W = N.onVnodeBeforeUpdate) && Ge(W, b, g, m), C && Mt(g, m, b, "beforeUpdate"), b && Ct(b, !0), (M.innerHTML && N.innerHTML == null || M.textContent && N.textContent == null) && i(j, ""), q ? ne(
      m.dynamicChildren,
      q,
      j,
      b,
      x,
      Lr(g, I),
      S
    ) : O || Y(
      m,
      g,
      j,
      null,
      b,
      x,
      Lr(g, I),
      S,
      !1
    ), A > 0) {
      if (A & 16)
        He(j, M, N, b, I);
      else if (A & 2 && M.class !== N.class && u(j, "class", null, N.class, I), A & 4 && u(j, "style", M.style, N.style, I), A & 8) {
        const U = g.dynamicProps;
        for (let B = 0; B < U.length; B++) {
          const Z = U[B], me = M[Z], he = N[Z];
          (he !== me || Z === "value") && u(j, Z, me, he, I, b);
        }
      }
      A & 1 && m.children !== g.children && i(j, g.children);
    } else !O && q == null && He(j, M, N, b, I);
    ((W = N.onVnodeUpdated) || C) && Ee(() => {
      W && Ge(W, b, g, m), C && Mt(g, m, b, "updated");
    }, x);
  }, ne = (m, g, b, x, I, S, O) => {
    for (let j = 0; j < g.length; j++) {
      const A = m[j], q = g[j], C = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        A.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (A.type === oe || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !fs(A, q) || // - In the case of a component, it could contain anything.
        A.shapeFlag & 198) ? d(A.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          b
        )
      );
      h(
        A,
        q,
        C,
        null,
        x,
        I,
        S,
        O,
        !0
      );
    }
  }, He = (m, g, b, x, I) => {
    if (g !== b) {
      if (g !== Q)
        for (const S in g)
          !Ps(S) && !(S in b) && u(
            m,
            S,
            g[S],
            null,
            I,
            x
          );
      for (const S in b) {
        if (Ps(S)) continue;
        const O = b[S], j = g[S];
        O !== j && S !== "value" && u(m, S, j, O, I, x);
      }
      "value" in b && u(m, "value", g.value, b.value, I);
    }
  }, Ke = (m, g, b, x, I, S, O, j, A) => {
    const q = g.el = m ? m.el : o(""), C = g.anchor = m ? m.anchor : o("");
    let { patchFlag: M, dynamicChildren: N, slotScopeIds: W } = g;
    W && (j = j ? j.concat(W) : W), m == null ? (a(q, b, x), a(C, b, x), $e(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      g.children || [],
      b,
      C,
      I,
      S,
      O,
      j,
      A
    )) : M > 0 && M & 64 && N && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    m.dynamicChildren ? (ne(
      m.dynamicChildren,
      N,
      b,
      I,
      S,
      O,
      j
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (g.key != null || I && g === I.subTree) && mo(
      m,
      g,
      !0
      /* shallow */
    )) : Y(
      m,
      g,
      b,
      C,
      I,
      S,
      O,
      j,
      A
    );
  }, St = (m, g, b, x, I, S, O, j, A) => {
    g.slotScopeIds = j, m == null ? g.shapeFlag & 512 ? I.ctx.activate(
      g,
      b,
      x,
      O,
      A
    ) : _t(
      g,
      b,
      x,
      I,
      S,
      O,
      A
    ) : Le(m, g, A);
  }, _t = (m, g, b, x, I, S, O) => {
    const j = m.component = bl(
      m,
      x,
      I
    );
    if (Qi(m) && (j.ctx.renderer = Je), kl(j, !1, O), j.asyncDep) {
      if (I && I.registerDep(j, fe, O), !m.el) {
        const A = j.subTree = tt(It);
        $(null, A, g, b), m.placeholder = A.el;
      }
    } else
      fe(
        j,
        m,
        g,
        b,
        I,
        S,
        O
      );
  }, Le = (m, g, b) => {
    const x = g.component = m.component;
    if (dl(m, g, b))
      if (x.asyncDep && !x.asyncResolved) {
        te(x, g, b);
        return;
      } else
        x.next = g, x.update();
    else
      g.el = m.el, x.vnode = g;
  }, fe = (m, g, b, x, I, S, O) => {
    const j = () => {
      if (m.isMounted) {
        let { next: M, bu: N, u: W, parent: U, vnode: B } = m;
        {
          const Re = ho(m);
          if (Re) {
            M && (M.el = B.el, te(m, M, O)), Re.asyncDep.then(() => {
              m.isUnmounted || j();
            });
            return;
          }
        }
        let Z = M, me;
        Ct(m, !1), M ? (M.el = B.el, te(m, M, O)) : M = B, N && Gs(N), (me = M.props && M.props.onVnodeBeforeUpdate) && Ge(me, U, M, B), Ct(m, !0);
        const he = Vn(m), ze = m.subTree;
        m.subTree = he, h(
          ze,
          he,
          // parent may have changed if it's in a teleport
          d(ze.el),
          // anchor may have changed if it's in a fragment
          Vt(ze),
          m,
          I,
          S
        ), M.el = he.el, Z === null && pl(m, he.el), W && Ee(W, I), (me = M.props && M.props.onVnodeUpdated) && Ee(
          () => Ge(me, U, M, B),
          I
        );
      } else {
        let M;
        const { el: N, props: W } = g, { bm: U, m: B, parent: Z, root: me, type: he } = m, ze = qs(g);
        Ct(m, !1), U && Gs(U), !ze && (M = W && W.onVnodeBeforeMount) && Ge(M, Z, g), Ct(m, !0);
        {
          me.ce && // @ts-expect-error _def is private
          me.ce._def.shadowRoot !== !1 && me.ce._injectChildStyle(he);
          const Re = m.subTree = Vn(m);
          h(
            null,
            Re,
            b,
            x,
            m,
            I,
            S
          ), g.el = Re.el;
        }
        if (B && Ee(B, I), !ze && (M = W && W.onVnodeMounted)) {
          const Re = g;
          Ee(
            () => Ge(M, Z, Re),
            I
          );
        }
        (g.shapeFlag & 256 || Z && qs(Z.vnode) && Z.vnode.shapeFlag & 256) && m.a && Ee(m.a, I), m.isMounted = !0, g = b = x = null;
      }
    };
    m.scope.on();
    const A = m.effect = new ji(j);
    m.scope.off();
    const q = m.update = A.run.bind(A), C = m.job = A.runIfDirty.bind(A);
    C.i = m, C.id = m.uid, A.scheduler = () => Pn(C), Ct(m, !0), q();
  }, te = (m, g, b) => {
    g.component = m;
    const x = m.vnode.props;
    m.vnode = g, m.next = null, Ka(m, g.props, x, b), Ya(m, g.children, b), mt(), Mn(m), ht();
  }, Y = (m, g, b, x, I, S, O, j, A = !1) => {
    const q = m && m.children, C = m ? m.shapeFlag : 0, M = g.children, { patchFlag: N, shapeFlag: W } = g;
    if (N > 0) {
      if (N & 128) {
        At(
          q,
          M,
          b,
          x,
          I,
          S,
          O,
          j,
          A
        );
        return;
      } else if (N & 256) {
        nt(
          q,
          M,
          b,
          x,
          I,
          S,
          O,
          j,
          A
        );
        return;
      }
    }
    W & 8 ? (C & 16 && Tt(q, I, S), M !== q && i(b, M)) : C & 16 ? W & 16 ? At(
      q,
      M,
      b,
      x,
      I,
      S,
      O,
      j,
      A
    ) : Tt(q, I, S, !0) : (C & 8 && i(b, ""), W & 16 && $e(
      M,
      b,
      x,
      I,
      S,
      O,
      j,
      A
    ));
  }, nt = (m, g, b, x, I, S, O, j, A) => {
    m = m || Zt, g = g || Zt;
    const q = m.length, C = g.length, M = Math.min(q, C);
    let N;
    for (N = 0; N < M; N++) {
      const W = g[N] = A ? Pt(g[N]) : Qe(g[N]);
      h(
        m[N],
        W,
        b,
        null,
        I,
        S,
        O,
        j,
        A
      );
    }
    q > C ? Tt(
      m,
      I,
      S,
      !0,
      !1,
      M
    ) : $e(
      g,
      b,
      x,
      I,
      S,
      O,
      j,
      A,
      M
    );
  }, At = (m, g, b, x, I, S, O, j, A) => {
    let q = 0;
    const C = g.length;
    let M = m.length - 1, N = C - 1;
    for (; q <= M && q <= N; ) {
      const W = m[q], U = g[q] = A ? Pt(g[q]) : Qe(g[q]);
      if (fs(W, U))
        h(
          W,
          U,
          b,
          null,
          I,
          S,
          O,
          j,
          A
        );
      else
        break;
      q++;
    }
    for (; q <= M && q <= N; ) {
      const W = m[M], U = g[N] = A ? Pt(g[N]) : Qe(g[N]);
      if (fs(W, U))
        h(
          W,
          U,
          b,
          null,
          I,
          S,
          O,
          j,
          A
        );
      else
        break;
      M--, N--;
    }
    if (q > M) {
      if (q <= N) {
        const W = N + 1, U = W < C ? g[W].el : x;
        for (; q <= N; )
          h(
            null,
            g[q] = A ? Pt(g[q]) : Qe(g[q]),
            b,
            U,
            I,
            S,
            O,
            j,
            A
          ), q++;
      }
    } else if (q > N)
      for (; q <= M; )
        je(m[q], I, S, !0), q++;
    else {
      const W = q, U = q, B = /* @__PURE__ */ new Map();
      for (q = U; q <= N; q++) {
        const we = g[q] = A ? Pt(g[q]) : Qe(g[q]);
        we.key != null && B.set(we.key, q);
      }
      let Z, me = 0;
      const he = N - U + 1;
      let ze = !1, Re = 0;
      const Et = new Array(he);
      for (q = 0; q < he; q++) Et[q] = 0;
      for (q = W; q <= M; q++) {
        const we = m[q];
        if (me >= he) {
          je(we, I, S, !0);
          continue;
        }
        let Te;
        if (we.key != null)
          Te = B.get(we.key);
        else
          for (Z = U; Z <= N; Z++)
            if (Et[Z - U] === 0 && fs(we, g[Z])) {
              Te = Z;
              break;
            }
        Te === void 0 ? je(we, I, S, !0) : (Et[Te - U] = q + 1, Te >= Re ? Re = Te : ze = !0, h(
          we,
          g[Te],
          b,
          null,
          I,
          S,
          O,
          j,
          A
        ), me++);
      }
      const Ot = ze ? sl(Et) : Zt;
      for (Z = Ot.length - 1, q = he - 1; q >= 0; q--) {
        const we = U + q, Te = g[we], Ht = g[we + 1], k = we + 1 < C ? (
          // #13559, fallback to el placeholder for unresolved async component
          Ht.el || Ht.placeholder
        ) : x;
        Et[q] === 0 ? h(
          null,
          Te,
          b,
          k,
          I,
          S,
          O,
          j,
          A
        ) : ze && (Z < 0 || q !== Ot[Z] ? Ue(Te, b, k, 2) : Z--);
      }
    }
  }, Ue = (m, g, b, x, I = null) => {
    const { el: S, type: O, transition: j, children: A, shapeFlag: q } = m;
    if (q & 6) {
      Ue(m.component.subTree, g, b, x);
      return;
    }
    if (q & 128) {
      m.suspense.move(g, b, x);
      return;
    }
    if (q & 64) {
      O.move(m, g, b, Je);
      return;
    }
    if (O === oe) {
      a(S, g, b);
      for (let M = 0; M < A.length; M++)
        Ue(A[M], g, b, x);
      a(m.anchor, g, b);
      return;
    }
    if (O === zr) {
      T(m, g, b);
      return;
    }
    if (x !== 2 && q & 1 && j)
      if (x === 0)
        j.beforeEnter(S), a(S, g, b), Ee(() => j.enter(S), I);
      else {
        const { leave: M, delayLeave: N, afterLeave: W } = j, U = () => {
          m.ctx.isUnmounted ? l(S) : a(S, g, b);
        }, B = () => {
          S._isLeaving && S[$a](
            !0
            /* cancelled */
          ), M(S, () => {
            U(), W && W();
          });
        };
        N ? N(S, U, B) : B();
      }
    else
      a(S, g, b);
  }, je = (m, g, b, x = !1, I = !1) => {
    const {
      type: S,
      props: O,
      ref: j,
      children: A,
      dynamicChildren: q,
      shapeFlag: C,
      patchFlag: M,
      dirs: N,
      cacheIndex: W
    } = m;
    if (M === -2 && (I = !1), j != null && (mt(), Is(j, null, b, m, !0), ht()), W != null && (g.renderCache[W] = void 0), C & 256) {
      g.ctx.deactivate(m);
      return;
    }
    const U = C & 1 && N, B = !qs(m);
    let Z;
    if (B && (Z = O && O.onVnodeBeforeUnmount) && Ge(Z, g, m), C & 6)
      Ft(m.component, b, x);
    else {
      if (C & 128) {
        m.suspense.unmount(b, x);
        return;
      }
      U && Mt(m, null, g, "beforeUnmount"), C & 64 ? m.type.remove(
        m,
        g,
        b,
        Je,
        x
      ) : q && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !q.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (S !== oe || M > 0 && M & 64) ? Tt(
        q,
        g,
        b,
        !1,
        !0
      ) : (S === oe && M & 384 || !I && C & 16) && Tt(A, g, b), x && jt(m);
    }
    (B && (Z = O && O.onVnodeUnmounted) || U) && Ee(() => {
      Z && Ge(Z, g, m), U && Mt(m, null, g, "unmounted");
    }, b);
  }, jt = (m) => {
    const { type: g, el: b, anchor: x, transition: I } = m;
    if (g === oe) {
      Fs(b, x);
      return;
    }
    if (g === zr) {
      L(m);
      return;
    }
    const S = () => {
      l(b), I && !I.persisted && I.afterLeave && I.afterLeave();
    };
    if (m.shapeFlag & 1 && I && !I.persisted) {
      const { leave: O, delayLeave: j } = I, A = () => O(b, S);
      j ? j(m.el, S, A) : A();
    } else
      S();
  }, Fs = (m, g) => {
    let b;
    for (; m !== g; )
      b = y(m), l(m), m = b;
    l(g);
  }, Ft = (m, g, b) => {
    const { bum: x, scope: I, job: S, subTree: O, um: j, m: A, a: q } = m;
    Fn(A), Fn(q), x && Gs(x), I.stop(), S && (S.flags |= 8, je(O, m, g, b)), j && Ee(j, g), Ee(() => {
      m.isUnmounted = !0;
    }, g);
  }, Tt = (m, g, b, x = !1, I = !1, S = 0) => {
    for (let O = S; O < m.length; O++)
      je(m[O], g, b, x, I);
  }, Vt = (m) => {
    if (m.shapeFlag & 6)
      return Vt(m.component.subTree);
    if (m.shapeFlag & 128)
      return m.suspense.next();
    const g = y(m.anchor || m.el), b = g && g[Pa];
    return b ? y(b) : g;
  };
  let ds = !1;
  const it = (m, g, b) => {
    m == null ? g._vnode && je(g._vnode, null, null, !0) : h(
      g._vnode || null,
      m,
      g,
      null,
      null,
      null,
      b
    ), g._vnode = m, ds || (ds = !0, Mn(), Ji(), ds = !1);
  }, Je = {
    p: h,
    um: je,
    m: Ue,
    r: jt,
    mt: _t,
    mc: $e,
    pc: Y,
    pbc: ne,
    n: Vt,
    o: e
  };
  return {
    render: it,
    hydrate: void 0,
    createApp: Ua(it)
  };
}
function Lr({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Ct({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function tl(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function mo(e, t, n = !1) {
  const a = e.children, l = t.children;
  if (D(a) && D(l))
    for (let u = 0; u < a.length; u++) {
      const s = a[u];
      let o = l[u];
      o.shapeFlag & 1 && !o.dynamicChildren && ((o.patchFlag <= 0 || o.patchFlag === 32) && (o = l[u] = Pt(l[u]), o.el = s.el), !n && o.patchFlag !== -2 && mo(s, o)), o.type === Sr && // avoid cached text nodes retaining detached dom nodes
      o.patchFlag !== -1 && (o.el = s.el), o.type === It && !o.el && (o.el = s.el);
    }
}
function sl(e) {
  const t = e.slice(), n = [0];
  let a, l, u, s, o;
  const c = e.length;
  for (a = 0; a < c; a++) {
    const r = e[a];
    if (r !== 0) {
      if (l = n[n.length - 1], e[l] < r) {
        t[a] = l, n.push(a);
        continue;
      }
      for (u = 0, s = n.length - 1; u < s; )
        o = u + s >> 1, e[n[o]] < r ? u = o + 1 : s = o;
      r < e[n[u]] && (u > 0 && (t[a] = n[u - 1]), n[u] = a);
    }
  }
  for (u = n.length, s = n[u - 1]; u-- > 0; )
    n[u] = s, s = t[s];
  return n;
}
function ho(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : ho(t);
}
function Fn(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const rl = Symbol.for("v-scx"), nl = () => Xs(rl);
function Ss(e, t, n) {
  return yo(e, t, n);
}
function yo(e, t, n = Q) {
  const { immediate: a, deep: l, flush: u, once: s } = n, o = xe({}, n), c = t && a || !t && u !== "post";
  let r;
  if (Os) {
    if (u === "sync") {
      const p = nl();
      r = p.__watcherHandles || (p.__watcherHandles = []);
    } else if (!c) {
      const p = () => {
      };
      return p.stop = et, p.resume = et, p.pause = et, p;
    }
  }
  const i = be;
  o.call = (p, f, h) => rt(p, i, f, h);
  let d = !1;
  u === "post" ? o.scheduler = (p) => {
    Ee(p, i && i.suspense);
  } : u !== "sync" && (d = !0, o.scheduler = (p, f) => {
    f ? p() : Pn(p);
  }), o.augmentJob = (p) => {
    t && (p.flags |= 4), d && (p.flags |= 2, i && (p.id = i.uid, p.i = i));
  };
  const y = ya(e, t, o);
  return Os && (r ? r.push(y) : c && y()), y;
}
function il(e, t, n) {
  const a = this.proxy, l = de(e) ? e.includes(".") ? go(a, e) : () => a[e] : e.bind(a, a);
  let u;
  V(t) ? u = t : (u = t.handler, n = t);
  const s = Ws(this), o = yo(l, u.bind(a), n);
  return s(), o;
}
function go(e, t) {
  const n = t.split(".");
  return () => {
    let a = e;
    for (let l = 0; l < n.length && a; l++)
      a = a[n[l]];
    return a;
  };
}
const ol = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ve(t)}Modifiers`] || e[`${xt(t)}Modifiers`];
function al(e, t, ...n) {
  if (e.isUnmounted) return;
  const a = e.vnode.props || Q;
  let l = n;
  const u = t.startsWith("update:"), s = u && ol(a, t.slice(7));
  s && (s.trim && (l = n.map((i) => de(i) ? i.trim() : i)), s.number && (l = n.map(er)));
  let o, c = a[o = Tr(t)] || // also try camelCase event handler (#2249)
  a[o = Tr(Ve(t))];
  !c && u && (c = a[o = Tr(xt(t))]), c && rt(
    c,
    e,
    6,
    l
  );
  const r = a[o + "Once"];
  if (r) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[o])
      return;
    e.emitted[o] = !0, rt(
      r,
      e,
      6,
      l
    );
  }
}
const ll = /* @__PURE__ */ new WeakMap();
function wo(e, t, n = !1) {
  const a = n ? ll : t.emitsCache, l = a.get(e);
  if (l !== void 0)
    return l;
  const u = e.emits;
  let s = {}, o = !1;
  if (!V(e)) {
    const c = (r) => {
      const i = wo(r, t, !0);
      i && (o = !0, xe(s, i));
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !u && !o ? (se(e) && a.set(e, null), null) : (D(u) ? u.forEach((c) => s[c] = null) : xe(s, u), se(e) && a.set(e, s), s);
}
function xr(e, t) {
  return !e || !gr(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), J(e, t[0].toLowerCase() + t.slice(1)) || J(e, xt(t)) || J(e, t));
}
function Vn(e) {
  const {
    type: t,
    vnode: n,
    proxy: a,
    withProxy: l,
    propsOptions: [u],
    slots: s,
    attrs: o,
    emit: c,
    render: r,
    renderCache: i,
    props: d,
    data: y,
    setupState: p,
    ctx: f,
    inheritAttrs: h
  } = e, P = nr(e);
  let $, E;
  try {
    if (n.shapeFlag & 4) {
      const L = l || a, G = L;
      $ = Qe(
        r.call(
          G,
          L,
          i,
          d,
          p,
          y,
          f
        )
      ), E = o;
    } else {
      const L = t;
      $ = Qe(
        L.length > 1 ? L(
          d,
          { attrs: o, slots: s, emit: c }
        ) : L(
          d,
          null
        )
      ), E = t.props ? o : ul(o);
    }
  } catch (L) {
    _s.length = 0, Ir(L, e, 1), $ = tt(It);
  }
  let T = $;
  if (E && h !== !1) {
    const L = Object.keys(E), { shapeFlag: G } = T;
    L.length && G & 7 && (u && L.some(ln) && (E = cl(
      E,
      u
    )), T = cs(T, E, !1, !0));
  }
  return n.dirs && (T = cs(T, null, !1, !0), T.dirs = T.dirs ? T.dirs.concat(n.dirs) : n.dirs), n.transition && kn(T, n.transition), $ = T, nr(P), $;
}
const ul = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || gr(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, cl = (e, t) => {
  const n = {};
  for (const a in e)
    (!ln(a) || !(a.slice(9) in t)) && (n[a] = e[a]);
  return n;
};
function dl(e, t, n) {
  const { props: a, children: l, component: u } = e, { props: s, children: o, patchFlag: c } = t, r = u.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return a ? Hn(a, s, r) : !!s;
    if (c & 8) {
      const i = t.dynamicProps;
      for (let d = 0; d < i.length; d++) {
        const y = i[d];
        if (s[y] !== a[y] && !xr(r, y))
          return !0;
      }
    }
  } else
    return (l || o) && (!o || !o.$stable) ? !0 : a === s ? !1 : a ? s ? Hn(a, s, r) : !0 : !!s;
  return !1;
}
function Hn(e, t, n) {
  const a = Object.keys(t);
  if (a.length !== Object.keys(e).length)
    return !0;
  for (let l = 0; l < a.length; l++) {
    const u = a[l];
    if (t[u] !== e[u] && !xr(n, u))
      return !0;
  }
  return !1;
}
function pl({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const a = t.subTree;
    if (a.suspense && a.suspense.activeBranch === e && (a.el = e.el), a === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const vo = (e) => e.__isSuspense;
function fl(e, t) {
  t && t.pendingBranch ? D(e) ? t.effects.push(...e) : t.effects.push(e) : va(e);
}
const oe = Symbol.for("v-fgt"), Sr = Symbol.for("v-txt"), It = Symbol.for("v-cmt"), zr = Symbol.for("v-stc"), _s = [];
let Ne = null;
function R(e = !1) {
  _s.push(Ne = e ? null : []);
}
function ml() {
  _s.pop(), Ne = _s[_s.length - 1] || null;
}
let Es = 1;
function Un(e, t = !1) {
  Es += e, e < 0 && Ne && t && (Ne.hasOnce = !0);
}
function bo(e) {
  return e.dynamicChildren = Es > 0 ? Ne || Zt : null, ml(), Es > 0 && Ne && Ne.push(e), e;
}
function F(e, t, n, a, l, u) {
  return bo(
    w(
      e,
      t,
      n,
      a,
      l,
      u,
      !0
    )
  );
}
function ar(e, t, n, a, l) {
  return bo(
    tt(
      e,
      t,
      n,
      a,
      l,
      !0
    )
  );
}
function Po(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function fs(e, t) {
  return e.type === t.type && e.key === t.key;
}
const ko = ({ key: e }) => e ?? null, Ys = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? de(e) || Pe(e) || V(e) ? { i: Ce, r: e, k: t, f: !!n } : e : null);
function w(e, t = null, n = null, a = 0, l = null, u = e === oe ? 0 : 1, s = !1, o = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && ko(t),
    ref: t && Ys(t),
    scopeId: Xi,
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
    patchFlag: a,
    dynamicProps: l,
    dynamicChildren: null,
    appContext: null,
    ctx: Ce
  };
  return o ? (Sn(c, n), u & 128 && e.normalize(c)) : n && (c.shapeFlag |= de(n) ? 8 : 16), Es > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  Ne && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || u & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && Ne.push(c), c;
}
const tt = hl;
function hl(e, t = null, n = null, a = 0, l = null, u = !1) {
  if ((!e || e === Na) && (e = It), Po(e)) {
    const o = cs(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Sn(o, n), Es > 0 && !u && Ne && (o.shapeFlag & 6 ? Ne[Ne.indexOf(e)] = o : Ne.push(o)), o.patchFlag = -2, o;
  }
  if (Sl(e) && (e = e.__vccOpts), t) {
    t = yl(t);
    let { class: o, style: c } = t;
    o && !de(o) && (t.class = Ae(o)), se(c) && (vn(c) && !D(c) && (c = xe({}, c)), t.style = dn(c));
  }
  const s = de(e) ? 1 : vo(e) ? 128 : ka(e) ? 64 : se(e) ? 4 : V(e) ? 2 : 0;
  return w(
    e,
    t,
    n,
    a,
    l,
    s,
    u,
    !0
  );
}
function yl(e) {
  return e ? vn(e) || ao(e) ? xe({}, e) : e : null;
}
function cs(e, t, n = !1, a = !1) {
  const { props: l, ref: u, patchFlag: s, children: o, transition: c } = e, r = t ? gl(l || {}, t) : l, i = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: r,
    key: r && ko(r),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && u ? D(u) ? u.concat(Ys(t)) : [u, Ys(t)] : Ys(t)
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
    patchFlag: t && e.type !== oe ? s === -1 ? 16 : s | 16 : s,
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
  return c && a && kn(
    i,
    c.clone(i)
  ), i;
}
function le(e = " ", t = 0) {
  return tt(Sr, null, e, t);
}
function We(e = "", t = !1) {
  return t ? (R(), ar(It, null, e)) : tt(It, null, e);
}
function Qe(e) {
  return e == null || typeof e == "boolean" ? tt(It) : D(e) ? tt(
    oe,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Po(e) ? Pt(e) : tt(Sr, null, String(e));
}
function Pt(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : cs(e);
}
function Sn(e, t) {
  let n = 0;
  const { shapeFlag: a } = e;
  if (t == null)
    t = null;
  else if (D(t))
    n = 16;
  else if (typeof t == "object")
    if (a & 65) {
      const l = t.default;
      l && (l._c && (l._d = !1), Sn(e, l()), l._c && (l._d = !0));
      return;
    } else {
      n = 32;
      const l = t._;
      !l && !ao(t) ? t._ctx = Ce : l === 3 && Ce && (Ce.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else V(t) ? (t = { default: t, _ctx: Ce }, n = 32) : (t = String(t), a & 64 ? (n = 16, t = [le(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function gl(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const a = e[n];
    for (const l in a)
      if (l === "class")
        t.class !== a.class && (t.class = Ae([t.class, a.class]));
      else if (l === "style")
        t.style = dn([t.style, a.style]);
      else if (gr(l)) {
        const u = t[l], s = a[l];
        s && u !== s && !(D(u) && u.includes(s)) && (t[l] = u ? [].concat(u, s) : s);
      } else l !== "" && (t[l] = a[l]);
  }
  return t;
}
function Ge(e, t, n, a = null) {
  rt(e, t, 7, [
    n,
    a
  ]);
}
const wl = no();
let vl = 0;
function bl(e, t, n) {
  const a = e.type, l = (t ? t.appContext : e.appContext) || wl, u = {
    uid: vl++,
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
    scope: new Fo(
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
    propsOptions: uo(a, l),
    emitsOptions: wo(a, l),
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
  return u.ctx = { _: u }, u.root = t ? t.root : u, u.emit = al.bind(null, u), e.ce && e.ce(u), u;
}
let be = null;
const Pl = () => be || Ce;
let lr, en;
{
  const e = Pr(), t = (n, a) => {
    let l;
    return (l = e[n]) || (l = e[n] = []), l.push(a), (u) => {
      l.length > 1 ? l.forEach((s) => s(u)) : l[0](u);
    };
  };
  lr = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => be = n
  ), en = t(
    "__VUE_SSR_SETTERS__",
    (n) => Os = n
  );
}
const Ws = (e) => {
  const t = be;
  return lr(e), e.scope.on(), () => {
    e.scope.off(), lr(t);
  };
}, Bn = () => {
  be && be.scope.off(), lr(null);
};
function $o(e) {
  return e.vnode.shapeFlag & 4;
}
let Os = !1;
function kl(e, t = !1, n = !1) {
  t && en(t);
  const { props: a, children: l } = e.vnode, u = $o(e);
  Za(e, a, u, t), Xa(e, l, n || t);
  const s = u ? $l(e, t) : void 0;
  return t && en(!1), s;
}
function $l(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, za);
  const { setup: a } = n;
  if (a) {
    mt();
    const l = e.setupContext = a.length > 1 ? ql(e) : null, u = Ws(e), s = Rs(
      a,
      e,
      0,
      [
        e.props,
        l
      ]
    ), o = $i(s);
    if (ht(), u(), (o || e.sp) && !qs(e) && Yi(e), o) {
      if (s.then(Bn, Bn), t)
        return s.then((c) => {
          Zn(e, c);
        }).catch((c) => {
          Ir(c, e, 0);
        });
      e.asyncDep = s;
    } else
      Zn(e, s);
  } else
    Io(e);
}
function Zn(e, t, n) {
  V(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : se(t) && (e.setupState = Bi(t)), Io(e);
}
function Io(e, t, n) {
  const a = e.type;
  e.render || (e.render = a.render || et);
  {
    const l = Ws(e);
    mt();
    try {
      Ra(e);
    } finally {
      ht(), l();
    }
  }
}
const Il = {
  get(e, t) {
    return ve(e, "get", ""), e[t];
  }
};
function ql(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Il),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function _r(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Bi(ua(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in xs)
        return xs[n](e);
    },
    has(t, n) {
      return n in t || n in xs;
    }
  })) : e.proxy;
}
function xl(e, t = !0) {
  return V(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Sl(e) {
  return V(e) && "__vccOpts" in e;
}
const De = (e, t) => ma(e, t, Os), _l = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let tn;
const Kn = typeof window < "u" && window.trustedTypes;
if (Kn)
  try {
    tn = /* @__PURE__ */ Kn.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const qo = tn ? (e) => tn.createHTML(e) : (e) => e, Al = "http://www.w3.org/2000/svg", jl = "http://www.w3.org/1998/Math/MathML", lt = typeof document < "u" ? document : null, Jn = lt && /* @__PURE__ */ lt.createElement("template"), Tl = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, a) => {
    const l = t === "svg" ? lt.createElementNS(Al, e) : t === "mathml" ? lt.createElementNS(jl, e) : n ? lt.createElement(e, { is: n }) : lt.createElement(e);
    return e === "select" && a && a.multiple != null && l.setAttribute("multiple", a.multiple), l;
  },
  createText: (e) => lt.createTextNode(e),
  createComment: (e) => lt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => lt.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, a, l, u) {
    const s = n ? n.previousSibling : t.lastChild;
    if (l && (l === u || l.nextSibling))
      for (; t.insertBefore(l.cloneNode(!0), n), !(l === u || !(l = l.nextSibling)); )
        ;
    else {
      Jn.innerHTML = qo(
        a === "svg" ? `<svg>${e}</svg>` : a === "mathml" ? `<math>${e}</math>` : e
      );
      const o = Jn.content;
      if (a === "svg" || a === "mathml") {
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
}, El = Symbol("_vtc");
function Ol(e, t, n) {
  const a = e[El];
  a && (t = (t ? [t, ...a] : [...a]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const ur = Symbol("_vod"), xo = Symbol("_vsh"), Gn = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(e, { value: t }, { transition: n }) {
    e[ur] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : ms(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: a }) {
    !t != !n && (a ? t ? (a.beforeEnter(e), ms(e, !0), a.enter(e)) : a.leave(e, () => {
      ms(e, !1);
    }) : ms(e, t));
  },
  beforeUnmount(e, { value: t }) {
    ms(e, t);
  }
};
function ms(e, t) {
  e.style.display = t ? e[ur] : "none", e[xo] = !t;
}
const Ml = Symbol(""), Cl = /(?:^|;)\s*display\s*:/;
function Nl(e, t, n) {
  const a = e.style, l = de(n);
  let u = !1;
  if (n && !l) {
    if (t)
      if (de(t))
        for (const s of t.split(";")) {
          const o = s.slice(0, s.indexOf(":")).trim();
          n[o] == null && Qs(a, o, "");
        }
      else
        for (const s in t)
          n[s] == null && Qs(a, s, "");
    for (const s in n)
      s === "display" && (u = !0), Qs(a, s, n[s]);
  } else if (l) {
    if (t !== n) {
      const s = a[Ml];
      s && (n += ";" + s), a.cssText = n, u = Cl.test(n);
    }
  } else t && e.removeAttribute("style");
  ur in e && (e[ur] = u ? a.display : "", e[xo] && (a.display = "none"));
}
const Xn = /\s*!important$/;
function Qs(e, t, n) {
  if (D(n))
    n.forEach((a) => Qs(e, t, a));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const a = Ll(e, t);
    Xn.test(n) ? e.setProperty(
      xt(a),
      n.replace(Xn, ""),
      "important"
    ) : e[a] = n;
  }
}
const Yn = ["Webkit", "Moz", "ms"], Rr = {};
function Ll(e, t) {
  const n = Rr[t];
  if (n)
    return n;
  let a = Ve(t);
  if (a !== "filter" && a in e)
    return Rr[t] = a;
  a = br(a);
  for (let l = 0; l < Yn.length; l++) {
    const u = Yn[l] + a;
    if (u in e)
      return Rr[t] = u;
  }
  return t;
}
const Qn = "http://www.w3.org/1999/xlink";
function ei(e, t, n, a, l, u = Ro(t)) {
  a && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Qn, t.slice(6, t.length)) : e.setAttributeNS(Qn, t, n) : n == null || u && !Si(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    u ? "" : st(n) ? String(n) : n
  );
}
function ti(e, t, n, a, l) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? qo(n) : n);
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
    o === "boolean" ? n = Si(n) : n == null && o === "string" ? (n = "", s = !0) : o === "number" && (n = 0, s = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  s && e.removeAttribute(l || t);
}
function Rt(e, t, n, a) {
  e.addEventListener(t, n, a);
}
function zl(e, t, n, a) {
  e.removeEventListener(t, n, a);
}
const si = Symbol("_vei");
function Rl(e, t, n, a, l = null) {
  const u = e[si] || (e[si] = {}), s = u[t];
  if (a && s)
    s.value = a;
  else {
    const [o, c] = Wl(t);
    if (a) {
      const r = u[t] = Vl(
        a,
        l
      );
      Rt(e, o, r, c);
    } else s && (zl(e, o, s, c), u[t] = void 0);
  }
}
const ri = /(?:Once|Passive|Capture)$/;
function Wl(e) {
  let t;
  if (ri.test(e)) {
    t = {};
    let a;
    for (; a = e.match(ri); )
      e = e.slice(0, e.length - a[0].length), t[a[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : xt(e.slice(2)), t];
}
let Wr = 0;
const Dl = /* @__PURE__ */ Promise.resolve(), Fl = () => Wr || (Dl.then(() => Wr = 0), Wr = Date.now());
function Vl(e, t) {
  const n = (a) => {
    if (!a._vts)
      a._vts = Date.now();
    else if (a._vts <= n.attached)
      return;
    rt(
      Hl(a, n.value),
      t,
      5,
      [a]
    );
  };
  return n.value = e, n.attached = Fl(), n;
}
function Hl(e, t) {
  if (D(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (a) => (l) => !l._stopped && a && a(l)
    );
  } else
    return t;
}
const ni = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Ul = (e, t, n, a, l, u) => {
  const s = l === "svg";
  t === "class" ? Ol(e, a, s) : t === "style" ? Nl(e, n, a) : gr(t) ? ln(t) || Rl(e, t, n, a, u) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Bl(e, t, a, s)) ? (ti(e, t, a), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ei(e, t, a, s, u, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !de(a)) ? ti(e, Ve(t), a, u, t) : (t === "true-value" ? e._trueValue = a : t === "false-value" && (e._falseValue = a), ei(e, t, a, s));
};
function Bl(e, t, n, a) {
  if (a)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ni(t) && V(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const l = e.tagName;
    if (l === "IMG" || l === "VIDEO" || l === "CANVAS" || l === "SOURCE")
      return !1;
  }
  return ni(t) && de(n) ? !1 : t in e;
}
const cr = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return D(t) ? (n) => Gs(t, n) : t;
};
function Zl(e) {
  e.target.composing = !0;
}
function ii(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Yt = Symbol("_assign"), Kl = {
  created(e, { modifiers: { lazy: t, trim: n, number: a } }, l) {
    e[Yt] = cr(l);
    const u = a || l.props && l.props.type === "number";
    Rt(e, t ? "change" : "input", (s) => {
      if (s.target.composing) return;
      let o = e.value;
      n && (o = o.trim()), u && (o = er(o)), e[Yt](o);
    }), n && Rt(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Rt(e, "compositionstart", Zl), Rt(e, "compositionend", ii), Rt(e, "change", ii));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: a, trim: l, number: u } }, s) {
    if (e[Yt] = cr(s), e.composing) return;
    const o = (u || e.type === "number") && !/^0\d/.test(e.value) ? er(e.value) : e.value, c = t ?? "";
    o !== c && (document.activeElement === e && e.type !== "range" && (a && t === n || l && e.value.trim() === c) || (e.value = c));
  }
}, Jl = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: n } }, a) {
    const l = wr(t);
    Rt(e, "change", () => {
      const u = Array.prototype.filter.call(e.options, (s) => s.selected).map(
        (s) => n ? er(dr(s)) : dr(s)
      );
      e[Yt](
        e.multiple ? l ? new Set(u) : u : u[0]
      ), e._assigning = !0, bn(() => {
        e._assigning = !1;
      });
    }), e[Yt] = cr(a);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    oi(e, t);
  },
  beforeUpdate(e, t, n) {
    e[Yt] = cr(n);
  },
  updated(e, { value: t }) {
    e._assigning || oi(e, t);
  }
};
function oi(e, t) {
  const n = e.multiple, a = D(t);
  if (!(n && !a && !wr(t))) {
    for (let l = 0, u = e.options.length; l < u; l++) {
      const s = e.options[l], o = dr(s);
      if (n)
        if (a) {
          const c = typeof o;
          c === "string" || c === "number" ? s.selected = t.some((r) => String(r) === String(o)) : s.selected = Do(t, o) > -1;
        } else
          s.selected = t.has(o);
      else if (kr(dr(s), t)) {
        e.selectedIndex !== l && (e.selectedIndex = l);
        return;
      }
    }
    !n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function dr(e) {
  return "_value" in e ? e._value : e.value;
}
const Gl = ["ctrl", "shift", "alt", "meta"], Xl = {
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
  exact: (e, t) => Gl.some((n) => e[`${n}Key`] && !t.includes(n))
}, _n = (e, t) => {
  const n = e._withMods || (e._withMods = {}), a = t.join(".");
  return n[a] || (n[a] = ((l, ...u) => {
    for (let s = 0; s < t.length; s++) {
      const o = Xl[t[s]];
      if (o && o(l, t)) return;
    }
    return e(l, ...u);
  }));
}, Yl = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Ql = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), a = t.join(".");
  return n[a] || (n[a] = ((l) => {
    if (!("key" in l))
      return;
    const u = xt(l.key);
    if (t.some(
      (s) => s === u || Yl[s] === u
    ))
      return e(l);
  }));
}, eu = /* @__PURE__ */ xe({ patchProp: Ul }, Tl);
let ai;
function tu() {
  return ai || (ai = Qa(eu));
}
const su = ((...e) => {
  const t = tu().createApp(...e), { mount: n } = t;
  return t.mount = (a) => {
    const l = nu(a);
    if (!l) return;
    const u = t._component;
    !V(u) && !u.render && !u.template && (u.template = l.innerHTML), l.nodeType === 1 && (l.textContent = "");
    const s = n(l, !1, ru(l));
    return l instanceof Element && (l.removeAttribute("v-cloak"), l.setAttribute("data-v-app", "")), s;
  }, t;
});
function ru(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function nu(e) {
  return de(e) ? document.querySelector(e) : e;
}
const iu = { class: "tree-node" }, ou = ["title"], au = { class: "tree-icon" }, lu = {
  key: 0,
  class: "tree-children"
}, uu = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
  __name: "FileTreeNode",
  props: {
    node: { type: Object, required: !0 },
    selectedPath: { type: String, default: "" }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = t, a = X(!0);
    return (l, u) => {
      const s = Ca("FileTreeNode", !0);
      return R(), F("div", iu, [
        w("div", {
          class: Ae(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: u[1] || (u[1] = (o) => n("select", e.node)),
          onDblclick: u[2] || (u[2] = (o) => e.node.kind === "directory" && (a.value = !a.value))
        }, [
          w("span", {
            class: "tree-toggle",
            onClick: u[0] || (u[0] = _n((o) => e.node.kind === "directory" && (a.value = !a.value), ["stop"]))
          }, H(e.node.kind === "directory" ? a.value ? "⌄" : "›" : ""), 1),
          w("span", au, H(e.node.kind === "directory" ? "▰" : "·"), 1),
          w("span", null, H(e.node.name), 1)
        ], 42, ou),
        e.node.kind === "directory" && a.value ? (R(), F("div", lu, [
          (R(!0), F(oe, null, bt(e.node.children, (o) => (R(), ar(s, {
            key: o.path,
            node: o,
            "selected-path": e.selectedPath,
            onSelect: u[3] || (u[3] = (c) => n("select", c))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : We("", !0)
      ]);
    };
  }
}), cu = { class: "monaco-editor-shell" }, du = {
  key: 0,
  class: "editor-loading"
}, pu = {
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
    const n = e, a = t, l = X(null), u = X(!0);
    let s, o, c, r, i = !1, d;
    $n(async () => {
      try {
        const h = await import("./monaco-runtime-Byn4_dO2.js").then((P) => P.jz);
        ({ monaco: c } = await h.configureStudioMonaco()), d = h.configureManifestSchemaForText, o = y(), f(o.getValue()), s = c.editor.create(l.value, {
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
        }), r = s.onDidChangeModelContent(() => {
          const P = o.getValue();
          f(P), i || a("update:value", P);
        }), s.addCommand(c.KeyMod.CtrlCmd | c.KeyCode.KeyS, () => a("save")), u.value = !1, p(), s.focus(), a("ready");
      } catch (h) {
        u.value = !1, a("error", h);
      }
    }), Ss(() => n.value, (h) => {
      !o || o.getValue() === h || (i = !0, o.setValue(h), f(h), i = !1);
    }), Ss(() => n.markers, p, { deep: !0 }), In(() => {
      r?.dispose(), s?.dispose();
    });
    function y() {
      const h = c.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(n.projectId)}/${n.path}`), P = c.editor.getModel(h);
      return P ? (c.editor.setModelLanguage(P, n.language), P.getValue() !== n.value && P.setValue(n.value), P) : c.editor.createModel(n.value, n.language, h);
    }
    function p() {
      !c || !o || c.editor.setModelMarkers(o, "webwindows-manifest", n.markers.map((h) => ({
        severity: h.severity === "warning" ? c.MarkerSeverity.Warning : c.MarkerSeverity.Error,
        message: `${h.path}: ${h.message}`,
        startLineNumber: h.line || 1,
        startColumn: h.column || 1,
        endLineNumber: h.endLine || h.line || 1,
        endColumn: h.endColumn || Math.max(2, (h.column || 1) + 1)
      })));
    }
    function f(h) {
      n.path === "manifest.json" && d?.(h);
    }
    return (h, P) => (R(), F("div", cu, [
      w("div", {
        ref_key: "host",
        ref: l,
        class: "monaco-editor-host"
      }, null, 512),
      u.value ? (R(), F("div", du, "正在载入本地编辑器…")) : We("", !0)
    ]));
  }
}, fu = 1, li = 2;
function qt(e) {
  return !e || typeof e != "object" || Array.isArray(e) ? null : Object.prototype.hasOwnProperty.call(e, "manifestVersion") ? e.manifestVersion === li ? li : null : fu;
}
const mu = { class: "manifest-inspector" }, hu = { class: "inspector-mode-tabs" }, yu = {
  key: 0,
  class: "inspector-note"
}, gu = {
  key: 1,
  class: "inspector-note error"
}, wu = ["value"], vu = { key: 0 }, bu = ["value"], Pu = ["value"], ku = ["value"], $u = ["value"], Iu = ["value"], qu = ["value"], xu = ["value"], Su = ["value"], _u = ["value"], Au = ["value"], ju = { class: "check" }, Tu = ["checked"], Eu = { class: "check" }, Ou = ["checked"], Mu = { class: "check" }, Cu = ["checked"], Nu = { class: "check" }, Lu = ["checked"], zu = { class: "check" }, Ru = ["checked"], Wu = {
  key: 1,
  class: "permission-fieldset"
}, Du = { class: "permission-heading" }, Fu = ["checked", "onChange"], Vu = { class: "permission-meta" }, Hu = { key: 0 }, Uu = {
  key: 2,
  class: "inspector-note"
}, Bu = { class: "inspector-summary" }, Zu = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const n = e, a = t, l = X("form"), u = De(() => n.manifest && typeof n.manifest == "object" && !Array.isArray(n.manifest)), s = De(() => {
      if (!u.value) return "—";
      const y = qt(n.manifest);
      return y === 1 ? "1 (legacy implicit)" : y === 2 ? "2" : `Unsupported (${String(n.manifest.manifestVersion)})`;
    }), o = De(() => qt(n.manifest) === 2), c = De(() => {
      const y = new Set(n.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
      return (n.permissionRegistry?.permissions || []).filter((p) => p.sourceDeclarable === !0 && y.has(p.id));
    });
    function r(y) {
      const p = (n.brokerMethods?.methods || []).filter((f) => f.requiredPermission === y.id);
      return {
        description: y.description || y.publicApiTargets?.join(", ") || "No public API target registered",
        consent: p[0]?.consent || y.prompt || "unspecified",
        pilot: p.some((f) => f.currentStatus === "enabled") ? "Preview Pilot enabled" : "Pilot contract only",
        methods: p.map((f) => f.id)
      };
    }
    function i(y, p) {
      const f = new Set(Array.isArray(n.manifest.permissions) ? n.manifest.permissions : []);
      p ? f.add(y) : f.delete(y);
      const h = c.value.map((P) => P.id);
      d(["permissions"], h.filter((P) => f.has(P)));
    }
    function d(y, p) {
      if (!u.value) return;
      const f = JSON.parse(JSON.stringify(n.manifest));
      let h = f;
      y.slice(0, -1).forEach((P) => {
        (!h[P] || typeof h[P] != "object") && (h[P] = {}), h = h[P];
      }), h[y.at(-1)] = p, a("update:manifest", f);
    }
    return (y, p) => (R(), F("div", mu, [
      w("div", hu, [
        w("button", {
          type: "button",
          class: Ae({ active: l.value === "form" }),
          onClick: p[0] || (p[0] = (f) => l.value = "form")
        }, "表单", 2),
        w("button", {
          type: "button",
          class: Ae({ active: l.value === "json" }),
          onClick: p[1] || (p[1] = (f) => {
            l.value = "json", a("open-json");
          })
        }, "JSON", 2)
      ]),
      l.value === "json" ? (R(), F("div", yu, [
        p[18] || (p[18] = le(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        w("button", {
          type: "button",
          onClick: p[2] || (p[2] = (f) => a("open-json"))
        }, "打开 manifest.json")
      ])) : u.value ? (R(), F("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: p[17] || (p[17] = _n(() => {
        }, ["prevent"]))
      }, [
        w("label", null, [
          p[19] || (p[19] = le("Manifest Version", -1)),
          w("input", {
            value: s.value,
            readonly: ""
          }, null, 8, wu)
        ]),
        o.value ? (R(), F("label", vu, [
          p[20] || (p[20] = le("SDK API Version", -1)),
          w("input", {
            value: e.manifest.sdk?.apiVersion,
            readonly: ""
          }, null, 8, bu)
        ])) : We("", !0),
        w("label", null, [
          p[21] || (p[21] = le("ID", -1)),
          w("input", {
            value: e.manifest.id,
            onInput: p[3] || (p[3] = (f) => d(["id"], f.target.value))
          }, null, 40, Pu)
        ]),
        w("label", null, [
          p[22] || (p[22] = le("名称", -1)),
          w("input", {
            value: e.manifest.name,
            onInput: p[4] || (p[4] = (f) => d(["name"], f.target.value))
          }, null, 40, ku)
        ]),
        w("label", null, [
          p[23] || (p[23] = le("版本", -1)),
          w("input", {
            value: e.manifest.version,
            onInput: p[5] || (p[5] = (f) => d(["version"], f.target.value))
          }, null, 40, $u)
        ]),
        w("label", null, [
          p[24] || (p[24] = le("描述", -1)),
          w("textarea", {
            value: e.manifest.description,
            onInput: p[6] || (p[6] = (f) => d(["description"], f.target.value))
          }, null, 40, Iu)
        ]),
        w("label", null, [
          p[25] || (p[25] = le("分类", -1)),
          w("input", {
            value: e.manifest.category,
            onInput: p[7] || (p[7] = (f) => d(["category"], f.target.value))
          }, null, 40, qu)
        ]),
        w("label", null, [
          p[26] || (p[26] = le("入口", -1)),
          w("input", {
            value: e.manifest.entry,
            onInput: p[8] || (p[8] = (f) => d(["entry"], f.target.value))
          }, null, 40, xu)
        ]),
        w("label", null, [
          p[27] || (p[27] = le("图标", -1)),
          w("input", {
            value: e.manifest.icon,
            onInput: p[9] || (p[9] = (f) => d(["icon"], f.target.value))
          }, null, 40, Su)
        ]),
        w("fieldset", null, [
          p[31] || (p[31] = w("legend", null, "Window", -1)),
          w("label", null, [
            p[28] || (p[28] = le("宽度", -1)),
            w("input", {
              value: e.manifest.window?.width,
              onInput: p[10] || (p[10] = (f) => d(["window", "width"], f.target.value))
            }, null, 40, _u)
          ]),
          w("label", null, [
            p[29] || (p[29] = le("高度", -1)),
            w("input", {
              value: e.manifest.window?.height,
              onInput: p[11] || (p[11] = (f) => d(["window", "height"], f.target.value))
            }, null, 40, Au)
          ]),
          w("label", ju, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: p[12] || (p[12] = (f) => d(["window", "singleton"], f.target.checked))
            }, null, 40, Tu),
            p[30] || (p[30] = le(" 单实例", -1))
          ])
        ]),
        w("fieldset", null, [
          p[36] || (p[36] = w("legend", null, "Placement", -1)),
          w("label", Eu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: p[13] || (p[13] = (f) => d(["placement", "startMenu"], f.target.checked))
            }, null, 40, Ou),
            p[32] || (p[32] = le(" 开始菜单", -1))
          ]),
          w("label", Mu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: p[14] || (p[14] = (f) => d(["placement", "allFunctions"], f.target.checked))
            }, null, 40, Cu),
            p[33] || (p[33] = le(" 全部功能", -1))
          ]),
          w("label", Nu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: p[15] || (p[15] = (f) => d(["placement", "desktop"], f.target.checked))
            }, null, 40, Lu),
            p[34] || (p[34] = le(" 桌面", -1))
          ]),
          w("label", zu, [
            w("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: p[16] || (p[16] = (f) => d(["placement", "taskbar"], f.target.checked))
            }, null, 40, Ru),
            p[35] || (p[35] = le(" 任务栏", -1))
          ])
        ]),
        o.value ? (R(), F("fieldset", Wu, [
          p[37] || (p[37] = w("legend", null, "Requested Permissions", -1)),
          p[38] || (p[38] = w("p", { class: "inspector-note" }, "声明仅表示请求授权，不表示 policy allowed、grant 或 Runtime capability。", -1)),
          (R(!0), F(oe, null, bt(c.value, (f) => (R(), F("label", {
            key: f.id,
            class: "permission-option"
          }, [
            w("span", Du, [
              w("input", {
                type: "checkbox",
                checked: e.manifest.permissions?.includes(f.id),
                onChange: (h) => i(f.id, h.target.checked)
              }, null, 40, Fu),
              w("code", null, H(f.displayName || f.id) + " · " + H(f.id), 1)
            ]),
            w("small", null, H(r(f).description), 1),
            w("span", Vu, [
              w("b", null, H(f.risk), 1),
              w("span", null, H(r(f).consent), 1),
              w("span", null, H(r(f).pilot), 1)
            ]),
            r(f).methods.length ? (R(), F("small", Hu, H(r(f).methods.join(", ")), 1)) : We("", !0)
          ]))), 128))
        ])) : (R(), F("p", Uu, "Manifest v1 不承载权限。升级到 v2 必须由开发者显式确认权限，Studio 不会从源码自动推断。")),
        p[39] || (p[39] = w("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (R(), F("div", gu, "修复 JSON 错误后才能使用可视化表单。")),
      w("div", Bu, H(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
};
function Ku(e) {
  let t = 0;
  for (let n = 0; n < e.length; n += 1) {
    const a = e.charCodeAt(n);
    if (a >= 55296 && a <= 56319 && n + 1 < e.length) {
      const l = e.charCodeAt(n + 1);
      l >= 56320 && l <= 57343 && (n += 1);
    }
    t += 1;
  }
  return t;
}
const Ju = { properties: { type: { enum: ["application", "system"] } } }, ui = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, Gu = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, Xu = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, Yu = { properties: { status: { enum: ["published", "disabled"] } } }, Oe = Ku, Qu = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), ec = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), So = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), tc = new RegExp("^\\.[a-z0-9]+$", "u"), sc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), rc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function pt(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = pt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Oe(e) > 240) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (Oe(e) < 1) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (!So.test(e)) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [r] : s.push(r), o++;
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [r] : s.push(r), o++;
  }
  if (typeof e == "string" && !rc.test(e)) {
    const r = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [r] : s.push(r), o++;
  }
  return pt.errors = s, o === 0;
}
pt.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const nc = new RegExp("^[a-f0-9]{64}$", "u"), ic = new RegExp("^/api/function-package\\.asp\\?", "u");
function Qt(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Qt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.size === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sha256 === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.entry === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.downloadUrl === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const r = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.size !== void 0) {
      let r = e.size;
      if (!(typeof r == "number" && !(r % 1) && !isNaN(r))) {
        const i = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        s === null ? s = [i] : s.push(i), o++;
      }
      if (typeof r == "number" && (r < 0 || isNaN(r))) {
        const i = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.sha256 !== void 0) {
      let r = e.sha256;
      if (typeof r == "string") {
        if (!nc.test(r)) {
          const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (pt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? pt.errors : s.concat(pt.errors), o = s.length)), e.downloadUrl !== void 0) {
      let r = e.downloadUrl;
      if (typeof r == "string") {
        if (!ic.test(r)) {
          const i = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return Qt.errors = s, o === 0;
}
Qt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function es(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = es.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.id === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.name === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.icon === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.entry === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.install === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.placement === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.window === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.id !== void 0) {
      let r = e.id;
      if (typeof r == "string") {
        if (Oe(r) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Qu.test(r)) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.legacyIds !== void 0) {
      let r = e.legacyIds;
      if (Array.isArray(r)) {
        const i = r.length;
        for (let p = 0; p < i; p++) {
          let f = r[p];
          if (typeof f == "string") {
            if (Oe(f) < 1) {
              const h = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [h] : s.push(h), o++;
            }
          } else {
            const h = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [h] : s.push(h), o++;
          }
        }
        let d = r.length, y;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let f = r[d];
            if (typeof f == "string") {
              if (typeof p[f] == "number") {
                y = p[f];
                const h = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: y }, message: "must NOT have duplicate items (items ## " + y + " and " + d + " are identical)" };
                s === null ? s = [h] : s.push(h), o++;
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
      let r = e.type;
      if (!(r === "application" || r === "system")) {
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: Ju.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let r = e.name;
      if (typeof r == "string") {
        if (Oe(r) < 1) {
          const i = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const r = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const r = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version !== void 0) {
      let r = e.version;
      if (typeof r == "string") {
        if (Oe(r) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ec.test(r)) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.icon !== void 0) {
      let r = e.icon;
      if (typeof r == "string") {
        if (Oe(r) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (Oe(r) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!So.test(r)) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (pt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? pt.errors : s.concat(pt.errors), o = s.length)), e.install !== void 0) {
      let r = e.install;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.defaultState === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.source === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.uninstallable === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.defaultState !== void 0) {
          let i = r.defaultState;
          if (!(i === "available" || i === "installed")) {
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: ui.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.source !== void 0) {
          let i = r.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: ui.properties.source.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.uninstallable !== void 0 && typeof r.uninstallable != "boolean") {
          const i = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.placement !== void 0) {
      let r = e.placement;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.desktop === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.startMenu === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.allFunctions === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.taskbar === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.desktop !== void 0 && typeof r.desktop != "boolean") {
          const i = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.startMenu !== void 0 && typeof r.startMenu != "boolean") {
          const i = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.startMenuGroup !== void 0) {
          let i = r.startMenuGroup;
          if (!(i === "user" || i === "system")) {
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: Gu.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.startMenuOrder !== void 0) {
          let i = r.startMenuOrder;
          if (!(typeof i == "number" && !(i % 1) && !isNaN(i))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            s === null ? s = [d] : s.push(d), o++;
          }
          if (typeof i == "number" && (i < 0 || isNaN(i))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.allFunctions !== void 0 && typeof r.allFunctions != "boolean") {
          const i = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.taskbar !== void 0 && typeof r.taskbar != "boolean") {
          const i = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.window !== void 0) {
      let r = e.window;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.mode === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.singleton === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.width === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.height === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.mode !== void 0) {
          let i = r.mode;
          if (!(i === "iframe" || i === "native" || i === "shell")) {
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: Xu.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.singleton !== void 0 && typeof r.singleton != "boolean") {
          const i = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.width !== void 0) {
          let i = r.width;
          if (typeof i == "string") {
            if (Oe(i) < 1) {
              const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.height !== void 0) {
          let i = r.height;
          if (typeof i == "string") {
            if (Oe(i) < 1) {
              const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.className !== void 0 && typeof r.className != "string") {
          const i = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let r = e.fileHandlers;
      if (Array.isArray(r)) {
        const i = r.length;
        for (let d = 0; d < i; d++) {
          let y = r[d];
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
                if (Oe(p) < 1) {
                  const f = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [f] : s.push(f), o++;
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (y.adapter !== void 0) {
              let p = y.adapter;
              if (typeof p == "string") {
                if (Oe(p) < 1) {
                  const f = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [f] : s.push(f), o++;
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (y.extensions !== void 0) {
              let p = y.extensions;
              if (Array.isArray(p)) {
                const f = p.length;
                for (let $ = 0; $ < f; $++) {
                  let E = p[$];
                  if (typeof E == "string") {
                    if (!tc.test(E)) {
                      const T = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [T] : s.push(T), o++;
                    }
                  } else {
                    const T = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [T] : s.push(T), o++;
                  }
                }
                let h = p.length, P;
                if (h > 1) {
                  const $ = {};
                  for (; h--; ) {
                    let E = p[h];
                    if (typeof E == "string") {
                      if (typeof $[E] == "number") {
                        P = $[E];
                        const T = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: h, j: P }, message: "must NOT have duplicate items (items ## " + P + " and " + h + " are identical)" };
                        s === null ? s = [T] : s.push(T), o++;
                        break;
                      }
                      $[E] = h;
                    }
                  }
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (y.mimeTypes !== void 0) {
              let p = y.mimeTypes;
              if (Array.isArray(p)) {
                const f = p.length;
                for (let $ = 0; $ < f; $++) {
                  let E = p[$];
                  if (typeof E == "string") {
                    if (!sc.test(E)) {
                      const T = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [T] : s.push(T), o++;
                    }
                  } else {
                    const T = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [T] : s.push(T), o++;
                  }
                }
                let h = p.length, P;
                if (h > 1) {
                  const $ = {};
                  for (; h--; ) {
                    let E = p[h];
                    if (typeof E == "string") {
                      if (typeof $[E] == "number") {
                        P = $[E];
                        const T = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: h, j: P }, message: "must NOT have duplicate items (items ## " + P + " and " + h + " are identical)" };
                        s === null ? s = [T] : s.push(T), o++;
                        break;
                      }
                      $[E] = h;
                    }
                  }
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [f] : s.push(f), o++;
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
      let r = e.launch;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.adapter !== void 0) {
          let i = r.adapter;
          if (typeof i == "string") {
            if (Oe(i) < 1) {
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
      let r = e.catalog;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.status !== void 0) {
          let i = r.status;
          if (!(i === "published" || i === "disabled")) {
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: Yu.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (Qt(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? Qt.errors : s.concat(Qt.errors), o = s.length)), e.runtime !== void 0) {
      let r = e.runtime;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.model === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.network === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.sameOrigin === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.model !== void 0 && r.model !== "browser-zip-sandbox-v1") {
          const i = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.network !== void 0 && r.network !== "none") {
          const i = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.sameOrigin !== void 0 && r.sameOrigin !== !1) {
          const i = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return es.errors = s, o === 0;
}
es.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ms(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Ms.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), es(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? es.errors : s.concat(es.errors), o = s.length), Ms.errors = s, o === 0;
}
Ms.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function oc(e) {
  let t = 0;
  for (let n = 0; n < e.length; n += 1) {
    const a = e.charCodeAt(n);
    if (a >= 55296 && a <= 56319 && n + 1 < e.length) {
      const l = e.charCodeAt(n + 1);
      l >= 56320 && l <= 57343 && (n += 1);
    }
    t += 1;
  }
  return t;
}
function ac(e, t) {
  return e === t;
}
const lc = { properties: { type: { enum: ["application", "system"] } } }, ci = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, uc = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, cc = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, dc = { properties: { status: { enum: ["published", "disabled"] } } }, pc = { enum: ["device.battery-status.read"] }, fc = ac;
function ts(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ts.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Array.isArray(e)) {
    const r = e.length;
    for (let y = 0; y < r; y++) {
      let p = e[y];
      if (typeof p != "string") {
        const f = { instancePath: t + "/" + y, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [f] : s.push(f), o++;
      }
      if (p !== "device.battery-status.read") {
        const f = { instancePath: t + "/" + y, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/enum", keyword: "enum", params: { allowedValues: pc.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [f] : s.push(f), o++;
      }
    }
    let i = e.length, d;
    if (i > 1) {
      e: for (; i--; )
        for (d = i; d--; )
          if (fc(e[i], e[d])) {
            const y = { instancePath: t, schemaPath: "#/uniqueItems", keyword: "uniqueItems", params: { i, j: d }, message: "must NOT have duplicate items (items ## " + d + " and " + i + " are identical)" };
            s === null ? s = [y] : s.push(y), o++;
            break e;
          }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "array" }, message: "must be array" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return ts.errors = s, o === 0;
}
ts.evaluated = { items: !0, dynamicProps: !1, dynamicItems: !1 };
const Me = oc, _o = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), mc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function ft(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ft.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Me(e) > 240) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (Me(e) < 1) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (!_o.test(e)) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [r] : s.push(r), o++;
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [r] : s.push(r), o++;
  }
  if (typeof e == "string" && !mc.test(e)) {
    const r = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [r] : s.push(r), o++;
  }
  return ft.errors = s, o === 0;
}
ft.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const hc = new RegExp("^[a-f0-9]{64}$", "u"), yc = new RegExp("^/api/function-package\\.asp\\?", "u");
function ss(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ss.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.format === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format" }, message: "must have required property 'format'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.size === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "size" }, message: "must have required property 'size'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sha256 === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sha256" }, message: "must have required property 'sha256'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.entry === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.downloadUrl === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "downloadUrl" }, message: "must have required property 'downloadUrl'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.format !== void 0 && e.format !== "zip") {
      const r = { instancePath: t + "/format", schemaPath: "#/properties/format/const", keyword: "const", params: { allowedValue: "zip" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.size !== void 0) {
      let r = e.size;
      if (!(typeof r == "number" && !(r % 1) && !isNaN(r))) {
        const i = { instancePath: t + "/size", schemaPath: "#/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        s === null ? s = [i] : s.push(i), o++;
      }
      if (typeof r == "number" && (r < 0 || isNaN(r))) {
        const i = { instancePath: t + "/size", schemaPath: "#/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.sha256 !== void 0) {
      let r = e.sha256;
      if (typeof r == "string") {
        if (!hc.test(r)) {
          const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (ft(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? ft.errors : s.concat(ft.errors), o = s.length)), e.downloadUrl !== void 0) {
      let r = e.downloadUrl;
      if (typeof r == "string") {
        if (!yc.test(r)) {
          const i = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/pattern", keyword: "pattern", params: { pattern: "^/api/function-package\\.asp\\?" }, message: 'must match pattern "^/api/function-package\\.asp\\?"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/downloadUrl", schemaPath: "#/properties/downloadUrl/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return ss.errors = s, o === 0;
}
ss.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const gc = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), wc = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), vc = new RegExp("^\\.[a-z0-9]+$", "u"), bc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u");
function rs(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = rs.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.manifestVersion === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "manifestVersion" }, message: "must have required property 'manifestVersion'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sdk === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sdk" }, message: "must have required property 'sdk'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.permissions === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "permissions" }, message: "must have required property 'permissions'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.id === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.name === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.icon === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "icon" }, message: "must have required property 'icon'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.entry === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entry" }, message: "must have required property 'entry'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.install === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "install" }, message: "must have required property 'install'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.placement === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placement" }, message: "must have required property 'placement'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.window === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "window" }, message: "must have required property 'window'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.manifestVersion !== void 0 && e.manifestVersion !== 2) {
      const r = { instancePath: t + "/manifestVersion", schemaPath: "#/properties/manifestVersion/const", keyword: "const", params: { allowedValue: 2 }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sdk !== void 0) {
      let r = e.sdk;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.apiVersion === void 0) {
          const i = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/required", keyword: "required", params: { missingProperty: "apiVersion" }, message: "must have required property 'apiVersion'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        for (const i in r)
          if (i !== "apiVersion") {
            const d = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: i }, message: "must NOT have additional properties" };
            s === null ? s = [d] : s.push(d), o++;
          }
        if (r.apiVersion !== void 0 && r.apiVersion !== "1") {
          const i = { instancePath: t + "/sdk/apiVersion", schemaPath: "#/$defs/sdk/properties/apiVersion/const", keyword: "const", params: { allowedValue: "1" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sdk", schemaPath: "#/$defs/sdk/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.permissions !== void 0 && (ts(e.permissions, { instancePath: t + "/permissions", parentData: e, parentDataProperty: "permissions", rootData: l, dynamicAnchors: u }) || (s = s === null ? ts.errors : s.concat(ts.errors), o = s.length)), e.id !== void 0) {
      let r = e.id;
      if (typeof r == "string") {
        if (Me(r) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!gc.test(r)) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/pattern", keyword: "pattern", params: { pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)+$" }, message: 'must match pattern "^[a-z0-9]+(?:[._-][a-z0-9]+)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.legacyIds !== void 0) {
      let r = e.legacyIds;
      if (Array.isArray(r)) {
        const i = r.length;
        for (let p = 0; p < i; p++) {
          let f = r[p];
          if (typeof f == "string") {
            if (Me(f) < 1) {
              const h = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [h] : s.push(h), o++;
            }
          } else {
            const h = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [h] : s.push(h), o++;
          }
        }
        let d = r.length, y;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let f = r[d];
            if (typeof f == "string") {
              if (typeof p[f] == "number") {
                y = p[f];
                const h = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: y }, message: "must NOT have duplicate items (items ## " + y + " and " + d + " are identical)" };
                s === null ? s = [h] : s.push(h), o++;
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
      let r = e.type;
      if (!(r === "application" || r === "system")) {
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: lc.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let r = e.name;
      if (typeof r == "string") {
        if (Me(r) < 1) {
          const i = { instancePath: t + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.description !== void 0 && typeof e.description != "string") {
      const r = { instancePath: t + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.category !== void 0 && typeof e.category != "string") {
      const r = { instancePath: t + "/category", schemaPath: "#/properties/category/type", keyword: "type", params: { type: "string" }, message: "must be string" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version !== void 0) {
      let r = e.version;
      if (typeof r == "string") {
        if (Me(r) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!wc.test(r)) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$" }, message: 'must match pattern "^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.icon !== void 0) {
      let r = e.icon;
      if (typeof r == "string") {
        if (Me(r) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (Me(r) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!_o.test(r)) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (ft(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? ft.errors : s.concat(ft.errors), o = s.length)), e.install !== void 0) {
      let r = e.install;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.defaultState === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "defaultState" }, message: "must have required property 'defaultState'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.source === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.uninstallable === void 0) {
          const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/required", keyword: "required", params: { missingProperty: "uninstallable" }, message: "must have required property 'uninstallable'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.defaultState !== void 0) {
          let i = r.defaultState;
          if (!(i === "available" || i === "installed")) {
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: ci.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.source !== void 0) {
          let i = r.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: ci.properties.source.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.uninstallable !== void 0 && typeof r.uninstallable != "boolean") {
          const i = { instancePath: t + "/install/uninstallable", schemaPath: "#/$defs/install/properties/uninstallable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/install", schemaPath: "#/$defs/install/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.placement !== void 0) {
      let r = e.placement;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.desktop === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "desktop" }, message: "must have required property 'desktop'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.startMenu === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "startMenu" }, message: "must have required property 'startMenu'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.allFunctions === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "allFunctions" }, message: "must have required property 'allFunctions'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.taskbar === void 0) {
          const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "taskbar" }, message: "must have required property 'taskbar'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.desktop !== void 0 && typeof r.desktop != "boolean") {
          const i = { instancePath: t + "/placement/desktop", schemaPath: "#/$defs/placement/properties/desktop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.startMenu !== void 0 && typeof r.startMenu != "boolean") {
          const i = { instancePath: t + "/placement/startMenu", schemaPath: "#/$defs/placement/properties/startMenu/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.startMenuGroup !== void 0) {
          let i = r.startMenuGroup;
          if (!(i === "user" || i === "system")) {
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: uc.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.startMenuOrder !== void 0) {
          let i = r.startMenuOrder;
          if (!(typeof i == "number" && !(i % 1) && !isNaN(i))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            s === null ? s = [d] : s.push(d), o++;
          }
          if (typeof i == "number" && (i < 0 || isNaN(i))) {
            const d = { instancePath: t + "/placement/startMenuOrder", schemaPath: "#/$defs/placement/properties/startMenuOrder/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.allFunctions !== void 0 && typeof r.allFunctions != "boolean") {
          const i = { instancePath: t + "/placement/allFunctions", schemaPath: "#/$defs/placement/properties/allFunctions/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.taskbar !== void 0 && typeof r.taskbar != "boolean") {
          const i = { instancePath: t + "/placement/taskbar", schemaPath: "#/$defs/placement/properties/taskbar/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/placement", schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.window !== void 0) {
      let r = e.window;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.mode === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.singleton === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "singleton" }, message: "must have required property 'singleton'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.width === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.height === void 0) {
          const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.mode !== void 0) {
          let i = r.mode;
          if (!(i === "iframe" || i === "native" || i === "shell")) {
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: cc.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.singleton !== void 0 && typeof r.singleton != "boolean") {
          const i = { instancePath: t + "/window/singleton", schemaPath: "#/$defs/window/properties/singleton/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.width !== void 0) {
          let i = r.width;
          if (typeof i == "string") {
            if (Me(i) < 1) {
              const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/window/width", schemaPath: "#/$defs/window/properties/width/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.height !== void 0) {
          let i = r.height;
          if (typeof i == "string") {
            if (Me(i) < 1) {
              const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/window/height", schemaPath: "#/$defs/window/properties/height/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.className !== void 0 && typeof r.className != "string") {
          const i = { instancePath: t + "/window/className", schemaPath: "#/$defs/window/properties/className/type", keyword: "type", params: { type: "string" }, message: "must be string" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/window", schemaPath: "#/$defs/window/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.fileHandlers !== void 0) {
      let r = e.fileHandlers;
      if (Array.isArray(r)) {
        const i = r.length;
        for (let d = 0; d < i; d++) {
          let y = r[d];
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
                if (Me(p) < 1) {
                  const f = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [f] : s.push(f), o++;
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/action", schemaPath: "#/$defs/fileHandler/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (y.adapter !== void 0) {
              let p = y.adapter;
              if (typeof p == "string") {
                if (Me(p) < 1) {
                  const f = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  s === null ? s = [f] : s.push(f), o++;
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/adapter", schemaPath: "#/$defs/fileHandler/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (y.extensions !== void 0) {
              let p = y.extensions;
              if (Array.isArray(p)) {
                const f = p.length;
                for (let $ = 0; $ < f; $++) {
                  let E = p[$];
                  if (typeof E == "string") {
                    if (!vc.test(E)) {
                      const T = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [T] : s.push(T), o++;
                    }
                  } else {
                    const T = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [T] : s.push(T), o++;
                  }
                }
                let h = p.length, P;
                if (h > 1) {
                  const $ = {};
                  for (; h--; ) {
                    let E = p[h];
                    if (typeof E == "string") {
                      if (typeof $[E] == "number") {
                        P = $[E];
                        const T = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: h, j: P }, message: "must NOT have duplicate items (items ## " + P + " and " + h + " are identical)" };
                        s === null ? s = [T] : s.push(T), o++;
                        break;
                      }
                      $[E] = h;
                    }
                  }
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [f] : s.push(f), o++;
              }
            }
            if (y.mimeTypes !== void 0) {
              let p = y.mimeTypes;
              if (Array.isArray(p)) {
                const f = p.length;
                for (let $ = 0; $ < f; $++) {
                  let E = p[$];
                  if (typeof E == "string") {
                    if (!bc.test(E)) {
                      const T = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [T] : s.push(T), o++;
                    }
                  } else {
                    const T = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [T] : s.push(T), o++;
                  }
                }
                let h = p.length, P;
                if (h > 1) {
                  const $ = {};
                  for (; h--; ) {
                    let E = p[h];
                    if (typeof E == "string") {
                      if (typeof $[E] == "number") {
                        P = $[E];
                        const T = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: h, j: P }, message: "must NOT have duplicate items (items ## " + P + " and " + h + " are identical)" };
                        s === null ? s = [T] : s.push(T), o++;
                        break;
                      }
                      $[E] = h;
                    }
                  }
                }
              } else {
                const f = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                s === null ? s = [f] : s.push(f), o++;
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
      let r = e.launch;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.adapter !== void 0) {
          let i = r.adapter;
          if (typeof i == "string") {
            if (Me(i) < 1) {
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
      let r = e.catalog;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.status !== void 0) {
          let i = r.status;
          if (!(i === "published" || i === "disabled")) {
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: dc.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (ss(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? ss.errors : s.concat(ss.errors), o = s.length)), e.runtime !== void 0) {
      let r = e.runtime;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.model === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "model" }, message: "must have required property 'model'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.network === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "network" }, message: "must have required property 'network'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.sameOrigin === void 0) {
          const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/required", keyword: "required", params: { missingProperty: "sameOrigin" }, message: "must have required property 'sameOrigin'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.model !== void 0 && r.model !== "browser-zip-sandbox-v1") {
          const i = { instancePath: t + "/runtime/model", schemaPath: "#/$defs/runtime/properties/model/const", keyword: "const", params: { allowedValue: "browser-zip-sandbox-v1" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.network !== void 0 && r.network !== "none") {
          const i = { instancePath: t + "/runtime/network", schemaPath: "#/$defs/runtime/properties/network/const", keyword: "const", params: { allowedValue: "none" }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.sameOrigin !== void 0 && r.sameOrigin !== !1) {
          const i = { instancePath: t + "/runtime/sameOrigin", schemaPath: "#/$defs/runtime/properties/sameOrigin/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/runtime", schemaPath: "#/$defs/runtime/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return rs.errors = s, o === 0;
}
rs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Cs(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Cs.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), rs(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? rs.errors : s.concat(rs.errors), o = s.length), Cs.errors = s, o === 0;
}
Cs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let Dr;
async function Pc() {
  return Dr || (Dr = kc()), Dr;
}
async function kc() {
  const e = await Promise.all([
    fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v2.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/permissions-v1.json", { credentials: "same-origin" })
  ]);
  if (e.some((l) => !l.ok)) throw new Error("无法载入 Manifest 平台契约。");
  const [t, n, a] = await Promise.all(e.map((l) => l.json()));
  return {
    schemas: { 1: t, 2: n },
    validators: { 1: Ms, 2: Cs },
    permissionRegistry: a,
    permissionIds: new Set(a.permissions.map((l) => l.id)),
    sourceDeclarableIds: new Set(a.sourceDeclaration?.declarablePermissionIds || [])
  };
}
async function $c(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch (r) {
    return {
      manifest: null,
      diagnostics: [{
        severity: "error",
        path: "$",
        message: r.message,
        ..._c(e, r.message)
      }]
    };
  }
  const n = qt(t);
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
  const a = await Pc(), l = a.schemas[n], u = a.validators[n];
  u(t);
  const s = (u.errors || []).filter((r) => !xc(n, r)).map((r) => ({
    ruleId: "WWM002",
    severity: "error",
    path: Sc(r.instancePath || r.params?.missingProperty || ""),
    message: r.message || r.keyword
  }));
  Ic(t, n, a.permissionIds, a.sourceDeclarableIds, s), n === 2 && t.sdk?.apiVersion !== void 0 && t.sdk.apiVersion !== "1" && s.push({
    ruleId: "WWM009",
    severity: "error",
    path: "$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。"
  });
  const o = l.$defs?.sourceManifest?.properties || {};
  return Object.entries(o).filter(([, r]) => r.readOnly === !0 || r.description?.includes("Reserved") || r.description?.includes("Platform-reserved")).map(([r]) => r).forEach((r) => {
    Object.prototype.hasOwnProperty.call(t, r) && s.push({
      ruleId: r === "launch" ? "WWM004" : "WWM003",
      severity: "warning",
      path: `$.${r}`,
      message: `${r} 是平台保留或发布阶段只读字段，不应由 Source Manifest 编辑。`
    });
  }), { manifest: t, manifestVersion: n, diagnostics: s };
}
function Ic(e, t, n, a, l) {
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
    u.has(s) && l.push({ ruleId: "WWM007", severity: "error", path: c, message: `重复权限：${s}` }), u.add(s), qc(s) ? l.push({ ruleId: "WWM008", severity: "error", path: c, message: `禁止声明超级或私有权限：${s}` }) : n.has(s) ? a.has(s) || l.push({ ruleId: "WWM008", severity: "error", path: c, message: `权限尚未开放 Source Manifest 声明：${s}` }) : l.push({ ruleId: "WWM006", severity: "error", path: c, message: `未知权限：${s}` });
  });
}
function qc(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function xc(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function Sc(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const n = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(n) ? `[${n}]` : `.${n}`;
  }).join("")}` : `$.${e}` : "$";
}
function _c(e, t) {
  const n = /position\s+(\d+)/i.exec(t);
  if (!n) return { line: 1, column: 1 };
  const a = Math.min(Number(n[1]), e.length), l = e.slice(0, a).split(`
`);
  return { line: l.length, column: l.at(-1).length + 1 };
}
const Ac = {
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
function jc() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(Ac, null, 2)}
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
const di = 240;
function ue(e, t = {}) {
  const n = String(e ?? "");
  if (n.includes("\0")) throw zt("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(n)) throw zt("项目路径不能使用盘符。", e);
  const a = n.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!a) {
    if (t.allowRoot === !0) return "";
    throw zt("项目路径不能为空。", e);
  }
  if (a.startsWith("/")) throw zt("项目路径必须是相对路径。", e);
  if (a.length > di)
    throw zt(`项目路径不能超过 ${di} 个字符。`, e);
  const l = a.split("/");
  if (l.some((u) => !u || u === "." || u === ".."))
    throw zt("项目路径包含不安全的路径段。", e);
  return l.join("/");
}
function Ns(e) {
  const t = ue(e), n = t.lastIndexOf("/");
  return n < 0 ? "" : t.slice(0, n);
}
function sn(e) {
  const t = ue(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function Tc(e, t) {
  const n = ue(e, { allowRoot: !0 }), a = String(t ?? "");
  if (!a || a.includes("/") || a.includes("\\"))
    throw zt("文件或目录名称必须是单个安全路径段。", t);
  return ue(n ? `${n}/${a}` : a);
}
function zt(e, t) {
  const n = new TypeError(e);
  return n.code = "invalid-project-path", n.value = t, n;
}
const Ec = "webwindows-developer-studio-v1", pi = 1, Oc = 1, re = "projects", ae = "files", Nt = "projectId";
class Mc {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || Ec, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, !this.indexedDB) throw new Error("IndexedDB is required by Developer Studio.");
  }
  async listProjects() {
    const t = await this.open();
    return (await Se(
      t.transaction(re, "readonly").objectStore(re).getAll()
    )).sort((a, l) => String(l.updatedAt).localeCompare(String(a.updatedAt))).map(at);
  }
  async createProject(t = {}) {
    const n = Nc(this.crypto), a = this.now(), l = {
      uuid: n,
      displayName: mi(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: Oc,
      storageVersion: pi,
      createdAt: a,
      updatedAt: a,
      editorState: pr(t.editorState)
    }, u = Cc(t.files || [], n, a), o = (await this.open()).transaction([re, ae], "readwrite");
    o.objectStore(re).add(l);
    const c = o.objectStore(ae);
    return u.forEach((r) => c.add(r)), await wt(o), at(l);
  }
  async getProject(t) {
    const n = await this.open(), a = await Se(
      n.transaction(re, "readonly").objectStore(re).get(t)
    );
    if (!a) throw pe("project-not-found", "找不到项目。");
    return at(a);
  }
  async renameProject(t, n) {
    return this.updateProject(t, (a) => {
      a.displayName = mi(n);
    });
  }
  async saveEditorState(t, n) {
    return this.updateProject(t, (a) => {
      a.editorState = pr(n);
    });
  }
  async deleteProject(t) {
    const a = (await this.open()).transaction([re, ae], "readwrite"), l = a.objectStore(re);
    if (!await Se(l.get(t))) throw pe("project-not-found", "找不到项目。");
    const s = a.objectStore(ae);
    (await Se(s.index(Nt).getAll(t))).forEach((c) => s.delete([t, c.path])), l.delete(t), await wt(a);
  }
  async listEntries(t) {
    await this.getProject(t);
    const n = await this.open();
    return (await Se(
      n.transaction(ae, "readonly").objectStore(ae).index(Nt).getAll(t)
    )).sort(hi).map(at);
  }
  async readProjectState(t) {
    const a = (await this.open()).transaction([re, ae], "readonly"), l = await Se(a.objectStore(re).get(t));
    if (!l) throw pe("project-not-found", "找不到项目。");
    const u = await Se(
      a.objectStore(ae).index(Nt).getAll(t)
    );
    return await wt(a), {
      project: at(l),
      entries: u.sort(hi).map(at)
    };
  }
  async readTextFile(t, n) {
    const a = await this.getEntry(t, n);
    if (a.kind !== "file") throw pe("not-a-file", "目标不是文本文件。");
    return a.content;
  }
  async writeTextFile(t, n, a) {
    const l = ue(n), s = (await this.open()).transaction([re, ae], "readwrite"), o = await Ks(s, t), c = s.objectStore(ae), r = await Se(c.get([t, l]));
    if (!r) throw pe("file-not-found", "找不到文件。");
    if (r.kind !== "file") throw pe("not-a-file", "目标不是文本文件。");
    const i = this.now();
    c.put({ ...r, content: String(a), updatedAt: i }), o.updatedAt = i, s.objectStore(re).put(o), await wt(s);
  }
  async createFile(t, n, a = "") {
    return this.createEntry(t, n, "file", String(a));
  }
  async createDirectory(t, n) {
    return this.createEntry(t, n, "directory", void 0);
  }
  async renameEntry(t, n, a) {
    const l = ue(n), u = ue(a);
    if (l === u) return this.getEntry(t, l);
    if (u.startsWith(`${l}/`))
      throw pe("invalid-project-path", "目录不能移动到自身内部。");
    const o = (await this.open()).transaction([re, ae], "readwrite"), c = await Ks(o, t), r = o.objectStore(ae), i = await Se(r.index(Nt).getAll(t)), d = i.filter((h) => h.path === l || h.path.startsWith(`${l}/`));
    if (!d.length) throw pe("entry-not-found", "找不到文件或目录。");
    await fi(i, u);
    const y = new Set(d.map((h) => h.path)), p = new Set(d.map((h) => h.path === l ? u : `${u}${h.path.slice(l.length)}`));
    if (i.some((h) => !y.has(h.path) && p.has(h.path)))
      throw pe("entry-exists", "目标路径已经存在。");
    const f = this.now();
    return d.forEach((h) => {
      const P = h.path === l ? u : `${u}${h.path.slice(l.length)}`;
      r.delete([t, h.path]), r.add({ ...h, path: P, updatedAt: f });
    }), c.editorState = Lc(c.editorState, l, u), c.updatedAt = f, o.objectStore(re).put(c), await wt(o), this.getEntry(t, u);
  }
  async deleteEntry(t, n) {
    const a = ue(n), u = (await this.open()).transaction([re, ae], "readwrite"), s = await Ks(u, t), o = u.objectStore(ae), r = (await Se(o.index(Nt).getAll(t))).filter((d) => d.path === a || d.path.startsWith(`${a}/`));
    if (!r.length) throw pe("entry-not-found", "找不到文件或目录。");
    r.forEach((d) => o.delete([t, d.path]));
    const i = this.now();
    s.editorState = zc(s.editorState, a), s.updatedAt = i, u.objectStore(re).put(s), await wt(u);
  }
  async getEntry(t, n) {
    const a = ue(n);
    await this.getProject(t);
    const l = await this.open(), u = await Se(
      l.transaction(ae, "readonly").objectStore(ae).get([t, a])
    );
    if (!u) throw pe("entry-not-found", "找不到文件或目录。");
    return at(u);
  }
  async close() {
    if (!this.databasePromise) return;
    (await this.databasePromise).close(), this.databasePromise = null;
  }
  async open() {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((t, n) => {
      const a = this.indexedDB.open(this.databaseName, pi);
      a.onupgradeneeded = () => {
        const l = a.result;
        l.objectStoreNames.contains(re) || l.createObjectStore(re, { keyPath: "uuid" }), l.objectStoreNames.contains(ae) || l.createObjectStore(ae, { keyPath: ["projectId", "path"] }).createIndex(Nt, "projectId", { unique: !1 });
      }, a.onsuccess = () => t(a.result), a.onerror = () => n(a.error || new Error("Developer Studio database failed to open.")), a.onblocked = () => n(new Error("Developer Studio database upgrade is blocked."));
    });
    try {
      return await this.databasePromise;
    } catch (t) {
      throw this.databasePromise = null, t;
    }
  }
  async updateProject(t, n) {
    const l = (await this.open()).transaction(re, "readwrite"), u = l.objectStore(re), s = await Se(u.get(t));
    if (!s) throw pe("project-not-found", "找不到项目。");
    return n(s), s.updatedAt = this.now(), u.put(s), await wt(l), at(s);
  }
  async createEntry(t, n, a, l) {
    const u = ue(n), o = (await this.open()).transaction([re, ae], "readwrite"), c = await Ks(o, t), r = o.objectStore(ae), i = await Se(r.index(Nt).getAll(t));
    if (i.some((p) => p.path === u))
      throw pe("entry-exists", "目标路径已经存在。");
    await fi(i, u);
    const d = this.now(), y = {
      projectId: t,
      path: u,
      kind: a,
      ...a === "file" ? { content: String(l ?? "") } : {},
      createdAt: d,
      updatedAt: d
    };
    return r.add(y), c.updatedAt = d, o.objectStore(re).put(c), await wt(o), at(y);
  }
}
function Cc(e, t, n) {
  const a = /* @__PURE__ */ new Set(), l = e.map((u) => {
    const s = ue(u.path);
    if (a.has(s)) throw pe("entry-exists", `模板包含重复路径：${s}`);
    a.add(s);
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
  return l.forEach((u) => {
    const s = Ns(u.path);
    if (!s) return;
    const o = l.find((c) => c.path === s);
    if (!o || o.kind !== "directory")
      throw pe("parent-directory-not-found", `模板缺少父目录：${s}`);
  }), l;
}
async function Ks(e, t) {
  const n = await Se(e.objectStore(re).get(t));
  if (!n) throw pe("project-not-found", "找不到项目。");
  return n;
}
async function fi(e, t) {
  const n = Ns(t);
  if (!n) return;
  const a = e.find((l) => l.path === n);
  if (!a || a.kind !== "directory")
    throw pe("parent-directory-not-found", "父目录不存在。");
}
function Nc(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const n = [...t].map((a) => a.toString(16).padStart(2, "0"));
  return `${n.slice(0, 4).join("")}-${n.slice(4, 6).join("")}-${n.slice(6, 8).join("")}-${n.slice(8, 10).join("")}-${n.slice(10).join("")}`;
}
function mi(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw pe("invalid-project-name", "项目名称不能为空。");
  return t;
}
function pr(e) {
  const t = e && typeof e == "object" ? e : {}, n = (u) => [...new Set((Array.isArray(u) ? u : []).map((s) => {
    try {
      return ue(s);
    } catch {
      return null;
    }
  }).filter(Boolean))], a = n(t.openFiles), l = t.activeFile ? ue(t.activeFile) : a[0] || null;
  return {
    openFiles: a,
    activeFile: l,
    recentFiles: n(t.recentFiles).slice(0, 20)
  };
}
function Lc(e, t, n) {
  const a = (l) => l === t || l?.startsWith(`${t}/`) ? `${n}${l.slice(t.length)}` : l;
  return pr({
    openFiles: e?.openFiles?.map(a),
    activeFile: a(e?.activeFile),
    recentFiles: e?.recentFiles?.map(a)
  });
}
function zc(e, t) {
  const n = (l) => l !== t && !l.startsWith(`${t}/`), a = (e?.openFiles || []).filter(n);
  return pr({
    openFiles: a,
    activeFile: e?.activeFile && n(e.activeFile) ? e.activeFile : a[0] || null,
    recentFiles: (e?.recentFiles || []).filter(n)
  });
}
function hi(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function at(e) {
  return structuredClone(e);
}
function Se(e) {
  return new Promise((t, n) => {
    e.onsuccess = () => t(e.result), e.onerror = () => n(e.error || new Error("IndexedDB request failed."));
  });
}
function wt(e) {
  return new Promise((t, n) => {
    e.oncomplete = () => t(), e.onerror = () => n(e.error || new Error("IndexedDB transaction failed.")), e.onabort = () => n(e.error || new Error("IndexedDB transaction was aborted."));
  });
}
function pe(e, t) {
  const n = new Error(t);
  return n.code = e, n;
}
function yi(e, t) {
  return Tc(e, t);
}
function Rc(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((l) => n.set(l.path, {
    ...l,
    name: sn(l.path),
    children: []
  })), n.forEach((l) => {
    const u = Ns(l.path);
    u ? n.get(u)?.children.push(l) : t.push(l);
  });
  const a = (l) => l.sort((u, s) => u.kind !== s.kind ? u.kind === "directory" ? -1 : 1 : u.name.localeCompare(s.name)).forEach((u) => a(u.children));
  return a(t), t;
}
function Wc(e) {
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
const Ao = "webwindows-project-snapshot-v1";
async function Dc(e, t, n = {}) {
  if (!e || typeof e.readProjectState != "function")
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  const a = await e.readProjectState(t), l = a.entries.filter((r) => r.kind === "file").map((r) => Object.freeze({
    path: ue(r.path),
    content: String(r.content ?? ""),
    byteLength: ns(r.content ?? "").byteLength
  })).sort((r, i) => Hc(r.path, i.path)), u = /* @__PURE__ */ new Set();
  for (const r of l) {
    if (u.has(r.path)) throw new Error(`Snapshot contains duplicate path: ${r.path}`);
    u.add(r.path);
  }
  const s = l.reduce((r, i) => r + i.byteLength, 0), o = await Fc(Vc(a.project.uuid, l)), c = {
    contract: Ao,
    schemaVersion: 1,
    projectUuid: a.project.uuid,
    projectDisplayName: a.project.displayName,
    snapshotId: `wws1-${o}`,
    revisionHash: o,
    createdAt: n.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    manifestPath: "manifest.json",
    fileCount: l.length,
    totalBytes: s,
    files: Object.freeze(l)
  };
  return Object.freeze(c);
}
function fr(e, t) {
  const n = ue(t);
  return e.files.find((a) => a.path === n) || null;
}
async function Fc(e) {
  const t = globalThis.crypto;
  if (!t?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const n = await t.subtle.digest("SHA-256", e);
  return [...new Uint8Array(n)].map((a) => a.toString(16).padStart(2, "0")).join("");
}
function Vc(e, t) {
  const n = [ns(`${Ao}\0${e}\0`)];
  for (const s of t) {
    const o = ns(s.path), c = ns(s.content);
    n.push(gi(o.byteLength), o, gi(c.byteLength), c);
  }
  const a = n.reduce((s, o) => s + o.byteLength, 0), l = new Uint8Array(a);
  let u = 0;
  for (const s of n)
    l.set(s, u), u += s.byteLength;
  return l;
}
function gi(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e, !1), t;
}
function ns(e) {
  return new TextEncoder().encode(String(e));
}
function Hc(e, t) {
  const n = ns(e), a = ns(t), l = Math.min(n.length, a.length);
  for (let u = 0; u < l; u += 1)
    if (n[u] !== a[u]) return n[u] - a[u];
  return n.length - a.length;
}
let Fr;
async function vs() {
  return Fr || (Fr = Uc()), Fr;
}
async function Uc() {
  const e = await Promise.all([
    Xe("/data/sdk/manifest-v1.schema.json"),
    Xe("/data/sdk/manifest-v2.schema.json"),
    Xe("/data/sdk/permissions-v1.json"),
    Xe("/data/sdk/capability-broker-v1.schema.json"),
    Xe("/data/sdk/capability-broker-methods-v1.json"),
    Xe("/data/sdk/capability-broker-errors-v1.json"),
    Xe("/data/sdk/capability-broker-policy-v1.json"),
    Xe("/data/sdk/package-runtime-policy-v1.json"),
    Xe("/data/sdk/runtime-compatibility-v1.json"),
    Xe("/data/sdk/studio-validator-rules-v1.json"),
    Bc("/data/sdk/webwindows-public-api-v1.d.ts")
  ]);
  return Object.freeze({
    manifestSchema: e[0],
    manifestSchemas: Object.freeze({ 1: e[0], 2: e[1] }),
    permissionRegistry: e[2],
    brokerSchema: e[3],
    brokerMethods: e[4],
    brokerErrors: e[5],
    brokerPolicy: e[6],
    packagePolicy: e[7],
    runtimeCompatibility: e[8],
    ruleCatalog: e[9],
    publicApiText: e[10]
  });
}
async function Xe(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.json();
}
async function Bc(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.text();
}
const Zc = "webwindows-studio-validation-report-v1";
async function rn(e, t = {}) {
  const n = t.contracts || await vs(), a = id(n.ruleCatalog), l = [], u = (y, p = {}) => l.push(od(a, y, p));
  Kc(n, u), Jc(e, n.packagePolicy, u);
  const s = e.files.find((y) => y.path === "manifest.json");
  let o = null;
  if (!s)
    u("WWP001", { path: "manifest.json", message: "ZIP root 必须包含 manifest.json。" });
  else
    try {
      o = JSON.parse(s.content);
    } catch (y) {
      u("WWM001", {
        path: "manifest.json",
        location: dd(s.content, y.message),
        message: y.message
      });
    }
  o && (Gc(o, n, u), ed(e, o, n.packagePolicy, u)), td(e, o, n, u);
  const c = [...new Map(l.map((y) => [hd(y), y])).values()].sort(md), r = c.filter((y) => y.severity === "error").length, i = c.filter((y) => y.severity === "warning").length, d = typeof o?.entry == "string" ? o.entry : null;
  return {
    contract: Zc,
    schemaVersion: 1,
    validatorVersion: n.ruleCatalog.validatorVersion,
    snapshotId: e.snapshotId,
    projectUuid: e.projectUuid,
    manifestIdentity: fd(o),
    passed: r === 0,
    errorCount: r,
    warningCount: i,
    diagnostics: c,
    packageFacts: {
      fileCount: e.fileCount,
      unpackedBytes: e.totalBytes,
      entry: d,
      runtimeModel: n.packagePolicy.runtimeModel
    },
    scannerLimitations: [
      "Source diagnostics are conservative static checks, not a complete JavaScript security analysis.",
      "Dynamic URLs and computed property access may require future server/admin review."
    ]
  };
}
function Kc(e, t) {
  const n = e.runtimeCompatibility.packageRuntime;
  (n?.status !== "supported" || n?.model !== e.packagePolicy.runtimeModel) && t("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
}
function Jc(e, t, n) {
  (!e.files.length || e.fileCount !== e.files.length || e.fileCount > t.limits.maxFiles) && n("WWP003", {
    message: `文件数量必须为 1-${t.limits.maxFiles}，当前为 ${e.fileCount}。`,
    metadata: { limit: t.limits.maxFiles, actual: e.fileCount }
  }), e.totalBytes > t.limits.maxUnpackedBytes && n("WWP004", {
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
      n("WWP002", { path: l.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const u = An(l.path);
    a.has(u) || n("WWP005", {
      path: l.path,
      message: `Package Runtime 不允许文件类型 ${u || "(none)"}。`,
      metadata: { extension: u }
    });
  }
}
function Gc(e, t, n) {
  const a = qt(e);
  if (a == null) {
    n("WWM005", {
      path: "manifest.json$.manifestVersion",
      message: "不支持的 Manifest 版本；legacy v1 省略 manifestVersion，v2 显式使用数字 2。"
    });
    return;
  }
  const l = t.manifestSchemas?.[a] || t.manifestSchema, u = a === 2 ? Cs : Ms;
  if (!u(e))
    for (const c of u.errors || [])
      Qc(a, c) || n("WWM002", {
        path: `manifest.json${pd(c.instancePath, c.params?.missingProperty)}`,
        message: c.message || c.keyword,
        metadata: { keyword: c.keyword, schemaPath: c.schemaPath }
      });
  Xc(e, a, t.permissionRegistry, n), a === 2 && e.sdk?.apiVersion !== void 0 && e.sdk.apiVersion !== "1" && n("WWM009", {
    path: "manifest.json$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。",
    metadata: { actual: e.sdk.apiVersion }
  });
  const s = l.$defs?.sourceManifest?.properties || {};
  for (const [c, r] of Object.entries(s)) {
    if (!Object.prototype.hasOwnProperty.call(e, c)) continue;
    const i = ld(l, r), d = `${r.description || ""} ${i.description || ""}`;
    i.readOnly === !0 || /server-(?:managed|generated)|published catalog/i.test(d) ? n("WWM003", {
      path: `manifest.json$.${c}`,
      message: `${c} 是发布端生成的只读字段，不能进入 Source Manifest。`
    }) : /platform-reserved/i.test(d) && n("WWM004", {
      path: `manifest.json$.${c}`,
      message: `${c} 是平台保留字段。`
    });
  }
  const o = [
    [e.type === "system", "$.type", "system 类型属于第一方平台能力。"],
    [e.install?.source && e.install.source !== "repository", "$.install.source", "第三方 Source Manifest 应使用 repository source。"],
    [e.window?.mode && e.window.mode !== "iframe", "$.window.mode", "第三方功能当前仅兼容 iframe window mode。"]
  ];
  for (const [c, r, i] of o)
    c && n("WWM004", { path: `manifest.json${r}`, message: i });
}
function Xc(e, t, n, a) {
  if (t === 1) {
    Object.prototype.hasOwnProperty.call(e, "permissions") && a("WWM008", {
      path: "manifest.json$.permissions",
      message: "Manifest v1 不承载权限声明；该字段不会授予能力，请显式迁移到 v2。"
    });
    return;
  }
  if (!Array.isArray(e.permissions)) return;
  const l = new Set((n?.permissions || []).map((o) => o.id)), u = new Set(n?.sourceDeclaration?.declarablePermissionIds || []), s = /* @__PURE__ */ new Set();
  e.permissions.forEach((o, c) => {
    if (typeof o != "string") return;
    const r = `manifest.json$.permissions[${c}]`;
    s.has(o) && a("WWM007", { path: r, message: `重复权限：${o}`, metadata: { permission: o } }), s.add(o), Yc(o) ? a("WWM008", { path: r, message: `禁止声明超级或私有权限：${o}`, metadata: { permission: o } }) : l.has(o) ? u.has(o) || a("WWM008", { path: r, message: `权限尚未开放 Source Manifest 声明：${o}`, metadata: { permission: o } }) : a("WWM006", { path: r, message: `未知权限：${o}`, metadata: { permission: o } });
  });
}
function Yc(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function Qc(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function ed(e, t, n, a) {
  if (typeof t.entry != "string") return;
  let l;
  try {
    l = ue(t.entry);
  } catch {
    a("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  (!n.entryExtensions.includes(An(l)) || !fr(e, l)) && a("WWP006", {
    path: "manifest.json$.entry",
    message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
    metadata: { entry: l }
  });
}
function td(e, t, n, a) {
  const l = ad(n.publicApiText), u = new Set(e.files.map((s) => s.path));
  for (const s of e.files) {
    const o = An(s.path);
    o === ".js" && sd(s, l, t, a), (o === ".html" || o === ".htm") && rd(s, u, a), o === ".css" && nd(s, a);
  }
  (n.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported" || n.runtimeCompatibility.packageRuntime.execution.network !== "none") && a("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
}
function sd(e, t, n, a) {
  const l = cd(e.content);
  dt(l, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (s, o) => {
    a("WWS001", { path: e.path, location: Be(e.content, o), message: "Package Runtime 仅支持 classic JavaScript。" });
  }), dt(l, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (s, o) => {
    a("WWS003", { path: e.path, location: Be(e.content, o), message: "功能代码不能引用私有 Native API。" });
  }), dt(l, /\bparent\s*\.\s*WebWindows\b/g, (s, o) => {
    a("WWS004", { path: e.path, location: Be(e.content, o), message: "功能代码不能访问 parent.WebWindows。" });
  }), dt(l, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (s, o) => {
    const c = s[1];
    t.has(c) || a("WWS004", {
      path: e.path,
      location: Be(e.content, o),
      message: `WebWindows.${c} 不属于 Public API v1。`,
      metadata: { namespace: c }
    });
  }), dt(l, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (s, o) => {
    a("WWS005", {
      path: e.path,
      location: Be(e.content, o),
      message: `${s[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
  const u = /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*device\s*\.\s*battery\s*\.\s*(?:getState|refresh)\s*\(/g.exec(l);
  u && (qt(n) !== 2 || !n.permissions?.includes("device.battery-status.read")) && a("WWM010", {
    path: e.path,
    location: Be(e.content, u.index),
    message: "Battery Broker API 需要 Manifest v2 声明 device.battery-status.read；静态提示不会自动授予权限。",
    metadata: { requiredPermission: "device.battery-status.read" }
  });
}
function rd(e, t, n) {
  dt(e.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (a, l) => {
    n("WWS001", { path: e.path, location: Be(e.content, l), message: "Package Runtime 不支持 script type=module。" });
  }), dt(e.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (a, l) => {
    const u = a[2], s = ud(e.path, u);
    (!s || !t.has(s)) && n("WWS002", {
      path: e.path,
      location: Be(e.content, l),
      message: `脚本或样式依赖必须包含在功能包内：${u}`,
      metadata: { reference: u }
    });
  }), dt(e.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (a, l) => {
    n("WWS002", {
      path: e.path,
      location: Be(e.content, l),
      message: `外部资源在无网络 Runtime 中不可用：${a[1]}`,
      metadata: { reference: a[1] }
    });
  });
}
function nd(e, t) {
  dt(e.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (n, a) => {
    t("WWS002", {
      path: e.path,
      location: Be(e.content, a),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${n[1]}`,
      metadata: { reference: n[1] }
    });
  });
}
function id(e) {
  return new Map(e.rules.map((t) => [t.ruleId, t]));
}
function od(e, t, n) {
  const a = e.get(t);
  if (!a) throw new Error(`Unknown validator rule: ${t}`);
  return {
    ruleId: t,
    category: a.category,
    severity: n.severity || a.defaultSeverity,
    path: n.path || null,
    location: n.location || null,
    message: n.message || a.title,
    ...n.metadata ? { metadata: n.metadata } : {}
  };
}
function ad(e) {
  const t = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(e)?.[1] || "";
  return new Set([...t.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((n) => n[1]));
}
function ld(e, t) {
  return t?.$ref?.startsWith("#/$defs/") ? e.$defs?.[t.$ref.slice(8)] || t : t || {};
}
function ud(e, t) {
  const n = String(t || "").split(/[?#]/, 1)[0];
  if (!n || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(n)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of n.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  return a.join("/");
}
function cd(e) {
  return e.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (t) => t.replace(/[^\n]/g, " ")
  );
}
function dt(e, t, n) {
  for (const a of e.matchAll(t)) n(a, a.index || 0);
}
function Be(e, t) {
  const n = e.slice(0, t).split(`
`);
  return { line: n.length, column: n.at(-1).length + 1 };
}
function dd(e, t) {
  const n = /position\s+(\d+)/i.exec(t);
  return Be(e, n ? Number(n[1]) : 0);
}
function pd(e, t) {
  return `$${(e || (t ? `/${t}` : "")).split("/").slice(1).map((a) => /^\d+$/.test(a) ? `[${a}]` : `.${a.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}
function fd(e) {
  return !e || typeof e.id != "string" || typeof e.version != "string" ? null : {
    id: e.id,
    version: e.version,
    name: typeof e.name == "string" ? e.name : null,
    manifestVersion: qt(e),
    sdkApiVersion: typeof e.sdk?.apiVersion == "string" ? e.sdk.apiVersion : null
  };
}
function An(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function md(e, t) {
  return e.ruleId.localeCompare(t.ruleId) || String(e.path || "").localeCompare(String(t.path || "")) || (e.location?.line || 0) - (t.location?.line || 0) || e.message.localeCompare(t.message);
}
function hd(e) {
  return [
    e.ruleId,
    e.severity,
    e.path || "",
    e.location?.line || 0,
    e.location?.column || 0,
    e.message
  ].join("\0");
}
const Js = "webwindows-studio-preview-control-v1", yd = "webwindows-studio-preview-console-v1", gd = "webwindows-studio-preview-console-init-v1", wd = "webwindows-studio-preview-sdk-init-v1", vd = "webwindows-studio-preview-session-v1", bd = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'", Pd = 30 * 1024 * 1024;
function Ls(e = "preview") {
  const t = globalThis.crypto;
  if (!t?.getRandomValues) throw new Error("Web Crypto is required for Preview sessions.");
  const n = new Uint8Array(24);
  t.getRandomValues(n);
  const a = [...n].map((l) => l.toString(16).padStart(2, "0")).join("");
  return `${e}-${a}`;
}
function nn(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class kd {
  constructor({ onConsole: t, onState: n, onBroker: a } = {}) {
    this.onConsole = t || (() => {
    }), this.onState = n || (() => {
    }), this.onBroker = a || null, this.port = null, this.hostNonce = null, this.requests = /* @__PURE__ */ new Map();
  }
  async connect(t) {
    if (this.disconnect(), !t?.contentWindow) throw new Error("Developer Preview Host 尚未加载。");
    this.hostNonce = Ls("host");
    const n = new MessageChannel();
    this.port = n.port1, this.port.onmessage = (a) => this.#n(a.data), this.port.start(), t.contentWindow.postMessage({
      protocol: Js,
      version: 1,
      type: "host.connect",
      hostNonce: this.hostNonce
    }, location.origin, [n.port2]), await this.#t("host.ping", {}, 5e3);
  }
  async start(t, n, a = { facadeEnabled: !1 }) {
    const l = new TextEncoder().encode(n).byteLength;
    if (l > Pd) throw new Error("Preview document 超过 30 MB 上限。");
    return this.#t("preview.start", {
      session: $d(t),
      token: t.token,
      documentHtml: n,
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
  #t(t, n, a) {
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
        protocol: Js,
        version: 1,
        type: t,
        hostNonce: this.hostNonce,
        requestId: l,
        payload: n
      });
    });
  }
  #n(t) {
    if (!nn(t) || t.protocol !== Js || t.version !== 1 || t.hostNonce !== this.hostNonce || typeof t.type != "string") return;
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
          protocol: Js,
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
    const n = this.requests.get(t.requestId);
    n && (this.requests.delete(t.requestId), t.ok === !0 ? n.resolve(t.payload) : n.reject(new Error(t.error || "Developer Preview Host 请求失败。")));
  }
}
function $d(e) {
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
function Id({ sessionId: e, snapshotId: t, token: n }) {
  const a = JSON.stringify({
    initProtocol: gd,
    protocol: yd,
    sessionId: e,
    snapshotId: t,
    token: n
  }).replace(/</g, "\\u003c");
  return `;(${qd.toString()})(${a});`;
}
function qd(e) {
  let u = null, s = 0;
  const o = [];
  function c(y) {
    const p = String(y);
    return p.length <= 4096 ? p : `${p.slice(0, 4096)}…[truncated]`;
  }
  function r(y, p, f) {
    if (y == null || typeof y == "boolean") return y;
    if (typeof y == "string" || typeof y == "number") return c(y);
    if (typeof y == "bigint") return `${y}n`;
    if (typeof y > "u") return "[undefined]";
    if (typeof y == "function") return `[Function${y.name ? ` ${y.name}` : ""}]`;
    if (typeof y == "symbol") return c(y.toString());
    if (y === globalThis || y === globalThis.window) return "[Window]";
    if (p >= 4) return "[Max depth]";
    if (f.has(y)) return "[Circular]";
    f.add(y);
    try {
      if (typeof Error < "u" && y instanceof Error)
        return { name: c(y.name), message: c(y.message), stack: c(y.stack || "") };
      if (typeof Node < "u" && y instanceof Node)
        return `[DOM ${y.nodeName || "Node"}]`;
      if (Array.isArray(y)) {
        const $ = y.slice(0, 40).map((E) => r(E, p + 1, f));
        return y.length > 40 && $.push(`[${y.length - 40} more items]`), $;
      }
      const h = {}, P = Object.keys(y).slice(0, 40);
      for (const $ of P)
        try {
          h[c($)] = r(y[$], p + 1, f);
        } catch (E) {
          h[c($)] = `[Unreadable: ${c(E?.message || E)}]`;
        }
      return Object.keys(y).length > 40 && (h["…"] = "[truncated properties]"), h;
    } catch (h) {
      return `[Unserializable: ${c(h?.message || h)}]`;
    } finally {
      f.delete(y);
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
      arguments: Array.from(p).map((f) => r(f, 0, /* @__PURE__ */ new Set()))
    };
  }
  function d(y, p) {
    const f = i(y, p);
    if (u)
      try {
        u.postMessage(f);
      } catch {
      }
    else o.length < 200 && o.push(f);
  }
  for (const y of ["log", "info", "warn", "error", "debug"]) {
    const p = console[y]?.bind(console) || console.log.bind(console);
    console[y] = function(...f) {
      d(y, f), p(...f);
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
    const f = p.data;
    if (!(!f || f.protocol !== e.initProtocol || f.version !== 1 || f.sessionId !== e.sessionId || f.snapshotId !== e.snapshotId || f.token !== e.token || p.ports.length !== 1 || u))
      for (u = p.ports[0], u.start?.(); o.length; ) u.postMessage(o.shift());
  });
}
function xd({ sessionId: e, snapshotId: t }, n) {
  if (!n?.facadeEnabled) return "";
  const a = JSON.stringify({
    initProtocol: wd,
    protocol: n.protocol,
    version: n.version,
    sessionId: e,
    snapshotId: t,
    channelId: n.channelId,
    refreshTimeoutMs: n.refreshTimeoutMs,
    clientErrors: n.clientErrors,
    handshake: n.handshake
  }).replace(/</g, "\\u003c");
  return `;(${Sd.toString()})(${a});`;
}
function Sd(e) {
  let t = null, n = 0, a = e.handshake?.ok === !0 ? o(e.handshake.result) : null;
  const l = e.handshake?.ok === !1 ? e.handshake.error : null, u = /* @__PURE__ */ new Map(), s = [];
  function o(h) {
    return {
      supported: h.supported,
      present: h.present,
      level: h.level,
      charging: h.charging,
      connected: h.connected,
      source: h.source
    };
  }
  function c(h) {
    const P = new Error(h?.message || "The WebWindows capability request failed.");
    return P.name = "WebWindowsCapabilityError", P.code = h?.code || "broker-unavailable", P.retryable = h?.retryable === !0, P;
  }
  function r() {
    const h = new Uint8Array(16);
    return crypto.getRandomValues(h), `sdk-${n++}-${Array.from(h, (P) => P.toString(16).padStart(2, "0")).join("")}`;
  }
  function i(h) {
    t ? t.postMessage(h) : s.push(h);
  }
  function d() {
    const h = r(), P = {
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
    return new Promise(($, E) => {
      const T = setTimeout(() => {
        if (!u.delete(h)) return;
        const { params: L, ...G } = P;
        i({ ...G, type: "cancel" }), E(c(e.clientErrors?.["request-timeout"]));
      }, e.refreshTimeoutMs);
      u.set(h, { resolve: $, reject: E, timer: T }), i(P);
    });
  }
  function y(h) {
    if (!h || h.protocol !== e.protocol || h.version !== e.version || h.type !== "response" || h.sessionId !== e.sessionId || h.snapshotId !== e.snapshotId || h.channelId !== e.channelId || h.method !== "device.battery.refresh" || typeof h.requestId != "string") return;
    const P = u.get(h.requestId);
    P && (u.delete(h.requestId), clearTimeout(P.timer), h.ok === !0 ? (a = o(h.result), P.resolve(o(a))) : P.reject(c(h.error)));
  }
  const p = Object.freeze({
    getState() {
      if (!a) throw c(l || e.clientErrors?.["broker-unavailable"]);
      return o(a);
    },
    refresh: d
  }), f = Object.freeze({ device: Object.freeze({ battery: p }) });
  Object.defineProperty(globalThis, "WebWindows", {
    value: f,
    configurable: !1,
    enumerable: !0,
    writable: !1
  }), addEventListener("message", function(P) {
    const $ = P.data;
    if (!(!$ || $.protocol !== e.initProtocol || $.version !== 1 || $.sessionId !== e.sessionId || $.snapshotId !== e.snapshotId || $.channelId !== e.channelId || P.ports.length !== 1 || t))
      for (t = P.ports[0], t.onmessage = (E) => y(E.data), t.start?.(); s.length; ) t.postMessage(s.shift());
  });
}
const on = Object.freeze({
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8",
  ".svg": "image/svg+xml;charset=utf-8"
}), _d = /* @__PURE__ */ new Set([".html", ".htm", ...Object.keys(on)]);
function Ad(e, t, n = {}) {
  const a = fr(e, "manifest.json");
  if (!a) throw new Error("Preview Snapshot 缺少 manifest.json。");
  const l = JSON.parse(a.content), u = ue(l.entry), s = fr(e, u);
  if (!s || ![".html", ".htm"].includes(hs(u)))
    throw new Error("Preview Snapshot 的 HTML entry 不存在。");
  const c = (n.domParser || new DOMParser()).parseFromString(s.content, "text/html");
  if (c.querySelector('script[type="module"]')) throw new Error("Developer Preview 不支持 ES Module。");
  const r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const f of e.files) {
    const h = hs(f.path);
    _d.has(h) && Object.prototype.hasOwnProperty.call(on, h) && ![".css", ".js"].includes(h) && r.set(f.path, jd(f.content, on[h]));
  }
  for (const f of e.files) {
    const h = hs(f.path);
    h === ".js" && i.set(f.path, f.content), h === ".css" && i.set(f.path, wi(f.content, f.path, r));
  }
  const d = c.createElement("meta");
  d.httpEquiv = "Content-Security-Policy", d.content = bd, c.head.prepend(d);
  const y = c.createElement("script");
  y.setAttribute("data-webwindows-preview-bootstrap", "v1"), y.textContent = Id(t), c.head.insertBefore(y, d.nextSibling);
  const p = xd(t, n.sdkLaunch);
  if (p) {
    const f = c.createElement("script");
    f.setAttribute("data-webwindows-preview-sdk", "v1"), f.textContent = p, c.head.insertBefore(f, y.nextSibling);
  }
  return c.querySelectorAll("script[src]").forEach((f) => {
    const h = f.getAttribute("src"), P = bs(u, h);
    if (!P || hs(P) !== ".js" || !i.has(P))
      throw new Error(`Preview 脚本必须来自 Snapshot：${h}`);
    f.removeAttribute("src"), f.textContent = i.get(P);
  }), c.querySelectorAll('link[rel~="stylesheet"][href]').forEach((f) => {
    const h = f.getAttribute("href"), P = bs(u, h);
    if (!P || hs(P) !== ".css" || !i.has(P))
      throw new Error(`Preview 样式必须来自 Snapshot：${h}`);
    const $ = c.createElement("style");
    $.textContent = i.get(P), f.replaceWith($);
  }), c.querySelectorAll("style").forEach((f) => {
    f.textContent = wi(f.textContent, u, r);
  }), c.querySelectorAll("[src],[href],[poster]").forEach((f) => {
    for (const h of ["src", "href", "poster"]) {
      if (!f.hasAttribute(h)) continue;
      const P = bs(u, f.getAttribute(h));
      P && r.has(P) && f.setAttribute(h, r.get(P));
    }
  }), c.querySelectorAll("[srcset]").forEach((f) => {
    const h = f.getAttribute("srcset").split(",").map((P) => {
      const $ = P.trim().split(/\s+/), E = bs(u, $[0]);
      return E && r.has(E) && ($[0] = r.get(E)), $.join(" ");
    });
    f.setAttribute("srcset", h.join(", "));
  }), `<!DOCTYPE html>
` + c.documentElement.outerHTML;
}
function bs(e, t) {
  const n = String(t || "").split(/[?#]/, 1)[0];
  if (!n || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(n)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of n.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  try {
    return ue(a.join("/"));
  } catch {
    return null;
  }
}
function wi(e, t, n) {
  return String(e).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (a, l, u) => {
    const s = bs(t, u);
    return s && n.has(s) ? `url("${n.get(s)}")` : a;
  });
}
function jd(e, t) {
  const n = new TextEncoder().encode(String(e));
  let a = "";
  for (let l = 0; l < n.length; l += 32768)
    a += String.fromCharCode(...n.subarray(l, l + 32768));
  return `data:${t};base64,${btoa(a)}`;
}
function hs(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function Td(e) {
  let t = 0;
  for (let n = 0; n < e.length; n += 1) {
    const a = e.charCodeAt(n);
    if (a >= 55296 && a <= 56319 && n + 1 < e.length) {
      const l = e.charCodeAt(n + 1);
      l >= 56320 && l <= 57343 && (n += 1);
    }
    t += 1;
  }
  return t;
}
const vi = mr, Ed = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "request" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, params: { type: "object", maxProperties: 64 } } }, Ar = Object.prototype.hasOwnProperty, z = Td, ce = new RegExp("^[A-Za-z0-9._:-]+$", "u"), Ds = new RegExp("^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$", "u");
function is(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = is.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.snapshotId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.channelId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.requestId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.method === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.params === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "params" }, message: "must have required property 'params'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e)
      if (!Ar.call(Ed.properties, r)) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: r }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const r = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const r = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type !== void 0 && e.type !== "request") {
      const r = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "request" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId !== void 0) {
      let r = e.sessionId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let r = e.snapshotId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let r = e.channelId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let r = e.requestId;
      if (typeof r == "string") {
        if (z(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let r = e.method;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ds.test(r)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.params !== void 0) {
      let r = e.params;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (Object.keys(r).length > 64) {
          const i = { instancePath: t + "/params", schemaPath: "#/properties/params/maxProperties", keyword: "maxProperties", params: { limit: 64 }, message: "must NOT have more than 64 properties" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/params", schemaPath: "#/properties/params/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return is.errors = s, o === 0;
}
is.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Od = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !0 }, result: {} } };
function os(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = os.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.snapshotId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.channelId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.requestId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.method === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.ok === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ok" }, message: "must have required property 'ok'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.result === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "result" }, message: "must have required property 'result'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e)
      if (!Ar.call(Od.properties, r)) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: r }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const r = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const r = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type !== void 0 && e.type !== "response") {
      const r = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "response" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId !== void 0) {
      let r = e.sessionId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let r = e.snapshotId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let r = e.channelId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let r = e.requestId;
      if (typeof r == "string") {
        if (z(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let r = e.method;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ds.test(r)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.ok !== void 0 && e.ok !== !0) {
      const r = { instancePath: t + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: !0 }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return os.errors = s, o === 0;
}
os.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Md = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !1 }, error: { $ref: "#/$defs/publicError" } } }, Cd = new RegExp("^[a-z]+(?:-[a-z]+)*$", "u");
function as(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = as.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.snapshotId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.channelId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.requestId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.method === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.ok === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ok" }, message: "must have required property 'ok'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.error === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "error" }, message: "must have required property 'error'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e)
      if (!Ar.call(Md.properties, r)) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: r }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const r = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const r = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type !== void 0 && e.type !== "response") {
      const r = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "response" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId !== void 0) {
      let r = e.sessionId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let r = e.snapshotId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let r = e.channelId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let r = e.requestId;
      if (typeof r == "string") {
        if (z(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let r = e.method;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ds.test(r)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.ok !== void 0 && e.ok !== !1) {
      const r = { instancePath: t + "/ok", schemaPath: "#/properties/ok/const", keyword: "const", params: { allowedValue: !1 }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.error !== void 0) {
      let r = e.error;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.code === void 0) {
          const i = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/required", keyword: "required", params: { missingProperty: "code" }, message: "must have required property 'code'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.message === void 0) {
          const i = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/required", keyword: "required", params: { missingProperty: "message" }, message: "must have required property 'message'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r.retryable === void 0) {
          const i = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/required", keyword: "required", params: { missingProperty: "retryable" }, message: "must have required property 'retryable'" };
          s === null ? s = [i] : s.push(i), o++;
        }
        for (const i in r)
          if (!(i === "code" || i === "message" || i === "retryable")) {
            const d = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: i }, message: "must NOT have additional properties" };
            s === null ? s = [d] : s.push(d), o++;
          }
        if (r.code !== void 0) {
          let i = r.code;
          if (typeof i == "string") {
            if (z(i) > 64) {
              const d = { instancePath: t + "/error/code", schemaPath: "#/$defs/publicError/properties/code/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (!Cd.test(i)) {
              const d = { instancePath: t + "/error/code", schemaPath: "#/$defs/publicError/properties/code/pattern", keyword: "pattern", params: { pattern: "^[a-z]+(?:-[a-z]+)*$" }, message: 'must match pattern "^[a-z]+(?:-[a-z]+)*$"' };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/error/code", schemaPath: "#/$defs/publicError/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.message !== void 0) {
          let i = r.message;
          if (typeof i == "string") {
            if (z(i) > 240) {
              const d = { instancePath: t + "/error/message", schemaPath: "#/$defs/publicError/properties/message/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (z(i) < 1) {
              const d = { instancePath: t + "/error/message", schemaPath: "#/$defs/publicError/properties/message/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
          } else {
            const d = { instancePath: t + "/error/message", schemaPath: "#/$defs/publicError/properties/message/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.retryable !== void 0 && typeof r.retryable != "boolean") {
          const i = { instancePath: t + "/error/retryable", schemaPath: "#/$defs/publicError/properties/retryable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/error", schemaPath: "#/$defs/publicError/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return as.errors = s, o === 0;
}
as.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Wt(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Wt.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const r = o;
  let i = !1, d = null;
  const y = o;
  os(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? os.errors : s.concat(os.errors), o = s.length);
  var h = y === o;
  if (h) {
    i = !0, d = 0;
    var p = !0;
  }
  const f = o;
  as(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? as.errors : s.concat(as.errors), o = s.length);
  var h = f === o;
  if (h && i ? (i = !1, d = [d, 1]) : h && (i = !0, d = 1, p !== !0 && (p = !0)), i)
    o = r, s !== null && (r ? s.length = r : s = null);
  else {
    const P = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [P] : s.push(P), o++;
  }
  return Wt.errors = s, c.props = p, o === 0;
}
Wt.evaluated = { dynamicProps: !0, dynamicItems: !1 };
function ls(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ls.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.snapshotId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.channelId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.requestId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.method === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e)
      if (!(r === "protocol" || r === "version" || r === "type" || r === "sessionId" || r === "snapshotId" || r === "channelId" || r === "requestId" || r === "method")) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: r }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const r = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const r = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type !== void 0 && e.type !== "cancel") {
      const r = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "cancel" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId !== void 0) {
      let r = e.sessionId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let r = e.snapshotId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let r = e.channelId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let r = e.requestId;
      if (typeof r == "string") {
        if (z(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let r = e.method;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ds.test(r)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return ls.errors = s, o === 0;
}
ls.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const bi = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "event" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, event: { enum: ["snapshot.update", "capability.change"] }, detail: { type: "object", maxProperties: 64 } } };
function us(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = us.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.protocol === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sessionId" }, message: "must have required property 'sessionId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.snapshotId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "snapshotId" }, message: "must have required property 'snapshotId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.channelId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "channelId" }, message: "must have required property 'channelId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.requestId === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "requestId" }, message: "must have required property 'requestId'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.method === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "method" }, message: "must have required property 'method'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.event === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "event" }, message: "must have required property 'event'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.detail === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "detail" }, message: "must have required property 'detail'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e)
      if (!Ar.call(bi.properties, r)) {
        const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: r }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.protocol !== void 0 && e.protocol !== "webwindows-capability-broker-v1") {
      const r = { instancePath: t + "/protocol", schemaPath: "#/$defs/protocol/const", keyword: "const", params: { allowedValue: "webwindows-capability-broker-v1" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.version !== void 0 && e.version !== 1) {
      const r = { instancePath: t + "/version", schemaPath: "#/$defs/version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.type !== void 0 && e.type !== "event") {
      const r = { instancePath: t + "/type", schemaPath: "#/properties/type/const", keyword: "const", params: { allowedValue: "event" }, message: "must be equal to constant" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.sessionId !== void 0) {
      let r = e.sessionId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.snapshotId !== void 0) {
      let r = e.snapshotId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.channelId !== void 0) {
      let r = e.channelId;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.requestId !== void 0) {
      let r = e.requestId;
      if (typeof r == "string") {
        if (z(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ce.test(r)) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9._:-]+$" }, message: 'must match pattern "^[A-Za-z0-9._:-]+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.method !== void 0) {
      let r = e.method;
      if (typeof r == "string") {
        if (z(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (z(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ds.test(r)) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$" }, message: 'must match pattern "^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.event !== void 0) {
      let r = e.event;
      if (!(r === "snapshot.update" || r === "capability.change")) {
        const i = { instancePath: t + "/event", schemaPath: "#/properties/event/enum", keyword: "enum", params: { allowedValues: bi.properties.event.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.detail !== void 0) {
      let r = e.detail;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (Object.keys(r).length > 64) {
          const i = { instancePath: t + "/detail", schemaPath: "#/properties/detail/maxProperties", keyword: "maxProperties", params: { limit: 64 }, message: "must NOT have more than 64 properties" };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/detail", schemaPath: "#/properties/detail/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return us.errors = s, o === 0;
}
us.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function mr(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = mr.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const r = o;
  let i = !1, d = null;
  const y = o;
  is(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? is.errors : s.concat(is.errors), o = s.length);
  var P = y === o;
  if (P) {
    i = !0, d = 0;
    var p = !0;
  }
  const f = o;
  if (!Wt(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }))
    s = s === null ? Wt.errors : s.concat(Wt.errors), o = s.length;
  else
    var h = Wt.evaluated.props;
  var P = f === o;
  if (P && i)
    i = !1, d = [d, 1];
  else {
    P && (i = !0, d = 1, p !== !0 && h !== void 0 && (h === !0 ? p = !0 : (p = p || {}, Object.assign(p, h))));
    const $ = o;
    ls(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ls.errors : s.concat(ls.errors), o = s.length);
    var P = $ === o;
    if (P && i)
      i = !1, d = [d, 2];
    else {
      P && (i = !0, d = 2, p !== !0 && (p = !0));
      const T = o;
      us(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? us.errors : s.concat(us.errors), o = s.length);
      var P = T === o;
      P && i ? (i = !1, d = [d, 3]) : P && (i = !0, d = 3, p !== !0 && (p = !0));
    }
  }
  if (i)
    o = r, s !== null && (r ? s.length = r : s = null);
  else {
    const $ = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [$] : s.push($), o++;
  }
  return mr.errors = s, c.props = p, o === 0;
}
mr.evaluated = { dynamicProps: !0, dynamicItems: !1 };
const Nd = hr;
function hr(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = hr.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (Object.keys(e).length > 0) {
      const r = { instancePath: t, schemaPath: "#/maxProperties", keyword: "maxProperties", params: { limit: 0 }, message: "must NOT have more than 0 properties" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e) {
      const i = { instancePath: t, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: r }, message: "must NOT have additional properties" };
      s === null ? s = [i] : s.push(i), o++;
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return hr.errors = s, o === 0;
}
hr.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Ld = yr, ys = { properties: { present: { type: ["boolean", "null"] }, level: { type: ["number", "null"] }, charging: { type: ["boolean", "null"] }, connected: { type: ["boolean", "null"] }, source: { enum: ["browser", "runtime", "unsupported"] } } };
function yr(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = yr.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), e && typeof e == "object" && !Array.isArray(e)) {
    if (e.supported === void 0) {
      const r = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "supported" }, message: "must have required property 'supported'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.present === void 0) {
      const r = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "present" }, message: "must have required property 'present'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.level === void 0) {
      const r = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "level" }, message: "must have required property 'level'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.charging === void 0) {
      const r = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "charging" }, message: "must have required property 'charging'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.connected === void 0) {
      const r = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "connected" }, message: "must have required property 'connected'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.source === void 0) {
      const r = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e)
      if (!(r === "supported" || r === "present" || r === "level" || r === "charging" || r === "connected" || r === "source")) {
        const i = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: r }, message: "must NOT have additional properties" };
        s === null ? s = [i] : s.push(i), o++;
      }
    if (e.supported !== void 0 && typeof e.supported != "boolean") {
      const r = { instancePath: t + "/supported", schemaPath: "#/$defs/sanitizedBatteryState/properties/supported/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.present !== void 0) {
      let r = e.present;
      if (typeof r != "boolean" && r !== null) {
        const i = { instancePath: t + "/present", schemaPath: "#/$defs/sanitizedBatteryState/properties/present/type", keyword: "type", params: { type: ys.properties.present.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.level !== void 0) {
      let r = e.level;
      if (typeof r != "number" && r !== null) {
        const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/type", keyword: "type", params: { type: ys.properties.level.type }, message: "must be number,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
      if (typeof r == "number") {
        if (r > 1 || isNaN(r)) {
          const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1 }, message: "must be <= 1" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (r < 0 || isNaN(r)) {
          const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
          s === null ? s = [i] : s.push(i), o++;
        }
      }
    }
    if (e.charging !== void 0) {
      let r = e.charging;
      if (typeof r != "boolean" && r !== null) {
        const i = { instancePath: t + "/charging", schemaPath: "#/$defs/sanitizedBatteryState/properties/charging/type", keyword: "type", params: { type: ys.properties.charging.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.connected !== void 0) {
      let r = e.connected;
      if (typeof r != "boolean" && r !== null) {
        const i = { instancePath: t + "/connected", schemaPath: "#/$defs/sanitizedBatteryState/properties/connected/type", keyword: "type", params: { type: ys.properties.connected.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.source !== void 0) {
      let r = e.source;
      if (!(r === "browser" || r === "runtime" || r === "unsupported")) {
        const i = { instancePath: t + "/source", schemaPath: "#/$defs/sanitizedBatteryState/properties/source/enum", keyword: "enum", params: { allowedValues: ys.properties.source.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return yr.errors = s, o === 0;
}
yr.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
class zd {
  constructor(t) {
    this.session = t.session, this.manifest = t.manifest, this.contracts = t.contracts, this.publicApi = t.publicApi || null, this.platformPolicyPermits = t.platformPolicyPermits ?? !0, this.grantResolver = t.grantResolver || Rd, this.now = t.now || (() => Date.now()), this.setTimer = t.setTimer || ((n, a) => setTimeout(n, a)), this.clearTimer = t.clearTimer || ((n) => clearTimeout(n)), this.channelId = t.channelId || Ls("broker"), this.methods = new Map(this.contracts.brokerMethods.methods.map((n) => [n.id, n])), this.errors = new Map(this.contracts.brokerErrors.errors.map((n) => [n.code, n])), this.seen = /* @__PURE__ */ new Set(), this.pending = /* @__PURE__ */ new Map(), this.requestTimes = [], this.audit = [], this.closed = !1;
  }
  async createLaunchDescriptor() {
    if (qt(this.manifest) !== 2 || this.manifest.sdk?.apiVersion !== "1")
      return Object.freeze({ facadeEnabled: !1 });
    const t = this.methods.get("device.battery.getState"), n = this.#t(t);
    let a;
    if (n)
      a = { ok: !1, error: this.#a(n) }, this.#s("handshake", t, "deny", n, 0);
    else {
      const s = this.now();
      try {
        const o = this.#i().getState();
        a = { ok: !0, result: this.#l(o, t) }, this.#s("handshake", t, "allow", "success", this.now() - s);
      } catch (o) {
        const c = Pi(o);
        a = { ok: !1, error: this.#a(c) }, this.#s("handshake", t, "allow", c, this.now() - s);
      }
    }
    const l = this.methods.get("device.battery.refresh"), u = ["request-timeout", "broker-unavailable"];
    return Object.freeze({
      facadeEnabled: !0,
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      channelId: this.channelId,
      refreshTimeoutMs: l.timeoutMs,
      clientErrors: Object.fromEntries(u.map((s) => [s, this.#a(s)])),
      handshake: structuredClone(a)
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
    if (this.seen.add(t.requestId), Hr(t) > this.contracts.brokerPolicy.limits.maximumRequestBytes)
      return Promise.resolve(this.#e(t, "request-too-large"));
    const n = this.methods.get(t.method);
    if (!n || n.invocation !== "request-response" || n.previewAvailability !== "enabled")
      return Promise.resolve(this.#e(t, "method-not-allowed", n));
    const a = this.#t(n);
    if (a) return Promise.resolve(this.#e(t, a, n));
    if (!vi(t) || !Nd(t.params))
      return Promise.resolve(this.#e(t, "invalid-params", n));
    if (n.userGesture === "host-required")
      return Promise.resolve(this.#e(t, "gesture-required", n));
    this.#p();
    const l = this.contracts.brokerPolicy.limits;
    return this.pending.size >= l.maximumConcurrentRequests || this.requestTimes.length >= l.maximumRequestsPerMinute ? Promise.resolve(this.#e(t, "rate-limited", n)) : (this.requestTimes.push(this.now()), this.#o(t, n));
  }
  close(t = "request-cancelled") {
    if (!this.closed) {
      this.closed = !0;
      for (const n of [...this.pending.values()]) this.#r(n, this.#e(n.message, t, n.method, !1));
    }
  }
  getAudit() {
    return this.audit.map((t) => Object.freeze({ ...t }));
  }
  #t(t) {
    return t ? this.manifest.permissions?.includes(t.requiredPermission) ? (typeof this.platformPolicyPermits == "function" ? this.platformPolicyPermits(t, this.manifest, this.session) === !0 : this.platformPolicyPermits === !0) ? this.grantResolver(t, this.manifest, this.session) !== !0 ? "permission-denied" : this.#n(t.requiredRuntimeCapability) ? null : "capability-unsupported" : "policy-denied" : "permission-not-declared" : "method-not-allowed";
  }
  #n(t) {
    if (t !== "battery.status") return !1;
    try {
      const n = this.#i();
      return typeof n.getState == "function" && typeof n.refresh == "function" && n.getCapabilities?.().status?.supported === !0;
    } catch {
      return !1;
    }
  }
  #i() {
    const t = this.publicApi?.device?.battery;
    if (!t) throw gs("capability-unsupported");
    return t;
  }
  #o(t, n) {
    const a = this.now(), l = n.timeoutMs || this.contracts.brokerPolicy.limits.defaultRequestTimeoutMs, u = Math.max(0, Date.parse(this.session.expiresAt) - this.now()), s = Math.min(l, this.contracts.brokerPolicy.limits.maximumRequestTimeoutMs, u);
    return new Promise((o) => {
      const c = { message: t, method: n, startedAt: a, resolve: o, timer: null, settled: !1 };
      c.timer = this.setTimer(() => {
        this.#r(c, this.#e(t, "request-timeout", n, !1));
      }, s), this.pending.set(t.requestId, c), this.#s(t.requestId, n, "allow", "pending", 0), Promise.resolve().then(() => this.#i().refresh()).then(
        (r) => {
          if (c.settled) {
            this.#s(t.requestId, n, "allow", "late-result-ignored", this.now() - a);
            return;
          }
          try {
            const i = this.#l(r, n);
            this.#r(c, this.#d(t, i));
          } catch (i) {
            this.#r(c, this.#e(t, Pi(i), n, !1));
          }
        },
        () => {
          if (c.settled) {
            this.#s(t.requestId, n, "allow", "late-result-ignored", this.now() - a);
            return;
          }
          this.#r(c, this.#e(t, "internal-error", n, !1));
        }
      );
    });
  }
  #u(t) {
    if (!vi(t)) return null;
    const n = this.pending.get(t.requestId);
    return !n || n.message.method !== t.method || this.#r(n, this.#e(n.message, "request-cancelled", n.method, !1)), null;
  }
  #r(t, n) {
    if (t.settled) return;
    t.settled = !0, this.clearTimer(t.timer), this.pending.delete(t.message.requestId);
    const a = n.ok ? "success" : n.error.code;
    this.#s(t.message.requestId, t.method, n.ok ? "allow" : Fd(a), a, this.now() - t.startedAt), t.resolve(n);
  }
  #l(t, n) {
    if (Hr(t) > n.maximumResponseBytes) throw gs("response-too-large");
    if (!nn(t) || typeof t.supported != "boolean" || !Vr(t.present) || !Vr(t.connected) || !Vr(t.charging) || typeof t.source != "string" || !Wd(t.level)) throw gs("internal-error");
    const a = {
      supported: t.supported,
      present: t.present,
      level: t.level,
      charging: t.charging,
      connected: t.connected,
      source: Dd(t.supported, t.source)
    };
    if (!Ld(a)) throw gs("internal-error");
    if (Hr(a) > n.maximumResponseBytes) throw gs("response-too-large");
    return Object.freeze(a);
  }
  #c(t) {
    return nn(t) && t.sessionId === this.session.sessionId && t.snapshotId === this.session.snapshotId && t.channelId === this.channelId;
  }
  #d(t, n) {
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
      result: structuredClone(n)
    };
  }
  #e(t, n, a = null, l = !0) {
    return l && this.#s(t?.requestId || null, a, "deny", n, 0), {
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      type: "response",
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      channelId: this.channelId,
      requestId: typeof t?.requestId == "string" && t.requestId ? t.requestId : "invalid-request",
      method: typeof t?.method == "string" && t.method ? t.method : "device.battery.refresh",
      ok: !1,
      error: this.#a(n)
    };
  }
  #a(t) {
    const n = this.errors.get(t) || this.errors.get("internal-error");
    return { code: n.code, message: n.message, retryable: n.retryable };
  }
  #s(t, n, a, l, u) {
    this.audit.push(Object.freeze({
      timestamp: new Date(this.now()).toISOString(),
      mode: "preview",
      appIdentity: typeof this.manifest.id == "string" ? this.manifest.id : null,
      projectIdentity: this.session.projectUuid,
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      requestId: t,
      method: n?.id || null,
      permission: n?.requiredPermission || null,
      decision: a,
      resultCategory: l,
      latencyMs: u
    }));
  }
  #p() {
    const t = this.now() - 6e4;
    this.requestTimes = this.requestTimes.filter((n) => n > t);
  }
}
function Rd(e) {
  return e.consent === "no-consent";
}
function Vr(e) {
  return e === null || typeof e == "boolean";
}
function Wd(e) {
  return e === null || typeof e == "number" && Number.isFinite(e) && e >= 0 && e <= 1;
}
function Dd(e, t) {
  return !e || t === "unsupported" ? "unsupported" : t === "battery-status-api" || t === "browser" ? "browser" : "runtime";
}
function Hr(e) {
  try {
    return new TextEncoder().encode(JSON.stringify(e)).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
function gs(e) {
  const t = new Error(e);
  return t.code = e, t;
}
function Pi(e) {
  return ["response-too-large", "capability-unsupported"].includes(e?.code) ? e.code : "internal-error";
}
function Fd(e) {
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
const Vd = 1800 * 1e3;
class Hd {
  constructor({
    hostClient: t,
    ttlMs: n = Vd,
    now: a = () => Date.now(),
    publicApiProvider: l = Ud,
    platformPolicyPermits: u = !0,
    grantResolver: s
  }) {
    if (!t) throw new TypeError("PreviewHostClient is required.");
    this.hostClient = t, this.ttlMs = n, this.now = a, this.publicApiProvider = l, this.platformPolicyPermits = u, this.grantResolver = s, this.sessions = /* @__PURE__ */ new Map(), this.activeSessionId = null, this.hostClient.onBroker = (o) => this.#n(o);
  }
  get activeSession() {
    return this.activeSessionId && this.sessions.get(this.activeSessionId) || null;
  }
  async run(t, { contracts: n, domParser: a } = {}) {
    const l = await rn(t, { contracts: n });
    if (!l.passed) return { started: !1, validationReport: l, session: null };
    this.activeSession && await this.stop(this.activeSession.sessionId);
    const u = this.#t(t);
    this.sessions.set(u.sessionId, u), this.activeSessionId = u.sessionId;
    try {
      const s = JSON.parse(fr(t, "manifest.json").content);
      u.broker = new zd({
        session: u,
        manifest: s,
        contracts: n,
        publicApi: this.publicApiProvider(),
        platformPolicyPermits: this.platformPolicyPermits,
        grantResolver: this.grantResolver,
        now: this.now
      }), u.brokerLaunch = await u.broker.createLaunchDescriptor();
      const o = Ad(t, u, { domParser: a, sdkLaunch: u.brokerLaunch });
      return await this.hostClient.start(u, o, u.brokerLaunch), u.state = "running", u.expiryTimer = setTimeout(() => this.#i(u.sessionId).catch(() => {
      }), this.ttlMs), { started: !0, validationReport: l, session: Ur(u) };
    } catch (s) {
      throw u.state = "failed", u.failure = s?.message || String(s), this.#o(u), s;
    }
  }
  async reload(t, n = {}) {
    const a = this.activeSession;
    a && (a.state = "reloading");
    const l = await rn(t, { contracts: n.contracts });
    return l.passed ? (a && await this.stop(a.sessionId), this.run(t, n)) : (a && (a.state = "running"), { started: !1, validationReport: l, session: a ? Ur(a) : null });
  }
  async stop(t = this.activeSessionId) {
    const n = t ? this.sessions.get(t) : null;
    if (!n) return null;
    n.broker?.close("request-cancelled");
    try {
      await this.hostClient.stop(n);
    } finally {
      n.state = "closed", this.#o(n);
    }
    return Ur(n);
  }
  async dispose() {
    const t = [...this.sessions.keys()];
    for (const n of t) await this.stop(n).catch(() => {
    });
    this.hostClient.disconnect?.(), this.hostClient.onBroker = null;
  }
  getBrokerAudit(t = this.activeSessionId) {
    return t ? this.sessions.get(t)?.broker?.getAudit() || [] : [];
  }
  #t(t) {
    const n = this.now();
    return {
      contract: vd,
      sessionId: Ls("session"),
      projectUuid: t.projectUuid,
      snapshotId: t.snapshotId,
      token: Ls("token"),
      createdAt: new Date(n).toISOString(),
      expiresAt: new Date(n + this.ttlMs).toISOString(),
      state: "created",
      snapshot: t,
      expiryTimer: null,
      failure: null,
      broker: null,
      brokerLaunch: null
    };
  }
  #n(t) {
    const n = t?.sessionId ? this.sessions.get(t.sessionId) : null;
    return n?.broker ? n.broker.handleEnvelope(t) : Promise.resolve(null);
  }
  async #i(t) {
    const n = this.sessions.get(t);
    if (n) {
      n.broker?.close("session-expired");
      try {
        await this.hostClient.stop(n);
      } finally {
        n.state = "closed", this.#o(n);
      }
    }
  }
  #o(t) {
    clearTimeout(t.expiryTimer), t.expiryTimer = null, t.token = null, t.snapshot = null, t.broker?.close("request-cancelled"), t.broker = null, t.brokerLaunch = null, this.sessions.delete(t.sessionId), this.activeSessionId === t.sessionId && (this.activeSessionId = null);
  }
}
function Ur(e) {
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
function Ud() {
  return globalThis.top?.WebWindows || globalThis.WebWindows || null;
}
const Bd = { class: "developer-studio" }, Zd = { class: "studio-toolbar" }, Kd = ["value"], Jd = ["value"], Gd = ["disabled"], Xd = ["disabled"], Yd = ["disabled"], Qd = ["disabled"], ep = ["disabled"], tp = ["disabled"], sp = ["disabled"], rp = {
  key: 0,
  class: "studio-main"
}, np = { class: "explorer-panel" }, ip = { class: "panel-heading" }, op = { class: "panel-actions" }, ap = ["disabled"], lp = ["disabled"], up = { class: "file-tree" }, cp = { class: "editor-workbench" }, dp = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, pp = ["onClick"], fp = {
  key: 0,
  class: "dirty-dot"
}, mp = { class: "editor-host" }, hp = {
  key: 1,
  class: "empty-editor"
}, yp = { class: "inspector-panel" }, gp = { class: "panel-heading" }, wp = { class: "panel-switcher" }, vp = { class: "inspector-content" }, bp = { class: "project-uuid" }, Pp = { class: "build-inspector" }, kp = { key: 0 }, $p = { key: 1 }, Ip = {
  key: 0,
  class: "build-blocked"
}, qp = { key: 1 }, xp = { class: "hash-row" }, Sp = ["disabled"], _p = { class: "preview-inspector" }, Ap = { class: "preview-session-banner" }, jp = { key: 0 }, Tp = { key: 1 }, Ep = {
  key: 1,
  class: "empty-workspace studio-main"
}, Op = { class: "problems-panel" }, Mp = { class: "bottom-tabs" }, Cp = ["value"], Np = {
  key: 0,
  class: "problems-empty"
}, Lp = ["onClick"], zp = {
  key: 0,
  class: "problems-empty"
}, Rp = { class: "studio-dialog-actions" }, Wp = {
  class: "primary",
  type: "submit"
}, Dp = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new Mc(), n = X([]), a = X(null), l = X([]), u = X(""), s = X([]), o = X(""), c = X(""), r = X(/* @__PURE__ */ new Set()), i = X(null), d = X([]), y = X(null), p = X(null), f = X(null), h = X(null), P = X(!1), $ = X(null), E = X(!1), T = X(null), L = X([]), G = X("problems"), ge = X("preview"), ke = X("all"), $e = X(""), gt = X(""), ne = X(null);
    let He = null, Ke = 0, St = 0, _t = null, Le = null;
    const fe = De(() => Rc(l.value)), te = De(() => l.value.find((k) => k.path === o.value)), Y = De(() => Wc(o.value)), nt = De(() => o.value === "manifest.json" ? d.value : []), At = De(() => qt(i.value)), Ue = De(() => f.value?.diagnostics || d.value.map((k) => ({
      ruleId: "Manifest",
      severity: k.severity,
      path: k.path,
      message: k.message
    }))), je = De(() => ke.value === "all" ? L.value : L.value.filter((k) => k.level === ke.value));
    $n(async () => {
      try {
        const k = await vs();
        y.value = k.permissionRegistry, p.value = k.brokerMethods, await jt(), n.value.length && await Ft(n.value[0].uuid);
      } catch (k) {
        C(k);
      }
    }), In(() => {
      clearTimeout(Ke), Le?.dispose().catch(() => {
      }), t.close();
    });
    async function jt() {
      n.value = await t.listProjects();
    }
    async function Fs() {
      try {
        await x();
        const k = jc(), v = await Ot("新建 WebWindows 功能", "项目名称", k.displayName);
        if (v == null) return;
        const _ = await t.createProject({ ...k, displayName: v });
        await jt(), await Ft(_.uuid), q("Hello WebWindows 项目已创建。");
      } catch (k) {
        C(k);
      }
    }
    async function Ft(k) {
      if (!k) return;
      T.value && await he(), await x(), a.value = await t.getProject(k), l.value = await t.listEntries(k);
      const v = a.value.editorState || {};
      s.value = (v.openFiles || []).filter((_) => l.value.some((ie) => ie.path === _ && ie.kind === "file")), o.value = l.value.some((_) => _.path === v.activeFile && _.kind === "file") ? v.activeFile : s.value[0] || "", u.value = o.value, r.value = /* @__PURE__ */ new Set(), B(), await Je(), await g(), await I();
    }
    async function Tt() {
      if (!a.value) return;
      const k = await Ot("重命名项目", "新的项目名称", a.value.displayName);
      if (k != null)
        try {
          a.value = await t.renameProject(a.value.uuid, k), await jt(), q("项目已重命名。");
        } catch (v) {
          C(v);
        }
    }
    async function Vt() {
      if (a.value && await we("删除项目", `永久删除项目“${a.value.displayName}”及其全部文件吗？`))
        try {
          const k = a.value.uuid;
          await t.deleteProject(k), a.value = null, l.value = [], s.value = [], o.value = "", u.value = "", c.value = "", B(), await jt(), n.value.length && await Ft(n.value[0].uuid), q("项目已删除。");
        } catch (k) {
          C(k);
        }
    }
    async function ds(k) {
      u.value = k.path, k.kind === "file" && await it(k.path);
    }
    async function it(k) {
      if (!a.value) return;
      await x();
      const v = ue(k);
      s.value.includes(v) || s.value.push(v), o.value = v, u.value = v, await Je(), await I();
    }
    async function Je() {
      if (!a.value || !o.value) {
        c.value = "";
        return;
      }
      c.value = await t.readTextFile(a.value.uuid, o.value), o.value === "manifest.json" && await m(c.value), await bn();
    }
    function jr(k) {
      c.value = k, o.value && (r.value = new Set(r.value).add(o.value), B(), o.value === "manifest.json" && m(k).catch(C), clearTimeout(Ke), Ke = window.setTimeout(() => x().catch(C), 700));
    }
    async function m(k) {
      const v = ++St, _ = await $c(k);
      v === St && (i.value = _.manifest, d.value = _.diagnostics);
    }
    async function g() {
      if (!a.value || !l.value.some((v) => v.path === "manifest.json" && v.kind === "file")) {
        i.value = null, d.value = [];
        return;
      }
      const k = o.value === "manifest.json" ? c.value : await t.readTextFile(a.value.uuid, "manifest.json");
      await m(k);
    }
    async function b(k) {
      o.value !== "manifest.json" && await it("manifest.json"), jr(`${JSON.stringify(k, null, 2)}
`);
    }
    async function x() {
      if (clearTimeout(Ke), Ke = 0, !a.value || !o.value || !r.value.has(o.value)) return;
      const k = o.value;
      await t.writeTextFile(a.value.uuid, k, c.value);
      const v = new Set(r.value);
      v.delete(k), r.value = v, a.value = await t.getProject(a.value.uuid);
    }
    async function I() {
      if (!a.value) return;
      const k = [o.value, ...a.value.editorState?.recentFiles || []].filter(Boolean);
      a.value = await t.saveEditorState(a.value.uuid, {
        openFiles: s.value,
        activeFile: o.value || null,
        recentFiles: [...new Set(k)].slice(0, 20)
      });
    }
    function S() {
      const k = l.value.find((v) => v.path === u.value);
      return k?.kind === "directory" ? k.path : k?.path ? Ns(k.path) : "";
    }
    async function O(k) {
      if (!a.value) return;
      const _ = await Ot(k === "directory" ? "新建目录" : "新建文件", k === "directory" ? "目录名称" : "文件名称", k === "directory" ? "new-folder" : "new-file.js");
      if (_ != null)
        try {
          const ie = yi(S(), _);
          k === "directory" ? await t.createDirectory(a.value.uuid, ie) : await t.createFile(a.value.uuid, ie, ""), B(), l.value = await t.listEntries(a.value.uuid), u.value = ie, k === "file" && await it(ie);
        } catch (ie) {
          C(ie);
        }
    }
    async function j() {
      const k = l.value.find((_) => _.path === u.value);
      if (!k || !a.value) return;
      const v = await Ot("重命名", "新的名称", sn(k.path));
      if (v != null)
        try {
          await x();
          const _ = yi(Ns(k.path), v);
          await t.renameEntry(a.value.uuid, k.path, _), B(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = _, await Je();
        } catch (_) {
          C(_);
        }
    }
    async function A() {
      const k = l.value.find((v) => v.path === u.value);
      if (!(!k || !a.value) && await we("删除文件或目录", `删除“${k.path}”${k.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(a.value.uuid, k.path), B(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = o.value, await Je();
        } catch (v) {
          C(v);
        }
    }
    function q(k) {
      $e.value = k, gt.value = "", window.setTimeout(() => {
        $e.value === k && ($e.value = "");
      }, 2400);
    }
    function C(k) {
      $e.value = k?.message || "操作失败。", gt.value = "error";
    }
    async function M() {
      if (!a.value) throw new Error("请先打开项目。");
      return await x(), Dc(t, a.value.uuid);
    }
    async function N() {
      if (!P.value) {
        P.value = !0;
        try {
          const k = await M(), v = await vs();
          f.value = await rn(k, { contracts: v }), h.value = null, q(f.value.passed ? "项目验证通过。" : `验证发现 ${f.value.errorCount} 个错误。`);
        } catch (k) {
          C(k);
        } finally {
          P.value = !1;
        }
      }
    }
    async function W() {
      if (!P.value) {
        P.value = !0;
        try {
          const k = await M(), v = await vs(), { buildProjectPackage: _ } = await import("./deterministic-builder-B9R9CzfM.js");
          h.value = await _(k, { contracts: v }), f.value = h.value.validationReport, q(h.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
        } catch (k) {
          C(k);
        } finally {
          P.value = !1;
        }
      }
    }
    function U() {
      if (!h.value?.artifactReady || !h.value.zipBytes) return;
      const k = h.value.manifestIdentity, v = `${k?.id || "webwindows-function"}-${k?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-"), _ = new Blob([h.value.zipBytes], { type: "application/zip" }), ie = URL.createObjectURL(_), Vs = document.createElement("a");
      Vs.href = ie, Vs.download = `${v}.zip`, Vs.click(), window.setTimeout(() => URL.revokeObjectURL(ie), 0);
    }
    function B() {
      f.value = null, h.value = null;
    }
    async function Z() {
      E.value = !1, Le?.dispose().catch(() => {
      }), _t = new kd({
        onConsole: (k) => {
          const v = T.value || Le?.activeSession;
          !v || k?.sessionId !== v.sessionId || k?.snapshotId !== v.snapshotId || (L.value = [...L.value, k].slice(-1e3));
        },
        onState: (k) => {
          !T.value || k?.sessionId !== T.value.sessionId || (T.value = { ...T.value, state: k.state });
        }
      }), Le = new Hd({ hostClient: _t });
      try {
        await _t.connect($.value), E.value = !0;
      } catch (k) {
        C(k);
      }
    }
    async function me({ reload: k = !1 } = {}) {
      if (!(P.value || !Le || !E.value)) {
        P.value = !0;
        try {
          const v = await M(), _ = await vs(), ie = k && T.value ? await Le.reload(v, { contracts: _ }) : await Le.run(v, { contracts: _ });
          if (f.value = ie.validationReport, h.value = null, G.value = ie.started ? "console" : "problems", ge.value = "preview", !ie.started) {
            q(`Developer Preview 被 ${ie.validationReport.errorCount} 个验证错误阻止。`);
            return;
          }
          T.value = ie.session, q(k ? "Developer Preview 已从新 Snapshot 重新加载。" : "Developer Preview 已启动。");
        } catch (v) {
          C(v);
        } finally {
          P.value = !1;
        }
      }
    }
    async function he() {
      if (!(!Le || !T.value))
        try {
          await Le.stop(T.value.sessionId), T.value = null, q("Developer Preview 已停止，会话凭据已撤销。");
        } catch (k) {
          C(k);
        }
    }
    function ze() {
      L.value = [];
    }
    function Re(k) {
      return k.arguments.map((v) => typeof v == "string" ? v : JSON.stringify(v)).join(" ");
    }
    function Et(k) {
      const v = l.value.find((_) => _.kind === "file" && (k.path === _.path || k.path?.startsWith(`${_.path}$`)));
      v && it(v.path).catch(C);
    }
    function Ot(k, v, _) {
      return Te({ kind: "text", title: k, message: v, value: _ });
    }
    function we(k, v) {
      return Te({ kind: "confirm", title: k, message: v, value: "" });
    }
    function Te(k) {
      return He && He(null), ne.value = { ...k }, new Promise((v) => {
        He = v;
      });
    }
    function Ht(k) {
      const v = He;
      He = null, ne.value = null, v?.(k);
    }
    return (k, v) => (R(), F("main", Bd, [
      w("header", Zd, [
        v[18] || (v[18] = w("div", { class: "studio-brand" }, [
          w("strong", null, "Developer Studio"),
          w("span", null, "WebWindows Function IDE")
        ], -1)),
        w("button", {
          class: "primary",
          type: "button",
          onClick: Fs
        }, "新建功能"),
        w("select", {
          "aria-label": "打开项目",
          value: a.value?.uuid || "",
          onChange: v[0] || (v[0] = (_) => Ft(_.target.value).catch(C))
        }, [
          v[17] || (v[17] = w("option", {
            value: "",
            disabled: ""
          }, "打开项目…", -1)),
          (R(!0), F(oe, null, bt(n.value, (_) => (R(), F("option", {
            key: _.uuid,
            value: _.uuid
          }, H(_.displayName), 9, Jd))), 128))
        ], 40, Kd),
        w("button", {
          type: "button",
          disabled: !a.value,
          onClick: Tt
        }, "重命名项目", 8, Gd),
        w("button", {
          type: "button",
          disabled: !a.value,
          onClick: Vt
        }, "删除项目", 8, Xd),
        v[19] || (v[19] = w("span", { class: "toolbar-spacer" }, null, -1)),
        w("button", {
          type: "button",
          disabled: !a.value || P.value,
          onClick: N
        }, "Validate", 8, Yd),
        w("button", {
          class: "primary",
          type: "button",
          disabled: !a.value || P.value,
          onClick: W
        }, "Build", 8, Qd),
        w("button", {
          class: "primary",
          type: "button",
          disabled: !a.value || P.value || !E.value,
          onClick: v[1] || (v[1] = (_) => me())
        }, "Run", 8, ep),
        w("button", {
          type: "button",
          disabled: !T.value || P.value,
          onClick: v[2] || (v[2] = (_) => me({ reload: !0 }))
        }, "Reload", 8, tp),
        w("button", {
          type: "button",
          disabled: !T.value,
          onClick: he
        }, "Stop", 8, sp)
      ]),
      a.value ? (R(), F("section", rp, [
        w("aside", np, [
          w("div", ip, [
            w("span", null, "Project · " + H(a.value.displayName), 1),
            w("div", op, [
              w("button", {
                type: "button",
                title: "新建文件",
                onClick: v[3] || (v[3] = (_) => O("file"))
              }, "＋F"),
              w("button", {
                type: "button",
                title: "新建目录",
                onClick: v[4] || (v[4] = (_) => O("directory"))
              }, "＋D"),
              w("button", {
                type: "button",
                title: "重命名",
                disabled: !u.value,
                onClick: j
              }, "R", 8, ap),
              w("button", {
                type: "button",
                title: "删除",
                disabled: !u.value,
                onClick: A
              }, "×", 8, lp)
            ])
          ]),
          w("div", up, [
            (R(!0), F(oe, null, bt(fe.value, (_) => (R(), ar(uu, {
              key: _.path,
              node: _,
              "selected-path": u.value,
              onSelect: ds
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ]),
        w("section", cp, [
          w("nav", dp, [
            (R(!0), F(oe, null, bt(s.value, (_) => (R(), F("button", {
              key: _,
              type: "button",
              class: Ae(["editor-tab", { active: _ === o.value }]),
              onClick: (ie) => it(_).catch(C)
            }, [
              w("span", null, H(Ui(sn)(_)), 1),
              r.value.has(_) ? (R(), F("span", fp, "•")) : We("", !0)
            ], 10, pp))), 128))
          ]),
          w("div", mp, [
            te.value?.kind === "file" ? (R(), ar(pu, {
              key: `${a.value.uuid}:${o.value}`,
              "project-id": a.value.uuid,
              path: o.value,
              language: Y.value,
              value: c.value,
              markers: nt.value,
              "onUpdate:value": jr,
              onSave: v[5] || (v[5] = (_) => x().then(() => q("已保存。")).catch(C)),
              onError: C
            }, null, 8, ["project-id", "path", "language", "value", "markers"])) : (R(), F("div", hp, [...v[20] || (v[20] = [
              w("h2", null, "选择文件开始编辑", -1),
              w("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ])
        ]),
        w("aside", yp, [
          w("div", gp, [
            v[21] || (v[21] = w("span", null, "Inspector", -1)),
            w("div", wp, [
              w("button", {
                type: "button",
                class: Ae({ active: ge.value === "manifest" }),
                onClick: v[6] || (v[6] = (_) => ge.value = "manifest")
              }, "Manifest", 2),
              w("button", {
                type: "button",
                class: Ae({ active: ge.value === "preview" }),
                onClick: v[7] || (v[7] = (_) => ge.value = "preview")
              }, "Preview", 2)
            ])
          ]),
          Zs(w("div", vp, [
            w("h2", null, "Manifest " + H(At.value === 2 ? "v2" : At.value === 1 ? "v1" : "unsupported"), 1),
            w("p", bp, "项目 UUID：" + H(a.value.uuid), 1),
            tt(Zu, {
              manifest: i.value,
              diagnostics: d.value,
              "permission-registry": y.value,
              "broker-methods": p.value,
              "onUpdate:manifest": v[8] || (v[8] = (_) => b(_).catch(C)),
              onOpenJson: v[9] || (v[9] = (_) => it("manifest.json").catch(C))
            }, null, 8, ["manifest", "diagnostics", "permission-registry", "broker-methods"]),
            w("section", Pp, [
              v[31] || (v[31] = w("h3", null, "Validation", -1)),
              f.value ? (R(), F("dl", $p, [
                w("div", null, [
                  v[22] || (v[22] = w("dt", null, "Result", -1)),
                  w("dd", null, H(f.value.passed ? "Passed" : "Blocked"), 1)
                ]),
                w("div", null, [
                  v[23] || (v[23] = w("dt", null, "Errors", -1)),
                  w("dd", null, H(f.value.errorCount), 1)
                ]),
                w("div", null, [
                  v[24] || (v[24] = w("dt", null, "Warnings", -1)),
                  w("dd", null, H(f.value.warningCount), 1)
                ]),
                w("div", null, [
                  v[25] || (v[25] = w("dt", null, "Files", -1)),
                  w("dd", null, H(f.value.packageFacts.fileCount), 1)
                ]),
                w("div", null, [
                  v[26] || (v[26] = w("dt", null, "Bytes", -1)),
                  w("dd", null, H(f.value.packageFacts.unpackedBytes), 1)
                ])
              ])) : (R(), F("p", kp, "尚未创建 Snapshot 验证。")),
              h.value ? (R(), F(oe, { key: 2 }, [
                v[30] || (v[30] = w("h3", null, "Build Result", -1)),
                h.value.artifactReady ? (R(), F("dl", qp, [
                  w("div", null, [
                    v[27] || (v[27] = w("dt", null, "Size", -1)),
                    w("dd", null, H(h.value.zipSize) + " bytes", 1)
                  ]),
                  w("div", null, [
                    v[28] || (v[28] = w("dt", null, "Files", -1)),
                    w("dd", null, H(h.value.fileCount), 1)
                  ]),
                  w("div", xp, [
                    v[29] || (v[29] = w("dt", null, "SHA-256", -1)),
                    w("dd", null, H(h.value.sha256), 1)
                  ])
                ])) : (R(), F("p", Ip, "验证未通过，没有生成可发布 ZIP。")),
                w("button", {
                  type: "button",
                  disabled: !h.value.artifactReady,
                  onClick: U
                }, "Export ZIP", 8, Sp)
              ], 64)) : We("", !0)
            ])
          ], 512), [
            [Gn, ge.value === "manifest"]
          ]),
          Zs(w("div", _p, [
            w("div", Ap, [
              v[32] || (v[32] = w("strong", null, "Developer Preview", -1)),
              T.value ? (R(), F("span", jp, H(T.value.state) + " · " + H(T.value.snapshotId), 1)) : (R(), F("span", Tp, "无活动会话"))
            ]),
            w("iframe", {
              ref_key: "previewHostFrame",
              ref: $,
              class: "preview-host-frame",
              src: "developer-preview-host.html?v=20260829-1",
              title: "Trusted Developer Preview Host",
              referrerpolicy: "no-referrer",
              onLoad: Z
            }, null, 544)
          ], 512), [
            [Gn, ge.value === "preview"]
          ])
        ])
      ])) : (R(), F("section", Ep, [
        v[33] || (v[33] = w("h2", null, "创建第一个 WebWindows 功能", -1)),
        v[34] || (v[34] = w("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        w("button", {
          class: "primary",
          type: "button",
          onClick: Fs
        }, "新建 Hello WebWindows")
      ])),
      w("section", Op, [
        w("div", Mp, [
          w("button", {
            type: "button",
            class: Ae({ active: G.value === "problems" }),
            onClick: v[10] || (v[10] = (_) => G.value = "problems")
          }, [
            v[35] || (v[35] = le("Problems ", -1)),
            w("span", null, H(Ue.value.length), 1)
          ], 2),
          w("button", {
            type: "button",
            class: Ae({ active: G.value === "console" }),
            onClick: v[11] || (v[11] = (_) => G.value = "console")
          }, [
            v[36] || (v[36] = le("Console ", -1)),
            w("span", null, H(L.value.length), 1)
          ], 2),
          v[38] || (v[38] = w("span", { class: "bottom-spacer" }, null, -1)),
          G.value === "console" ? (R(), F(oe, { key: 0 }, [
            Zs(w("select", {
              "onUpdate:modelValue": v[12] || (v[12] = (_) => ke.value = _),
              "aria-label": "Console level"
            }, [
              v[37] || (v[37] = w("option", { value: "all" }, "All levels", -1)),
              (R(), F(oe, null, bt(["log", "info", "warn", "error", "debug"], (_) => w("option", {
                key: _,
                value: _
              }, H(_), 9, Cp)), 64))
            ], 512), [
              [Jl, ke.value]
            ]),
            w("button", {
              type: "button",
              onClick: ze
            }, "Clear")
          ], 64)) : We("", !0)
        ]),
        G.value === "problems" ? (R(), F(oe, { key: 0 }, [
          Ue.value.length ? We("", !0) : (R(), F("div", Np, "当前 Snapshot 未发现问题。")),
          (R(!0), F(oe, null, bt(Ue.value, (_, ie) => (R(), F("button", {
            key: `${_.ruleId}:${_.path}:${ie}`,
            type: "button",
            class: "problem-row",
            onClick: (Vs) => Et(_)
          }, [
            w("span", {
              class: Ae(["problem-severity", _.severity])
            }, H(_.ruleId), 3),
            w("code", null, H(_.path), 1),
            w("span", null, H(_.message), 1)
          ], 8, Lp))), 128))
        ], 64)) : (R(), F(oe, { key: 1 }, [
          je.value.length ? We("", !0) : (R(), F("div", zp, "当前 Developer Preview 尚无 Console 输出。")),
          (R(!0), F(oe, null, bt(je.value, (_) => (R(), F("div", {
            key: `${_.sessionId}:${_.sequence}`,
            class: Ae(["console-row", _.level])
          }, [
            w("time", null, H(_.timestamp), 1),
            w("strong", null, H(_.level), 1),
            w("span", null, H(Re(_)), 1),
            w("code", null, H(_.snapshotId), 1)
          ], 2))), 128))
        ], 64))
      ]),
      $e.value ? (R(), F("div", {
        key: 2,
        class: Ae(["studio-status", gt.value]),
        role: "status"
      }, H($e.value), 3)) : We("", !0),
      ne.value ? (R(), F("div", {
        key: 3,
        class: "studio-dialog-backdrop",
        onKeydown: v[16] || (v[16] = Ql((_) => Ht(ne.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        w("form", {
          class: "studio-dialog",
          onSubmit: v[15] || (v[15] = _n((_) => Ht(ne.value.kind === "confirm" ? !0 : ne.value.value), ["prevent"]))
        }, [
          w("h2", null, H(ne.value.title), 1),
          w("p", null, H(ne.value.message), 1),
          ne.value.kind === "text" ? Zs((R(), F("input", {
            key: 0,
            "onUpdate:modelValue": v[13] || (v[13] = (_) => ne.value.value = _),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [Kl, ne.value.value]
          ]) : We("", !0),
          w("div", Rp, [
            w("button", {
              type: "button",
              onClick: v[14] || (v[14] = (_) => Ht(ne.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            w("button", Wp, H(ne.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : We("", !0)
    ]));
  }
};
su(Dp).mount("#developer-studio-app");
export {
  qt as a,
  fr as g,
  Fc as s,
  rn as v
};
