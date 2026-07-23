"use client";

import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactInput } from "@/lib/validations/contact";
import { sendContactAction } from "@/actions/contact-action";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PaperPlaneTilt, Envelope, MapPin, Clock } from "@phosphor-icons/react";
import {
  DS_LP_TAG,
  DS_LP_TITLE,
  DS_LP_ACCENT,
  DS_LP_CARD,
  DS_LP_PRICE_CTA_PRI,
} from "@/lib/design-system";

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema) as Resolver<ContactInput>,
  });

  const onSubmit = async (data: ContactInput) => {
    const response = await sendContactAction(data);
    if (response.success) {
      toast.success("Message envoyé avec succès");
      reset();
    } else {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  return (
    <div className="space-y-24">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-12"
      >
        <span className={DS_LP_TAG}>Contact</span>
        <h1 className={DS_LP_TITLE}>
          Parlons de votre<span className="text-indigo-400">.</span>projet
        </h1>
        <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Une question, un projet, une collaboration&nbsp;? Notre équipe est là pour vous accompagner.
        </p>
        <div className={DS_LP_ACCENT} />
      </motion.div>

      {/* FORMULAIRE — plein écran avec coordonnées intégrées */}
      <div className="max-w-2xl mx-auto">
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className={DS_LP_CARD}>
            {/* Coordonnées compactes — barre horizontale */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-5 mb-5 border-b border-zinc-800/60">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Envelope size={15} className="text-indigo-400 shrink-0" />
                <a href="mailto:contact@devilo.com" className="hover:text-white transition-colors">
                  contact@devilo.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <MapPin size={15} className="text-indigo-400 shrink-0" />
                <span>Abidjan, Côte d&rsquo;Ivoire</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Clock size={15} className="text-indigo-400 shrink-0" />
                <span>Réponse sous 24h ouvrées</span>
              </div>
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 flex justify-between">
                <span>Nom / Société</span>
                <span className="text-zinc-600">Obligatoire</span>
              </label>
              <input
                {...register("name")}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Votre nom"
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="vous@exemple.com"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Sujet */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">
                Sujet
              </label>
              <div className="relative">
                <select
                  {...register("subject")}
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="support">Assistance technique</option>
                  <option value="facturation">Facturation</option>
                  <option value="partenariat">Partenariat</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">
                Message
              </label>
              <textarea
                {...register("message")}
                rows={6}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Décrivez votre demande..."
              />
              {errors.message && (
                <p className="text-xs text-red-400">{errors.message.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${DS_LP_PRICE_CTA_PRI} w-full inline-flex items-center justify-center gap-2 px-8 py-4 text-sm`}
          >
            {isSubmitting ? (
              "Envoi..."
            ) : (
              <>
                Envoyer le message
                <PaperPlaneTilt size={16} />
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}