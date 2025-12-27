import React from "react";

export default function ConditionsGenerales() {
  return (
    <div className="max-w-4xl mx-auto bg-white p-0">
      <table className="w-full table-auto border border-black text-sm leading-relaxed">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border border-black p-2 font-bold">CONDITIONS GÉNÉRALES</th>
            <th className="border border-black p-2 font-bold">الشروط العامة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2 align-top" style={{ width: '50%' }}>
              <strong>ARTICLE 1: UTILISATION DE VOITURE</strong>
              <p>- Le locataires&apos;engage a ne pas laisser conduire la voiture que ceux designes au contrat.</p>
              <p>- Ne pas utiliser le véhicule à des fins illicites ou pour le transport de marchandises interdites, le remorquage ou le transport des personnes à contre partie.</p>
              <p>- Ne pas utiliser le véhicule dans les pistes.</p>
            </td>
            <td className="border border-black p-2 align-top text-right" dir="rtl">
              <strong>البند 1: استعمال السيارة</strong>
              <p>- يلتزم المستأجر بعدم السماح بقيادة المركبة لغير المصرح لهم في العقد.</p>
              <p>- عدم استخدام المركبة لأغراض غير مشروعة، أو لنقل بضائع ممنوعة، أو للقطر، أو لنقل الأشخاص بمقابل.</p>
              <p>- عدم استخدام المركبة على الطرق غير المعبدة.</p>
            </td>
          </tr>

          <tr>
            <td className="border border-black p-2 align-top">
              <strong>ARTICLE 2: ETAT DE VOITURE</strong>
              <p>- Le véhicule est livré en parfait état de propreté ; doit être rendu dans les mêmes conditions.</p>
              <p>- Si le véhicule est loué moins de 3 jours, le kilométrage est fixé à 250 km/jour. En cas de dépassement, le locataire paiera 2 DH/km. Au-delà de 3 jours le kilométrage est illimité.</p>
            </td>
            <td className="border border-black p-2 align-top text-right" dir="rtl">
              <strong>البند 2: حالة السيارة</strong>
              <p>- تُسلَّم السيارة في حالة جيدة من حيث النظافة ويجب إرجاعها بنفس الحالة.</p>
              <p>- إذا تم تأجير السيارة لأقل من 3 أيام، يتم تحديد المسافة بـ 250 كم/اليوم. في حالة التجاوز، يدفع المستأجر 2 دراهم لكل كيلومتر إضافي. إذا تجاوزت المدة 3 أيام، تكون المسافة غير محدودة.</p>
            </td>
          </tr>

          <tr>
            <td className="border border-black p-2 align-top">
              <strong>ARTICLE 3: ENTRETIEN ET RÉPARATION</strong>
              <p>- Toute opération d&apos;entretien ou de réparation doit être autorisée par l&apos;agence (fax ou email).</p>
              <p>- Le locataire doit vérifier les niveaux (huile, eau) si la location dépasse 3 jours.</p>
              <p>- Toute panne causée par la négligence du client sera à sa charge ; une expertise peut être requise.</p>
            </td>
            <td className="border border-black p-2 align-top text-right" dir="rtl">
              <strong>البند 3: الصيانة والإصلاح</strong>
              <p>- يجب الحصول على موافقة الوكالة على أي صيانة أو إصلاح.</p>
              <p>- يجب على المستأجر التحقق من مستوى الزيت والماء إذا تجاوزت المدة 3 أيام.</p>
              <p>- كل عطل ناتج عن إهمال المستأجر يكون على نفقته، وقد يتم الاستعانة بخبير.</p>
            </td>
          </tr>

          <tr>
            <td className="border border-black p-2 align-top">
              <strong>ARTICLE 4: ASSURANCES</strong>
              <p>- Assurance tous risques.</p>
              <p>- En cas de faute du locataire, il doit payer une franchise fixée + frais d&apos;immobilisation.</p>
              <p>- Le locataire doit informer l&apos;agence immédiatement en cas d&apos;accident.</p>
            </td>
            <td className="border border-black p-2 align-top text-right" dir="rtl">
              <strong>البند 4: التأمين</strong>
              <p>- تأمين شامل.</p>
              <p>- إذا كان المستأجر مخطئًا، عليه دفع نسبة التحمل المحددة من طرف شركة التأمين بالإضافة إلى مصاريف توقف السيارة للإصلاح.</p>
              <p>- يجب على المستأجر إبلاغ الوكالة فورًا في حالة وقوع حادث.</p>
            </td>
          </tr>

          <tr>
            <td className="border border-black p-2 align-top">
              <strong>ARTICLE 5: LOCATION / PROLONGATION</strong>
              <p>- Paiement et caution à régler d&apos;avance.</p>
              <p>- Toute prolongation doit être autorisée par l&apos;agence.</p>
              <p>- Le locataire doit avertir 2 jours avant ; sinon, pénalité forfaitaire de 2000 DH.</p>
            </td>
            <td className="border border-black p-2 align-top text-right" dir="rtl">
              <strong>البند 5: الكراء / التمديد</strong>
              <p>- يجب دفع الكراء والضمان مسبقًا.</p>
              <p>- يجب الحصول على موافقة الوكالة في حالة التمديد.</p>
              <p>- في حالة التمديد، يجب إعلام الوكالة قبل يومين، وإلا يتم فرض غرامة جزافية قدرها 2000 درهم.</p>
            </td>
          </tr>

          <tr>
            <td className="border border-black p-2 align-top">
              <strong>ARTICLE 6: PAPIERS DE LA VOITURE</strong>
              <p>- En cas de perte de papiers, tous les frais sont à la charge du locataire (immobilisation, renouvellement...)</p>
            </td>
            <td className="border border-black p-2 align-top text-right" dir="rtl">
              <strong>البند 6: أوراق السيارة</strong>
              <p>- في حالة فقدان الأوراق، يتحمل المستأجر جميع المصاريف (توقف السيارة، إعادة الإصدار...).</p>
            </td>
          </tr>

          <tr>
            <td className="border border-black p-2 align-top">
              <strong>ARTICLE 7: RESPONSABILITÉ</strong>
              <p>- Le locataire est responsable des amendes, contraventions et PV établis à son encontre.</p>
            </td>
            <td className="border border-black p-2 align-top text-right" dir="rtl">
              <strong>البند 7: المسؤولية</strong>
              <p>- المستأجر مسؤول عن جميع الغرامات والمخالفات والمحاضر الصادرة بحقه من السلطات.</p>
            </td>
          </tr>


          <tr>
            <td className="border border-black p-2 align-top">
              <strong>ARTICLE 8: LITIGES</strong>
              <p>- Les litiges seront soumis à la juridiction compétente du lieu de signature du contrat.</p>
            </td>
            <td className="border border-black p-2 align-top text-right" dir="rtl">
              <strong>البند 8: النزاعات</strong>
              <p>- جميع المنازعات التي قد تنشأ بين شركة التأجير والمستأجر تبقى من الاختصاص الحصري للمحاكم التابعة لمقــر الشركة.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
