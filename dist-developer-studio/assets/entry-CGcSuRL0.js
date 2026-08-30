/**
* @vue/shared v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function cn(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const ee = {}, Bt = [], Qe = () => {
}, Si = () => !1, vr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), dn = (e) => e.startsWith("onUpdate:"), xe = Object.assign, pn = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Mo = Object.prototype.hasOwnProperty, G = (e, t) => Mo.call(e, t), V = Array.isArray, Ut = (e) => zs(e) === "[object Map]", br = (e) => zs(e) === "[object Set]", Mn = (e) => zs(e) === "[object Date]", H = (e) => typeof e == "function", pe = (e) => typeof e == "string", et = (e) => typeof e == "symbol", re = (e) => e !== null && typeof e == "object", xi = (e) => (re(e) || H(e)) && H(e.then) && H(e.catch), _i = Object.prototype.toString, zs = (e) => _i.call(e), Co = (e) => zs(e).slice(8, -1), Ai = (e) => zs(e) === "[object Object]", fn = (e) => pe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ks = /* @__PURE__ */ cn(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Pr = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((n) => t[n] || (t[n] = e(n)));
}, No = /-\w/g, Ve = Pr(
  (e) => e.replace(No, (t) => t.slice(1).toUpperCase())
), Lo = /\B([A-Z])/g, xt = Pr(
  (e) => e.replace(Lo, "-$1").toLowerCase()
), kr = Pr((e) => e.charAt(0).toUpperCase() + e.slice(1)), Or = Pr(
  (e) => e ? `on${kr(e)}` : ""
), $t = (e, t) => !Object.is(e, t), Ys = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, ji = (e, t, n, a = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: a,
    value: n
  });
}, sr = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Cn;
const $r = () => Cn || (Cn = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function mn(e) {
  if (V(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const a = e[n], l = pe(a) ? Wo(a) : mn(a);
      if (l)
        for (const u in l)
          t[u] = l[u];
    }
    return t;
  } else if (pe(e) || re(e))
    return e;
}
const Ro = /;(?![^(]*\))/g, zo = /:([^]+)/, Do = /\/\*[^]*?\*\//g;
function Wo(e) {
  const t = {};
  return e.replace(Do, "").split(Ro).forEach((n) => {
    if (n) {
      const a = n.split(zo);
      a.length > 1 && (t[a[0].trim()] = a[1].trim());
    }
  }), t;
}
function we(e) {
  let t = "";
  if (pe(e))
    t = e;
  else if (V(e))
    for (let n = 0; n < e.length; n++) {
      const a = we(e[n]);
      a && (t += a + " ");
    }
  else if (re(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Fo = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Vo = /* @__PURE__ */ cn(Fo);
function Ti(e) {
  return !!e || e === "";
}
function Ho(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let a = 0; n && a < e.length; a++)
    n = Ir(e[a], t[a]);
  return n;
}
function Ir(e, t) {
  if (e === t) return !0;
  let n = Mn(e), a = Mn(t);
  if (n || a)
    return n && a ? e.getTime() === t.getTime() : !1;
  if (n = et(e), a = et(t), n || a)
    return e === t;
  if (n = V(e), a = V(t), n || a)
    return n && a ? Ho(e, t) : !1;
  if (n = re(e), a = re(t), n || a) {
    if (!n || !a)
      return !1;
    const l = Object.keys(e).length, u = Object.keys(t).length;
    if (l !== u)
      return !1;
    for (const s in e) {
      const o = e.hasOwnProperty(s), c = t.hasOwnProperty(s);
      if (o && !c || !o && c || !Ir(e[s], t[s]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function Bo(e, t) {
  return e.findIndex((n) => Ir(n, t));
}
const Ei = (e) => !!(e && e.__v_isRef === !0), L = (e) => pe(e) ? e : e == null ? "" : V(e) || re(e) && (e.toString === _i || !H(e.toString)) ? Ei(e) ? L(e.value) : JSON.stringify(e, Oi, 2) : String(e), Oi = (e, t) => Ei(t) ? Oi(e, t.value) : Ut(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [a, l], u) => (n[Mr(a, u) + " =>"] = l, n),
    {}
  )
} : br(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Mr(n))
} : et(t) ? Mr(t) : re(t) && !V(t) && !Ai(t) ? String(t) : t, Mr = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    et(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let je;
class Uo {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = je, !t && je && (this.index = (je.scopes || (je.scopes = [])).push(
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
      const n = je;
      try {
        return je = this, t();
      } finally {
        je = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = je, je = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (je = this.prevScope, this.prevScope = void 0);
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
function Zo() {
  return je;
}
let te;
const Cr = /* @__PURE__ */ new WeakSet();
class Mi {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, je && je.active && je.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Cr.has(this) && (Cr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ni(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Nn(this), Li(this);
    const t = te, n = Ze;
    te = this, Ze = !0;
    try {
      return this.fn();
    } finally {
      Ri(this), te = t, Ze = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        gn(t);
      this.deps = this.depsTail = void 0, Nn(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Cr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Jr(this) && this.run();
  }
  get dirty() {
    return Jr(this);
  }
}
let Ci = 0, $s, Is;
function Ni(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Is, Is = e;
    return;
  }
  e.next = $s, $s = e;
}
function hn() {
  Ci++;
}
function yn() {
  if (--Ci > 0)
    return;
  if (Is) {
    let t = Is;
    for (Is = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; $s; ) {
    let t = $s;
    for ($s = void 0; t; ) {
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
function Li(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Ri(e) {
  let t, n = e.depsTail, a = n;
  for (; a; ) {
    const l = a.prevDep;
    a.version === -1 ? (a === n && (n = l), gn(a), Ko(a)) : t = a, a.dep.activeLink = a.prevActiveLink, a.prevActiveLink = void 0, a = l;
  }
  e.deps = t, e.depsTail = n;
}
function Jr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (zi(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function zi(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === js) || (e.globalVersion = js, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Jr(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = te, a = Ze;
  te = e, Ze = !0;
  try {
    Li(e);
    const l = e.fn(e._value);
    (t.version === 0 || $t(l, e._value)) && (e.flags |= 128, e._value = l, t.version++);
  } catch (l) {
    throw t.version++, l;
  } finally {
    te = n, Ze = a, Ri(e), e.flags &= -3;
  }
}
function gn(e, t = !1) {
  const { dep: n, prevSub: a, nextSub: l } = e;
  if (a && (a.nextSub = l, e.prevSub = void 0), l && (l.prevSub = a, e.nextSub = void 0), n.subs === e && (n.subs = a, !a && n.computed)) {
    n.computed.flags &= -5;
    for (let u = n.computed.deps; u; u = u.nextDep)
      gn(u, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Ko(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let Ze = !0;
const Di = [];
function yt() {
  Di.push(Ze), Ze = !1;
}
function gt() {
  const e = Di.pop();
  Ze = e === void 0 ? !0 : e;
}
function Nn(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = te;
    te = void 0;
    try {
      t();
    } finally {
      te = n;
    }
  }
}
let js = 0;
class Jo {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class wn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!te || !Ze || te === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== te)
      n = this.activeLink = new Jo(te, this), te.deps ? (n.prevDep = te.depsTail, te.depsTail.nextDep = n, te.depsTail = n) : te.deps = te.depsTail = n, Wi(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const a = n.nextDep;
      a.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = a), n.prevDep = te.depsTail, n.nextDep = void 0, te.depsTail.nextDep = n, te.depsTail = n, te.deps === n && (te.deps = a);
    }
    return n;
  }
  trigger(t) {
    this.version++, js++, this.notify(t);
  }
  notify(t) {
    hn();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      yn();
    }
  }
}
function Wi(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let a = t.deps; a; a = a.nextDep)
        Wi(a);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Gr = /* @__PURE__ */ new WeakMap(), zt = Symbol(
  ""
), Xr = Symbol(
  ""
), Ts = Symbol(
  ""
);
function Pe(e, t, n) {
  if (Ze && te) {
    let a = Gr.get(e);
    a || Gr.set(e, a = /* @__PURE__ */ new Map());
    let l = a.get(n);
    l || (a.set(n, l = new wn()), l.map = a, l.key = n), l.track();
  }
}
function dt(e, t, n, a, l, u) {
  const s = Gr.get(e);
  if (!s) {
    js++;
    return;
  }
  const o = (c) => {
    c && c.trigger();
  };
  if (hn(), t === "clear")
    s.forEach(o);
  else {
    const c = V(e), r = c && fn(n);
    if (c && n === "length") {
      const i = Number(a);
      s.forEach((d, h) => {
        (h === "length" || h === Ts || !et(h) && h >= i) && o(d);
      });
    } else
      switch ((n !== void 0 || s.has(void 0)) && o(s.get(n)), r && o(s.get(Ts)), t) {
        case "add":
          c ? r && o(s.get("length")) : (o(s.get(zt)), Ut(e) && o(s.get(Xr)));
          break;
        case "delete":
          c || (o(s.get(zt)), Ut(e) && o(s.get(Xr)));
          break;
        case "set":
          Ut(e) && o(s.get(zt));
          break;
      }
  }
  yn();
}
function Vt(e) {
  const t = J(e);
  return t === e ? t : (Pe(t, "iterate", Ts), Fe(e) ? t : t.map(ve));
}
function qr(e) {
  return Pe(e = J(e), "iterate", Ts), e;
}
const Go = {
  __proto__: null,
  [Symbol.iterator]() {
    return Nr(this, Symbol.iterator, ve);
  },
  concat(...e) {
    return Vt(this).concat(
      ...e.map((t) => V(t) ? Vt(t) : t)
    );
  },
  entries() {
    return Nr(this, "entries", (e) => (e[1] = ve(e[1]), e));
  },
  every(e, t) {
    return lt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return lt(this, "filter", e, t, (n) => n.map(ve), arguments);
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
    return Lr(this, "includes", e);
  },
  indexOf(...e) {
    return Lr(this, "indexOf", e);
  },
  join(e) {
    return Vt(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Lr(this, "lastIndexOf", e);
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
    return Ln(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Ln(this, "reduceRight", e, t);
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
    return Vt(this).toReversed();
  },
  toSorted(e) {
    return Vt(this).toSorted(e);
  },
  toSpliced(...e) {
    return Vt(this).toSpliced(...e);
  },
  unshift(...e) {
    return ps(this, "unshift", e);
  },
  values() {
    return Nr(this, "values", ve);
  }
};
function Nr(e, t, n) {
  const a = qr(e), l = a[t]();
  return a !== e && !Fe(e) && (l._next = l.next, l.next = () => {
    const u = l._next();
    return u.value && (u.value = n(u.value)), u;
  }), l;
}
const Xo = Array.prototype;
function lt(e, t, n, a, l, u) {
  const s = qr(e), o = s !== e && !Fe(e), c = s[t];
  if (c !== Xo[t]) {
    const d = c.apply(e, u);
    return o ? ve(d) : d;
  }
  let r = n;
  s !== e && (o ? r = function(d, h) {
    return n.call(this, ve(d), h, e);
  } : n.length > 2 && (r = function(d, h) {
    return n.call(this, d, h, e);
  }));
  const i = c.call(s, r, a);
  return o && l ? l(i) : i;
}
function Ln(e, t, n, a) {
  const l = qr(e);
  let u = n;
  return l !== e && (Fe(e) ? n.length > 3 && (u = function(s, o, c) {
    return n.call(this, s, o, c, e);
  }) : u = function(s, o, c) {
    return n.call(this, s, ve(o), c, e);
  }), l[t](u, ...a);
}
function Lr(e, t, n) {
  const a = J(e);
  Pe(a, "iterate", Ts);
  const l = a[t](...n);
  return (l === -1 || l === !1) && kn(n[0]) ? (n[0] = J(n[0]), a[t](...n)) : l;
}
function ps(e, t, n = []) {
  yt(), hn();
  const a = J(e)[t].apply(e, n);
  return yn(), gt(), a;
}
const Yo = /* @__PURE__ */ cn("__proto__,__v_isRef,__isVue"), Fi = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(et)
);
function Qo(e) {
  et(e) || (e = String(e));
  const t = J(this);
  return Pe(t, "has", e), t.hasOwnProperty(e);
}
class Vi {
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
      return a === (l ? u ? ua : Zi : u ? Ui : Bi).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(a) ? t : void 0;
    const s = V(t);
    if (!l) {
      let c;
      if (s && (c = Go[n]))
        return c;
      if (n === "hasOwnProperty")
        return Qo;
    }
    const o = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      $e(t) ? t : a
    );
    return (et(n) ? Fi.has(n) : Yo(n)) || (l || Pe(t, "get", n), u) ? o : $e(o) ? s && fn(n) ? o : o.value : re(o) ? l ? Ki(o) : bn(o) : o;
  }
}
class Hi extends Vi {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, a, l) {
    let u = t[n];
    if (!this._isShallow) {
      const c = It(u);
      if (!Fe(a) && !It(a) && (u = J(u), a = J(a)), !V(t) && $e(u) && !$e(a))
        return c || (u.value = a), !0;
    }
    const s = V(t) && fn(n) ? Number(n) < t.length : G(t, n), o = Reflect.set(
      t,
      n,
      a,
      $e(t) ? t : l
    );
    return t === J(l) && (s ? $t(a, u) && dt(t, "set", n, a) : dt(t, "add", n, a)), o;
  }
  deleteProperty(t, n) {
    const a = G(t, n);
    t[n];
    const l = Reflect.deleteProperty(t, n);
    return l && a && dt(t, "delete", n, void 0), l;
  }
  has(t, n) {
    const a = Reflect.has(t, n);
    return (!et(n) || !Fi.has(n)) && Pe(t, "has", n), a;
  }
  ownKeys(t) {
    return Pe(
      t,
      "iterate",
      V(t) ? "length" : zt
    ), Reflect.ownKeys(t);
  }
}
class ea extends Vi {
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
const ta = /* @__PURE__ */ new Hi(), sa = /* @__PURE__ */ new ea(), ra = /* @__PURE__ */ new Hi(!0);
const Yr = (e) => e, Zs = (e) => Reflect.getPrototypeOf(e);
function na(e, t, n) {
  return function(...a) {
    const l = this.__v_raw, u = J(l), s = Ut(u), o = e === "entries" || e === Symbol.iterator && s, c = e === "keys" && s, r = l[e](...a), i = n ? Yr : t ? rr : ve;
    return !t && Pe(
      u,
      "iterate",
      c ? Xr : zt
    ), {
      // iterator protocol
      next() {
        const { value: d, done: h } = r.next();
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
function Ks(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function ia(e, t) {
  const n = {
    get(l) {
      const u = this.__v_raw, s = J(u), o = J(l);
      e || ($t(l, o) && Pe(s, "get", l), Pe(s, "get", o));
      const { has: c } = Zs(s), r = t ? Yr : e ? rr : ve;
      if (c.call(s, l))
        return r(u.get(l));
      if (c.call(s, o))
        return r(u.get(o));
      u !== s && u.get(l);
    },
    get size() {
      const l = this.__v_raw;
      return !e && Pe(J(l), "iterate", zt), l.size;
    },
    has(l) {
      const u = this.__v_raw, s = J(u), o = J(l);
      return e || ($t(l, o) && Pe(s, "has", l), Pe(s, "has", o)), l === o ? u.has(l) : u.has(l) || u.has(o);
    },
    forEach(l, u) {
      const s = this, o = s.__v_raw, c = J(o), r = t ? Yr : e ? rr : ve;
      return !e && Pe(c, "iterate", zt), o.forEach((i, d) => l.call(u, r(i), r(d), s));
    }
  };
  return xe(
    n,
    e ? {
      add: Ks("add"),
      set: Ks("set"),
      delete: Ks("delete"),
      clear: Ks("clear")
    } : {
      add(l) {
        !t && !Fe(l) && !It(l) && (l = J(l));
        const u = J(this);
        return Zs(u).has.call(u, l) || (u.add(l), dt(u, "add", l, l)), this;
      },
      set(l, u) {
        !t && !Fe(u) && !It(u) && (u = J(u));
        const s = J(this), { has: o, get: c } = Zs(s);
        let r = o.call(s, l);
        r || (l = J(l), r = o.call(s, l));
        const i = c.call(s, l);
        return s.set(l, u), r ? $t(u, i) && dt(s, "set", l, u) : dt(s, "add", l, u), this;
      },
      delete(l) {
        const u = J(this), { has: s, get: o } = Zs(u);
        let c = s.call(u, l);
        c || (l = J(l), c = s.call(u, l)), o && o.call(u, l);
        const r = u.delete(l);
        return c && dt(u, "delete", l, void 0), r;
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
    n[l] = na(l, e, t);
  }), n;
}
function vn(e, t) {
  const n = ia(e, t);
  return (a, l, u) => l === "__v_isReactive" ? !e : l === "__v_isReadonly" ? e : l === "__v_raw" ? a : Reflect.get(
    G(n, l) && l in a ? n : a,
    l,
    u
  );
}
const oa = {
  get: /* @__PURE__ */ vn(!1, !1)
}, aa = {
  get: /* @__PURE__ */ vn(!1, !0)
}, la = {
  get: /* @__PURE__ */ vn(!0, !1)
};
const Bi = /* @__PURE__ */ new WeakMap(), Ui = /* @__PURE__ */ new WeakMap(), Zi = /* @__PURE__ */ new WeakMap(), ua = /* @__PURE__ */ new WeakMap();
function ca(e) {
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
function da(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : ca(Co(e));
}
function bn(e) {
  return It(e) ? e : Pn(
    e,
    !1,
    ta,
    oa,
    Bi
  );
}
function pa(e) {
  return Pn(
    e,
    !1,
    ra,
    aa,
    Ui
  );
}
function Ki(e) {
  return Pn(
    e,
    !0,
    sa,
    la,
    Zi
  );
}
function Pn(e, t, n, a, l) {
  if (!re(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const u = da(e);
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
function Zt(e) {
  return It(e) ? Zt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function It(e) {
  return !!(e && e.__v_isReadonly);
}
function Fe(e) {
  return !!(e && e.__v_isShallow);
}
function kn(e) {
  return e ? !!e.__v_raw : !1;
}
function J(e) {
  const t = e && e.__v_raw;
  return t ? J(t) : e;
}
function fa(e) {
  return !G(e, "__v_skip") && Object.isExtensible(e) && ji(e, "__v_skip", !0), e;
}
const ve = (e) => re(e) ? bn(e) : e, rr = (e) => re(e) ? Ki(e) : e;
function $e(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function K(e) {
  return ma(e, !1);
}
function ma(e, t) {
  return $e(e) ? e : new ha(e, t);
}
class ha {
  constructor(t, n) {
    this.dep = new wn(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : J(t), this._value = n ? t : ve(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, a = this.__v_isShallow || Fe(t) || It(t);
    t = a ? t : J(t), $t(t, n) && (this._rawValue = t, this._value = a ? t : ve(t), this.dep.trigger());
  }
}
function Ji(e) {
  return $e(e) ? e.value : e;
}
const ya = {
  get: (e, t, n) => t === "__v_raw" ? e : Ji(Reflect.get(e, t, n)),
  set: (e, t, n, a) => {
    const l = e[t];
    return $e(l) && !$e(n) ? (l.value = n, !0) : Reflect.set(e, t, n, a);
  }
};
function Gi(e) {
  return Zt(e) ? e : new Proxy(e, ya);
}
class ga {
  constructor(t, n, a) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new wn(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = js - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = a;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    te !== this)
      return Ni(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return zi(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function wa(e, t, n = !1) {
  let a, l;
  return H(e) ? a = e : (a = e.get, l = e.set), new ga(a, l, n);
}
const Js = {}, nr = /* @__PURE__ */ new WeakMap();
let Ct;
function va(e, t = !1, n = Ct) {
  if (n) {
    let a = nr.get(n);
    a || nr.set(n, a = []), a.push(e);
  }
}
function ba(e, t, n = ee) {
  const { immediate: a, deep: l, once: u, scheduler: s, augmentJob: o, call: c } = n, r = (N) => l ? N : Fe(N) || l === !1 || l === 0 ? pt(N, 1) : pt(N);
  let i, d, h, p, f = !1, y = !1;
  if ($e(e) ? (d = () => e.value, f = Fe(e)) : Zt(e) ? (d = () => r(e), f = !0) : V(e) ? (y = !0, f = e.some((N) => Zt(N) || Fe(N)), d = () => e.map((N) => {
    if ($e(N))
      return N.value;
    if (Zt(N))
      return r(N);
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
    const N = Ct;
    Ct = i;
    try {
      return c ? c(e, 3, [p]) : e(p);
    } finally {
      Ct = N;
    }
  } : d = Qe, t && l) {
    const N = d, X = l === !0 ? 1 / 0 : l;
    d = () => pt(N(), X);
  }
  const P = Zo(), $ = () => {
    i.stop(), P && P.active && pn(P.effects, i);
  };
  if (u && t) {
    const N = t;
    t = (...X) => {
      N(...X), $();
    };
  }
  let O = y ? new Array(e.length).fill(Js) : Js;
  const C = (N) => {
    if (!(!(i.flags & 1) || !i.dirty && !N))
      if (t) {
        const X = i.run();
        if (l || f || (y ? X.some((he, oe) => $t(he, O[oe])) : $t(X, O))) {
          h && h();
          const he = Ct;
          Ct = i;
          try {
            const oe = [
              X,
              // pass undefined as the old value when it's changed for the first time
              O === Js ? void 0 : y && O[0] === Js ? [] : O,
              p
            ];
            O = X, c ? c(t, 3, oe) : (
              // @ts-expect-error
              t(...oe)
            );
          } finally {
            Ct = he;
          }
        }
      } else
        i.run();
  };
  return o && o(C), i = new Mi(d), i.scheduler = s ? () => s(C, !1) : C, p = (N) => va(N, !1, i), h = i.onStop = () => {
    const N = nr.get(i);
    if (N) {
      if (c)
        c(N, 4);
      else
        for (const X of N) X();
      nr.delete(i);
    }
  }, t ? a ? C(!0) : O = i.run() : s ? s(C.bind(null, !0), !0) : i.run(), $.pause = i.pause.bind(i), $.resume = i.resume.bind(i), $.stop = $, $;
}
function pt(e, t = 1 / 0, n) {
  if (t <= 0 || !re(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t))
    return e;
  if (n.set(e, t), t--, $e(e))
    pt(e.value, t, n);
  else if (V(e))
    for (let a = 0; a < e.length; a++)
      pt(e[a], t, n);
  else if (br(e) || Ut(e))
    e.forEach((a) => {
      pt(a, t, n);
    });
  else if (Ai(e)) {
    for (const a in e)
      pt(e[a], t, n);
    for (const a of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, a) && pt(e[a], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Ds(e, t, n, a) {
  try {
    return a ? e(...a) : e();
  } catch (l) {
    Sr(l, t, n);
  }
}
function tt(e, t, n, a) {
  if (H(e)) {
    const l = Ds(e, t, n, a);
    return l && xi(l) && l.catch((u) => {
      Sr(u, t, n);
    }), l;
  }
  if (V(e)) {
    const l = [];
    for (let u = 0; u < e.length; u++)
      l.push(tt(e[u], t, n, a));
    return l;
  }
}
function Sr(e, t, n, a = !0) {
  const l = t ? t.vnode : null, { errorHandler: u, throwUnhandledErrorInProduction: s } = t && t.appContext.config || ee;
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
      yt(), Ds(u, null, 10, [
        e,
        c,
        r
      ]), gt();
      return;
    }
  }
  Pa(e, n, l, a, s);
}
function Pa(e, t, n, a = !0, l = !1) {
  if (l)
    throw e;
  console.error(e);
}
const Se = [];
let Xe = -1;
const Kt = [];
let Pt = null, Ht = 0;
const Xi = /* @__PURE__ */ Promise.resolve();
let ir = null;
function $n(e) {
  const t = ir || Xi;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function ka(e) {
  let t = Xe + 1, n = Se.length;
  for (; t < n; ) {
    const a = t + n >>> 1, l = Se[a], u = Es(l);
    u < e || u === e && l.flags & 2 ? t = a + 1 : n = a;
  }
  return t;
}
function In(e) {
  if (!(e.flags & 1)) {
    const t = Es(e), n = Se[Se.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Es(n) ? Se.push(e) : Se.splice(ka(t), 0, e), e.flags |= 1, Yi();
  }
}
function Yi() {
  ir || (ir = Xi.then(eo));
}
function $a(e) {
  V(e) ? Kt.push(...e) : Pt && e.id === -1 ? Pt.splice(Ht + 1, 0, e) : e.flags & 1 || (Kt.push(e), e.flags |= 1), Yi();
}
function Rn(e, t, n = Xe + 1) {
  for (; n < Se.length; n++) {
    const a = Se[n];
    if (a && a.flags & 2) {
      if (e && a.id !== e.uid)
        continue;
      Se.splice(n, 1), n--, a.flags & 4 && (a.flags &= -2), a(), a.flags & 4 || (a.flags &= -2);
    }
  }
}
function Qi(e) {
  if (Kt.length) {
    const t = [...new Set(Kt)].sort(
      (n, a) => Es(n) - Es(a)
    );
    if (Kt.length = 0, Pt) {
      Pt.push(...t);
      return;
    }
    for (Pt = t, Ht = 0; Ht < Pt.length; Ht++) {
      const n = Pt[Ht];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    Pt = null, Ht = 0;
  }
}
const Es = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function eo(e) {
  try {
    for (Xe = 0; Xe < Se.length; Xe++) {
      const t = Se[Xe];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Ds(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Xe < Se.length; Xe++) {
      const t = Se[Xe];
      t && (t.flags &= -2);
    }
    Xe = -1, Se.length = 0, Qi(), ir = null, (Se.length || Kt.length) && eo();
  }
}
let ze = null, to = null;
function or(e) {
  const t = ze;
  return ze = e, to = e && e.type.__scopeId || null, t;
}
function Ia(e, t = ze, n) {
  if (!t || e._n)
    return e;
  const a = (...l) => {
    a._d && Jn(-1);
    const u = or(t);
    let s;
    try {
      s = e(...l);
    } finally {
      or(u), a._d && Jn(1);
    }
    return s;
  };
  return a._n = !0, a._c = !0, a._d = !0, a;
}
function fs(e, t) {
  if (ze === null)
    return e;
  const n = jr(ze), a = e.dirs || (e.dirs = []);
  for (let l = 0; l < t.length; l++) {
    let [u, s, o, c = ee] = t[l];
    u && (H(u) && (u = {
      mounted: u,
      updated: u
    }), u.deep && pt(s), a.push({
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
function Et(e, t, n, a) {
  const l = e.dirs, u = t && t.dirs;
  for (let s = 0; s < l.length; s++) {
    const o = l[s];
    u && (o.oldValue = u[s].value);
    let c = o.dir[a];
    c && (yt(), tt(c, n, 8, [
      e.el,
      o,
      e,
      t
    ]), gt());
  }
}
const qa = Symbol("_vte"), Sa = (e) => e.__isTeleport, xa = Symbol("_leaveCb");
function qn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, qn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function so(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const ar = /* @__PURE__ */ new WeakMap();
function qs(e, t, n, a, l = !1) {
  if (V(e)) {
    e.forEach(
      (f, y) => qs(
        f,
        t && (V(t) ? t[y] : t),
        n,
        a,
        l
      )
    );
    return;
  }
  if (Ss(a) && !l) {
    a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && qs(e, t, n, a.component.subTree);
    return;
  }
  const u = a.shapeFlag & 4 ? jr(a.component) : a.el, s = l ? null : u, { i: o, r: c } = e, r = t && t.r, i = o.refs === ee ? o.refs = {} : o.refs, d = o.setupState, h = J(d), p = d === ee ? Si : (f) => G(h, f);
  if (r != null && r !== c) {
    if (zn(t), pe(r))
      i[r] = null, p(r) && (d[r] = null);
    else if ($e(r)) {
      r.value = null;
      const f = t;
      f.k && (i[f.k] = null);
    }
  }
  if (H(c))
    Ds(c, o, 12, [s, i]);
  else {
    const f = pe(c), y = $e(c);
    if (f || y) {
      const P = () => {
        if (e.f) {
          const $ = f ? p(c) ? d[c] : i[c] : c.value;
          if (l)
            V($) && pn($, u);
          else if (V($))
            $.includes(u) || $.push(u);
          else if (f)
            i[c] = [u], p(c) && (d[c] = i[c]);
          else {
            const O = [u];
            c.value = O, e.k && (i[e.k] = O);
          }
        } else f ? (i[c] = s, p(c) && (d[c] = s)) : y && (c.value = s, e.k && (i[e.k] = s));
      };
      if (s) {
        const $ = () => {
          P(), ar.delete(e);
        };
        $.id = -1, ar.set(e, $), Ce($, n);
      } else
        zn(e), P();
    }
  }
}
function zn(e) {
  const t = ar.get(e);
  t && (t.flags |= 8, ar.delete(e));
}
$r().requestIdleCallback;
$r().cancelIdleCallback;
const Ss = (e) => !!e.type.__asyncLoader, ro = (e) => e.type.__isKeepAlive;
function _a(e, t) {
  no(e, "a", t);
}
function Aa(e, t) {
  no(e, "da", t);
}
function no(e, t, n = ke) {
  const a = e.__wdc || (e.__wdc = () => {
    let l = n;
    for (; l; ) {
      if (l.isDeactivated)
        return;
      l = l.parent;
    }
    return e();
  });
  if (xr(t, a, n), n) {
    let l = n.parent;
    for (; l && l.parent; )
      ro(l.parent.vnode) && ja(a, t, n, l), l = l.parent;
  }
}
function ja(e, t, n, a) {
  const l = xr(
    t,
    e,
    a,
    !0
    /* prepend */
  );
  io(() => {
    pn(a[t], l);
  }, n);
}
function xr(e, t, n = ke, a = !1) {
  if (n) {
    const l = n[e] || (n[e] = []), u = t.__weh || (t.__weh = (...s) => {
      yt();
      const o = Ws(n), c = tt(t, n, e, s);
      return o(), gt(), c;
    });
    return a ? l.unshift(u) : l.push(u), u;
  }
}
const wt = (e) => (t, n = ke) => {
  (!Ms || e === "sp") && xr(e, (...a) => t(...a), n);
}, Ta = wt("bm"), Sn = wt("m"), Ea = wt(
  "bu"
), Oa = wt("u"), xn = wt(
  "bum"
), io = wt("um"), Ma = wt(
  "sp"
), Ca = wt("rtg"), Na = wt("rtc");
function La(e, t = ke) {
  xr("ec", e, t);
}
const Ra = "components";
function za(e, t) {
  return Wa(Ra, e, !0, t) || e;
}
const Da = Symbol.for("v-ndc");
function Wa(e, t, n = !0, a = !1) {
  const l = ze || ke;
  if (l) {
    const u = l.type;
    {
      const o = jl(
        u,
        !1
      );
      if (o && (o === t || o === Ve(t) || o === kr(Ve(t))))
        return u;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      Dn(l[e] || u[e], t) || // global registration
      Dn(l.appContext[e], t)
    );
    return !s && a ? u : s;
  }
}
function Dn(e, t) {
  return e && (e[t] || e[Ve(t)] || e[kr(Ve(t))]);
}
function Be(e, t, n, a) {
  let l;
  const u = n, s = V(e);
  if (s || pe(e)) {
    const o = s && Zt(e);
    let c = !1, r = !1;
    o && (c = !Fe(e), r = It(e), e = qr(e)), l = new Array(e.length);
    for (let i = 0, d = e.length; i < d; i++)
      l[i] = t(
        c ? r ? rr(ve(e[i])) : ve(e[i]) : e[i],
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
      for (let c = 0, r = o.length; c < r; c++) {
        const i = o[c];
        l[c] = t(e[i], i, c, u);
      }
    }
  else
    l = [];
  return l;
}
const Qr = (e) => e ? xo(e) ? jr(e) : Qr(e.parent) : null, xs = (
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
    $parent: (e) => Qr(e.parent),
    $root: (e) => Qr(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => ao(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      In(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = $n.bind(e.proxy)),
    $watch: (e) => ul.bind(e)
  })
), Rr = (e, t) => e !== ee && !e.__isScriptSetup && G(e, t), Fa = {
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
        if (Rr(a, t))
          return s[t] = 1, a[t];
        if (l !== ee && G(l, t))
          return s[t] = 2, l[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (r = e.propsOptions[0]) && G(r, t)
        )
          return s[t] = 3, u[t];
        if (n !== ee && G(n, t))
          return s[t] = 4, n[t];
        en && (s[t] = 0);
      }
    }
    const i = xs[t];
    let d, h;
    if (i)
      return t === "$attrs" && Pe(e.attrs, "get", ""), i(e);
    if (
      // css module (injected by vue-loader)
      (d = o.__cssModules) && (d = d[t])
    )
      return d;
    if (n !== ee && G(n, t))
      return s[t] = 4, n[t];
    if (
      // global properties
      h = c.config.globalProperties, G(h, t)
    )
      return h[t];
  },
  set({ _: e }, t, n) {
    const { data: a, setupState: l, ctx: u } = e;
    return Rr(l, t) ? (l[t] = n, !0) : a !== ee && G(a, t) ? (a[t] = n, !0) : G(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (u[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: a, appContext: l, propsOptions: u, type: s }
  }, o) {
    let c, r;
    return !!(n[o] || e !== ee && o[0] !== "$" && G(e, o) || Rr(t, o) || (c = u[0]) && G(c, o) || G(a, o) || G(xs, o) || G(l.config.globalProperties, o) || (r = s.__cssModules) && r[o]);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : G(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Wn(e) {
  return V(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let en = !0;
function Va(e) {
  const t = ao(e), n = e.proxy, a = e.ctx;
  en = !1, t.beforeCreate && Fn(t.beforeCreate, e, "bc");
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
    mounted: h,
    beforeUpdate: p,
    updated: f,
    activated: y,
    deactivated: P,
    beforeDestroy: $,
    beforeUnmount: O,
    destroyed: C,
    unmounted: N,
    render: X,
    renderTracked: he,
    renderTriggered: oe,
    errorCaptured: fe,
    serverPrefetch: st,
    // public API
    expose: _e,
    inheritAttrs: rt,
    // assets
    components: ye,
    directives: Je,
    filters: nt
  } = t;
  if (r && Ha(r, a, null), s)
    for (const U in s) {
      const Y = s[U];
      H(Y) && (a[U] = Y.bind(n));
    }
  if (l) {
    const U = l.call(n, n);
    re(U) && (e.data = bn(U));
  }
  if (en = !0, u)
    for (const U in u) {
      const Y = u[U], it = H(Y) ? Y.bind(n, n) : H(Y.get) ? Y.get.bind(n, n) : Qe, Dt = !H(Y) && H(Y.set) ? Y.set.bind(n) : Qe, ot = Re({
        get: it,
        set: Dt
      });
      Object.defineProperty(a, U, {
        enumerable: !0,
        configurable: !0,
        get: () => ot.value,
        set: (Ee) => ot.value = Ee
      });
    }
  if (o)
    for (const U in o)
      oo(o[U], a, n, U);
  if (c) {
    const U = H(c) ? c.call(n) : c;
    Reflect.ownKeys(U).forEach((Y) => {
      Ga(Y, U[Y]);
    });
  }
  i && Fn(i, e, "c");
  function me(U, Y) {
    V(Y) ? Y.forEach((it) => U(it.bind(n))) : Y && U(Y.bind(n));
  }
  if (me(Ta, d), me(Sn, h), me(Ea, p), me(Oa, f), me(_a, y), me(Aa, P), me(La, fe), me(Na, he), me(Ca, oe), me(xn, O), me(io, N), me(Ma, st), V(_e))
    if (_e.length) {
      const U = e.exposed || (e.exposed = {});
      _e.forEach((Y) => {
        Object.defineProperty(U, Y, {
          get: () => n[Y],
          set: (it) => n[Y] = it,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  X && e.render === Qe && (e.render = X), rt != null && (e.inheritAttrs = rt), ye && (e.components = ye), Je && (e.directives = Je), st && so(e);
}
function Ha(e, t, n = Qe) {
  V(e) && (e = tn(e));
  for (const a in e) {
    const l = e[a];
    let u;
    re(l) ? "default" in l ? u = Qs(
      l.from || a,
      l.default,
      !0
    ) : u = Qs(l.from || a) : u = Qs(l), $e(u) ? Object.defineProperty(t, a, {
      enumerable: !0,
      configurable: !0,
      get: () => u.value,
      set: (s) => u.value = s
    }) : t[a] = u;
  }
}
function Fn(e, t, n) {
  tt(
    V(e) ? e.map((a) => a.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function oo(e, t, n, a) {
  let l = a.includes(".") ? Po(n, a) : () => n[a];
  if (pe(e)) {
    const u = t[e];
    H(u) && _s(l, u);
  } else if (H(e))
    _s(l, e.bind(n));
  else if (re(e))
    if (V(e))
      e.forEach((u) => oo(u, t, n, a));
    else {
      const u = H(e.handler) ? e.handler.bind(n) : t[e.handler];
      H(u) && _s(l, u, e);
    }
}
function ao(e) {
  const t = e.type, { mixins: n, extends: a } = t, {
    mixins: l,
    optionsCache: u,
    config: { optionMergeStrategies: s }
  } = e.appContext, o = u.get(t);
  let c;
  return o ? c = o : !l.length && !n && !a ? c = t : (c = {}, l.length && l.forEach(
    (r) => lr(c, r, s, !0)
  ), lr(c, t, s)), re(t) && u.set(t, c), c;
}
function lr(e, t, n, a = !1) {
  const { mixins: l, extends: u } = t;
  u && lr(e, u, n, !0), l && l.forEach(
    (s) => lr(e, s, n, !0)
  );
  for (const s in t)
    if (!(a && s === "expose")) {
      const o = Ba[s] || n && n[s];
      e[s] = o ? o(e[s], t[s]) : t[s];
    }
  return e;
}
const Ba = {
  data: Vn,
  props: Hn,
  emits: Hn,
  // objects
  methods: vs,
  computed: vs,
  // lifecycle
  beforeCreate: qe,
  created: qe,
  beforeMount: qe,
  mounted: qe,
  beforeUpdate: qe,
  updated: qe,
  beforeDestroy: qe,
  beforeUnmount: qe,
  destroyed: qe,
  unmounted: qe,
  activated: qe,
  deactivated: qe,
  errorCaptured: qe,
  serverPrefetch: qe,
  // assets
  components: vs,
  directives: vs,
  // watch
  watch: Za,
  // provide / inject
  provide: Vn,
  inject: Ua
};
function Vn(e, t) {
  return t ? e ? function() {
    return xe(
      H(e) ? e.call(this, this) : e,
      H(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Ua(e, t) {
  return vs(tn(e), tn(t));
}
function tn(e) {
  if (V(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function qe(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function vs(e, t) {
  return e ? xe(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Hn(e, t) {
  return e ? V(e) && V(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : xe(
    /* @__PURE__ */ Object.create(null),
    Wn(e),
    Wn(t ?? {})
  ) : t;
}
function Za(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = xe(/* @__PURE__ */ Object.create(null), e);
  for (const a in t)
    n[a] = qe(e[a], t[a]);
  return n;
}
function lo() {
  return {
    app: null,
    config: {
      isNativeTag: Si,
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
let Ka = 0;
function Ja(e, t) {
  return function(a, l = null) {
    H(a) || (a = xe({}, a)), l != null && !re(l) && (l = null);
    const u = lo(), s = /* @__PURE__ */ new WeakSet(), o = [];
    let c = !1;
    const r = u.app = {
      _uid: Ka++,
      _component: a,
      _props: l,
      _container: null,
      _context: u,
      _instance: null,
      version: El,
      get config() {
        return u.config;
      },
      set config(i) {
      },
      use(i, ...d) {
        return s.has(i) || (i && H(i.install) ? (s.add(i), i.install(r, ...d)) : H(i) && (s.add(i), i(r, ...d))), r;
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
      mount(i, d, h) {
        if (!c) {
          const p = r._ceVNode || Ke(a, l);
          return p.appContext = u, h === !0 ? h = "svg" : h === !1 && (h = void 0), e(p, i, h), c = !0, r._container = i, i.__vue_app__ = r, jr(p.component);
        }
      },
      onUnmount(i) {
        o.push(i);
      },
      unmount() {
        c && (tt(
          o,
          r._instance,
          16
        ), e(null, r._container), delete r._container.__vue_app__);
      },
      provide(i, d) {
        return u.provides[i] = d, r;
      },
      runWithContext(i) {
        const d = Jt;
        Jt = r;
        try {
          return i();
        } finally {
          Jt = d;
        }
      }
    };
    return r;
  };
}
let Jt = null;
function Ga(e, t) {
  if (ke) {
    let n = ke.provides;
    const a = ke.parent && ke.parent.provides;
    a === n && (n = ke.provides = Object.create(a)), n[e] = t;
  }
}
function Qs(e, t, n = !1) {
  const a = ql();
  if (a || Jt) {
    let l = Jt ? Jt._context.provides : a ? a.parent == null || a.ce ? a.vnode.appContext && a.vnode.appContext.provides : a.parent.provides : void 0;
    if (l && e in l)
      return l[e];
    if (arguments.length > 1)
      return n && H(t) ? t.call(a && a.proxy) : t;
  }
}
const uo = {}, co = () => Object.create(uo), po = (e) => Object.getPrototypeOf(e) === uo;
function Xa(e, t, n, a = !1) {
  const l = {}, u = co();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), fo(e, t, l, u);
  for (const s in e.propsOptions[0])
    s in l || (l[s] = void 0);
  n ? e.props = a ? l : pa(l) : e.type.props ? e.props = l : e.props = u, e.attrs = u;
}
function Ya(e, t, n, a) {
  const {
    props: l,
    attrs: u,
    vnode: { patchFlag: s }
  } = e, o = J(l), [c] = e.propsOptions;
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
        let h = i[d];
        if (_r(e.emitsOptions, h))
          continue;
        const p = t[h];
        if (c)
          if (G(u, h))
            p !== u[h] && (u[h] = p, r = !0);
          else {
            const f = Ve(h);
            l[f] = sn(
              c,
              o,
              f,
              p,
              e,
              !1
            );
          }
        else
          p !== u[h] && (u[h] = p, r = !0);
      }
    }
  } else {
    fo(e, t, l, u) && (r = !0);
    let i;
    for (const d in o)
      (!t || // for camelCase
      !G(t, d) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((i = xt(d)) === d || !G(t, i))) && (c ? n && // for camelCase
      (n[d] !== void 0 || // for kebab-case
      n[i] !== void 0) && (l[d] = sn(
        c,
        o,
        d,
        void 0,
        e,
        !0
      )) : delete l[d]);
    if (u !== o)
      for (const d in u)
        (!t || !G(t, d)) && (delete u[d], r = !0);
  }
  r && dt(e.attrs, "set", "");
}
function fo(e, t, n, a) {
  const [l, u] = e.propsOptions;
  let s = !1, o;
  if (t)
    for (let c in t) {
      if (ks(c))
        continue;
      const r = t[c];
      let i;
      l && G(l, i = Ve(c)) ? !u || !u.includes(i) ? n[i] = r : (o || (o = {}))[i] = r : _r(e.emitsOptions, c) || (!(c in a) || r !== a[c]) && (a[c] = r, s = !0);
    }
  if (u) {
    const c = J(n), r = o || ee;
    for (let i = 0; i < u.length; i++) {
      const d = u[i];
      n[d] = sn(
        l,
        c,
        d,
        r[d],
        e,
        !G(r, d)
      );
    }
  }
  return s;
}
function sn(e, t, n, a, l, u) {
  const s = e[n];
  if (s != null) {
    const o = G(s, "default");
    if (o && a === void 0) {
      const c = s.default;
      if (s.type !== Function && !s.skipFactory && H(c)) {
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
const Qa = /* @__PURE__ */ new WeakMap();
function mo(e, t, n = !1) {
  const a = n ? Qa : t.propsCache, l = a.get(e);
  if (l)
    return l;
  const u = e.props, s = {}, o = [];
  let c = !1;
  if (!H(e)) {
    const i = (d) => {
      c = !0;
      const [h, p] = mo(d, t, !0);
      xe(s, h), p && o.push(...p);
    };
    !n && t.mixins.length && t.mixins.forEach(i), e.extends && i(e.extends), e.mixins && e.mixins.forEach(i);
  }
  if (!u && !c)
    return re(e) && a.set(e, Bt), Bt;
  if (V(u))
    for (let i = 0; i < u.length; i++) {
      const d = Ve(u[i]);
      Bn(d) && (s[d] = ee);
    }
  else if (u)
    for (const i in u) {
      const d = Ve(i);
      if (Bn(d)) {
        const h = u[i], p = s[d] = V(h) || H(h) ? { type: h } : xe({}, h), f = p.type;
        let y = !1, P = !0;
        if (V(f))
          for (let $ = 0; $ < f.length; ++$) {
            const O = f[$], C = H(O) && O.name;
            if (C === "Boolean") {
              y = !0;
              break;
            } else C === "String" && (P = !1);
          }
        else
          y = H(f) && f.name === "Boolean";
        p[
          0
          /* shouldCast */
        ] = y, p[
          1
          /* shouldCastTrue */
        ] = P, (y || G(p, "default")) && o.push(d);
      }
    }
  const r = [s, o];
  return re(e) && a.set(e, r), r;
}
function Bn(e) {
  return e[0] !== "$" && !ks(e);
}
const _n = (e) => e === "_" || e === "_ctx" || e === "$stable", An = (e) => V(e) ? e.map(Ye) : [Ye(e)], el = (e, t, n) => {
  if (t._n)
    return t;
  const a = Ia((...l) => An(t(...l)), n);
  return a._c = !1, a;
}, ho = (e, t, n) => {
  const a = e._ctx;
  for (const l in e) {
    if (_n(l)) continue;
    const u = e[l];
    if (H(u))
      t[l] = el(l, u, a);
    else if (u != null) {
      const s = An(u);
      t[l] = () => s;
    }
  }
}, yo = (e, t) => {
  const n = An(t);
  e.slots.default = () => n;
}, go = (e, t, n) => {
  for (const a in t)
    (n || !_n(a)) && (e[a] = t[a]);
}, tl = (e, t, n) => {
  const a = e.slots = co();
  if (e.vnode.shapeFlag & 32) {
    const l = t._;
    l ? (go(a, t, n), n && ji(a, "_", l, !0)) : ho(t, a);
  } else t && yo(e, t);
}, sl = (e, t, n) => {
  const { vnode: a, slots: l } = e;
  let u = !0, s = ee;
  if (a.shapeFlag & 32) {
    const o = t._;
    o ? n && o === 1 ? u = !1 : go(l, t, n) : (u = !t.$stable, ho(t, l)), s = t;
  } else t && (yo(e, t), s = { default: 1 });
  if (u)
    for (const o in l)
      !_n(o) && s[o] == null && delete l[o];
}, Ce = gl;
function rl(e) {
  return nl(e);
}
function nl(e, t) {
  const n = $r();
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
    nextSibling: h,
    setScopeId: p = Qe,
    insertStaticContent: f
  } = e, y = (m, w, b, x = null, S = null, I = null, E = void 0, j = null, A = !!w.dynamicChildren) => {
    if (m === w)
      return;
    m && !ms(m, w) && (x = at(m), Ee(m, S, I, !0), m = null), w.patchFlag === -2 && (A = !1, w.dynamicChildren = null);
    const { type: _, ref: W, shapeFlag: T } = w;
    switch (_) {
      case Ar:
        P(m, w, b, x);
        break;
      case qt:
        $(m, w, b, x);
        break;
      case Dr:
        m == null && O(w, b, x, E);
        break;
      case se:
        ye(
          m,
          w,
          b,
          x,
          S,
          I,
          E,
          j,
          A
        );
        break;
      default:
        T & 1 ? X(
          m,
          w,
          b,
          x,
          S,
          I,
          E,
          j,
          A
        ) : T & 6 ? Je(
          m,
          w,
          b,
          x,
          S,
          I,
          E,
          j,
          A
        ) : (T & 64 || T & 128) && _.process(
          m,
          w,
          b,
          x,
          S,
          I,
          E,
          j,
          A,
          _t
        );
    }
    W != null && S ? qs(W, m && m.ref, I, w || m, !w) : W == null && m && m.ref != null && qs(m.ref, null, I, m, !0);
  }, P = (m, w, b, x) => {
    if (m == null)
      a(
        w.el = o(w.children),
        b,
        x
      );
    else {
      const S = w.el = m.el;
      w.children !== m.children && r(S, w.children);
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
    let S;
    for (; m && m !== w; )
      S = h(m), a(m, b, x), m = S;
    a(w, b, x);
  }, N = ({ el: m, anchor: w }) => {
    let b;
    for (; m && m !== w; )
      b = h(m), l(m), m = b;
    l(w);
  }, X = (m, w, b, x, S, I, E, j, A) => {
    w.type === "svg" ? E = "svg" : w.type === "math" && (E = "mathml"), m == null ? he(
      w,
      b,
      x,
      S,
      I,
      E,
      j,
      A
    ) : st(
      m,
      w,
      S,
      I,
      E,
      j,
      A
    );
  }, he = (m, w, b, x, S, I, E, j) => {
    let A, _;
    const { props: W, shapeFlag: T, transition: M, dirs: F } = m;
    if (A = m.el = s(
      m.type,
      I,
      W && W.is,
      W
    ), T & 8 ? i(A, m.children) : T & 16 && fe(
      m.children,
      A,
      null,
      x,
      S,
      zr(m, I),
      E,
      j
    ), F && Et(m, null, x, "created"), oe(A, m, m.scopeId, E, x), W) {
      for (const Q in W)
        Q !== "value" && !ks(Q) && u(A, Q, null, W[Q], I, x);
      "value" in W && u(A, "value", null, W.value, I), (_ = W.onVnodeBeforeMount) && Ge(_, x, m);
    }
    F && Et(m, null, x, "beforeMount");
    const B = il(S, M);
    B && M.beforeEnter(A), a(A, w, b), ((_ = W && W.onVnodeMounted) || B || F) && Ce(() => {
      _ && Ge(_, x, m), B && M.enter(A), F && Et(m, null, x, "mounted");
    }, S);
  }, oe = (m, w, b, x, S) => {
    if (b && p(m, b), x)
      for (let I = 0; I < x.length; I++)
        p(m, x[I]);
    if (S) {
      let I = S.subTree;
      if (w === I || $o(I.type) && (I.ssContent === w || I.ssFallback === w)) {
        const E = S.vnode;
        oe(
          m,
          E,
          E.scopeId,
          E.slotScopeIds,
          S.parent
        );
      }
    }
  }, fe = (m, w, b, x, S, I, E, j, A = 0) => {
    for (let _ = A; _ < m.length; _++) {
      const W = m[_] = j ? kt(m[_]) : Ye(m[_]);
      y(
        null,
        W,
        w,
        b,
        x,
        S,
        I,
        E,
        j
      );
    }
  }, st = (m, w, b, x, S, I, E) => {
    const j = w.el = m.el;
    let { patchFlag: A, dynamicChildren: _, dirs: W } = w;
    A |= m.patchFlag & 16;
    const T = m.props || ee, M = w.props || ee;
    let F;
    if (b && Ot(b, !1), (F = M.onVnodeBeforeUpdate) && Ge(F, b, w, m), W && Et(w, m, b, "beforeUpdate"), b && Ot(b, !0), (T.innerHTML && M.innerHTML == null || T.textContent && M.textContent == null) && i(j, ""), _ ? _e(
      m.dynamicChildren,
      _,
      j,
      b,
      x,
      zr(w, S),
      I
    ) : E || Y(
      m,
      w,
      j,
      null,
      b,
      x,
      zr(w, S),
      I,
      !1
    ), A > 0) {
      if (A & 16)
        rt(j, T, M, b, S);
      else if (A & 2 && T.class !== M.class && u(j, "class", null, M.class, S), A & 4 && u(j, "style", T.style, M.style, S), A & 8) {
        const B = w.dynamicProps;
        for (let Q = 0; Q < B.length; Q++) {
          const Z = B[Q], ae = T[Z], be = M[Z];
          (be !== ae || Z === "value") && u(j, Z, ae, be, S, b);
        }
      }
      A & 1 && m.children !== w.children && i(j, w.children);
    } else !E && _ == null && rt(j, T, M, b, S);
    ((F = M.onVnodeUpdated) || W) && Ce(() => {
      F && Ge(F, b, w, m), W && Et(w, m, b, "updated");
    }, x);
  }, _e = (m, w, b, x, S, I, E) => {
    for (let j = 0; j < w.length; j++) {
      const A = m[j], _ = w[j], W = (
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
      y(
        A,
        _,
        W,
        null,
        x,
        S,
        I,
        E,
        !0
      );
    }
  }, rt = (m, w, b, x, S) => {
    if (w !== b) {
      if (w !== ee)
        for (const I in w)
          !ks(I) && !(I in b) && u(
            m,
            I,
            w[I],
            null,
            S,
            x
          );
      for (const I in b) {
        if (ks(I)) continue;
        const E = b[I], j = w[I];
        E !== j && I !== "value" && u(m, I, j, E, S, x);
      }
      "value" in b && u(m, "value", w.value, b.value, S);
    }
  }, ye = (m, w, b, x, S, I, E, j, A) => {
    const _ = w.el = m ? m.el : o(""), W = w.anchor = m ? m.anchor : o("");
    let { patchFlag: T, dynamicChildren: M, slotScopeIds: F } = w;
    F && (j = j ? j.concat(F) : F), m == null ? (a(_, b, x), a(W, b, x), fe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      w.children || [],
      b,
      W,
      S,
      I,
      E,
      j,
      A
    )) : T > 0 && T & 64 && M && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    m.dynamicChildren ? (_e(
      m.dynamicChildren,
      M,
      b,
      S,
      I,
      E,
      j
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (w.key != null || S && w === S.subTree) && wo(
      m,
      w,
      !0
      /* shallow */
    )) : Y(
      m,
      w,
      b,
      W,
      S,
      I,
      E,
      j,
      A
    );
  }, Je = (m, w, b, x, S, I, E, j, A) => {
    w.slotScopeIds = j, m == null ? w.shapeFlag & 512 ? S.ctx.activate(
      w,
      b,
      x,
      E,
      A
    ) : nt(
      w,
      b,
      x,
      S,
      I,
      E,
      A
    ) : us(m, w, A);
  }, nt = (m, w, b, x, S, I, E) => {
    const j = m.component = Il(
      m,
      x,
      S
    );
    if (ro(m) && (j.ctx.renderer = _t), Sl(j, !1, E), j.asyncDep) {
      if (S && S.registerDep(j, me, E), !m.el) {
        const A = j.subTree = Ke(qt);
        $(null, A, w, b), m.placeholder = A.el;
      }
    } else
      me(
        j,
        m,
        w,
        b,
        S,
        I,
        E
      );
  }, us = (m, w, b) => {
    const x = w.component = m.component;
    if (hl(m, w, b))
      if (x.asyncDep && !x.asyncResolved) {
        U(x, w, b);
        return;
      } else
        x.next = w, x.update();
    else
      w.el = m.el, x.vnode = w;
  }, me = (m, w, b, x, S, I, E) => {
    const j = () => {
      if (m.isMounted) {
        let { next: T, bu: M, u: F, parent: B, vnode: Q } = m;
        {
          const Me = vo(m);
          if (Me) {
            T && (T.el = Q.el, U(m, T, E)), Me.asyncDep.then(() => {
              m.isUnmounted || j();
            });
            return;
          }
        }
        let Z = T, ae;
        Ot(m, !1), T ? (T.el = Q.el, U(m, T, E)) : T = Q, M && Ys(M), (ae = T.props && T.props.onVnodeBeforeUpdate) && Ge(ae, B, T, Q), Ot(m, !0);
        const be = Zn(m), Oe = m.subTree;
        m.subTree = be, y(
          Oe,
          be,
          // parent may have changed if it's in a teleport
          d(Oe.el),
          // anchor may have changed if it's in a fragment
          at(Oe),
          m,
          S,
          I
        ), T.el = be.el, Z === null && yl(m, be.el), F && Ce(F, S), (ae = T.props && T.props.onVnodeUpdated) && Ce(
          () => Ge(ae, B, T, Q),
          S
        );
      } else {
        let T;
        const { el: M, props: F } = w, { bm: B, m: Q, parent: Z, root: ae, type: be } = m, Oe = Ss(w);
        Ot(m, !1), B && Ys(B), !Oe && (T = F && F.onVnodeBeforeMount) && Ge(T, Z, w), Ot(m, !0);
        {
          ae.ce && // @ts-expect-error _def is private
          ae.ce._def.shadowRoot !== !1 && ae.ce._injectChildStyle(be);
          const Me = m.subTree = Zn(m);
          y(
            null,
            Me,
            b,
            x,
            m,
            S,
            I
          ), w.el = Me.el;
        }
        if (Q && Ce(Q, S), !Oe && (T = F && F.onVnodeMounted)) {
          const Me = w;
          Ce(
            () => Ge(T, Z, Me),
            S
          );
        }
        (w.shapeFlag & 256 || Z && Ss(Z.vnode) && Z.vnode.shapeFlag & 256) && m.a && Ce(m.a, S), m.isMounted = !0, w = b = x = null;
      }
    };
    m.scope.on();
    const A = m.effect = new Mi(j);
    m.scope.off();
    const _ = m.update = A.run.bind(A), W = m.job = A.runIfDirty.bind(A);
    W.i = m, W.id = m.uid, A.scheduler = () => In(W), Ot(m, !0), _();
  }, U = (m, w, b) => {
    w.component = m;
    const x = m.vnode.props;
    m.vnode = w, m.next = null, Ya(m, w.props, x, b), sl(m, w.children, b), yt(), Rn(m), gt();
  }, Y = (m, w, b, x, S, I, E, j, A = !1) => {
    const _ = m && m.children, W = m ? m.shapeFlag : 0, T = w.children, { patchFlag: M, shapeFlag: F } = w;
    if (M > 0) {
      if (M & 128) {
        Dt(
          _,
          T,
          b,
          x,
          S,
          I,
          E,
          j,
          A
        );
        return;
      } else if (M & 256) {
        it(
          _,
          T,
          b,
          x,
          S,
          I,
          E,
          j,
          A
        );
        return;
      }
    }
    F & 8 ? (W & 16 && vt(_, S, I), T !== _ && i(b, T)) : W & 16 ? F & 16 ? Dt(
      _,
      T,
      b,
      x,
      S,
      I,
      E,
      j,
      A
    ) : vt(_, S, I, !0) : (W & 8 && i(b, ""), F & 16 && fe(
      T,
      b,
      x,
      S,
      I,
      E,
      j,
      A
    ));
  }, it = (m, w, b, x, S, I, E, j, A) => {
    m = m || Bt, w = w || Bt;
    const _ = m.length, W = w.length, T = Math.min(_, W);
    let M;
    for (M = 0; M < T; M++) {
      const F = w[M] = A ? kt(w[M]) : Ye(w[M]);
      y(
        m[M],
        F,
        b,
        null,
        S,
        I,
        E,
        j,
        A
      );
    }
    _ > W ? vt(
      m,
      S,
      I,
      !0,
      !1,
      T
    ) : fe(
      w,
      b,
      x,
      S,
      I,
      E,
      j,
      A,
      T
    );
  }, Dt = (m, w, b, x, S, I, E, j, A) => {
    let _ = 0;
    const W = w.length;
    let T = m.length - 1, M = W - 1;
    for (; _ <= T && _ <= M; ) {
      const F = m[_], B = w[_] = A ? kt(w[_]) : Ye(w[_]);
      if (ms(F, B))
        y(
          F,
          B,
          b,
          null,
          S,
          I,
          E,
          j,
          A
        );
      else
        break;
      _++;
    }
    for (; _ <= T && _ <= M; ) {
      const F = m[T], B = w[M] = A ? kt(w[M]) : Ye(w[M]);
      if (ms(F, B))
        y(
          F,
          B,
          b,
          null,
          S,
          I,
          E,
          j,
          A
        );
      else
        break;
      T--, M--;
    }
    if (_ > T) {
      if (_ <= M) {
        const F = M + 1, B = F < W ? w[F].el : x;
        for (; _ <= M; )
          y(
            null,
            w[_] = A ? kt(w[_]) : Ye(w[_]),
            b,
            B,
            S,
            I,
            E,
            j,
            A
          ), _++;
      }
    } else if (_ > M)
      for (; _ <= T; )
        Ee(m[_], S, I, !0), _++;
    else {
      const F = _, B = _, Q = /* @__PURE__ */ new Map();
      for (_ = B; _ <= M; _++) {
        const Ie = w[_] = A ? kt(w[_]) : Ye(w[_]);
        Ie.key != null && Q.set(Ie.key, _);
      }
      let Z, ae = 0;
      const be = M - B + 1;
      let Oe = !1, Me = 0;
      const jt = new Array(be);
      for (_ = 0; _ < be; _++) jt[_] = 0;
      for (_ = F; _ <= T; _++) {
        const Ie = m[_];
        if (ae >= be) {
          Ee(Ie, S, I, !0);
          continue;
        }
        let We;
        if (Ie.key != null)
          We = Q.get(Ie.key);
        else
          for (Z = B; Z <= M; Z++)
            if (jt[Z - B] === 0 && ms(Ie, w[Z])) {
              We = Z;
              break;
            }
        We === void 0 ? Ee(Ie, S, I, !0) : (jt[We - B] = _ + 1, We >= Me ? Me = We : Oe = !0, y(
          Ie,
          w[We],
          b,
          null,
          S,
          I,
          E,
          j,
          A
        ), ae++);
      }
      const Bs = Oe ? ol(jt) : Bt;
      for (Z = Bs.length - 1, _ = be - 1; _ >= 0; _--) {
        const Ie = B + _, We = w[Ie], Tt = w[Ie + 1], ds = Ie + 1 < W ? (
          // #13559, fallback to el placeholder for unresolved async component
          Tt.el || Tt.placeholder
        ) : x;
        jt[_] === 0 ? y(
          null,
          We,
          b,
          ds,
          S,
          I,
          E,
          j,
          A
        ) : Oe && (Z < 0 || _ !== Bs[Z] ? ot(We, b, ds, 2) : Z--);
      }
    }
  }, ot = (m, w, b, x, S = null) => {
    const { el: I, type: E, transition: j, children: A, shapeFlag: _ } = m;
    if (_ & 6) {
      ot(m.component.subTree, w, b, x);
      return;
    }
    if (_ & 128) {
      m.suspense.move(w, b, x);
      return;
    }
    if (_ & 64) {
      E.move(m, w, b, _t);
      return;
    }
    if (E === se) {
      a(I, w, b);
      for (let T = 0; T < A.length; T++)
        ot(A[T], w, b, x);
      a(m.anchor, w, b);
      return;
    }
    if (E === Dr) {
      C(m, w, b);
      return;
    }
    if (x !== 2 && _ & 1 && j)
      if (x === 0)
        j.beforeEnter(I), a(I, w, b), Ce(() => j.enter(I), S);
      else {
        const { leave: T, delayLeave: M, afterLeave: F } = j, B = () => {
          m.ctx.isUnmounted ? l(I) : a(I, w, b);
        }, Q = () => {
          I._isLeaving && I[xa](
            !0
            /* cancelled */
          ), T(I, () => {
            B(), F && F();
          });
        };
        M ? M(I, B, Q) : Q();
      }
    else
      a(I, w, b);
  }, Ee = (m, w, b, x = !1, S = !1) => {
    const {
      type: I,
      props: E,
      ref: j,
      children: A,
      dynamicChildren: _,
      shapeFlag: W,
      patchFlag: T,
      dirs: M,
      cacheIndex: F
    } = m;
    if (T === -2 && (S = !1), j != null && (yt(), qs(j, null, b, m, !0), gt()), F != null && (w.renderCache[F] = void 0), W & 256) {
      w.ctx.deactivate(m);
      return;
    }
    const B = W & 1 && M, Q = !Ss(m);
    let Z;
    if (Q && (Z = E && E.onVnodeBeforeUnmount) && Ge(Z, w, m), W & 6)
      Ft(m.component, b, x);
    else {
      if (W & 128) {
        m.suspense.unmount(b, x);
        return;
      }
      B && Et(m, null, w, "beforeUnmount"), W & 64 ? m.type.remove(
        m,
        w,
        b,
        _t,
        x
      ) : _ && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !_.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (I !== se || T > 0 && T & 64) ? vt(
        _,
        w,
        b,
        !1,
        !0
      ) : (I === se && T & 384 || !S && W & 16) && vt(A, w, b), x && Wt(m);
    }
    (Q && (Z = E && E.onVnodeUnmounted) || B) && Ce(() => {
      Z && Ge(Z, w, m), B && Et(m, null, w, "unmounted");
    }, b);
  }, Wt = (m) => {
    const { type: w, el: b, anchor: x, transition: S } = m;
    if (w === se) {
      Vs(b, x);
      return;
    }
    if (w === Dr) {
      N(m);
      return;
    }
    const I = () => {
      l(b), S && !S.persisted && S.afterLeave && S.afterLeave();
    };
    if (m.shapeFlag & 1 && S && !S.persisted) {
      const { leave: E, delayLeave: j } = S, A = () => E(b, I);
      j ? j(m.el, I, A) : A();
    } else
      I();
  }, Vs = (m, w) => {
    let b;
    for (; m !== w; )
      b = h(m), l(m), m = b;
    l(w);
  }, Ft = (m, w, b) => {
    const { bum: x, scope: S, job: I, subTree: E, um: j, m: A, a: _ } = m;
    Un(A), Un(_), x && Ys(x), S.stop(), I && (I.flags |= 8, Ee(E, m, w, b)), j && Ce(j, w), Ce(() => {
      m.isUnmounted = !0;
    }, w);
  }, vt = (m, w, b, x = !1, S = !1, I = 0) => {
    for (let E = I; E < m.length; E++)
      Ee(m[E], w, b, x, S);
  }, at = (m) => {
    if (m.shapeFlag & 6)
      return at(m.component.subTree);
    if (m.shapeFlag & 128)
      return m.suspense.next();
    const w = h(m.anchor || m.el), b = w && w[qa];
    return b ? h(b) : w;
  };
  let cs = !1;
  const Hs = (m, w, b) => {
    m == null ? w._vnode && Ee(w._vnode, null, null, !0) : y(
      w._vnode || null,
      m,
      w,
      null,
      null,
      null,
      b
    ), w._vnode = m, cs || (cs = !0, Rn(), Qi(), cs = !1);
  }, _t = {
    p: y,
    um: Ee,
    m: ot,
    r: Wt,
    mt: nt,
    mc: fe,
    pc: Y,
    pbc: _e,
    n: at,
    o: e
  };
  return {
    render: Hs,
    hydrate: void 0,
    createApp: Ja(Hs)
  };
}
function zr({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Ot({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function il(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function wo(e, t, n = !1) {
  const a = e.children, l = t.children;
  if (V(a) && V(l))
    for (let u = 0; u < a.length; u++) {
      const s = a[u];
      let o = l[u];
      o.shapeFlag & 1 && !o.dynamicChildren && ((o.patchFlag <= 0 || o.patchFlag === 32) && (o = l[u] = kt(l[u]), o.el = s.el), !n && o.patchFlag !== -2 && wo(s, o)), o.type === Ar && // avoid cached text nodes retaining detached dom nodes
      o.patchFlag !== -1 && (o.el = s.el), o.type === qt && !o.el && (o.el = s.el);
    }
}
function ol(e) {
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
function vo(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : vo(t);
}
function Un(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const al = Symbol.for("v-scx"), ll = () => Qs(al);
function _s(e, t, n) {
  return bo(e, t, n);
}
function bo(e, t, n = ee) {
  const { immediate: a, deep: l, flush: u, once: s } = n, o = xe({}, n), c = t && a || !t && u !== "post";
  let r;
  if (Ms) {
    if (u === "sync") {
      const p = ll();
      r = p.__watcherHandles || (p.__watcherHandles = []);
    } else if (!c) {
      const p = () => {
      };
      return p.stop = Qe, p.resume = Qe, p.pause = Qe, p;
    }
  }
  const i = ke;
  o.call = (p, f, y) => tt(p, i, f, y);
  let d = !1;
  u === "post" ? o.scheduler = (p) => {
    Ce(p, i && i.suspense);
  } : u !== "sync" && (d = !0, o.scheduler = (p, f) => {
    f ? p() : In(p);
  }), o.augmentJob = (p) => {
    t && (p.flags |= 4), d && (p.flags |= 2, i && (p.id = i.uid, p.i = i));
  };
  const h = ba(e, t, o);
  return Ms && (r ? r.push(h) : c && h()), h;
}
function ul(e, t, n) {
  const a = this.proxy, l = pe(e) ? e.includes(".") ? Po(a, e) : () => a[e] : e.bind(a, a);
  let u;
  H(t) ? u = t : (u = t.handler, n = t);
  const s = Ws(this), o = bo(l, u.bind(a), n);
  return s(), o;
}
function Po(e, t) {
  const n = t.split(".");
  return () => {
    let a = e;
    for (let l = 0; l < n.length && a; l++)
      a = a[n[l]];
    return a;
  };
}
const cl = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ve(t)}Modifiers`] || e[`${xt(t)}Modifiers`];
function dl(e, t, ...n) {
  if (e.isUnmounted) return;
  const a = e.vnode.props || ee;
  let l = n;
  const u = t.startsWith("update:"), s = u && cl(a, t.slice(7));
  s && (s.trim && (l = n.map((i) => pe(i) ? i.trim() : i)), s.number && (l = n.map(sr)));
  let o, c = a[o = Or(t)] || // also try camelCase event handler (#2249)
  a[o = Or(Ve(t))];
  !c && u && (c = a[o = Or(xt(t))]), c && tt(
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
    e.emitted[o] = !0, tt(
      r,
      e,
      6,
      l
    );
  }
}
const pl = /* @__PURE__ */ new WeakMap();
function ko(e, t, n = !1) {
  const a = n ? pl : t.emitsCache, l = a.get(e);
  if (l !== void 0)
    return l;
  const u = e.emits;
  let s = {}, o = !1;
  if (!H(e)) {
    const c = (r) => {
      const i = ko(r, t, !0);
      i && (o = !0, xe(s, i));
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  return !u && !o ? (re(e) && a.set(e, null), null) : (V(u) ? u.forEach((c) => s[c] = null) : xe(s, u), re(e) && a.set(e, s), s);
}
function _r(e, t) {
  return !e || !vr(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), G(e, t[0].toLowerCase() + t.slice(1)) || G(e, xt(t)) || G(e, t));
}
function Zn(e) {
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
    data: h,
    setupState: p,
    ctx: f,
    inheritAttrs: y
  } = e, P = or(e);
  let $, O;
  try {
    if (n.shapeFlag & 4) {
      const N = l || a, X = N;
      $ = Ye(
        r.call(
          X,
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
      $ = Ye(
        N.length > 1 ? N(
          d,
          { attrs: o, slots: s, emit: c }
        ) : N(
          d,
          null
        )
      ), O = t.props ? o : fl(o);
    }
  } catch (N) {
    As.length = 0, Sr(N, e, 1), $ = Ke(qt);
  }
  let C = $;
  if (O && y !== !1) {
    const N = Object.keys(O), { shapeFlag: X } = C;
    N.length && X & 7 && (u && N.some(dn) && (O = ml(
      O,
      u
    )), C = ls(C, O, !1, !0));
  }
  return n.dirs && (C = ls(C, null, !1, !0), C.dirs = C.dirs ? C.dirs.concat(n.dirs) : n.dirs), n.transition && qn(C, n.transition), $ = C, or(P), $;
}
const fl = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || vr(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, ml = (e, t) => {
  const n = {};
  for (const a in e)
    (!dn(a) || !(a.slice(9) in t)) && (n[a] = e[a]);
  return n;
};
function hl(e, t, n) {
  const { props: a, children: l, component: u } = e, { props: s, children: o, patchFlag: c } = t, r = u.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return a ? Kn(a, s, r) : !!s;
    if (c & 8) {
      const i = t.dynamicProps;
      for (let d = 0; d < i.length; d++) {
        const h = i[d];
        if (s[h] !== a[h] && !_r(r, h))
          return !0;
      }
    }
  } else
    return (l || o) && (!o || !o.$stable) ? !0 : a === s ? !1 : a ? s ? Kn(a, s, r) : !0 : !!s;
  return !1;
}
function Kn(e, t, n) {
  const a = Object.keys(t);
  if (a.length !== Object.keys(e).length)
    return !0;
  for (let l = 0; l < a.length; l++) {
    const u = a[l];
    if (t[u] !== e[u] && !_r(n, u))
      return !0;
  }
  return !1;
}
function yl({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const a = t.subTree;
    if (a.suspense && a.suspense.activeBranch === e && (a.el = e.el), a === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const $o = (e) => e.__isSuspense;
function gl(e, t) {
  t && t.pendingBranch ? V(e) ? t.effects.push(...e) : t.effects.push(e) : $a(e);
}
const se = Symbol.for("v-fgt"), Ar = Symbol.for("v-txt"), qt = Symbol.for("v-cmt"), Dr = Symbol.for("v-stc"), As = [];
let De = null;
function R(e = !1) {
  As.push(De = e ? null : []);
}
function wl() {
  As.pop(), De = As[As.length - 1] || null;
}
let Os = 1;
function Jn(e, t = !1) {
  Os += e, e < 0 && De && t && (De.hasOnce = !0);
}
function Io(e) {
  return e.dynamicChildren = Os > 0 ? De || Bt : null, wl(), Os > 0 && De && De.push(e), e;
}
function z(e, t, n, a, l, u) {
  return Io(
    g(
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
function ur(e, t, n, a, l) {
  return Io(
    Ke(
      e,
      t,
      n,
      a,
      l,
      !0
    )
  );
}
function qo(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function ms(e, t) {
  return e.type === t.type && e.key === t.key;
}
const So = ({ key: e }) => e ?? null, er = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? pe(e) || $e(e) || H(e) ? { i: ze, r: e, k: t, f: !!n } : e : null);
function g(e, t = null, n = null, a = 0, l = null, u = e === se ? 0 : 1, s = !1, o = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && So(t),
    ref: t && er(t),
    scopeId: to,
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
    ctx: ze
  };
  return o ? (jn(c, n), u & 128 && e.normalize(c)) : n && (c.shapeFlag |= pe(n) ? 8 : 16), Os > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  De && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || u & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && De.push(c), c;
}
const Ke = vl;
function vl(e, t = null, n = null, a = 0, l = null, u = !1) {
  if ((!e || e === Da) && (e = qt), qo(e)) {
    const o = ls(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && jn(o, n), Os > 0 && !u && De && (o.shapeFlag & 6 ? De[De.indexOf(e)] = o : De.push(o)), o.patchFlag = -2, o;
  }
  if (Tl(e) && (e = e.__vccOpts), t) {
    t = bl(t);
    let { class: o, style: c } = t;
    o && !pe(o) && (t.class = we(o)), re(c) && (kn(c) && !V(c) && (c = xe({}, c)), t.style = mn(c));
  }
  const s = pe(e) ? 1 : $o(e) ? 128 : Sa(e) ? 64 : re(e) ? 4 : H(e) ? 2 : 0;
  return g(
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
function bl(e) {
  return e ? kn(e) || po(e) ? xe({}, e) : e : null;
}
function ls(e, t, n = !1, a = !1) {
  const { props: l, ref: u, patchFlag: s, children: o, transition: c } = e, r = t ? Pl(l || {}, t) : l, i = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: r,
    key: r && So(r),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && u ? V(u) ? u.concat(er(t)) : [u, er(t)] : er(t)
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
  return c && a && qn(
    i,
    c.clone(i)
  ), i;
}
function le(e = " ", t = 0) {
  return Ke(Ar, null, e, t);
}
function Te(e = "", t = !1) {
  return t ? (R(), ur(qt, null, e)) : Ke(qt, null, e);
}
function Ye(e) {
  return e == null || typeof e == "boolean" ? Ke(qt) : V(e) ? Ke(
    se,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : qo(e) ? kt(e) : Ke(Ar, null, String(e));
}
function kt(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ls(e);
}
function jn(e, t) {
  let n = 0;
  const { shapeFlag: a } = e;
  if (t == null)
    t = null;
  else if (V(t))
    n = 16;
  else if (typeof t == "object")
    if (a & 65) {
      const l = t.default;
      l && (l._c && (l._d = !1), jn(e, l()), l._c && (l._d = !0));
      return;
    } else {
      n = 32;
      const l = t._;
      !l && !po(t) ? t._ctx = ze : l === 3 && ze && (ze.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else H(t) ? (t = { default: t, _ctx: ze }, n = 32) : (t = String(t), a & 64 ? (n = 16, t = [le(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Pl(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const a = e[n];
    for (const l in a)
      if (l === "class")
        t.class !== a.class && (t.class = we([t.class, a.class]));
      else if (l === "style")
        t.style = mn([t.style, a.style]);
      else if (vr(l)) {
        const u = t[l], s = a[l];
        s && u !== s && !(V(u) && u.includes(s)) && (t[l] = u ? [].concat(u, s) : s);
      } else l !== "" && (t[l] = a[l]);
  }
  return t;
}
function Ge(e, t, n, a = null) {
  tt(e, t, 7, [
    n,
    a
  ]);
}
const kl = lo();
let $l = 0;
function Il(e, t, n) {
  const a = e.type, l = (t ? t.appContext : e.appContext) || kl, u = {
    uid: $l++,
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
    scope: new Uo(
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
    propsOptions: mo(a, l),
    emitsOptions: ko(a, l),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: ee,
    // inheritAttrs
    inheritAttrs: a.inheritAttrs,
    // state
    ctx: ee,
    data: ee,
    props: ee,
    attrs: ee,
    slots: ee,
    refs: ee,
    setupState: ee,
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
  return u.ctx = { _: u }, u.root = t ? t.root : u, u.emit = dl.bind(null, u), e.ce && e.ce(u), u;
}
let ke = null;
const ql = () => ke || ze;
let cr, rn;
{
  const e = $r(), t = (n, a) => {
    let l;
    return (l = e[n]) || (l = e[n] = []), l.push(a), (u) => {
      l.length > 1 ? l.forEach((s) => s(u)) : l[0](u);
    };
  };
  cr = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => ke = n
  ), rn = t(
    "__VUE_SSR_SETTERS__",
    (n) => Ms = n
  );
}
const Ws = (e) => {
  const t = ke;
  return cr(e), e.scope.on(), () => {
    e.scope.off(), cr(t);
  };
}, Gn = () => {
  ke && ke.scope.off(), cr(null);
};
function xo(e) {
  return e.vnode.shapeFlag & 4;
}
let Ms = !1;
function Sl(e, t = !1, n = !1) {
  t && rn(t);
  const { props: a, children: l } = e.vnode, u = xo(e);
  Xa(e, a, u, t), tl(e, l, n || t);
  const s = u ? xl(e, t) : void 0;
  return t && rn(!1), s;
}
function xl(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Fa);
  const { setup: a } = n;
  if (a) {
    yt();
    const l = e.setupContext = a.length > 1 ? Al(e) : null, u = Ws(e), s = Ds(
      a,
      e,
      0,
      [
        e.props,
        l
      ]
    ), o = xi(s);
    if (gt(), u(), (o || e.sp) && !Ss(e) && so(e), o) {
      if (s.then(Gn, Gn), t)
        return s.then((c) => {
          Xn(e, c);
        }).catch((c) => {
          Sr(c, e, 0);
        });
      e.asyncDep = s;
    } else
      Xn(e, s);
  } else
    _o(e);
}
function Xn(e, t, n) {
  H(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : re(t) && (e.setupState = Gi(t)), _o(e);
}
function _o(e, t, n) {
  const a = e.type;
  e.render || (e.render = a.render || Qe);
  {
    const l = Ws(e);
    yt();
    try {
      Va(e);
    } finally {
      gt(), l();
    }
  }
}
const _l = {
  get(e, t) {
    return Pe(e, "get", ""), e[t];
  }
};
function Al(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, _l),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function jr(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Gi(fa(e.exposed)), {
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
function jl(e, t = !0) {
  return H(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Tl(e) {
  return H(e) && "__vccOpts" in e;
}
const Re = (e, t) => wa(e, t, Ms), El = "3.5.21";
/**
* @vue/runtime-dom v3.5.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let nn;
const Yn = typeof window < "u" && window.trustedTypes;
if (Yn)
  try {
    nn = /* @__PURE__ */ Yn.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Ao = nn ? (e) => nn.createHTML(e) : (e) => e, Ol = "http://www.w3.org/2000/svg", Ml = "http://www.w3.org/1998/Math/MathML", ct = typeof document < "u" ? document : null, Qn = ct && /* @__PURE__ */ ct.createElement("template"), Cl = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, a) => {
    const l = t === "svg" ? ct.createElementNS(Ol, e) : t === "mathml" ? ct.createElementNS(Ml, e) : n ? ct.createElement(e, { is: n }) : ct.createElement(e);
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
  insertStaticContent(e, t, n, a, l, u) {
    const s = n ? n.previousSibling : t.lastChild;
    if (l && (l === u || l.nextSibling))
      for (; t.insertBefore(l.cloneNode(!0), n), !(l === u || !(l = l.nextSibling)); )
        ;
    else {
      Qn.innerHTML = Ao(
        a === "svg" ? `<svg>${e}</svg>` : a === "mathml" ? `<math>${e}</math>` : e
      );
      const o = Qn.content;
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
}, Nl = Symbol("_vtc");
function Ll(e, t, n) {
  const a = e[Nl];
  a && (t = (t ? [t, ...a] : [...a]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const dr = Symbol("_vod"), jo = Symbol("_vsh"), Wr = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(e, { value: t }, { transition: n }) {
    e[dr] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : hs(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: a }) {
    !t != !n && (a ? t ? (a.beforeEnter(e), hs(e, !0), a.enter(e)) : a.leave(e, () => {
      hs(e, !1);
    }) : hs(e, t));
  },
  beforeUnmount(e, { value: t }) {
    hs(e, t);
  }
};
function hs(e, t) {
  e.style.display = t ? e[dr] : "none", e[jo] = !t;
}
const Rl = Symbol(""), zl = /(?:^|;)\s*display\s*:/;
function Dl(e, t, n) {
  const a = e.style, l = pe(n);
  let u = !1;
  if (n && !l) {
    if (t)
      if (pe(t))
        for (const s of t.split(";")) {
          const o = s.slice(0, s.indexOf(":")).trim();
          n[o] == null && tr(a, o, "");
        }
      else
        for (const s in t)
          n[s] == null && tr(a, s, "");
    for (const s in n)
      s === "display" && (u = !0), tr(a, s, n[s]);
  } else if (l) {
    if (t !== n) {
      const s = a[Rl];
      s && (n += ";" + s), a.cssText = n, u = zl.test(n);
    }
  } else t && e.removeAttribute("style");
  dr in e && (e[dr] = u ? a.display : "", e[jo] && (a.display = "none"));
}
const ei = /\s*!important$/;
function tr(e, t, n) {
  if (V(n))
    n.forEach((a) => tr(e, t, a));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const a = Wl(e, t);
    ei.test(n) ? e.setProperty(
      xt(a),
      n.replace(ei, ""),
      "important"
    ) : e[a] = n;
  }
}
const ti = ["Webkit", "Moz", "ms"], Fr = {};
function Wl(e, t) {
  const n = Fr[t];
  if (n)
    return n;
  let a = Ve(t);
  if (a !== "filter" && a in e)
    return Fr[t] = a;
  a = kr(a);
  for (let l = 0; l < ti.length; l++) {
    const u = ti[l] + a;
    if (u in e)
      return Fr[t] = u;
  }
  return t;
}
const si = "http://www.w3.org/1999/xlink";
function ri(e, t, n, a, l, u = Vo(t)) {
  a && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(si, t.slice(6, t.length)) : e.setAttributeNS(si, t, n) : n == null || u && !Ti(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    u ? "" : et(n) ? String(n) : n
  );
}
function ni(e, t, n, a, l) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Ao(n) : n);
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
    o === "boolean" ? n = Ti(n) : n == null && o === "string" ? (n = "", s = !0) : o === "number" && (n = 0, s = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  s && e.removeAttribute(l || t);
}
function Lt(e, t, n, a) {
  e.addEventListener(t, n, a);
}
function Fl(e, t, n, a) {
  e.removeEventListener(t, n, a);
}
const ii = Symbol("_vei");
function Vl(e, t, n, a, l = null) {
  const u = e[ii] || (e[ii] = {}), s = u[t];
  if (a && s)
    s.value = a;
  else {
    const [o, c] = Hl(t);
    if (a) {
      const r = u[t] = Zl(
        a,
        l
      );
      Lt(e, o, r, c);
    } else s && (Fl(e, o, s, c), u[t] = void 0);
  }
}
const oi = /(?:Once|Passive|Capture)$/;
function Hl(e) {
  let t;
  if (oi.test(e)) {
    t = {};
    let a;
    for (; a = e.match(oi); )
      e = e.slice(0, e.length - a[0].length), t[a[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : xt(e.slice(2)), t];
}
let Vr = 0;
const Bl = /* @__PURE__ */ Promise.resolve(), Ul = () => Vr || (Bl.then(() => Vr = 0), Vr = Date.now());
function Zl(e, t) {
  const n = (a) => {
    if (!a._vts)
      a._vts = Date.now();
    else if (a._vts <= n.attached)
      return;
    tt(
      Kl(a, n.value),
      t,
      5,
      [a]
    );
  };
  return n.value = e, n.attached = Ul(), n;
}
function Kl(e, t) {
  if (V(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (a) => (l) => !l._stopped && a && a(l)
    );
  } else
    return t;
}
const ai = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Jl = (e, t, n, a, l, u) => {
  const s = l === "svg";
  t === "class" ? Ll(e, a, s) : t === "style" ? Dl(e, n, a) : vr(t) ? dn(t) || Vl(e, t, n, a, u) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Gl(e, t, a, s)) ? (ni(e, t, a), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ri(e, t, a, s, u, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !pe(a)) ? ni(e, Ve(t), a, u, t) : (t === "true-value" ? e._trueValue = a : t === "false-value" && (e._falseValue = a), ri(e, t, a, s));
};
function Gl(e, t, n, a) {
  if (a)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ai(t) && H(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const l = e.tagName;
    if (l === "IMG" || l === "VIDEO" || l === "CANVAS" || l === "SOURCE")
      return !1;
  }
  return ai(t) && pe(n) ? !1 : t in e;
}
const pr = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return V(t) ? (n) => Ys(t, n) : t;
};
function Xl(e) {
  e.target.composing = !0;
}
function li(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Gt = Symbol("_assign"), Yl = {
  created(e, { modifiers: { lazy: t, trim: n, number: a } }, l) {
    e[Gt] = pr(l);
    const u = a || l.props && l.props.type === "number";
    Lt(e, t ? "change" : "input", (s) => {
      if (s.target.composing) return;
      let o = e.value;
      n && (o = o.trim()), u && (o = sr(o)), e[Gt](o);
    }), n && Lt(e, "change", () => {
      e.value = e.value.trim();
    }), t || (Lt(e, "compositionstart", Xl), Lt(e, "compositionend", li), Lt(e, "change", li));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: a, trim: l, number: u } }, s) {
    if (e[Gt] = pr(s), e.composing) return;
    const o = (u || e.type === "number") && !/^0\d/.test(e.value) ? sr(e.value) : e.value, c = t ?? "";
    o !== c && (document.activeElement === e && e.type !== "range" && (a && t === n || l && e.value.trim() === c) || (e.value = c));
  }
}, Ql = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: n } }, a) {
    const l = br(t);
    Lt(e, "change", () => {
      const u = Array.prototype.filter.call(e.options, (s) => s.selected).map(
        (s) => n ? sr(fr(s)) : fr(s)
      );
      e[Gt](
        e.multiple ? l ? new Set(u) : u : u[0]
      ), e._assigning = !0, $n(() => {
        e._assigning = !1;
      });
    }), e[Gt] = pr(a);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    ui(e, t);
  },
  beforeUpdate(e, t, n) {
    e[Gt] = pr(n);
  },
  updated(e, { value: t }) {
    e._assigning || ui(e, t);
  }
};
function ui(e, t) {
  const n = e.multiple, a = V(t);
  if (!(n && !a && !br(t))) {
    for (let l = 0, u = e.options.length; l < u; l++) {
      const s = e.options[l], o = fr(s);
      if (n)
        if (a) {
          const c = typeof o;
          c === "string" || c === "number" ? s.selected = t.some((r) => String(r) === String(o)) : s.selected = Bo(t, o) > -1;
        } else
          s.selected = t.has(o);
      else if (Ir(fr(s), t)) {
        e.selectedIndex !== l && (e.selectedIndex = l);
        return;
      }
    }
    !n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function fr(e) {
  return "_value" in e ? e._value : e.value;
}
const eu = ["ctrl", "shift", "alt", "meta"], tu = {
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
  exact: (e, t) => eu.some((n) => e[`${n}Key`] && !t.includes(n))
}, Tn = (e, t) => {
  const n = e._withMods || (e._withMods = {}), a = t.join(".");
  return n[a] || (n[a] = ((l, ...u) => {
    for (let s = 0; s < t.length; s++) {
      const o = tu[t[s]];
      if (o && o(l, t)) return;
    }
    return e(l, ...u);
  }));
}, su = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, ru = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), a = t.join(".");
  return n[a] || (n[a] = ((l) => {
    if (!("key" in l))
      return;
    const u = xt(l.key);
    if (t.some(
      (s) => s === u || su[s] === u
    ))
      return e(l);
  }));
}, nu = /* @__PURE__ */ xe({ patchProp: Jl }, Cl);
let ci;
function iu() {
  return ci || (ci = rl(nu));
}
const ou = ((...e) => {
  const t = iu().createApp(...e), { mount: n } = t;
  return t.mount = (a) => {
    const l = lu(a);
    if (!l) return;
    const u = t._component;
    !H(u) && !u.render && !u.template && (u.template = l.innerHTML), l.nodeType === 1 && (l.textContent = "");
    const s = n(l, !1, au(l));
    return l instanceof Element && (l.removeAttribute("v-cloak"), l.setAttribute("data-v-app", "")), s;
  }, t;
});
function au(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function lu(e) {
  return pe(e) ? document.querySelector(e) : e;
}
const uu = { class: "tree-node" }, cu = ["title"], du = { class: "tree-icon" }, pu = {
  key: 0,
  class: "tree-children"
}, fu = /* @__PURE__ */ Object.assign({ name: "FileTreeNode" }, {
  __name: "FileTreeNode",
  props: {
    node: { type: Object, required: !0 },
    selectedPath: { type: String, default: "" }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = t, a = K(!0);
    return (l, u) => {
      const s = za("FileTreeNode", !0);
      return R(), z("div", uu, [
        g("div", {
          class: we(["tree-row", { selected: e.selectedPath === e.node.path }]),
          title: e.node.path,
          onClick: u[1] || (u[1] = (o) => n("select", e.node)),
          onDblclick: u[2] || (u[2] = (o) => e.node.kind === "directory" && (a.value = !a.value))
        }, [
          g("span", {
            class: "tree-toggle",
            onClick: u[0] || (u[0] = Tn((o) => e.node.kind === "directory" && (a.value = !a.value), ["stop"]))
          }, L(e.node.kind === "directory" ? a.value ? "⌄" : "›" : ""), 1),
          g("span", du, L(e.node.kind === "directory" ? "▰" : "·"), 1),
          g("span", null, L(e.node.name), 1)
        ], 42, cu),
        e.node.kind === "directory" && a.value ? (R(), z("div", pu, [
          (R(!0), z(se, null, Be(e.node.children, (o) => (R(), ur(s, {
            key: o.path,
            node: o,
            "selected-path": e.selectedPath,
            onSelect: u[3] || (u[3] = (c) => n("select", c))
          }, null, 8, ["node", "selected-path"]))), 128))
        ])) : Te("", !0)
      ]);
    };
  }
}), mu = { class: "monaco-editor-shell" }, hu = {
  key: 0,
  class: "editor-loading"
}, yu = {
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
    const n = e, a = t, l = K(null), u = K(!0);
    let s, o, c, r, i = !1, d;
    Sn(async () => {
      try {
        const y = await import("./monaco-runtime-zBBsQfqc.js").then((P) => P.jz);
        ({ monaco: c } = await y.configureStudioMonaco()), d = y.configureManifestSchemaForText, o = h(), f(o.getValue()), s = c.editor.create(l.value, {
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
      } catch (y) {
        u.value = !1, a("error", y);
      }
    }), _s(() => n.value, (y) => {
      !o || o.getValue() === y || (i = !0, o.setValue(y), f(y), i = !1);
    }), _s(() => n.markers, p, { deep: !0 }), xn(() => {
      r?.dispose(), s?.dispose();
    });
    function h() {
      const y = c.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(n.projectId)}/${n.path}`), P = c.editor.getModel(y);
      return P ? (c.editor.setModelLanguage(P, n.language), P.getValue() !== n.value && P.setValue(n.value), P) : c.editor.createModel(n.value, n.language, y);
    }
    function p() {
      !c || !o || c.editor.setModelMarkers(o, "webwindows-manifest", n.markers.map((y) => ({
        severity: y.severity === "warning" ? c.MarkerSeverity.Warning : c.MarkerSeverity.Error,
        message: `${y.path}: ${y.message}`,
        startLineNumber: y.line || 1,
        startColumn: y.column || 1,
        endLineNumber: y.endLine || y.line || 1,
        endColumn: y.endColumn || Math.max(2, (y.column || 1) + 1)
      })));
    }
    function f(y) {
      n.path === "manifest.json" && d?.(y);
    }
    return (y, P) => (R(), z("div", mu, [
      g("div", {
        ref_key: "host",
        ref: l,
        class: "monaco-editor-host"
      }, null, 512),
      u.value ? (R(), z("div", hu, "正在载入本地编辑器…")) : Te("", !0)
    ]));
  }
}, gu = 1, di = 2;
function St(e) {
  return !e || typeof e != "object" || Array.isArray(e) ? null : Object.prototype.hasOwnProperty.call(e, "manifestVersion") ? e.manifestVersion === di ? di : null : gu;
}
const wu = { class: "manifest-inspector" }, vu = { class: "inspector-mode-tabs" }, bu = {
  key: 0,
  class: "inspector-note"
}, Pu = {
  key: 1,
  class: "inspector-note error"
}, ku = ["value"], $u = { key: 0 }, Iu = ["value"], qu = ["value"], Su = ["value"], xu = ["value"], _u = ["value"], Au = ["value"], ju = ["value"], Tu = ["value"], Eu = ["value"], Ou = ["value"], Mu = { class: "check" }, Cu = ["checked"], Nu = { class: "check" }, Lu = ["checked"], Ru = { class: "check" }, zu = ["checked"], Du = { class: "check" }, Wu = ["checked"], Fu = { class: "check" }, Vu = ["checked"], Hu = {
  key: 1,
  class: "permission-fieldset"
}, Bu = { class: "permission-heading" }, Uu = ["checked", "onChange"], Zu = { class: "permission-meta" }, Ku = { key: 0 }, Ju = {
  key: 2,
  class: "inspector-note"
}, Gu = { class: "inspector-summary" }, Xu = {
  __name: "ManifestInspector",
  props: {
    manifest: { type: Object, default: null },
    diagnostics: { type: Array, default: () => [] },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null }
  },
  emits: ["update:manifest", "open-json"],
  setup(e, { emit: t }) {
    const n = e, a = t, l = K("form"), u = Re(() => n.manifest && typeof n.manifest == "object" && !Array.isArray(n.manifest)), s = Re(() => {
      if (!u.value) return "—";
      const h = St(n.manifest);
      return h === 1 ? "1 (legacy implicit)" : h === 2 ? "2" : `Unsupported (${String(n.manifest.manifestVersion)})`;
    }), o = Re(() => St(n.manifest) === 2), c = Re(() => {
      const h = new Set(n.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
      return (n.permissionRegistry?.permissions || []).filter((p) => p.sourceDeclarable === !0 && h.has(p.id));
    });
    function r(h) {
      const p = (n.brokerMethods?.methods || []).filter((f) => f.requiredPermission === h.id);
      return {
        description: h.description || h.publicApiTargets?.join(", ") || "No public API target registered",
        consent: p[0]?.consent || h.prompt || "unspecified",
        pilot: p.some((f) => f.currentStatus === "enabled") ? "Preview Pilot enabled" : "Pilot contract only",
        methods: p.map((f) => f.id)
      };
    }
    function i(h, p) {
      const f = new Set(Array.isArray(n.manifest.permissions) ? n.manifest.permissions : []);
      p ? f.add(h) : f.delete(h);
      const y = c.value.map((P) => P.id);
      d(["permissions"], y.filter((P) => f.has(P)));
    }
    function d(h, p) {
      if (!u.value) return;
      const f = JSON.parse(JSON.stringify(n.manifest));
      let y = f;
      h.slice(0, -1).forEach((P) => {
        (!y[P] || typeof y[P] != "object") && (y[P] = {}), y = y[P];
      }), y[h.at(-1)] = p, a("update:manifest", f);
    }
    return (h, p) => (R(), z("div", wu, [
      g("div", vu, [
        g("button", {
          type: "button",
          class: we({ active: l.value === "form" }),
          onClick: p[0] || (p[0] = (f) => l.value = "form")
        }, "表单", 2),
        g("button", {
          type: "button",
          class: we({ active: l.value === "json" }),
          onClick: p[1] || (p[1] = (f) => {
            l.value = "json", a("open-json");
          })
        }, "JSON", 2)
      ]),
      l.value === "json" ? (R(), z("div", bu, [
        p[18] || (p[18] = le(" Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。 ", -1)),
        g("button", {
          type: "button",
          onClick: p[2] || (p[2] = (f) => a("open-json"))
        }, "打开 manifest.json")
      ])) : u.value ? (R(), z("form", {
        key: 2,
        class: "manifest-form",
        onSubmit: p[17] || (p[17] = Tn(() => {
        }, ["prevent"]))
      }, [
        g("label", null, [
          p[19] || (p[19] = le("Manifest Version", -1)),
          g("input", {
            value: s.value,
            readonly: ""
          }, null, 8, ku)
        ]),
        o.value ? (R(), z("label", $u, [
          p[20] || (p[20] = le("SDK API Version", -1)),
          g("input", {
            value: e.manifest.sdk?.apiVersion,
            readonly: ""
          }, null, 8, Iu)
        ])) : Te("", !0),
        g("label", null, [
          p[21] || (p[21] = le("ID", -1)),
          g("input", {
            value: e.manifest.id,
            onInput: p[3] || (p[3] = (f) => d(["id"], f.target.value))
          }, null, 40, qu)
        ]),
        g("label", null, [
          p[22] || (p[22] = le("名称", -1)),
          g("input", {
            value: e.manifest.name,
            onInput: p[4] || (p[4] = (f) => d(["name"], f.target.value))
          }, null, 40, Su)
        ]),
        g("label", null, [
          p[23] || (p[23] = le("版本", -1)),
          g("input", {
            value: e.manifest.version,
            onInput: p[5] || (p[5] = (f) => d(["version"], f.target.value))
          }, null, 40, xu)
        ]),
        g("label", null, [
          p[24] || (p[24] = le("描述", -1)),
          g("textarea", {
            value: e.manifest.description,
            onInput: p[6] || (p[6] = (f) => d(["description"], f.target.value))
          }, null, 40, _u)
        ]),
        g("label", null, [
          p[25] || (p[25] = le("分类", -1)),
          g("input", {
            value: e.manifest.category,
            onInput: p[7] || (p[7] = (f) => d(["category"], f.target.value))
          }, null, 40, Au)
        ]),
        g("label", null, [
          p[26] || (p[26] = le("入口", -1)),
          g("input", {
            value: e.manifest.entry,
            onInput: p[8] || (p[8] = (f) => d(["entry"], f.target.value))
          }, null, 40, ju)
        ]),
        g("label", null, [
          p[27] || (p[27] = le("图标", -1)),
          g("input", {
            value: e.manifest.icon,
            onInput: p[9] || (p[9] = (f) => d(["icon"], f.target.value))
          }, null, 40, Tu)
        ]),
        g("fieldset", null, [
          p[31] || (p[31] = g("legend", null, "Window", -1)),
          g("label", null, [
            p[28] || (p[28] = le("宽度", -1)),
            g("input", {
              value: e.manifest.window?.width,
              onInput: p[10] || (p[10] = (f) => d(["window", "width"], f.target.value))
            }, null, 40, Eu)
          ]),
          g("label", null, [
            p[29] || (p[29] = le("高度", -1)),
            g("input", {
              value: e.manifest.window?.height,
              onInput: p[11] || (p[11] = (f) => d(["window", "height"], f.target.value))
            }, null, 40, Ou)
          ]),
          g("label", Mu, [
            g("input", {
              type: "checkbox",
              checked: e.manifest.window?.singleton,
              onChange: p[12] || (p[12] = (f) => d(["window", "singleton"], f.target.checked))
            }, null, 40, Cu),
            p[30] || (p[30] = le(" 单实例", -1))
          ])
        ]),
        g("fieldset", null, [
          p[36] || (p[36] = g("legend", null, "Placement", -1)),
          g("label", Nu, [
            g("input", {
              type: "checkbox",
              checked: e.manifest.placement?.startMenu,
              onChange: p[13] || (p[13] = (f) => d(["placement", "startMenu"], f.target.checked))
            }, null, 40, Lu),
            p[32] || (p[32] = le(" 开始菜单", -1))
          ]),
          g("label", Ru, [
            g("input", {
              type: "checkbox",
              checked: e.manifest.placement?.allFunctions,
              onChange: p[14] || (p[14] = (f) => d(["placement", "allFunctions"], f.target.checked))
            }, null, 40, zu),
            p[33] || (p[33] = le(" 全部功能", -1))
          ]),
          g("label", Du, [
            g("input", {
              type: "checkbox",
              checked: e.manifest.placement?.desktop,
              onChange: p[15] || (p[15] = (f) => d(["placement", "desktop"], f.target.checked))
            }, null, 40, Wu),
            p[34] || (p[34] = le(" 桌面", -1))
          ]),
          g("label", Fu, [
            g("input", {
              type: "checkbox",
              checked: e.manifest.placement?.taskbar,
              onChange: p[16] || (p[16] = (f) => d(["placement", "taskbar"], f.target.checked))
            }, null, 40, Vu),
            p[35] || (p[35] = le(" 任务栏", -1))
          ])
        ]),
        o.value ? (R(), z("fieldset", Hu, [
          p[37] || (p[37] = g("legend", null, "Requested Permissions", -1)),
          p[38] || (p[38] = g("p", { class: "inspector-note" }, "声明仅表示请求授权，不表示 policy allowed、grant 或 Runtime capability。", -1)),
          (R(!0), z(se, null, Be(c.value, (f) => (R(), z("label", {
            key: f.id,
            class: "permission-option"
          }, [
            g("span", Bu, [
              g("input", {
                type: "checkbox",
                checked: e.manifest.permissions?.includes(f.id),
                onChange: (y) => i(f.id, y.target.checked)
              }, null, 40, Uu),
              g("code", null, L(f.displayName || f.id) + " · " + L(f.id), 1)
            ]),
            g("small", null, L(r(f).description), 1),
            g("span", Zu, [
              g("b", null, L(f.risk), 1),
              g("span", null, L(r(f).consent), 1),
              g("span", null, L(r(f).pilot), 1)
            ]),
            r(f).methods.length ? (R(), z("small", Ku, L(r(f).methods.join(", ")), 1)) : Te("", !0)
          ]))), 128))
        ])) : (R(), z("p", Ju, "Manifest v1 不承载权限。升级到 v2 必须由开发者显式确认权限，Studio 不会从源码自动推断。")),
        p[39] || (p[39] = g("p", { class: "inspector-note" }, "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。", -1))
      ], 32)) : (R(), z("div", Pu, "修复 JSON 错误后才能使用可视化表单。")),
      g("div", Gu, L(e.diagnostics.length) + " 个 Manifest 问题", 1)
    ]));
  }
}, Yu = { class: "permission-inspector" }, Qu = {
  key: 0,
  class: "problems-empty"
}, ec = {
  __name: "PermissionInspector",
  props: {
    manifest: { type: Object, default: null },
    permissionRegistry: { type: Object, default: null },
    brokerMethods: { type: Object, default: null },
    runtimeCompatibility: { type: Object, default: null },
    decisions: { type: Array, default: () => [] }
  },
  setup(e) {
    const t = e, n = Re(() => {
      const a = new Set(t.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
      return (t.permissionRegistry?.permissions || []).filter((l) => l.sourceDeclarable === !0 && a.has(l.id)).map((l) => {
        const u = (t.brokerMethods?.methods || []).filter((r) => r.requiredPermission === l.id), s = [...t.decisions].reverse().find((r) => r.permission === l.id), o = u[0]?.requiredRuntimeCapability, c = (t.runtimeCompatibility?.hostRuntimes || []).filter((r) => r.capabilities?.[o]).map((r) => `${r.id}: ${r.capabilities[o].status}`);
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
    return (a, l) => (R(), z("div", Yu, [
      l[9] || (l[9] = g("p", { class: "inspector-note" }, "Declaration、review policy、Host grant 与 Runtime capability 是独立事实。", -1)),
      (R(!0), z(se, null, Be(n.value, (u) => (R(), z("article", {
        key: u.id,
        class: "permission-card"
      }, [
        g("h3", null, L(u.displayName || u.id), 1),
        g("code", null, L(u.id), 1),
        g("p", null, L(u.description), 1),
        g("dl", null, [
          g("div", null, [
            l[0] || (l[0] = g("dt", null, "Risk", -1)),
            g("dd", null, L(u.risk), 1)
          ]),
          g("div", null, [
            l[1] || (l[1] = g("dt", null, "Consent", -1)),
            g("dd", null, L(u.consent), 1)
          ]),
          g("div", null, [
            l[2] || (l[2] = g("dt", null, "Declared", -1)),
            g("dd", null, L(u.declared ? "yes" : "no"), 1)
          ]),
          g("div", null, [
            l[3] || (l[3] = g("dt", null, "Policy", -1)),
            g("dd", null, L(u.latest?.policyDecision || "not-evaluated"), 1)
          ]),
          g("div", null, [
            l[4] || (l[4] = g("dt", null, "Grant", -1)),
            g("dd", null, L(u.latest?.grantState || "not-evaluated"), 1)
          ]),
          g("div", null, [
            l[5] || (l[5] = g("dt", null, "Runtime capability", -1)),
            g("dd", null, L(u.capability), 1)
          ]),
          g("div", null, [
            l[6] || (l[6] = g("dt", null, "Effective", -1)),
            g("dd", null, L(u.latest ? u.latest.finalDecision : "not-evaluated"), 1)
          ]),
          g("div", null, [
            l[7] || (l[7] = g("dt", null, "Policy version", -1)),
            g("dd", null, L(u.latest?.policyVersion || "—"), 1)
          ])
        ]),
        l[8] || (l[8] = g("h4", null, "Broker methods", -1)),
        (R(!0), z(se, null, Be(u.methods, (s) => (R(), z("code", {
          key: s.id,
          class: "permission-method"
        }, L(s.id), 1))), 128))
      ]))), 128)),
      n.value.length ? Te("", !0) : (R(), z("div", Qu, "当前 registry 没有可声明的 Preview permission。"))
    ]));
  }
};
function tc(e) {
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
const sc = { properties: { type: { enum: ["application", "system"] } } }, pi = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, rc = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, nc = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, ic = { properties: { status: { enum: ["published", "disabled"] } } }, Ne = tc, oc = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), ac = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), To = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), lc = new RegExp("^\\.[a-z0-9]+$", "u"), uc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u"), cc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function mt(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = mt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Ne(e) > 240) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (Ne(e) < 1) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (!To.test(e)) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [r] : s.push(r), o++;
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [r] : s.push(r), o++;
  }
  if (typeof e == "string" && !cc.test(e)) {
    const r = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [r] : s.push(r), o++;
  }
  return mt.errors = s, o === 0;
}
mt.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const dc = new RegExp("^[a-f0-9]{64}$", "u"), pc = new RegExp("^/api/function-package\\.asp\\?", "u");
function Xt(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Xt.evaluated;
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
        if (!dc.test(r)) {
          const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (mt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? mt.errors : s.concat(mt.errors), o = s.length)), e.downloadUrl !== void 0) {
      let r = e.downloadUrl;
      if (typeof r == "string") {
        if (!pc.test(r)) {
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
  return Xt.errors = s, o === 0;
}
Xt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Yt(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Yt.evaluated;
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
        if (Ne(r) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!oc.test(r)) {
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
            if (Ne(f) < 1) {
              const y = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [y] : s.push(y), o++;
            }
          } else {
            const y = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [y] : s.push(y), o++;
          }
        }
        let d = r.length, h;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let f = r[d];
            if (typeof f == "string") {
              if (typeof p[f] == "number") {
                h = p[f];
                const y = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: h }, message: "must NOT have duplicate items (items ## " + h + " and " + d + " are identical)" };
                s === null ? s = [y] : s.push(y), o++;
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
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: sc.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let r = e.name;
      if (typeof r == "string") {
        if (Ne(r) < 1) {
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
        if (Ne(r) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!ac.test(r)) {
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
        if (Ne(r) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (Ne(r) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!To.test(r)) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (mt(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? mt.errors : s.concat(mt.errors), o = s.length)), e.install !== void 0) {
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
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: pi.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.source !== void 0) {
          let i = r.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: pi.properties.source.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: rc.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: nc.properties.mode.enum }, message: "must be equal to one of the allowed values" };
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
            if (Ne(i) < 1) {
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
            if (Ne(i) < 1) {
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
          let h = r[d];
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
                    if (!lc.test(O)) {
                      const C = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [C] : s.push(C), o++;
                    }
                  } else {
                    const C = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [C] : s.push(C), o++;
                  }
                }
                let y = p.length, P;
                if (y > 1) {
                  const $ = {};
                  for (; y--; ) {
                    let O = p[y];
                    if (typeof O == "string") {
                      if (typeof $[O] == "number") {
                        P = $[O];
                        const C = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: y, j: P }, message: "must NOT have duplicate items (items ## " + P + " and " + y + " are identical)" };
                        s === null ? s = [C] : s.push(C), o++;
                        break;
                      }
                      $[O] = y;
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
                    if (!uc.test(O)) {
                      const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [C] : s.push(C), o++;
                    }
                  } else {
                    const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [C] : s.push(C), o++;
                  }
                }
                let y = p.length, P;
                if (y > 1) {
                  const $ = {};
                  for (; y--; ) {
                    let O = p[y];
                    if (typeof O == "string") {
                      if (typeof $[O] == "number") {
                        P = $[O];
                        const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: y, j: P }, message: "must NOT have duplicate items (items ## " + P + " and " + y + " are identical)" };
                        s === null ? s = [C] : s.push(C), o++;
                        break;
                      }
                      $[O] = y;
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
      let r = e.launch;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.adapter !== void 0) {
          let i = r.adapter;
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
      let r = e.catalog;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.status !== void 0) {
          let i = r.status;
          if (!(i === "published" || i === "disabled")) {
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: ic.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (Xt(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? Xt.errors : s.concat(Xt.errors), o = s.length)), e.runtime !== void 0) {
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
  return Yt.errors = s, o === 0;
}
Yt.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Cs(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Cs.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Yt(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? Yt.errors : s.concat(Yt.errors), o = s.length), Cs.errors = s, o === 0;
}
Cs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function fc(e) {
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
function mc(e, t) {
  return e === t;
}
const hc = { properties: { type: { enum: ["application", "system"] } } }, fi = { properties: { defaultState: { enum: ["available", "installed"] }, source: { enum: ["repository", "preinstalled", "system"] } } }, yc = { properties: { startMenuGroup: { enum: ["user", "system"] } } }, gc = { properties: { mode: { enum: ["iframe", "native", "shell"] } } }, wc = { properties: { status: { enum: ["published", "disabled"] } } }, vc = { enum: ["device.battery-status.read"] }, bc = mc;
function Qt(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Qt.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), Array.isArray(e)) {
    const r = e.length;
    for (let h = 0; h < r; h++) {
      let p = e[h];
      if (typeof p != "string") {
        const f = { instancePath: t + "/" + h, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [f] : s.push(f), o++;
      }
      if (p !== "device.battery-status.read") {
        const f = { instancePath: t + "/" + h, schemaPath: "https://www.y0.hk/data/sdk/permissions-v1.json#/$defs/permissionId/enum", keyword: "enum", params: { allowedValues: vc.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [f] : s.push(f), o++;
      }
    }
    let i = e.length, d;
    if (i > 1) {
      e: for (; i--; )
        for (d = i; d--; )
          if (bc(e[i], e[d])) {
            const h = { instancePath: t, schemaPath: "#/uniqueItems", keyword: "uniqueItems", params: { i, j: d }, message: "must NOT have duplicate items (items ## " + d + " and " + i + " are identical)" };
            s === null ? s = [h] : s.push(h), o++;
            break e;
          }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/type", keyword: "type", params: { type: "array" }, message: "must be array" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return Qt.errors = s, o === 0;
}
Qt.evaluated = { items: !0, dynamicProps: !1, dynamicItems: !1 };
const Le = fc, Eo = new RegExp("^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$", "u"), Pc = new RegExp("\\.[Hh][Tt][Mm][Ll]?$", "u");
function ht(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ht.evaluated;
  if (c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), typeof e == "string") {
    if (Le(e) > 240) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (Le(e) < 1) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (!Eo.test(e)) {
      const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
      s === null ? s = [r] : s.push(r), o++;
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
    s === null ? s = [r] : s.push(r), o++;
  }
  if (typeof e == "string" && !Pc.test(e)) {
    const r = { instancePath: t, schemaPath: "#/allOf/1/pattern", keyword: "pattern", params: { pattern: "\\.[Hh][Tt][Mm][Ll]?$" }, message: 'must match pattern "\\.[Hh][Tt][Mm][Ll]?$"' };
    s === null ? s = [r] : s.push(r), o++;
  }
  return ht.errors = s, o === 0;
}
ht.evaluated = { dynamicProps: !1, dynamicItems: !1 };
const kc = new RegExp("^[a-f0-9]{64}$", "u"), $c = new RegExp("^/api/function-package\\.asp\\?", "u");
function es(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = es.evaluated;
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
        if (!kc.test(r)) {
          const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/sha256", schemaPath: "#/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (ht(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? ht.errors : s.concat(ht.errors), o = s.length)), e.downloadUrl !== void 0) {
      let r = e.downloadUrl;
      if (typeof r == "string") {
        if (!$c.test(r)) {
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
  return es.errors = s, o === 0;
}
es.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Ic = new RegExp("^[a-z0-9]+(?:[._-][a-z0-9]+)+$", "u"), qc = new RegExp("^[0-9]+(?:\\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$", "u"), Sc = new RegExp("^\\.[a-z0-9]+$", "u"), xc = new RegExp("^[^/\\s]+/[^/\\s]+$", "u");
function ts(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ts.evaluated;
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
    if (e.permissions !== void 0 && (Qt(e.permissions, { instancePath: t + "/permissions", parentData: e, parentDataProperty: "permissions", rootData: l, dynamicAnchors: u }) || (s = s === null ? Qt.errors : s.concat(Qt.errors), o = s.length)), e.id !== void 0) {
      let r = e.id;
      if (typeof r == "string") {
        if (Le(r) > 160) {
          const i = { instancePath: t + "/id", schemaPath: "#/$defs/appId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Ic.test(r)) {
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
            if (Le(f) < 1) {
              const y = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              s === null ? s = [y] : s.push(y), o++;
            }
          } else {
            const y = { instancePath: t + "/legacyIds/" + p, schemaPath: "#/properties/legacyIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            s === null ? s = [y] : s.push(y), o++;
          }
        }
        let d = r.length, h;
        if (d > 1) {
          const p = {};
          for (; d--; ) {
            let f = r[d];
            if (typeof f == "string") {
              if (typeof p[f] == "number") {
                h = p[f];
                const y = { instancePath: t + "/legacyIds", schemaPath: "#/properties/legacyIds/uniqueItems", keyword: "uniqueItems", params: { i: d, j: h }, message: "must NOT have duplicate items (items ## " + h + " and " + d + " are identical)" };
                s === null ? s = [y] : s.push(y), o++;
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
        const i = { instancePath: t + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: hc.properties.type.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.name !== void 0) {
      let r = e.name;
      if (typeof r == "string") {
        if (Le(r) < 1) {
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
        if (Le(r) > 40) {
          const i = { instancePath: t + "/version", schemaPath: "#/$defs/version/maxLength", keyword: "maxLength", params: { limit: 40 }, message: "must NOT have more than 40 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!qc.test(r)) {
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
        if (Le(r) > 240) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (Le(r) < 1) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Eo.test(r)) {
          const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/pattern", keyword: "pattern", params: { pattern: "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$" }, message: 'must match pattern "^(?!/)(?![A-Za-z]:)(?!.*\\\\)(?!.*(?:^|/)\\.{1,2}(?:/|$))(?!.*//).+$"' };
          s === null ? s = [i] : s.push(i), o++;
        }
      } else {
        const i = { instancePath: t + "/icon", schemaPath: "#/$defs/safePackagePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.entry !== void 0 && (ht(e.entry, { instancePath: t + "/entry", parentData: e, parentDataProperty: "entry", rootData: l, dynamicAnchors: u }) || (s = s === null ? ht.errors : s.concat(ht.errors), o = s.length)), e.install !== void 0) {
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
            const d = { instancePath: t + "/install/defaultState", schemaPath: "#/$defs/install/properties/defaultState/enum", keyword: "enum", params: { allowedValues: fi.properties.defaultState.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
        if (r.source !== void 0) {
          let i = r.source;
          if (!(i === "repository" || i === "preinstalled" || i === "system")) {
            const d = { instancePath: t + "/install/source", schemaPath: "#/$defs/install/properties/source/enum", keyword: "enum", params: { allowedValues: fi.properties.source.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/placement/startMenuGroup", schemaPath: "#/$defs/placement/properties/startMenuGroup/enum", keyword: "enum", params: { allowedValues: yc.properties.startMenuGroup.enum }, message: "must be equal to one of the allowed values" };
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
            const d = { instancePath: t + "/window/mode", schemaPath: "#/$defs/window/properties/mode/enum", keyword: "enum", params: { allowedValues: gc.properties.mode.enum }, message: "must be equal to one of the allowed values" };
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
            if (Le(i) < 1) {
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
            if (Le(i) < 1) {
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
          let h = r[d];
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
                    if (!Sc.test(O)) {
                      const C = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/pattern", keyword: "pattern", params: { pattern: "^\\.[a-z0-9]+$" }, message: 'must match pattern "^\\.[a-z0-9]+$"' };
                      s === null ? s = [C] : s.push(C), o++;
                    }
                  } else {
                    const C = { instancePath: t + "/fileHandlers/" + d + "/extensions/" + $, schemaPath: "#/$defs/fileHandler/properties/extensions/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [C] : s.push(C), o++;
                  }
                }
                let y = p.length, P;
                if (y > 1) {
                  const $ = {};
                  for (; y--; ) {
                    let O = p[y];
                    if (typeof O == "string") {
                      if (typeof $[O] == "number") {
                        P = $[O];
                        const C = { instancePath: t + "/fileHandlers/" + d + "/extensions", schemaPath: "#/$defs/fileHandler/properties/extensions/uniqueItems", keyword: "uniqueItems", params: { i: y, j: P }, message: "must NOT have duplicate items (items ## " + P + " and " + y + " are identical)" };
                        s === null ? s = [C] : s.push(C), o++;
                        break;
                      }
                      $[O] = y;
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
                    if (!xc.test(O)) {
                      const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/pattern", keyword: "pattern", params: { pattern: "^[^/\\s]+/[^/\\s]+$" }, message: 'must match pattern "^[^/\\s]+/[^/\\s]+$"' };
                      s === null ? s = [C] : s.push(C), o++;
                    }
                  } else {
                    const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes/" + $, schemaPath: "#/$defs/fileHandler/properties/mimeTypes/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    s === null ? s = [C] : s.push(C), o++;
                  }
                }
                let y = p.length, P;
                if (y > 1) {
                  const $ = {};
                  for (; y--; ) {
                    let O = p[y];
                    if (typeof O == "string") {
                      if (typeof $[O] == "number") {
                        P = $[O];
                        const C = { instancePath: t + "/fileHandlers/" + d + "/mimeTypes", schemaPath: "#/$defs/fileHandler/properties/mimeTypes/uniqueItems", keyword: "uniqueItems", params: { i: y, j: P }, message: "must NOT have duplicate items (items ## " + P + " and " + y + " are identical)" };
                        s === null ? s = [C] : s.push(C), o++;
                        break;
                      }
                      $[O] = y;
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
      let r = e.launch;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.adapter !== void 0) {
          let i = r.adapter;
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
      let r = e.catalog;
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (r.status !== void 0) {
          let i = r.status;
          if (!(i === "published" || i === "disabled")) {
            const d = { instancePath: t + "/catalog/status", schemaPath: "#/$defs/catalog/properties/status/enum", keyword: "enum", params: { allowedValues: wc.properties.status.enum }, message: "must be equal to one of the allowed values" };
            s === null ? s = [d] : s.push(d), o++;
          }
        }
      } else {
        const i = { instancePath: t + "/catalog", schemaPath: "#/$defs/catalog/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.package !== void 0 && (es(e.package, { instancePath: t + "/package", parentData: e, parentDataProperty: "package", rootData: l, dynamicAnchors: u }) || (s = s === null ? es.errors : s.concat(es.errors), o = s.length)), e.runtime !== void 0) {
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
  return ts.errors = s, o === 0;
}
ts.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Ns(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Ns.evaluated;
  return c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0), ts(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ts.errors : s.concat(ts.errors), o = s.length), Ns.errors = s, o === 0;
}
Ns.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
let Hr;
async function _c() {
  return Hr || (Hr = Ac()), Hr;
}
async function Ac() {
  const e = await Promise.all([
    fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v2.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/permissions-v1.json", { credentials: "same-origin" })
  ]);
  if (e.some((l) => !l.ok)) throw new Error("无法载入 Manifest 平台契约。");
  const [t, n, a] = await Promise.all(e.map((l) => l.json()));
  return {
    schemas: { 1: t, 2: n },
    validators: { 1: Cs, 2: Ns },
    permissionRegistry: a,
    permissionIds: new Set(a.permissions.map((l) => l.id)),
    sourceDeclarableIds: new Set(a.sourceDeclaration?.declarablePermissionIds || [])
  };
}
async function jc(e) {
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
        ...Cc(e, r.message)
      }]
    };
  }
  const n = St(t);
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
  const a = await _c(), l = a.schemas[n], u = a.validators[n];
  u(t);
  const s = (u.errors || []).filter((r) => !Oc(n, r)).map((r) => ({
    ruleId: "WWM002",
    severity: "error",
    path: Mc(r.instancePath || r.params?.missingProperty || ""),
    message: r.message || r.keyword
  }));
  Tc(t, n, a.permissionIds, a.sourceDeclarableIds, s), n === 2 && t.sdk?.apiVersion !== void 0 && t.sdk.apiVersion !== "1" && s.push({
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
function Tc(e, t, n, a, l) {
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
    u.has(s) && l.push({ ruleId: "WWM007", severity: "error", path: c, message: `重复权限：${s}` }), u.add(s), Ec(s) ? l.push({ ruleId: "WWM008", severity: "error", path: c, message: `禁止声明超级或私有权限：${s}` }) : n.has(s) ? a.has(s) || l.push({ ruleId: "WWM008", severity: "error", path: c, message: `权限尚未开放 Source Manifest 声明：${s}` }) : l.push({ ruleId: "WWM006", severity: "error", path: c, message: `未知权限：${s}` });
  });
}
function Ec(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function Oc(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function Mc(e) {
  return e ? e.startsWith("/") ? `$${e.split("/").slice(1).map((t) => {
    const n = t.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(n) ? `[${n}]` : `.${n}`;
  }).join("")}` : `$.${e}` : "$";
}
function Cc(e, t) {
  const n = /position\s+(\d+)/i.exec(t);
  if (!n) return { line: 1, column: 1 };
  const a = Math.min(Number(n[1]), e.length), l = e.slice(0, a).split(`
`);
  return { line: l.length, column: l.at(-1).length + 1 };
}
const Nc = {
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
function Lc() {
  return {
    displayName: "Hello WebWindows",
    files: [
      { path: "manifest.json", kind: "file", content: `${JSON.stringify(Nc, null, 2)}
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
const mi = 240;
function ce(e, t = {}) {
  const n = String(e ?? "");
  if (n.includes("\0")) throw Nt("项目路径不能包含 NUL。", e);
  if (/^[a-z]:/i.test(n)) throw Nt("项目路径不能使用盘符。", e);
  const a = n.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!a) {
    if (t.allowRoot === !0) return "";
    throw Nt("项目路径不能为空。", e);
  }
  if (a.startsWith("/")) throw Nt("项目路径必须是相对路径。", e);
  if (a.length > mi)
    throw Nt(`项目路径不能超过 ${mi} 个字符。`, e);
  const l = a.split("/");
  if (l.some((u) => !u || u === "." || u === ".."))
    throw Nt("项目路径包含不安全的路径段。", e);
  return l.join("/");
}
function Ls(e) {
  const t = ce(e), n = t.lastIndexOf("/");
  return n < 0 ? "" : t.slice(0, n);
}
function on(e) {
  const t = ce(e);
  return t.slice(t.lastIndexOf("/") + 1);
}
function Rc(e, t) {
  const n = ce(e, { allowRoot: !0 }), a = String(t ?? "");
  if (!a || a.includes("/") || a.includes("\\"))
    throw Nt("文件或目录名称必须是单个安全路径段。", t);
  return ce(n ? `${n}/${a}` : a);
}
function Nt(e, t) {
  const n = new TypeError(e);
  return n.code = "invalid-project-path", n.value = t, n;
}
const zc = "webwindows-developer-studio-v1", hi = 1, Dc = 1, ie = "projects", ue = "files", Mt = "projectId";
class Wc {
  constructor(t = {}) {
    if (this.indexedDB = t.indexedDB || globalThis.indexedDB, this.crypto = t.crypto || globalThis.crypto, this.databaseName = t.databaseName || zc, this.now = t.now || (() => (/* @__PURE__ */ new Date()).toISOString()), this.databasePromise = null, !this.indexedDB) throw new Error("IndexedDB is required by Developer Studio.");
  }
  async listProjects() {
    const t = await this.open();
    return (await Ae(
      t.transaction(ie, "readonly").objectStore(ie).getAll()
    )).sort((a, l) => String(l.updatedAt).localeCompare(String(a.updatedAt))).map(ut);
  }
  async createProject(t = {}) {
    const n = Vc(this.crypto), a = this.now(), l = {
      uuid: n,
      displayName: gi(t.displayName || "Untitled WebWindows Function"),
      schemaVersion: Dc,
      storageVersion: hi,
      createdAt: a,
      updatedAt: a,
      editorState: mr(t.editorState)
    }, u = Fc(t.files || [], n, a), o = (await this.open()).transaction([ie, ue], "readwrite");
    o.objectStore(ie).add(l);
    const c = o.objectStore(ue);
    return u.forEach((r) => c.add(r)), await bt(o), ut(l);
  }
  async getProject(t) {
    const n = await this.open(), a = await Ae(
      n.transaction(ie, "readonly").objectStore(ie).get(t)
    );
    if (!a) throw ge("project-not-found", "找不到项目。");
    return ut(a);
  }
  async renameProject(t, n) {
    return this.updateProject(t, (a) => {
      a.displayName = gi(n);
    });
  }
  async saveEditorState(t, n) {
    return this.updateProject(t, (a) => {
      a.editorState = mr(n);
    });
  }
  async deleteProject(t) {
    const a = (await this.open()).transaction([ie, ue], "readwrite"), l = a.objectStore(ie);
    if (!await Ae(l.get(t))) throw ge("project-not-found", "找不到项目。");
    const s = a.objectStore(ue);
    (await Ae(s.index(Mt).getAll(t))).forEach((c) => s.delete([t, c.path])), l.delete(t), await bt(a);
  }
  async listEntries(t) {
    await this.getProject(t);
    const n = await this.open();
    return (await Ae(
      n.transaction(ue, "readonly").objectStore(ue).index(Mt).getAll(t)
    )).sort(wi).map(ut);
  }
  async readProjectState(t) {
    const a = (await this.open()).transaction([ie, ue], "readonly"), l = await Ae(a.objectStore(ie).get(t));
    if (!l) throw ge("project-not-found", "找不到项目。");
    const u = await Ae(
      a.objectStore(ue).index(Mt).getAll(t)
    );
    return await bt(a), {
      project: ut(l),
      entries: u.sort(wi).map(ut)
    };
  }
  async readTextFile(t, n) {
    const a = await this.getEntry(t, n);
    if (a.kind !== "file") throw ge("not-a-file", "目标不是文本文件。");
    return a.content;
  }
  async writeTextFile(t, n, a) {
    const l = ce(n), s = (await this.open()).transaction([ie, ue], "readwrite"), o = await Gs(s, t), c = s.objectStore(ue), r = await Ae(c.get([t, l]));
    if (!r) throw ge("file-not-found", "找不到文件。");
    if (r.kind !== "file") throw ge("not-a-file", "目标不是文本文件。");
    const i = this.now();
    c.put({ ...r, content: String(a), updatedAt: i }), o.updatedAt = i, s.objectStore(ie).put(o), await bt(s);
  }
  async createFile(t, n, a = "") {
    return this.createEntry(t, n, "file", String(a));
  }
  async createDirectory(t, n) {
    return this.createEntry(t, n, "directory", void 0);
  }
  async renameEntry(t, n, a) {
    const l = ce(n), u = ce(a);
    if (l === u) return this.getEntry(t, l);
    if (u.startsWith(`${l}/`))
      throw ge("invalid-project-path", "目录不能移动到自身内部。");
    const o = (await this.open()).transaction([ie, ue], "readwrite"), c = await Gs(o, t), r = o.objectStore(ue), i = await Ae(r.index(Mt).getAll(t)), d = i.filter((y) => y.path === l || y.path.startsWith(`${l}/`));
    if (!d.length) throw ge("entry-not-found", "找不到文件或目录。");
    await yi(i, u);
    const h = new Set(d.map((y) => y.path)), p = new Set(d.map((y) => y.path === l ? u : `${u}${y.path.slice(l.length)}`));
    if (i.some((y) => !h.has(y.path) && p.has(y.path)))
      throw ge("entry-exists", "目标路径已经存在。");
    const f = this.now();
    return d.forEach((y) => {
      const P = y.path === l ? u : `${u}${y.path.slice(l.length)}`;
      r.delete([t, y.path]), r.add({ ...y, path: P, updatedAt: f });
    }), c.editorState = Hc(c.editorState, l, u), c.updatedAt = f, o.objectStore(ie).put(c), await bt(o), this.getEntry(t, u);
  }
  async deleteEntry(t, n) {
    const a = ce(n), u = (await this.open()).transaction([ie, ue], "readwrite"), s = await Gs(u, t), o = u.objectStore(ue), r = (await Ae(o.index(Mt).getAll(t))).filter((d) => d.path === a || d.path.startsWith(`${a}/`));
    if (!r.length) throw ge("entry-not-found", "找不到文件或目录。");
    r.forEach((d) => o.delete([t, d.path]));
    const i = this.now();
    s.editorState = Bc(s.editorState, a), s.updatedAt = i, u.objectStore(ie).put(s), await bt(u);
  }
  async getEntry(t, n) {
    const a = ce(n);
    await this.getProject(t);
    const l = await this.open(), u = await Ae(
      l.transaction(ue, "readonly").objectStore(ue).get([t, a])
    );
    if (!u) throw ge("entry-not-found", "找不到文件或目录。");
    return ut(u);
  }
  async close() {
    if (!this.databasePromise) return;
    (await this.databasePromise).close(), this.databasePromise = null;
  }
  async open() {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((t, n) => {
      const a = this.indexedDB.open(this.databaseName, hi);
      a.onupgradeneeded = () => {
        const l = a.result;
        l.objectStoreNames.contains(ie) || l.createObjectStore(ie, { keyPath: "uuid" }), l.objectStoreNames.contains(ue) || l.createObjectStore(ue, { keyPath: ["projectId", "path"] }).createIndex(Mt, "projectId", { unique: !1 });
      }, a.onsuccess = () => t(a.result), a.onerror = () => n(a.error || new Error("Developer Studio database failed to open.")), a.onblocked = () => n(new Error("Developer Studio database upgrade is blocked."));
    });
    try {
      return await this.databasePromise;
    } catch (t) {
      throw this.databasePromise = null, t;
    }
  }
  async updateProject(t, n) {
    const l = (await this.open()).transaction(ie, "readwrite"), u = l.objectStore(ie), s = await Ae(u.get(t));
    if (!s) throw ge("project-not-found", "找不到项目。");
    return n(s), s.updatedAt = this.now(), u.put(s), await bt(l), ut(s);
  }
  async createEntry(t, n, a, l) {
    const u = ce(n), o = (await this.open()).transaction([ie, ue], "readwrite"), c = await Gs(o, t), r = o.objectStore(ue), i = await Ae(r.index(Mt).getAll(t));
    if (i.some((p) => p.path === u))
      throw ge("entry-exists", "目标路径已经存在。");
    await yi(i, u);
    const d = this.now(), h = {
      projectId: t,
      path: u,
      kind: a,
      ...a === "file" ? { content: String(l ?? "") } : {},
      createdAt: d,
      updatedAt: d
    };
    return r.add(h), c.updatedAt = d, o.objectStore(ie).put(c), await bt(o), ut(h);
  }
}
function Fc(e, t, n) {
  const a = /* @__PURE__ */ new Set(), l = e.map((u) => {
    const s = ce(u.path);
    if (a.has(s)) throw ge("entry-exists", `模板包含重复路径：${s}`);
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
    const s = Ls(u.path);
    if (!s) return;
    const o = l.find((c) => c.path === s);
    if (!o || o.kind !== "directory")
      throw ge("parent-directory-not-found", `模板缺少父目录：${s}`);
  }), l;
}
async function Gs(e, t) {
  const n = await Ae(e.objectStore(ie).get(t));
  if (!n) throw ge("project-not-found", "找不到项目。");
  return n;
}
async function yi(e, t) {
  const n = Ls(t);
  if (!n) return;
  const a = e.find((l) => l.path === n);
  if (!a || a.kind !== "directory")
    throw ge("parent-directory-not-found", "父目录不存在。");
}
function Vc(e) {
  if (typeof e?.randomUUID == "function") return e.randomUUID();
  if (typeof e?.getRandomValues != "function")
    throw new Error("Secure random UUID generation is unavailable.");
  const t = e.getRandomValues(new Uint8Array(16));
  t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128;
  const n = [...t].map((a) => a.toString(16).padStart(2, "0"));
  return `${n.slice(0, 4).join("")}-${n.slice(4, 6).join("")}-${n.slice(6, 8).join("")}-${n.slice(8, 10).join("")}-${n.slice(10).join("")}`;
}
function gi(e) {
  const t = String(e || "").trim().slice(0, 120);
  if (!t) throw ge("invalid-project-name", "项目名称不能为空。");
  return t;
}
function mr(e) {
  const t = e && typeof e == "object" ? e : {}, n = (u) => [...new Set((Array.isArray(u) ? u : []).map((s) => {
    try {
      return ce(s);
    } catch {
      return null;
    }
  }).filter(Boolean))], a = n(t.openFiles), l = t.activeFile ? ce(t.activeFile) : a[0] || null;
  return {
    openFiles: a,
    activeFile: l,
    recentFiles: n(t.recentFiles).slice(0, 20)
  };
}
function Hc(e, t, n) {
  const a = (l) => l === t || l?.startsWith(`${t}/`) ? `${n}${l.slice(t.length)}` : l;
  return mr({
    openFiles: e?.openFiles?.map(a),
    activeFile: a(e?.activeFile),
    recentFiles: e?.recentFiles?.map(a)
  });
}
function Bc(e, t) {
  const n = (l) => l !== t && !l.startsWith(`${t}/`), a = (e?.openFiles || []).filter(n);
  return mr({
    openFiles: a,
    activeFile: e?.activeFile && n(e.activeFile) ? e.activeFile : a[0] || null,
    recentFiles: (e?.recentFiles || []).filter(n)
  });
}
function wi(e, t) {
  return e.path === t.path ? 0 : e.path.localeCompare(t.path);
}
function ut(e) {
  return structuredClone(e);
}
function Ae(e) {
  return new Promise((t, n) => {
    e.onsuccess = () => t(e.result), e.onerror = () => n(e.error || new Error("IndexedDB request failed."));
  });
}
function bt(e) {
  return new Promise((t, n) => {
    e.oncomplete = () => t(), e.onerror = () => n(e.error || new Error("IndexedDB transaction failed.")), e.onabort = () => n(e.error || new Error("IndexedDB transaction was aborted."));
  });
}
function ge(e, t) {
  const n = new Error(t);
  return n.code = e, n;
}
function vi(e, t) {
  return Rc(e, t);
}
function Uc(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  e.forEach((l) => n.set(l.path, {
    ...l,
    name: on(l.path),
    children: []
  })), n.forEach((l) => {
    const u = Ls(l.path);
    u ? n.get(u)?.children.push(l) : t.push(l);
  });
  const a = (l) => l.sort((u, s) => u.kind !== s.kind ? u.kind === "directory" ? -1 : 1 : u.name.localeCompare(s.name)).forEach((u) => a(u.children));
  return a(t), t;
}
function Zc(e) {
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
const Oo = "webwindows-project-snapshot-v1";
async function Kc(e, t, n = {}) {
  if (!e || typeof e.readProjectState != "function")
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  const a = await e.readProjectState(t), l = a.entries.filter((r) => r.kind === "file").map((r) => Object.freeze({
    path: ce(r.path),
    content: String(r.content ?? ""),
    byteLength: ss(r.content ?? "").byteLength
  })).sort((r, i) => Xc(r.path, i.path)), u = /* @__PURE__ */ new Set();
  for (const r of l) {
    if (u.has(r.path)) throw new Error(`Snapshot contains duplicate path: ${r.path}`);
    u.add(r.path);
  }
  const s = l.reduce((r, i) => r + i.byteLength, 0), o = await Jc(Gc(a.project.uuid, l)), c = {
    contract: Oo,
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
function hr(e, t) {
  const n = ce(t);
  return e.files.find((a) => a.path === n) || null;
}
async function Jc(e) {
  const t = globalThis.crypto;
  if (!t?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const n = await t.subtle.digest("SHA-256", e);
  return [...new Uint8Array(n)].map((a) => a.toString(16).padStart(2, "0")).join("");
}
function Gc(e, t) {
  const n = [ss(`${Oo}\0${e}\0`)];
  for (const s of t) {
    const o = ss(s.path), c = ss(s.content);
    n.push(bi(o.byteLength), o, bi(c.byteLength), c);
  }
  const a = n.reduce((s, o) => s + o.byteLength, 0), l = new Uint8Array(a);
  let u = 0;
  for (const s of n)
    l.set(s, u), u += s.byteLength;
  return l;
}
function bi(e) {
  const t = new Uint8Array(4);
  return new DataView(t.buffer).setUint32(0, e, !1), t;
}
function ss(e) {
  return new TextEncoder().encode(String(e));
}
function Xc(e, t) {
  const n = ss(e), a = ss(t), l = Math.min(n.length, a.length);
  for (let u = 0; u < l; u += 1)
    if (n[u] !== a[u]) return n[u] - a[u];
  return n.length - a.length;
}
let Br;
async function bs() {
  return Br || (Br = Yc()), Br;
}
async function Yc() {
  const e = await Promise.all([
    He("/data/sdk/manifest-v1.schema.json"),
    He("/data/sdk/manifest-v2.schema.json"),
    He("/data/sdk/permissions-v1.json"),
    He("/data/sdk/capability-broker-v1.schema.json"),
    He("/data/sdk/capability-broker-methods-v1.json"),
    He("/data/sdk/capability-broker-errors-v1.json"),
    He("/data/sdk/capability-broker-policy-v1.json"),
    He("/data/sdk/permission-decision-v1.json"),
    He("/data/sdk/package-runtime-policy-v1.json"),
    He("/data/sdk/runtime-compatibility-v1.json"),
    He("/data/sdk/studio-validator-rules-v1.json"),
    Qc("/data/sdk/webwindows-public-api-v1.d.ts")
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
async function He(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.json();
}
async function Qc(e) {
  const t = await fetch(e, { credentials: "same-origin" });
  if (!t.ok) throw new Error(`无法载入平台契约：${e}`);
  return t.text();
}
const ed = "webwindows-studio-validation-report-v1";
async function an(e, t = {}) {
  const n = t.contracts || await bs(), a = pd(n.ruleCatalog), l = [], u = (h, p = {}) => l.push(fd(a, h, p));
  td(n, u), sd(e, n.packagePolicy, u);
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
        location: wd(s.content, h.message),
        message: h.message
      });
    }
  o && (rd(o, n, u), ad(e, o, n.packagePolicy, u)), ld(e, o, n, u);
  const c = [...new Map(l.map((h) => [kd(h), h])).values()].sort(Pd), r = c.filter((h) => h.severity === "error").length, i = c.filter((h) => h.severity === "warning").length, d = typeof o?.entry == "string" ? o.entry : null;
  return {
    contract: ed,
    schemaVersion: 1,
    validatorVersion: n.ruleCatalog.validatorVersion,
    snapshotId: e.snapshotId,
    projectUuid: e.projectUuid,
    manifestIdentity: bd(o),
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
function td(e, t) {
  const n = e.runtimeCompatibility.packageRuntime;
  (n?.status !== "supported" || n?.model !== e.packagePolicy.runtimeModel) && t("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
}
function sd(e, t, n) {
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
      const s = ce(l.path);
      if (s !== l.path || s.length > t.limits.maxPathCharacters)
        throw new Error("not canonical");
    } catch {
      n("WWP002", { path: l.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const u = En(l.path);
    a.has(u) || n("WWP005", {
      path: l.path,
      message: `Package Runtime 不允许文件类型 ${u || "(none)"}。`,
      metadata: { extension: u }
    });
  }
}
function rd(e, t, n) {
  const a = St(e);
  if (a == null) {
    n("WWM005", {
      path: "manifest.json$.manifestVersion",
      message: "不支持的 Manifest 版本；legacy v1 省略 manifestVersion，v2 显式使用数字 2。"
    });
    return;
  }
  const l = t.manifestSchemas?.[a] || t.manifestSchema, u = a === 2 ? Ns : Cs;
  if (!u(e))
    for (const c of u.errors || [])
      od(a, c) || n("WWM002", {
        path: `manifest.json${vd(c.instancePath, c.params?.missingProperty)}`,
        message: c.message || c.keyword,
        metadata: { keyword: c.keyword, schemaPath: c.schemaPath }
      });
  nd(e, a, t.permissionRegistry, n), a === 2 && e.sdk?.apiVersion !== void 0 && e.sdk.apiVersion !== "1" && n("WWM009", {
    path: "manifest.json$.sdk.apiVersion",
    message: "当前只支持 WebWindows Public SDK API version 1。",
    metadata: { actual: e.sdk.apiVersion }
  });
  const s = l.$defs?.sourceManifest?.properties || {};
  for (const [c, r] of Object.entries(s)) {
    if (!Object.prototype.hasOwnProperty.call(e, c)) continue;
    const i = hd(l, r), d = `${r.description || ""} ${i.description || ""}`;
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
function nd(e, t, n, a) {
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
    s.has(o) && a("WWM007", { path: r, message: `重复权限：${o}`, metadata: { permission: o } }), s.add(o), id(o) ? a("WWM008", { path: r, message: `禁止声明超级或私有权限：${o}`, metadata: { permission: o } }) : l.has(o) ? u.has(o) || a("WWM008", { path: r, message: `权限尚未开放 Source Manifest 声明：${o}`, metadata: { permission: o } }) : a("WWM006", { path: r, message: `未知权限：${o}`, metadata: { permission: o } });
  });
}
function id(e) {
  return e === "native" || e === "system" || e === "device.*" || e.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(e);
}
function od(e, t) {
  return e !== 2 ? !1 : t.instancePath === "/sdk/apiVersion" && t.keyword === "const" || t.instancePath === "/permissions" && t.keyword === "uniqueItems" || t.instancePath.startsWith("/permissions/") && t.keyword === "enum";
}
function ad(e, t, n, a) {
  if (typeof t.entry != "string") return;
  let l;
  try {
    l = ce(t.entry);
  } catch {
    a("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  (!n.entryExtensions.includes(En(l)) || !hr(e, l)) && a("WWP006", {
    path: "manifest.json$.entry",
    message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
    metadata: { entry: l }
  });
}
function ld(e, t, n, a) {
  const l = md(n.publicApiText), u = new Set(e.files.map((s) => s.path));
  for (const s of e.files) {
    const o = En(s.path);
    o === ".js" && ud(s, l, t, a), (o === ".html" || o === ".htm") && cd(s, u, a), o === ".css" && dd(s, a);
  }
  (n.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported" || n.runtimeCompatibility.packageRuntime.execution.network !== "none") && a("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
}
function ud(e, t, n, a) {
  const l = gd(e.content);
  ft(l, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (s, o) => {
    a("WWS001", { path: e.path, location: Ue(e.content, o), message: "Package Runtime 仅支持 classic JavaScript。" });
  }), ft(l, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (s, o) => {
    a("WWS003", { path: e.path, location: Ue(e.content, o), message: "功能代码不能引用私有 Native API。" });
  }), ft(l, /\bparent\s*\.\s*WebWindows\b/g, (s, o) => {
    a("WWS004", { path: e.path, location: Ue(e.content, o), message: "功能代码不能访问 parent.WebWindows。" });
  }), ft(l, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (s, o) => {
    const c = s[1];
    t.has(c) || a("WWS004", {
      path: e.path,
      location: Ue(e.content, o),
      message: `WebWindows.${c} 不属于 Public API v1。`,
      metadata: { namespace: c }
    });
  }), ft(l, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (s, o) => {
    a("WWS005", {
      path: e.path,
      location: Ue(e.content, o),
      message: `${s[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
  const u = /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*device\s*\.\s*battery\s*\.\s*(?:getState|refresh)\s*\(/g.exec(l);
  u && (St(n) !== 2 || !n.permissions?.includes("device.battery-status.read")) && a("WWM010", {
    path: e.path,
    location: Ue(e.content, u.index),
    message: "Battery Broker API 需要 Manifest v2 声明 device.battery-status.read；静态提示不会自动授予权限。",
    metadata: { requiredPermission: "device.battery-status.read" }
  });
}
function cd(e, t, n) {
  ft(e.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (a, l) => {
    n("WWS001", { path: e.path, location: Ue(e.content, l), message: "Package Runtime 不支持 script type=module。" });
  }), ft(e.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (a, l) => {
    const u = a[2], s = yd(e.path, u);
    (!s || !t.has(s)) && n("WWS002", {
      path: e.path,
      location: Ue(e.content, l),
      message: `脚本或样式依赖必须包含在功能包内：${u}`,
      metadata: { reference: u }
    });
  }), ft(e.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (a, l) => {
    n("WWS002", {
      path: e.path,
      location: Ue(e.content, l),
      message: `外部资源在无网络 Runtime 中不可用：${a[1]}`,
      metadata: { reference: a[1] }
    });
  });
}
function dd(e, t) {
  ft(e.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (n, a) => {
    t("WWS002", {
      path: e.path,
      location: Ue(e.content, a),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${n[1]}`,
      metadata: { reference: n[1] }
    });
  });
}
function pd(e) {
  return new Map(e.rules.map((t) => [t.ruleId, t]));
}
function fd(e, t, n) {
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
function md(e) {
  const t = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(e)?.[1] || "";
  return new Set([...t.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((n) => n[1]));
}
function hd(e, t) {
  return t?.$ref?.startsWith("#/$defs/") ? e.$defs?.[t.$ref.slice(8)] || t : t || {};
}
function yd(e, t) {
  const n = String(t || "").split(/[?#]/, 1)[0];
  if (!n || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(n)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of n.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  return a.join("/");
}
function gd(e) {
  return e.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (t) => t.replace(/[^\n]/g, " ")
  );
}
function ft(e, t, n) {
  for (const a of e.matchAll(t)) n(a, a.index || 0);
}
function Ue(e, t) {
  const n = e.slice(0, t).split(`
`);
  return { line: n.length, column: n.at(-1).length + 1 };
}
function wd(e, t) {
  const n = /position\s+(\d+)/i.exec(t);
  return Ue(e, n ? Number(n[1]) : 0);
}
function vd(e, t) {
  return `$${(e || (t ? `/${t}` : "")).split("/").slice(1).map((a) => /^\d+$/.test(a) ? `[${a}]` : `.${a.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}
function bd(e) {
  return !e || typeof e.id != "string" || typeof e.version != "string" ? null : {
    id: e.id,
    version: e.version,
    name: typeof e.name == "string" ? e.name : null,
    manifestVersion: St(e),
    sdkApiVersion: typeof e.sdk?.apiVersion == "string" ? e.sdk.apiVersion : null
  };
}
function En(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function Pd(e, t) {
  return e.ruleId.localeCompare(t.ruleId) || String(e.path || "").localeCompare(String(t.path || "")) || (e.location?.line || 0) - (t.location?.line || 0) || e.message.localeCompare(t.message);
}
function kd(e) {
  return [
    e.ruleId,
    e.severity,
    e.path || "",
    e.location?.line || 0,
    e.location?.column || 0,
    e.message
  ].join("\0");
}
const Xs = "webwindows-studio-preview-control-v1", $d = "webwindows-studio-preview-console-v1", Id = "webwindows-studio-preview-console-init-v1", qd = "webwindows-studio-preview-sdk-init-v1", Sd = "webwindows-studio-preview-session-v1", xd = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'", _d = 30 * 1024 * 1024;
function Rs(e = "preview") {
  const t = globalThis.crypto;
  if (!t?.getRandomValues) throw new Error("Web Crypto is required for Preview sessions.");
  const n = new Uint8Array(24);
  t.getRandomValues(n);
  const a = [...n].map((l) => l.toString(16).padStart(2, "0")).join("");
  return `${e}-${a}`;
}
function ln(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
class Ad {
  constructor({ onConsole: t, onState: n, onBroker: a } = {}) {
    this.onConsole = t || (() => {
    }), this.onState = n || (() => {
    }), this.onBroker = a || null, this.port = null, this.hostNonce = null, this.requests = /* @__PURE__ */ new Map();
  }
  async connect(t) {
    if (this.disconnect(), !t?.contentWindow) throw new Error("Developer Preview Host 尚未加载。");
    this.hostNonce = Rs("host");
    const n = new MessageChannel();
    this.port = n.port1, this.port.onmessage = (a) => this.#n(a.data), this.port.start(), t.contentWindow.postMessage({
      protocol: Xs,
      version: 1,
      type: "host.connect",
      hostNonce: this.hostNonce
    }, location.origin, [n.port2]), await this.#t("host.ping", {}, 5e3);
  }
  async start(t, n, a = { facadeEnabled: !1 }) {
    const l = new TextEncoder().encode(n).byteLength;
    if (l > _d) throw new Error("Preview document 超过 30 MB 上限。");
    return this.#t("preview.start", {
      session: jd(t),
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
    const l = Rs("request");
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
        protocol: Xs,
        version: 1,
        type: t,
        hostNonce: this.hostNonce,
        requestId: l,
        payload: n
      });
    });
  }
  #n(t) {
    if (!ln(t) || t.protocol !== Xs || t.version !== 1 || t.hostNonce !== this.hostNonce || typeof t.type != "string") return;
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
          protocol: Xs,
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
function jd(e) {
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
function Td({ sessionId: e, snapshotId: t, token: n }) {
  const a = JSON.stringify({
    initProtocol: Id,
    protocol: $d,
    sessionId: e,
    snapshotId: t,
    token: n
  }).replace(/</g, "\\u003c");
  return `;(${Ed.toString()})(${a});`;
}
function Ed(e) {
  let u = null, s = 0;
  const o = [];
  function c(h) {
    const p = String(h);
    return p.length <= 4096 ? p : `${p.slice(0, 4096)}…[truncated]`;
  }
  function r(h, p, f) {
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
        const $ = h.slice(0, 40).map((O) => r(O, p + 1, f));
        return h.length > 40 && $.push(`[${h.length - 40} more items]`), $;
      }
      const y = {}, P = Object.keys(h).slice(0, 40);
      for (const $ of P)
        try {
          y[c($)] = r(h[$], p + 1, f);
        } catch (O) {
          y[c($)] = `[Unreadable: ${c(O?.message || O)}]`;
        }
      return Object.keys(h).length > 40 && (y["…"] = "[truncated properties]"), y;
    } catch (y) {
      return `[Unserializable: ${c(y?.message || y)}]`;
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
      arguments: Array.from(p).map((f) => r(f, 0, /* @__PURE__ */ new Set()))
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
function Od({ sessionId: e, snapshotId: t }, n) {
  if (!n?.facadeEnabled) return "";
  const a = JSON.stringify({
    initProtocol: qd,
    protocol: n.protocol,
    version: n.version,
    sessionId: e,
    snapshotId: t,
    channelId: n.channelId,
    refreshTimeoutMs: n.refreshTimeoutMs,
    clientErrors: n.clientErrors,
    handshake: n.handshake
  }).replace(/</g, "\\u003c");
  return `;(${Md.toString()})(${a});`;
}
function Md(e) {
  let t = null, n = 0, a = e.handshake?.ok === !0 ? o(e.handshake.result) : null;
  const l = e.handshake?.ok === !1 ? e.handshake.error : null, u = /* @__PURE__ */ new Map(), s = [];
  function o(y) {
    return {
      supported: y.supported,
      present: y.present,
      level: y.level,
      charging: y.charging,
      connected: y.connected,
      source: y.source
    };
  }
  function c(y) {
    const P = new Error(y?.message || "The WebWindows capability request failed.");
    return P.name = "WebWindowsCapabilityError", P.code = y?.code || "broker-unavailable", P.retryable = y?.retryable === !0, P;
  }
  function r() {
    const y = new Uint8Array(16);
    return crypto.getRandomValues(y), `sdk-${n++}-${Array.from(y, (P) => P.toString(16).padStart(2, "0")).join("")}`;
  }
  function i(y) {
    t ? t.postMessage(y) : s.push(y);
  }
  function d() {
    const y = r(), P = {
      protocol: e.protocol,
      version: e.version,
      type: "request",
      sessionId: e.sessionId,
      snapshotId: e.snapshotId,
      channelId: e.channelId,
      requestId: y,
      method: "device.battery.refresh",
      params: {}
    };
    return new Promise(($, O) => {
      const C = setTimeout(() => {
        if (!u.delete(y)) return;
        const { params: N, ...X } = P;
        i({ ...X, type: "cancel" }), O(c(e.clientErrors?.["request-timeout"]));
      }, e.refreshTimeoutMs);
      u.set(y, { resolve: $, reject: O, timer: C }), i(P);
    });
  }
  function h(y) {
    if (!y || y.protocol !== e.protocol || y.version !== e.version || y.type !== "response" || y.sessionId !== e.sessionId || y.snapshotId !== e.snapshotId || y.channelId !== e.channelId || y.method !== "device.battery.refresh" || typeof y.requestId != "string") return;
    const P = u.get(y.requestId);
    P && (u.delete(y.requestId), clearTimeout(P.timer), y.ok === !0 ? (a = o(y.result), P.resolve(o(a))) : P.reject(c(y.error)));
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
      for (t = P.ports[0], t.onmessage = (O) => h(O.data), t.start?.(); s.length; ) t.postMessage(s.shift());
  });
}
const un = Object.freeze({
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8",
  ".svg": "image/svg+xml;charset=utf-8"
}), Cd = /* @__PURE__ */ new Set([".html", ".htm", ...Object.keys(un)]);
function Nd(e, t, n = {}) {
  const a = hr(e, "manifest.json");
  if (!a) throw new Error("Preview Snapshot 缺少 manifest.json。");
  const l = JSON.parse(a.content), u = ce(l.entry), s = hr(e, u);
  if (!s || ![".html", ".htm"].includes(ys(u)))
    throw new Error("Preview Snapshot 的 HTML entry 不存在。");
  const c = (n.domParser || new DOMParser()).parseFromString(s.content, "text/html");
  if (c.querySelector('script[type="module"]')) throw new Error("Developer Preview 不支持 ES Module。");
  const r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const f of e.files) {
    const y = ys(f.path);
    Cd.has(y) && Object.prototype.hasOwnProperty.call(un, y) && ![".css", ".js"].includes(y) && r.set(f.path, Ld(f.content, un[y]));
  }
  for (const f of e.files) {
    const y = ys(f.path);
    y === ".js" && i.set(f.path, f.content), y === ".css" && i.set(f.path, Pi(f.content, f.path, r));
  }
  const d = c.createElement("meta");
  d.httpEquiv = "Content-Security-Policy", d.content = xd, c.head.prepend(d);
  const h = c.createElement("script");
  h.setAttribute("data-webwindows-preview-bootstrap", "v1"), h.textContent = Td(t), c.head.insertBefore(h, d.nextSibling);
  const p = Od(t, n.sdkLaunch);
  if (p) {
    const f = c.createElement("script");
    f.setAttribute("data-webwindows-preview-sdk", "v1"), f.textContent = p, c.head.insertBefore(f, h.nextSibling);
  }
  return c.querySelectorAll("script[src]").forEach((f) => {
    const y = f.getAttribute("src"), P = Ps(u, y);
    if (!P || ys(P) !== ".js" || !i.has(P))
      throw new Error(`Preview 脚本必须来自 Snapshot：${y}`);
    f.removeAttribute("src"), f.textContent = i.get(P);
  }), c.querySelectorAll('link[rel~="stylesheet"][href]').forEach((f) => {
    const y = f.getAttribute("href"), P = Ps(u, y);
    if (!P || ys(P) !== ".css" || !i.has(P))
      throw new Error(`Preview 样式必须来自 Snapshot：${y}`);
    const $ = c.createElement("style");
    $.textContent = i.get(P), f.replaceWith($);
  }), c.querySelectorAll("style").forEach((f) => {
    f.textContent = Pi(f.textContent, u, r);
  }), c.querySelectorAll("[src],[href],[poster]").forEach((f) => {
    for (const y of ["src", "href", "poster"]) {
      if (!f.hasAttribute(y)) continue;
      const P = Ps(u, f.getAttribute(y));
      P && r.has(P) && f.setAttribute(y, r.get(P));
    }
  }), c.querySelectorAll("[srcset]").forEach((f) => {
    const y = f.getAttribute("srcset").split(",").map((P) => {
      const $ = P.trim().split(/\s+/), O = Ps(u, $[0]);
      return O && r.has(O) && ($[0] = r.get(O)), $.join(" ");
    });
    f.setAttribute("srcset", y.join(", "));
  }), `<!DOCTYPE html>
` + c.documentElement.outerHTML;
}
function Ps(e, t) {
  const n = String(t || "").split(/[?#]/, 1)[0];
  if (!n || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(n)) return null;
  const a = e.split("/").slice(0, -1);
  for (const l of n.replace(/\\/g, "/").split("/"))
    !l || l === "." || (l === ".." ? a.pop() : a.push(l));
  try {
    return ce(a.join("/"));
  } catch {
    return null;
  }
}
function Pi(e, t, n) {
  return String(e).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (a, l, u) => {
    const s = Ps(t, u);
    return s && n.has(s) ? `url("${n.get(s)}")` : a;
  });
}
function Ld(e, t) {
  const n = new TextEncoder().encode(String(e));
  let a = "";
  for (let l = 0; l < n.length; l += 32768)
    a += String.fromCharCode(...n.subarray(l, l + 32768));
  return `data:${t};base64,${btoa(a)}`;
}
function ys(e) {
  return String(e).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
function Rd(e) {
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
const ki = yr, zd = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "request" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, params: { type: "object", maxProperties: 64 } } }, Tr = Object.prototype.hasOwnProperty, D = Rd, de = new RegExp("^[A-Za-z0-9._:-]+$", "u"), Fs = new RegExp("^[a-z][a-z0-9]*(?:\\.[a-z][A-Za-z0-9]*)+$", "u");
function rs(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = rs.evaluated;
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
      if (!Tr.call(zd.properties, r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Fs.test(r)) {
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
  return rs.errors = s, o === 0;
}
rs.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Dd = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !0 }, result: {} } };
function ns(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = ns.evaluated;
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
      if (!Tr.call(Dd.properties, r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Fs.test(r)) {
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
  return ns.errors = s, o === 0;
}
ns.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Wd = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "response" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, ok: { const: !1 }, error: { $ref: "#/$defs/publicError" } } }, Fd = new RegExp("^[a-z]+(?:-[a-z]+)*$", "u");
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
    if (e.ok === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ok" }, message: "must have required property 'ok'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.error === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "error" }, message: "must have required property 'error'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e)
      if (!Tr.call(Wd.properties, r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Fs.test(r)) {
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
            if (D(i) > 64) {
              const d = { instancePath: t + "/error/code", schemaPath: "#/$defs/publicError/properties/code/maxLength", keyword: "maxLength", params: { limit: 64 }, message: "must NOT have more than 64 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (!Fd.test(i)) {
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
            if (D(i) > 240) {
              const d = { instancePath: t + "/error/message", schemaPath: "#/$defs/publicError/properties/message/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" };
              s === null ? s = [d] : s.push(d), o++;
            }
            if (D(i) < 1) {
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
  return is.errors = s, o === 0;
}
is.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Rt(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = Rt.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const r = o;
  let i = !1, d = null;
  const h = o;
  ns(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? ns.errors : s.concat(ns.errors), o = s.length);
  var y = h === o;
  if (y) {
    i = !0, d = 0;
    var p = !0;
  }
  const f = o;
  is(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? is.errors : s.concat(is.errors), o = s.length);
  var y = f === o;
  if (y && i ? (i = !1, d = [d, 1]) : y && (i = !0, d = 1, p !== !0 && (p = !0)), i)
    o = r, s !== null && (r ? s.length = r : s = null);
  else {
    const P = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [P] : s.push(P), o++;
  }
  return Rt.errors = s, c.props = p, o === 0;
}
Rt.evaluated = { dynamicProps: !0, dynamicItems: !1 };
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Fs.test(r)) {
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
  return os.errors = s, o === 0;
}
os.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const $i = { properties: { protocol: { $ref: "#/$defs/protocol" }, version: { $ref: "#/$defs/version" }, type: { const: "event" }, sessionId: { $ref: "#/$defs/opaqueId" }, snapshotId: { $ref: "#/$defs/opaqueId" }, channelId: { $ref: "#/$defs/opaqueId" }, requestId: { $ref: "#/$defs/requestId" }, method: { $ref: "#/$defs/methodId" }, event: { enum: ["snapshot.update", "capability.change"] }, detail: { type: "object", maxProperties: 64 } } };
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
    if (e.event === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "event" }, message: "must have required property 'event'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    if (e.detail === void 0) {
      const r = { instancePath: t, schemaPath: "#/required", keyword: "required", params: { missingProperty: "detail" }, message: "must have required property 'detail'" };
      s === null ? s = [r] : s.push(r), o++;
    }
    for (const r in e)
      if (!Tr.call($i.properties, r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/sessionId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/snapshotId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 16) {
          const i = { instancePath: t + "/channelId", schemaPath: "#/$defs/opaqueId/minLength", keyword: "minLength", params: { limit: 16 }, message: "must NOT have fewer than 16 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 128) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/maxLength", keyword: "maxLength", params: { limit: 128 }, message: "must NOT have more than 128 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 1) {
          const i = { instancePath: t + "/requestId", schemaPath: "#/$defs/requestId/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!de.test(r)) {
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
        if (D(r) > 160) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (D(r) < 3) {
          const i = { instancePath: t + "/method", schemaPath: "#/$defs/methodId/minLength", keyword: "minLength", params: { limit: 3 }, message: "must NOT have fewer than 3 characters" };
          s === null ? s = [i] : s.push(i), o++;
        }
        if (!Fs.test(r)) {
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
        const i = { instancePath: t + "/event", schemaPath: "#/properties/event/enum", keyword: "enum", params: { allowedValues: $i.properties.event.enum }, message: "must be equal to one of the allowed values" };
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
  return as.errors = s, o === 0;
}
as.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function yr(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = yr.evaluated;
  c.dynamicProps && (c.props = void 0), c.dynamicItems && (c.items = void 0);
  const r = o;
  let i = !1, d = null;
  const h = o;
  rs(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? rs.errors : s.concat(rs.errors), o = s.length);
  var P = h === o;
  if (P) {
    i = !0, d = 0;
    var p = !0;
  }
  const f = o;
  if (!Rt(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }))
    s = s === null ? Rt.errors : s.concat(Rt.errors), o = s.length;
  else
    var y = Rt.evaluated.props;
  var P = f === o;
  if (P && i)
    i = !1, d = [d, 1];
  else {
    P && (i = !0, d = 1, p !== !0 && y !== void 0 && (y === !0 ? p = !0 : (p = p || {}, Object.assign(p, y))));
    const $ = o;
    os(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? os.errors : s.concat(os.errors), o = s.length);
    var P = $ === o;
    if (P && i)
      i = !1, d = [d, 2];
    else {
      P && (i = !0, d = 2, p !== !0 && (p = !0));
      const C = o;
      as(e, { instancePath: t, parentData: n, parentDataProperty: a, rootData: l, dynamicAnchors: u }) || (s = s === null ? as.errors : s.concat(as.errors), o = s.length);
      var P = C === o;
      P && i ? (i = !1, d = [d, 3]) : P && (i = !0, d = 3, p !== !0 && (p = !0));
    }
  }
  if (i)
    o = r, s !== null && (r ? s.length = r : s = null);
  else {
    const $ = { instancePath: t, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: d }, message: "must match exactly one schema in oneOf" };
    s === null ? s = [$] : s.push($), o++;
  }
  return yr.errors = s, c.props = p, o === 0;
}
yr.evaluated = { dynamicProps: !0, dynamicItems: !1 };
const Vd = gr;
function gr(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = gr.evaluated;
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
  return gr.errors = s, o === 0;
}
gr.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
const Hd = wr, gs = { properties: { present: { type: ["boolean", "null"] }, level: { type: ["number", "null"] }, charging: { type: ["boolean", "null"] }, connected: { type: ["boolean", "null"] }, source: { enum: ["browser", "runtime", "unsupported"] } } };
function wr(e, { instancePath: t = "", parentData: n, parentDataProperty: a, rootData: l = e, dynamicAnchors: u = {} } = {}) {
  let s = null, o = 0;
  const c = wr.evaluated;
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
        const i = { instancePath: t + "/present", schemaPath: "#/$defs/sanitizedBatteryState/properties/present/type", keyword: "type", params: { type: gs.properties.present.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.level !== void 0) {
      let r = e.level;
      if (typeof r != "number" && r !== null) {
        const i = { instancePath: t + "/level", schemaPath: "#/$defs/sanitizedBatteryState/properties/level/type", keyword: "type", params: { type: gs.properties.level.type }, message: "must be number,null" };
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
        const i = { instancePath: t + "/charging", schemaPath: "#/$defs/sanitizedBatteryState/properties/charging/type", keyword: "type", params: { type: gs.properties.charging.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.connected !== void 0) {
      let r = e.connected;
      if (typeof r != "boolean" && r !== null) {
        const i = { instancePath: t + "/connected", schemaPath: "#/$defs/sanitizedBatteryState/properties/connected/type", keyword: "type", params: { type: gs.properties.connected.type }, message: "must be boolean,null" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
    if (e.source !== void 0) {
      let r = e.source;
      if (!(r === "browser" || r === "runtime" || r === "unsupported")) {
        const i = { instancePath: t + "/source", schemaPath: "#/$defs/sanitizedBatteryState/properties/source/enum", keyword: "enum", params: { allowedValues: gs.properties.source.enum }, message: "must be equal to one of the allowed values" };
        s === null ? s = [i] : s.push(i), o++;
      }
    }
  } else {
    const r = { instancePath: t, schemaPath: "#/$defs/sanitizedBatteryState/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    s === null ? s = [r] : s.push(r), o++;
  }
  return wr.errors = s, o === 0;
}
wr.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
function Bd({
  manifest: e,
  method: t,
  decisionContract: n,
  platformPolicyAllowed: a,
  hostGrant: l,
  capabilitySupported: u
}) {
  if (!n || n.policyVersion !== 1)
    throw new TypeError("Permission decision contract v1 is required.");
  const s = t?.requiredPermission || null, o = t?.id || null, c = !!(s && Array.isArray(e?.permissions) && e.permissions.includes(s)), r = t?.previewAvailability === "enabled" && t?.currentStatus === "enabled" ? "enabled" : "disabled";
  let i = "not-evaluated", d = "denied", h = "not-evaluated", p = null;
  if (!c)
    p = "not-declared";
  else if (i = (typeof a == "function" ? a() : a) === !0 ? "allowed" : "denied", i === "denied")
    p = "policy-denied";
  else {
    const P = typeof l == "function" ? l() : l;
    d = Ud(t?.consent, P), d === "denied" ? p = "grant-denied" : (h = (typeof u == "function" ? u() : u) === !0 ? "supported" : "unsupported", h === "unsupported" ? p = "capability-unsupported" : r !== "enabled" && (p = "method-disabled"));
  }
  const f = p ? n.stableDenialReasons[p] || "permission-denied" : null;
  return Object.freeze({
    contract: n.contract,
    permissionId: s,
    methodId: o,
    declared: c,
    policy: i,
    consentMode: t?.consent || "unspecified",
    grantState: d,
    capability: h,
    methodPolicy: r,
    effective: p === null,
    denialReason: p,
    publicErrorCode: f,
    policyVersion: n.policyVersion
  });
}
function Ud(e, t) {
  if (t === !1 || t?.allowed === !1 || t?.state === "denied") return "denied";
  if (e === "no-consent") return "not-required";
  const n = t?.state;
  return t?.allowed === !0 && [
    "session-grant",
    "persistent-user-grant",
    "resource-scoped-grant"
  ].includes(n) ? n : "denied";
}
function Ii(e) {
  return e?.effective ? null : e?.publicErrorCode || "permission-denied";
}
class Zd {
  constructor(t) {
    this.session = t.session, this.manifest = t.manifest, this.contracts = t.contracts, this.publicApi = t.publicApi || null, this.platformPolicyPermits = t.platformPolicyPermits ?? !0, this.grantResolver = t.grantResolver || Kd, this.now = t.now || (() => Date.now()), this.setTimer = t.setTimer || ((n, a) => setTimeout(n, a)), this.clearTimer = t.clearTimer || ((n) => clearTimeout(n)), this.onDiagnostic = typeof t.onDiagnostic == "function" ? t.onDiagnostic : null, this.channelId = t.channelId || Rs("broker"), this.methods = new Map(this.contracts.brokerMethods.methods.map((n) => [n.id, n])), this.errors = new Map(this.contracts.brokerErrors.errors.map((n) => [n.code, n])), this.seen = /* @__PURE__ */ new Set(), this.pending = /* @__PURE__ */ new Map(), this.requestTimes = [], this.audit = [], this.diagnostics = [], this.closed = !1;
  }
  async createLaunchDescriptor() {
    if (St(this.manifest) !== 2 || this.manifest.sdk?.apiVersion !== "1")
      return Object.freeze({ facadeEnabled: !1 });
    const t = this.methods.get("device.battery.getState"), n = this.#t(t), a = Ii(n);
    let l;
    if (a)
      l = { ok: !1, error: this.#a(a) }, this.#s("handshake", t, "deny", a, 0, n);
    else {
      const o = this.now();
      try {
        const c = this.#i().getState();
        l = { ok: !0, result: this.#l(c, t) }, this.#s("handshake", t, "allow", "success", this.now() - o, n);
      } catch (c) {
        const r = qi(c);
        l = { ok: !1, error: this.#a(r) }, this.#s("handshake", t, "allow", r, this.now() - o, n);
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
    if (this.seen.add(t.requestId), Zr(t) > this.contracts.brokerPolicy.limits.maximumRequestBytes)
      return Promise.resolve(this.#e(t, "request-too-large"));
    const n = this.methods.get(t.method);
    if (!n || n.invocation !== "request-response" || n.previewAvailability !== "enabled")
      return Promise.resolve(this.#e(t, "method-not-allowed", n));
    const a = this.#t(n), l = Ii(a);
    if (l) return Promise.resolve(this.#e(t, l, n, !0, a));
    if (!ki(t) || !Vd(t.params))
      return Promise.resolve(this.#e(t, "invalid-params", n, !0, a));
    if (n.userGesture === "host-required")
      return Promise.resolve(this.#e(t, "gesture-required", n, !0, a));
    this.#p();
    const u = this.contracts.brokerPolicy.limits;
    return this.pending.size >= u.maximumConcurrentRequests || this.requestTimes.length >= u.maximumRequestsPerMinute ? Promise.resolve(this.#e(t, "rate-limited", n, !0, a)) : (this.requestTimes.push(this.now()), this.#o(t, n, a));
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
  getDiagnostics() {
    return this.diagnostics.map((t) => Object.freeze({ ...t }));
  }
  clearDiagnostics() {
    this.diagnostics = [];
  }
  #t(t) {
    return Bd({
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
      const n = this.#i();
      return typeof n.getState == "function" && typeof n.refresh == "function" && n.getCapabilities?.().status?.supported === !0;
    } catch {
      return !1;
    }
  }
  #i() {
    const t = this.publicApi?.device?.battery;
    if (!t) throw ws("capability-unsupported");
    return t;
  }
  #o(t, n, a) {
    const l = this.now(), u = n.timeoutMs || this.contracts.brokerPolicy.limits.defaultRequestTimeoutMs, s = Math.max(0, Date.parse(this.session.expiresAt) - this.now()), o = Math.min(u, this.contracts.brokerPolicy.limits.maximumRequestTimeoutMs, s);
    return new Promise((c) => {
      const r = { message: t, method: n, permissionDecision: a, startedAt: l, resolve: c, timer: null, settled: !1 };
      r.timer = this.setTimer(() => {
        this.#r(r, this.#e(t, "request-timeout", n, !1));
      }, o), this.pending.set(t.requestId, r), this.#s(t.requestId, n, "allow", "pending", 0, a), Promise.resolve().then(() => this.#i().refresh()).then(
        (i) => {
          if (r.settled) {
            this.#s(t.requestId, n, "allow", "late-result-ignored", this.now() - l);
            return;
          }
          try {
            const d = this.#l(i, n);
            this.#r(r, this.#d(t, d));
          } catch (d) {
            this.#r(r, this.#e(t, qi(d), n, !1));
          }
        },
        () => {
          if (r.settled) {
            this.#s(t.requestId, n, "allow", "late-result-ignored", this.now() - l);
            return;
          }
          this.#r(r, this.#e(t, "internal-error", n, !1));
        }
      );
    });
  }
  #u(t) {
    if (!ki(t)) return null;
    const n = this.pending.get(t.requestId);
    return !n || n.message.method !== t.method || this.#r(n, this.#e(n.message, "request-cancelled", n.method, !1)), null;
  }
  #r(t, n) {
    if (t.settled) return;
    t.settled = !0, this.clearTimer(t.timer), this.pending.delete(t.message.requestId);
    const a = n.ok ? "success" : n.error.code;
    this.#s(t.message.requestId, t.method, n.ok ? "allow" : Yd(a), a, this.now() - t.startedAt, t.permissionDecision), t.resolve(n);
  }
  #l(t, n) {
    if (Zr(t) > n.maximumResponseBytes) throw ws("response-too-large");
    if (!ln(t) || typeof t.supported != "boolean" || !Ur(t.present) || !Ur(t.connected) || !Ur(t.charging) || typeof t.source != "string" || !Gd(t.level)) throw ws("internal-error");
    const a = {
      supported: t.supported,
      present: t.present,
      level: t.level,
      charging: t.charging,
      connected: t.connected,
      source: Xd(t.supported, t.source)
    };
    if (!Hd(a)) throw ws("internal-error");
    if (Zr(a) > n.maximumResponseBytes) throw ws("response-too-large");
    return Object.freeze(a);
  }
  #c(t) {
    return ln(t) && t.sessionId === this.session.sessionId && t.snapshotId === this.session.snapshotId && t.channelId === this.channelId;
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
  #e(t, n, a = null, l = !0, u = null) {
    return l && this.#s(t?.requestId || null, a, "deny", n, 0, u), {
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
  #s(t, n, a, l, u, s = null) {
    const o = Object.freeze({
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
    });
    this.audit.push(o);
    const c = s?.denialReason || Jd(l), r = Object.freeze({
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
      consentMode: s?.consentMode || n?.consent || null,
      grantState: s?.grantState || null,
      capabilityState: s?.capability || "not-evaluated",
      methodPolicy: s?.methodPolicy || (n ? "enabled" : "not-evaluated"),
      finalDecision: a,
      resultCategory: l,
      publicError: this.errors.has(l) ? l : null,
      denialReason: c,
      latencyMs: u,
      policyVersion: this.contracts.permissionDecision.policyVersion
    });
    this.diagnostics.push(r);
    try {
      this.onDiagnostic?.(Object.freeze({ ...r }));
    } catch {
    }
  }
  #p() {
    const t = this.now() - 6e4;
    this.requestTimes = this.requestTimes.filter((n) => n > t);
  }
}
function Kd(e) {
  return e.consent === "no-consent";
}
function Jd(e) {
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
function Ur(e) {
  return e === null || typeof e == "boolean";
}
function Gd(e) {
  return e === null || typeof e == "number" && Number.isFinite(e) && e >= 0 && e <= 1;
}
function Xd(e, t) {
  return !e || t === "unsupported" ? "unsupported" : t === "battery-status-api" || t === "browser" ? "browser" : "runtime";
}
function Zr(e) {
  try {
    return new TextEncoder().encode(JSON.stringify(e)).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
function ws(e) {
  const t = new Error(e);
  return t.code = e, t;
}
function qi(e) {
  return ["response-too-large", "capability-unsupported"].includes(e?.code) ? e.code : "internal-error";
}
function Yd(e) {
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
const Qd = 1800 * 1e3;
class ep {
  constructor({
    hostClient: t,
    ttlMs: n = Qd,
    now: a = () => Date.now(),
    publicApiProvider: l = tp,
    platformPolicyPermits: u = !0,
    grantResolver: s,
    onBrokerDiagnostic: o
  }) {
    if (!t) throw new TypeError("PreviewHostClient is required.");
    this.hostClient = t, this.ttlMs = n, this.now = a, this.publicApiProvider = l, this.platformPolicyPermits = u, this.grantResolver = s, this.onBrokerDiagnostic = typeof o == "function" ? o : null, this.sessions = /* @__PURE__ */ new Map(), this.activeSessionId = null, this.hostClient.onBroker = (c) => this.#n(c);
  }
  get activeSession() {
    return this.activeSessionId && this.sessions.get(this.activeSessionId) || null;
  }
  async run(t, { contracts: n, domParser: a } = {}) {
    const l = await an(t, { contracts: n });
    if (!l.passed) return { started: !1, validationReport: l, session: null };
    this.activeSession && await this.stop(this.activeSession.sessionId);
    const u = this.#t(t);
    this.sessions.set(u.sessionId, u), this.activeSessionId = u.sessionId;
    try {
      const s = JSON.parse(hr(t, "manifest.json").content);
      u.broker = new Zd({
        session: u,
        manifest: s,
        contracts: n,
        publicApi: this.publicApiProvider(),
        platformPolicyPermits: this.platformPolicyPermits,
        grantResolver: this.grantResolver,
        onDiagnostic: this.onBrokerDiagnostic,
        now: this.now
      }), u.brokerLaunch = await u.broker.createLaunchDescriptor();
      const o = Nd(t, u, { domParser: a, sdkLaunch: u.brokerLaunch });
      return await this.hostClient.start(u, o, u.brokerLaunch), u.state = "running", u.expiryTimer = setTimeout(() => this.#i(u.sessionId).catch(() => {
      }), this.ttlMs), { started: !0, validationReport: l, session: Kr(u) };
    } catch (s) {
      throw u.state = "failed", u.failure = s?.message || String(s), this.#o(u), s;
    }
  }
  async reload(t, n = {}) {
    const a = this.activeSession;
    a && (a.state = "reloading");
    const l = await an(t, { contracts: n.contracts });
    return l.passed ? (a && await this.stop(a.sessionId), this.run(t, n)) : (a && (a.state = "running"), { started: !1, validationReport: l, session: a ? Kr(a) : null });
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
    return Kr(n);
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
  getBrokerDiagnostics(t = this.activeSessionId) {
    return t ? this.sessions.get(t)?.broker?.getDiagnostics() || [] : [];
  }
  clearBrokerDiagnostics(t = this.activeSessionId) {
    t && this.sessions.get(t)?.broker?.clearDiagnostics();
  }
  #t(t) {
    const n = this.now();
    return {
      contract: Sd,
      sessionId: Rs("session"),
      projectUuid: t.projectUuid,
      snapshotId: t.snapshotId,
      token: Rs("token"),
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
function Kr(e) {
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
function tp() {
  return globalThis.top?.WebWindows || globalThis.WebWindows || null;
}
const sp = { class: "developer-studio" }, rp = { class: "studio-toolbar" }, np = ["value"], ip = ["value"], op = ["disabled"], ap = ["disabled"], lp = ["disabled"], up = ["disabled"], cp = ["disabled"], dp = ["disabled"], pp = ["disabled"], fp = {
  key: 0,
  class: "studio-main"
}, mp = { class: "explorer-panel" }, hp = { class: "panel-heading" }, yp = { class: "panel-actions" }, gp = ["disabled"], wp = ["disabled"], vp = { class: "file-tree" }, bp = { class: "editor-workbench" }, Pp = {
  class: "editor-tabs",
  "aria-label": "打开的文件"
}, kp = ["onClick"], $p = {
  key: 0,
  class: "dirty-dot"
}, Ip = { class: "editor-host" }, qp = {
  key: 1,
  class: "empty-editor"
}, Sp = { class: "inspector-panel" }, xp = { class: "panel-heading" }, _p = { class: "panel-switcher" }, Ap = { class: "inspector-content" }, jp = { class: "project-uuid" }, Tp = { class: "build-inspector" }, Ep = { key: 0 }, Op = { key: 1 }, Mp = {
  key: 0,
  class: "build-blocked"
}, Cp = { key: 1 }, Np = { class: "hash-row" }, Lp = ["disabled"], Rp = { class: "inspector-content" }, zp = { class: "preview-inspector" }, Dp = { class: "preview-session-banner" }, Wp = { key: 0 }, Fp = { key: 1 }, Vp = {
  key: 1,
  class: "empty-workspace studio-main"
}, Hp = { class: "problems-panel" }, Bp = { class: "bottom-tabs" }, Up = ["value"], Zp = {
  key: 0,
  class: "problems-empty"
}, Kp = ["onClick"], Jp = {
  key: 0,
  class: "problems-empty"
}, Gp = {
  key: 0,
  class: "problems-empty"
}, Xp = { class: "studio-dialog-actions" }, Yp = {
  class: "primary",
  type: "submit"
}, Qp = {
  __name: "DeveloperStudio",
  setup(e) {
    const t = new Wc(), n = K([]), a = K(null), l = K([]), u = K(""), s = K([]), o = K(""), c = K(""), r = K(/* @__PURE__ */ new Set()), i = K(null), d = K([]), h = K(null), p = K(null), f = K(null), y = K(null), P = K(null), $ = K(!1), O = K(null), C = K(!1), N = K(null), X = K([]), he = K([]), oe = K("problems"), fe = K("preview"), st = K("all"), _e = K(""), rt = K(""), ye = K(null);
    let Je = null, nt = 0, us = 0, me = null, U = null;
    const Y = Re(() => Uc(l.value)), it = Re(() => l.value.find((k) => k.path === o.value)), Dt = Re(() => Zc(o.value)), ot = Re(() => o.value === "manifest.json" ? d.value : []), Ee = Re(() => St(i.value)), Wt = Re(() => y.value?.diagnostics || d.value.map((k) => ({
      ruleId: "Manifest",
      severity: k.severity,
      path: k.path,
      message: k.message
    }))), Vs = Re(() => st.value === "all" ? X.value : X.value.filter((k) => k.level === st.value));
    Sn(async () => {
      try {
        const k = await bs();
        h.value = k.permissionRegistry, p.value = k.brokerMethods, f.value = k.runtimeCompatibility, await Ft(), n.value.length && await at(n.value[0].uuid);
      } catch (k) {
        M(k);
      }
    }), xn(() => {
      clearTimeout(nt), U?.dispose().catch(() => {
      }), t.close();
    });
    async function Ft() {
      n.value = await t.listProjects();
    }
    async function vt() {
      try {
        await I();
        const k = Lc(), v = await Tt("新建 WebWindows 功能", "项目名称", k.displayName);
        if (v == null) return;
        const q = await t.createProject({ ...k, displayName: v });
        await Ft(), await at(q.uuid), T("Hello WebWindows 项目已创建。");
      } catch (k) {
        M(k);
      }
    }
    async function at(k) {
      if (!k) return;
      N.value && await Me(), await I(), a.value = await t.getProject(k), l.value = await t.listEntries(k);
      const v = a.value.editorState || {};
      s.value = (v.openFiles || []).filter((q) => l.value.some((ne) => ne.path === q && ne.kind === "file")), o.value = l.value.some((q) => q.path === v.activeFile && q.kind === "file") ? v.activeFile : s.value[0] || "", u.value = o.value, r.value = /* @__PURE__ */ new Set(), ae(), await m(), await x(), await E();
    }
    async function cs() {
      if (!a.value) return;
      const k = await Tt("重命名项目", "新的项目名称", a.value.displayName);
      if (k != null)
        try {
          a.value = await t.renameProject(a.value.uuid, k), await Ft(), T("项目已重命名。");
        } catch (v) {
          M(v);
        }
    }
    async function Hs() {
      if (a.value && await ds("删除项目", `永久删除项目“${a.value.displayName}”及其全部文件吗？`))
        try {
          const k = a.value.uuid;
          await t.deleteProject(k), a.value = null, l.value = [], s.value = [], o.value = "", u.value = "", c.value = "", ae(), await Ft(), n.value.length && await at(n.value[0].uuid), T("项目已删除。");
        } catch (k) {
          M(k);
        }
    }
    async function _t(k) {
      u.value = k.path, k.kind === "file" && await At(k.path);
    }
    async function At(k) {
      if (!a.value) return;
      await I();
      const v = ce(k);
      s.value.includes(v) || s.value.push(v), o.value = v, u.value = v, await m(), await E();
    }
    async function m() {
      if (!a.value || !o.value) {
        c.value = "";
        return;
      }
      c.value = await t.readTextFile(a.value.uuid, o.value), o.value === "manifest.json" && await b(c.value), await $n();
    }
    function w(k) {
      c.value = k, o.value && (r.value = new Set(r.value).add(o.value), ae(), o.value === "manifest.json" && b(k).catch(M), clearTimeout(nt), nt = window.setTimeout(() => I().catch(M), 700));
    }
    async function b(k) {
      const v = ++us, q = await jc(k);
      v === us && (i.value = q.manifest, d.value = q.diagnostics);
    }
    async function x() {
      if (!a.value || !l.value.some((v) => v.path === "manifest.json" && v.kind === "file")) {
        i.value = null, d.value = [];
        return;
      }
      const k = o.value === "manifest.json" ? c.value : await t.readTextFile(a.value.uuid, "manifest.json");
      await b(k);
    }
    async function S(k) {
      o.value !== "manifest.json" && await At("manifest.json"), w(`${JSON.stringify(k, null, 2)}
`);
    }
    async function I() {
      if (clearTimeout(nt), nt = 0, !a.value || !o.value || !r.value.has(o.value)) return;
      const k = o.value;
      await t.writeTextFile(a.value.uuid, k, c.value);
      const v = new Set(r.value);
      v.delete(k), r.value = v, a.value = await t.getProject(a.value.uuid);
    }
    async function E() {
      if (!a.value) return;
      const k = [o.value, ...a.value.editorState?.recentFiles || []].filter(Boolean);
      a.value = await t.saveEditorState(a.value.uuid, {
        openFiles: s.value,
        activeFile: o.value || null,
        recentFiles: [...new Set(k)].slice(0, 20)
      });
    }
    function j() {
      const k = l.value.find((v) => v.path === u.value);
      return k?.kind === "directory" ? k.path : k?.path ? Ls(k.path) : "";
    }
    async function A(k) {
      if (!a.value) return;
      const q = await Tt(k === "directory" ? "新建目录" : "新建文件", k === "directory" ? "目录名称" : "文件名称", k === "directory" ? "new-folder" : "new-file.js");
      if (q != null)
        try {
          const ne = vi(j(), q);
          k === "directory" ? await t.createDirectory(a.value.uuid, ne) : await t.createFile(a.value.uuid, ne, ""), ae(), l.value = await t.listEntries(a.value.uuid), u.value = ne, k === "file" && await At(ne);
        } catch (ne) {
          M(ne);
        }
    }
    async function _() {
      const k = l.value.find((q) => q.path === u.value);
      if (!k || !a.value) return;
      const v = await Tt("重命名", "新的名称", on(k.path));
      if (v != null)
        try {
          await I();
          const q = vi(Ls(k.path), v);
          await t.renameEntry(a.value.uuid, k.path, q), ae(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = q, await m();
        } catch (q) {
          M(q);
        }
    }
    async function W() {
      const k = l.value.find((v) => v.path === u.value);
      if (!(!k || !a.value) && await ds("删除文件或目录", `删除“${k.path}”${k.kind === "directory" ? "及其全部内容" : ""}吗？`))
        try {
          await t.deleteEntry(a.value.uuid, k.path), ae(), l.value = await t.listEntries(a.value.uuid), a.value = await t.getProject(a.value.uuid), s.value = a.value.editorState.openFiles, o.value = a.value.editorState.activeFile || "", u.value = o.value, await m();
        } catch (v) {
          M(v);
        }
    }
    function T(k) {
      _e.value = k, rt.value = "", window.setTimeout(() => {
        _e.value === k && (_e.value = "");
      }, 2400);
    }
    function M(k) {
      _e.value = k?.message || "操作失败。", rt.value = "error";
    }
    async function F() {
      if (!a.value) throw new Error("请先打开项目。");
      return await I(), Kc(t, a.value.uuid);
    }
    async function B() {
      if (!$.value) {
        $.value = !0;
        try {
          const k = await F(), v = await bs();
          y.value = await an(k, { contracts: v }), P.value = null, T(y.value.passed ? "项目验证通过。" : `验证发现 ${y.value.errorCount} 个错误。`);
        } catch (k) {
          M(k);
        } finally {
          $.value = !1;
        }
      }
    }
    async function Q() {
      if (!$.value) {
        $.value = !0;
        try {
          const k = await F(), v = await bs(), { buildProjectPackage: q } = await import("./deterministic-builder-rPCWXDht.js");
          P.value = await q(k, { contracts: v }), y.value = P.value.validationReport, T(P.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
        } catch (k) {
          M(k);
        } finally {
          $.value = !1;
        }
      }
    }
    function Z() {
      if (!P.value?.artifactReady || !P.value.zipBytes) return;
      const k = P.value.manifestIdentity, v = `${k?.id || "webwindows-function"}-${k?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-"), q = new Blob([P.value.zipBytes], { type: "application/zip" }), ne = URL.createObjectURL(q), Us = document.createElement("a");
      Us.href = ne, Us.download = `${v}.zip`, Us.click(), window.setTimeout(() => URL.revokeObjectURL(ne), 0);
    }
    function ae() {
      y.value = null, P.value = null;
    }
    async function be() {
      C.value = !1, U?.dispose().catch(() => {
      }), me = new Ad({
        onConsole: (k) => {
          const v = N.value || U?.activeSession;
          !v || k?.sessionId !== v.sessionId || k?.snapshotId !== v.snapshotId || (X.value = [...X.value, k].slice(-1e3));
        },
        onState: (k) => {
          !N.value || k?.sessionId !== N.value.sessionId || (N.value = { ...N.value, state: k.state });
        }
      }), U = new ep({
        hostClient: me,
        onBrokerDiagnostic: (k) => {
          he.value = [...he.value, k].slice(-500);
        }
      });
      try {
        await me.connect(O.value), C.value = !0;
      } catch (k) {
        M(k);
      }
    }
    async function Oe({ reload: k = !1 } = {}) {
      if (!($.value || !U || !C.value)) {
        $.value = !0;
        try {
          he.value = [];
          const v = await F(), q = await bs(), ne = k && N.value ? await U.reload(v, { contracts: q }) : await U.run(v, { contracts: q });
          if (y.value = ne.validationReport, P.value = null, oe.value = ne.started ? "console" : "problems", fe.value = "preview", !ne.started) {
            T(`Developer Preview 被 ${ne.validationReport.errorCount} 个验证错误阻止。`);
            return;
          }
          N.value = ne.session, T(k ? "Developer Preview 已从新 Snapshot 重新加载。" : "Developer Preview 已启动。");
        } catch (v) {
          M(v);
        } finally {
          $.value = !1;
        }
      }
    }
    async function Me() {
      if (!(!U || !N.value))
        try {
          await U.stop(N.value.sessionId), N.value = null, he.value = [], T("Developer Preview 已停止，会话凭据已撤销。");
        } catch (k) {
          M(k);
        }
    }
    function jt() {
      X.value = [];
    }
    function Bs() {
      U?.clearBrokerDiagnostics(), he.value = [];
    }
    function Ie(k) {
      return k.arguments.map((v) => typeof v == "string" ? v : JSON.stringify(v)).join(" ");
    }
    function We(k) {
      const v = l.value.find((q) => q.kind === "file" && (k.path === q.path || k.path?.startsWith(`${q.path}$`)));
      v && At(v.path).catch(M);
    }
    function Tt(k, v, q) {
      return On({ kind: "text", title: k, message: v, value: q });
    }
    function ds(k, v) {
      return On({ kind: "confirm", title: k, message: v, value: "" });
    }
    function On(k) {
      return Je && Je(null), ye.value = { ...k }, new Promise((v) => {
        Je = v;
      });
    }
    function Er(k) {
      const v = Je;
      Je = null, ye.value = null, v?.(k);
    }
    return (k, v) => (R(), z("main", sp, [
      g("header", rp, [
        v[20] || (v[20] = g("div", { class: "studio-brand" }, [
          g("strong", null, "Developer Studio"),
          g("span", null, "WebWindows Function IDE")
        ], -1)),
        g("button", {
          class: "primary",
          type: "button",
          onClick: vt
        }, "新建功能"),
        g("select", {
          "aria-label": "打开项目",
          value: a.value?.uuid || "",
          onChange: v[0] || (v[0] = (q) => at(q.target.value).catch(M))
        }, [
          v[19] || (v[19] = g("option", {
            value: "",
            disabled: ""
          }, "打开项目…", -1)),
          (R(!0), z(se, null, Be(n.value, (q) => (R(), z("option", {
            key: q.uuid,
            value: q.uuid
          }, L(q.displayName), 9, ip))), 128))
        ], 40, np),
        g("button", {
          type: "button",
          disabled: !a.value,
          onClick: cs
        }, "重命名项目", 8, op),
        g("button", {
          type: "button",
          disabled: !a.value,
          onClick: Hs
        }, "删除项目", 8, ap),
        v[21] || (v[21] = g("span", { class: "toolbar-spacer" }, null, -1)),
        g("button", {
          type: "button",
          disabled: !a.value || $.value,
          onClick: B
        }, "Validate", 8, lp),
        g("button", {
          class: "primary",
          type: "button",
          disabled: !a.value || $.value,
          onClick: Q
        }, "Build", 8, up),
        g("button", {
          class: "primary",
          type: "button",
          disabled: !a.value || $.value || !C.value,
          onClick: v[1] || (v[1] = (q) => Oe())
        }, "Run", 8, cp),
        g("button", {
          type: "button",
          disabled: !N.value || $.value,
          onClick: v[2] || (v[2] = (q) => Oe({ reload: !0 }))
        }, "Reload", 8, dp),
        g("button", {
          type: "button",
          disabled: !N.value,
          onClick: Me
        }, "Stop", 8, pp)
      ]),
      a.value ? (R(), z("section", fp, [
        g("aside", mp, [
          g("div", hp, [
            g("span", null, "Project · " + L(a.value.displayName), 1),
            g("div", yp, [
              g("button", {
                type: "button",
                title: "新建文件",
                onClick: v[3] || (v[3] = (q) => A("file"))
              }, "＋F"),
              g("button", {
                type: "button",
                title: "新建目录",
                onClick: v[4] || (v[4] = (q) => A("directory"))
              }, "＋D"),
              g("button", {
                type: "button",
                title: "重命名",
                disabled: !u.value,
                onClick: _
              }, "R", 8, gp),
              g("button", {
                type: "button",
                title: "删除",
                disabled: !u.value,
                onClick: W
              }, "×", 8, wp)
            ])
          ]),
          g("div", vp, [
            (R(!0), z(se, null, Be(Y.value, (q) => (R(), ur(fu, {
              key: q.path,
              node: q,
              "selected-path": u.value,
              onSelect: _t
            }, null, 8, ["node", "selected-path"]))), 128))
          ])
        ]),
        g("section", bp, [
          g("nav", Pp, [
            (R(!0), z(se, null, Be(s.value, (q) => (R(), z("button", {
              key: q,
              type: "button",
              class: we(["editor-tab", { active: q === o.value }]),
              onClick: (ne) => At(q).catch(M)
            }, [
              g("span", null, L(Ji(on)(q)), 1),
              r.value.has(q) ? (R(), z("span", $p, "•")) : Te("", !0)
            ], 10, kp))), 128))
          ]),
          g("div", Ip, [
            it.value?.kind === "file" ? (R(), ur(yu, {
              key: `${a.value.uuid}:${o.value}`,
              "project-id": a.value.uuid,
              path: o.value,
              language: Dt.value,
              value: c.value,
              markers: ot.value,
              "onUpdate:value": w,
              onSave: v[5] || (v[5] = (q) => I().then(() => T("已保存。")).catch(M)),
              onError: M
            }, null, 8, ["project-id", "path", "language", "value", "markers"])) : (R(), z("div", qp, [...v[22] || (v[22] = [
              g("h2", null, "选择文件开始编辑", -1),
              g("p", null, "Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。", -1)
            ])]))
          ])
        ]),
        g("aside", Sp, [
          g("div", xp, [
            v[23] || (v[23] = g("span", null, "Inspector", -1)),
            g("div", _p, [
              g("button", {
                type: "button",
                class: we({ active: fe.value === "manifest" }),
                onClick: v[6] || (v[6] = (q) => fe.value = "manifest")
              }, "Manifest", 2),
              g("button", {
                type: "button",
                class: we({ active: fe.value === "permissions" }),
                onClick: v[7] || (v[7] = (q) => fe.value = "permissions")
              }, "Permissions", 2),
              g("button", {
                type: "button",
                class: we({ active: fe.value === "preview" }),
                onClick: v[8] || (v[8] = (q) => fe.value = "preview")
              }, "Preview", 2)
            ])
          ]),
          fs(g("div", Ap, [
            g("h2", null, "Manifest " + L(Ee.value === 2 ? "v2" : Ee.value === 1 ? "v1" : "unsupported"), 1),
            g("p", jp, "项目 UUID：" + L(a.value.uuid), 1),
            Ke(Xu, {
              manifest: i.value,
              diagnostics: d.value,
              "permission-registry": h.value,
              "broker-methods": p.value,
              "onUpdate:manifest": v[9] || (v[9] = (q) => S(q).catch(M)),
              onOpenJson: v[10] || (v[10] = (q) => At("manifest.json").catch(M))
            }, null, 8, ["manifest", "diagnostics", "permission-registry", "broker-methods"]),
            g("section", Tp, [
              v[33] || (v[33] = g("h3", null, "Validation", -1)),
              y.value ? (R(), z("dl", Op, [
                g("div", null, [
                  v[24] || (v[24] = g("dt", null, "Result", -1)),
                  g("dd", null, L(y.value.passed ? "Passed" : "Blocked"), 1)
                ]),
                g("div", null, [
                  v[25] || (v[25] = g("dt", null, "Errors", -1)),
                  g("dd", null, L(y.value.errorCount), 1)
                ]),
                g("div", null, [
                  v[26] || (v[26] = g("dt", null, "Warnings", -1)),
                  g("dd", null, L(y.value.warningCount), 1)
                ]),
                g("div", null, [
                  v[27] || (v[27] = g("dt", null, "Files", -1)),
                  g("dd", null, L(y.value.packageFacts.fileCount), 1)
                ]),
                g("div", null, [
                  v[28] || (v[28] = g("dt", null, "Bytes", -1)),
                  g("dd", null, L(y.value.packageFacts.unpackedBytes), 1)
                ])
              ])) : (R(), z("p", Ep, "尚未创建 Snapshot 验证。")),
              P.value ? (R(), z(se, { key: 2 }, [
                v[32] || (v[32] = g("h3", null, "Build Result", -1)),
                P.value.artifactReady ? (R(), z("dl", Cp, [
                  g("div", null, [
                    v[29] || (v[29] = g("dt", null, "Size", -1)),
                    g("dd", null, L(P.value.zipSize) + " bytes", 1)
                  ]),
                  g("div", null, [
                    v[30] || (v[30] = g("dt", null, "Files", -1)),
                    g("dd", null, L(P.value.fileCount), 1)
                  ]),
                  g("div", Np, [
                    v[31] || (v[31] = g("dt", null, "SHA-256", -1)),
                    g("dd", null, L(P.value.sha256), 1)
                  ])
                ])) : (R(), z("p", Mp, "验证未通过，没有生成可发布 ZIP。")),
                g("button", {
                  type: "button",
                  disabled: !P.value.artifactReady,
                  onClick: Z
                }, "Export ZIP", 8, Lp)
              ], 64)) : Te("", !0)
            ])
          ], 512), [
            [Wr, fe.value === "manifest"]
          ]),
          fs(g("div", Rp, [
            v[34] || (v[34] = g("h2", null, "Permission Inspector", -1)),
            Ke(ec, {
              manifest: i.value,
              "permission-registry": h.value,
              "broker-methods": p.value,
              "runtime-compatibility": f.value,
              decisions: he.value
            }, null, 8, ["manifest", "permission-registry", "broker-methods", "runtime-compatibility", "decisions"])
          ], 512), [
            [Wr, fe.value === "permissions"]
          ]),
          fs(g("div", zp, [
            g("div", Dp, [
              v[35] || (v[35] = g("strong", null, "Developer Preview", -1)),
              N.value ? (R(), z("span", Wp, L(N.value.state) + " · " + L(N.value.snapshotId), 1)) : (R(), z("span", Fp, "无活动会话"))
            ]),
            g("iframe", {
              ref_key: "previewHostFrame",
              ref: O,
              class: "preview-host-frame",
              src: "developer-preview-host.html?v=20260829-1",
              title: "Trusted Developer Preview Host",
              referrerpolicy: "no-referrer",
              onLoad: be
            }, null, 544)
          ], 512), [
            [Wr, fe.value === "preview"]
          ])
        ])
      ])) : (R(), z("section", Vp, [
        v[36] || (v[36] = g("h2", null, "创建第一个 WebWindows 功能", -1)),
        v[37] || (v[37] = g("p", null, "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。", -1)),
        g("button", {
          class: "primary",
          type: "button",
          onClick: vt
        }, "新建 Hello WebWindows")
      ])),
      g("section", Hp, [
        g("div", Bp, [
          g("button", {
            type: "button",
            class: we({ active: oe.value === "problems" }),
            onClick: v[11] || (v[11] = (q) => oe.value = "problems")
          }, [
            v[38] || (v[38] = le("Problems ", -1)),
            g("span", null, L(Wt.value.length), 1)
          ], 2),
          g("button", {
            type: "button",
            class: we({ active: oe.value === "console" }),
            onClick: v[12] || (v[12] = (q) => oe.value = "console")
          }, [
            v[39] || (v[39] = le("Console ", -1)),
            g("span", null, L(X.value.length), 1)
          ], 2),
          g("button", {
            type: "button",
            class: we({ active: oe.value === "broker" }),
            onClick: v[13] || (v[13] = (q) => oe.value = "broker")
          }, [
            v[40] || (v[40] = le("Permissions ", -1)),
            g("span", null, L(he.value.length), 1)
          ], 2),
          v[42] || (v[42] = g("span", { class: "bottom-spacer" }, null, -1)),
          oe.value === "console" ? (R(), z(se, { key: 0 }, [
            fs(g("select", {
              "onUpdate:modelValue": v[14] || (v[14] = (q) => st.value = q),
              "aria-label": "Console level"
            }, [
              v[41] || (v[41] = g("option", { value: "all" }, "All levels", -1)),
              (R(), z(se, null, Be(["log", "info", "warn", "error", "debug"], (q) => g("option", {
                key: q,
                value: q
              }, L(q), 9, Up)), 64))
            ], 512), [
              [Ql, st.value]
            ]),
            g("button", {
              type: "button",
              onClick: jt
            }, "Clear")
          ], 64)) : oe.value === "broker" ? (R(), z("button", {
            key: 1,
            type: "button",
            onClick: Bs
          }, "Clear")) : Te("", !0)
        ]),
        oe.value === "problems" ? (R(), z(se, { key: 0 }, [
          Wt.value.length ? Te("", !0) : (R(), z("div", Zp, "当前 Snapshot 未发现问题。")),
          (R(!0), z(se, null, Be(Wt.value, (q, ne) => (R(), z("button", {
            key: `${q.ruleId}:${q.path}:${ne}`,
            type: "button",
            class: "problem-row",
            onClick: (Us) => We(q)
          }, [
            g("span", {
              class: we(["problem-severity", q.severity])
            }, L(q.ruleId), 3),
            g("code", null, L(q.path), 1),
            g("span", null, L(q.message), 1)
          ], 8, Kp))), 128))
        ], 64)) : oe.value === "console" ? (R(), z(se, { key: 1 }, [
          Vs.value.length ? Te("", !0) : (R(), z("div", Jp, "当前 Developer Preview 尚无 Console 输出。")),
          (R(!0), z(se, null, Be(Vs.value, (q) => (R(), z("div", {
            key: `${q.sessionId}:${q.sequence}`,
            class: we(["console-row", q.level])
          }, [
            g("time", null, L(q.timestamp), 1),
            g("strong", null, L(q.level), 1),
            g("span", null, L(Ie(q)), 1),
            g("code", null, L(q.snapshotId), 1)
          ], 2))), 128))
        ], 64)) : (R(), z(se, { key: 2 }, [
          he.value.length ? Te("", !0) : (R(), z("div", Gp, "当前 Preview 尚无 Broker permission diagnostics。")),
          (R(!0), z(se, null, Be(he.value, (q, ne) => (R(), z("div", {
            key: `${q.sessionId}:${q.requestId}:${ne}`,
            class: "broker-row"
          }, [
            g("time", null, L(q.timestamp), 1),
            g("code", null, L(q.method || "protocol"), 1),
            g("span", null, L(q.permission || "—"), 1),
            g("span", null, "declared: " + L(q.declared == null ? "n/a" : q.declared ? "yes" : "no"), 1),
            g("span", null, "policy: " + L(q.policyDecision), 1),
            g("span", null, "grant: " + L(q.grantState || "n/a"), 1),
            g("span", null, "capability: " + L(q.capabilityState), 1),
            g("strong", {
              class: we(q.finalDecision)
            }, L(q.denialReason || q.resultCategory), 3)
          ]))), 128))
        ], 64))
      ]),
      _e.value ? (R(), z("div", {
        key: 2,
        class: we(["studio-status", rt.value]),
        role: "status"
      }, L(_e.value), 3)) : Te("", !0),
      ye.value ? (R(), z("div", {
        key: 3,
        class: "studio-dialog-backdrop",
        onKeydown: v[18] || (v[18] = ru((q) => Er(ye.value.kind === "confirm" ? !1 : null), ["esc"]))
      }, [
        g("form", {
          class: "studio-dialog",
          onSubmit: v[17] || (v[17] = Tn((q) => Er(ye.value.kind === "confirm" ? !0 : ye.value.value), ["prevent"]))
        }, [
          g("h2", null, L(ye.value.title), 1),
          g("p", null, L(ye.value.message), 1),
          ye.value.kind === "text" ? fs((R(), z("input", {
            key: 0,
            "onUpdate:modelValue": v[15] || (v[15] = (q) => ye.value.value = q),
            "aria-label": "输入值",
            autofocus: ""
          }, null, 512)), [
            [Yl, ye.value.value]
          ]) : Te("", !0),
          g("div", Xp, [
            g("button", {
              type: "button",
              onClick: v[16] || (v[16] = (q) => Er(ye.value.kind === "confirm" ? !1 : null))
            }, "取消"),
            g("button", Yp, L(ye.value.kind === "confirm" ? "确认" : "继续"), 1)
          ])
        ], 32)
      ], 32)) : Te("", !0)
    ]));
  }
};
ou(Qp).mount("#developer-studio-app");
export {
  St as a,
  hr as g,
  Jc as s,
  an as v
};
